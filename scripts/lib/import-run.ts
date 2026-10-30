import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createClient, type SanityClient } from "@sanity/client";
import type { LegacyMediaManifest } from "./legacy-media";
import {
  findPlanConflicts,
  indexManifest,
  loadLegacyPortfolio,
  loadOverrides,
  mapLegacyProject,
  projectKey,
  selectWorks,
  type MappingIssue,
  type ProjectPlan,
} from "./legacy-portfolio";

// Shared plumbing for migrate-assets and migrate-content: arguments, the
// write client, the asset checkpoint, and reports. Everything generated stays
// under the ignored .migration/ directory.

export const repoRoot = process.cwd();
export const migrationDir = path.join(repoRoot, ".migration");
export const assetCheckpointFile = path.join(migrationDir, "checkpoints", "assets.json");
export const API_VERSION = "2026-10-10";
export const IMPORT_SOURCE_NAME = "premiumbells-legacy-import";

export interface ImportOptions {
  write: boolean;
  collection: string;
  projects: string[];
  legacyRoot: string;
  manifestFile: string;
  concurrency: number;
}

export function parseImportArgs(argv = process.argv.slice(2)): ImportOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      write: { type: "boolean", default: false },
      collection: { type: "string", default: "worksClopote" },
      project: { type: "string", multiple: true, default: [] },
      "legacy-root": { type: "string", default: path.resolve(repoRoot, "../rbells-tw") },
      manifest: { type: "string", default: path.join(migrationDir, "legacy-media-manifest.json") },
      concurrency: { type: "string", default: "4" },
    },
  });
  return {
    write: values.write,
    collection: values.collection,
    projects: values.project.flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean),
    legacyRoot: values["legacy-root"],
    manifestFile: values.manifest,
    concurrency: Math.max(1, Math.min(8, Number(values.concurrency) || 4)),
  };
}

/** Write client from .env.local; the token is never printed. */
export function createWriteClient(): SanityClient {
  const envFile = path.join(repoRoot, ".env.local");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not set in .env.local.");
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1fzbw4s1",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: API_VERSION,
    useCdn: false,
    perspective: "raw",
    token,
  });
}

export interface AssetCheckpointEntry {
  assetId: string;
  sha1: string;
  originalBytes: number;
  uploadedBytes?: number;
  mode?: string;
  width?: number;
  height?: number;
  /** `uploaded` by this importer, or `existing` when an asset with the same fingerprint was found. */
  status: "uploaded" | "existing";
  at: string;
}

export type AssetCheckpoint = Record<string, AssetCheckpointEntry>;

export function loadAssetCheckpoint(): AssetCheckpoint {
  return existsSync(assetCheckpointFile)
    ? (JSON.parse(readFileSync(assetCheckpointFile, "utf8")) as AssetCheckpoint)
    : {};
}

/** Atomic write, so an interrupted run never leaves a truncated checkpoint. */
export function saveAssetCheckpoint(checkpoint: AssetCheckpoint): void {
  mkdirSync(path.dirname(assetCheckpointFile), { recursive: true });
  const temporary = `${assetCheckpointFile}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(checkpoint, null, 2)}\n`);
  renameSync(temporary, assetCheckpointFile);
}

export function loadManifest(file: string): LegacyMediaManifest {
  if (!existsSync(file)) throw new Error(`Media manifest not found: ${file}. Run npm run inventory:legacy first.`);
  return JSON.parse(readFileSync(file, "utf8")) as LegacyMediaManifest;
}

/** Maps the selected legacy records; conflicts within the selection are added to `conflicts`. */
export function buildPlans(
  options: ImportOptions,
  categoryId: string,
  resolveAsset: (canonical: string) => string | undefined,
): { plans: ProjectPlan[]; conflicts: MappingIssue[] } {
  const manifest = indexManifest(loadManifest(options.manifestFile));
  const overrides = loadOverrides();
  const portfolio = loadLegacyPortfolio(options.legacyRoot);
  const plans = selectWorks(portfolio, options.collection, options.projects).map(({ work, index }) =>
    mapLegacyProject(work, {
      collection: options.collection,
      index,
      legacyRoot: options.legacyRoot,
      categoryId,
      manifest,
      override: overrides.projects[projectKey(options.collection, work)],
      resolveAsset,
    }),
  );
  return { plans, conflicts: findPlanConflicts(plans) };
}

export function writeReport(name: string, data: unknown, markdown: string): { json: string; md: string } {
  const directory = path.join(migrationDir, "reports");
  mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const json = path.join(directory, `${name}-${stamp}.json`);
  const md = path.join(directory, `${name}-${stamp}.md`);
  writeFileSync(json, `${JSON.stringify(data, null, 2)}\n`);
  writeFileSync(md, markdown);
  return { json: path.relative(repoRoot, json), md: path.relative(repoRoot, md) };
}

export function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
