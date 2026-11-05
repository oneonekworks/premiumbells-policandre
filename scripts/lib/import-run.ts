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
import { mapLegacyCatalog, type CatalogOverride } from "./legacy-catalog";
import { createSourceLoader, type DocumentPlan } from "./legacy-documents";
import { loadServicesSeed, mapServices } from "./legacy-services";
import { PHASE7_COLLECTIONS, loadHomeSeed, mapPhase7, type Phase7Collection } from "./legacy-home";

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
): { plans: ProjectPlan[]; conflicts: MappingIssue[]; skipped: Array<{ key: string; reason: string }> } {
  const manifest = indexManifest(loadManifest(options.manifestFile));
  const overrides = loadOverrides();
  const portfolio = loadLegacyPortfolio(options.legacyRoot);
  const skipped: Array<{ key: string; reason: string }> = [];
  const plans = selectWorks(portfolio, options.collection, options.projects).flatMap(({ work, index, occurrence }) => {
    const key = projectKey(options.collection, work, occurrence);
    const override = overrides.projects[key];
    if (override?.skip) {
      skipped.push({ key, reason: override.skip });
      return [];
    }
    return [mapLegacyProject(work, {
      collection: options.collection,
      index,
      occurrence,
      legacyRoot: options.legacyRoot,
      categoryId,
      manifest,
      override,
      resolveAsset,
    })];
  });
  for (const { key, reason } of skipped) console.log(`Skipped ${key}: ${reason}`);
  return { plans, conflicts: findPlanConflicts(plans), skipped };
}

/** Phase 6 `services` (reviewed seed) and `catalog`; Phase 7 `global`, `home` and `blog`. */
export const DOCUMENT_COLLECTIONS = ["services", "catalog", ...PHASE7_COLLECTIONS] as const;
export const isDocumentCollection = (collection: string) => (DOCUMENT_COLLECTIONS as readonly string[]).includes(collection);

/** Maps the services seed or the catalogue; `--project` selects keys (`services:/servicii/usi`, `catalog:policandre#7`) or paths. */
export function buildDocumentPlans(
  options: ImportOptions,
  resolveAsset: (canonical: string) => string | undefined,
  transform?: (value: unknown) => unknown,
): { plans: DocumentPlan[]; skipped: Array<{ key: string; reason: string }> } {
  const manifest = indexManifest(loadManifest(options.manifestFile));
  const load = createSourceLoader(options.legacyRoot, transform);
  const context = { load, legacyRoot: options.legacyRoot, manifest, resolveAsset };
  const phase7 = (PHASE7_COLLECTIONS as readonly string[]).includes(options.collection);
  const result = phase7
    ? { plans: mapPhase7(options.collection as Phase7Collection, { ...context, seed: loadHomeSeed() }), skipped: [] }
    : options.collection === "services"
    ? { plans: mapServices({ ...context, seed: loadServicesSeed() }), skipped: [] }
    : mapLegacyCatalog({ ...context, overrides: (loadOverrides() as { catalog?: Record<string, CatalogOverride> }).catalog ?? {} });
  const selected = options.projects.length
    ? result.plans.filter((plan) => options.projects.some((wanted) => plan.key === wanted || plan.key.endsWith(`:${wanted}`)))
    : result.plans;
  return { plans: selected, skipped: result.skipped };
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
