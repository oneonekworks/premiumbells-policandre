import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { delay, mapConcurrent, stableId } from "./lib/legacy-media";
import type { ImageNeed } from "./lib/legacy-portfolio";
import { optimizeImage } from "./lib/optimize-image";
import {
  IMPORT_SOURCE_NAME,
  buildPlans,
  createWriteClient,
  formatBytes,
  loadAssetCheckpoint,
  migrationDir,
  parseImportArgs,
  saveAssetCheckpoint,
  writeReport,
} from "./lib/import-run";

// Uploads the cover and gallery photos of the selected legacy projects to
// Sanity, prepared with the Studio's photo rules. Dry run by default: photos
// are read and optimised to report sizes, nothing is uploaded. Originals are
// only read (local legacy files or HTTP GET from GCS) and cached under
// .migration/cache. The SHA-1 of each original becomes the asset's
// `source.id`, the same fingerprint the Studio uses, so a photo already in
// Sanity is reused instead of uploaded again.

interface AssetResult {
  canonical: string;
  projects: string[];
  status: "checkpoint" | "existing" | "uploaded" | "planned" | "failed";
  originalBytes?: number;
  uploadedBytes?: number;
  mode?: string;
  width?: number;
  height?: number;
  sha1?: string;
  assetId?: string;
  error?: string;
}

const cacheDir = path.join(migrationDir, "cache", "originals");

async function readOriginal(image: ImageNeed): Promise<Buffer> {
  if (image.localFile) return readFileSync(image.localFile);
  if (!image.resolvedUrl) throw new Error("No local file or URL.");
  const cached = path.join(cacheDir, stableId(image.canonical));
  if (existsSync(cached)) return readFileSync(cached);
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(image.resolvedUrl, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = Buffer.from(await response.arrayBuffer());
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(cached, data);
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(1_000 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function filenameFor(image: ImageNeed, extension: string): string {
  const base = decodeURIComponent(path.posix.basename(image.canonical)).replace(/\.[^.]+$/, "");
  return `${base || "fotografie"}.${extension}`;
}

async function main() {
  const options = parseImportArgs();
  const client = createWriteClient();
  const checkpoint = loadAssetCheckpoint();
  const { plans } = buildPlans(options, "category-not-needed", () => undefined);

  // One entry per photo, even when several projects share it.
  const needs = new Map<string, { image: ImageNeed; projects: string[] }>();
  for (const plan of plans) {
    for (const image of plan.images) {
      const entry = needs.get(image.canonical) ?? { image, projects: [] };
      if (!entry.projects.includes(plan.key)) entry.projects.push(plan.key);
      needs.set(image.canonical, entry);
    }
  }

  console.log(`${options.write ? "WRITE" : "DRY RUN"}: ${needs.size} photos for ${plans.length} projects.`);
  const results: AssetResult[] = [];
  let done = 0;

  await mapConcurrent([...needs.values()], options.concurrency, async ({ image, projects }) => {
    const result: AssetResult = { canonical: image.canonical, projects, status: "planned" };
    results.push(result);
    try {
      const saved = checkpoint[image.canonical];
      if (saved) {
        const exists = await client.fetch<string | null>("*[_id == $id][0]._id", { id: saved.assetId });
        if (exists) {
          Object.assign(result, { ...saved, status: "checkpoint" });
          return;
        }
      }

      const original = await readOriginal(image);
      const sha1 = createHash("sha1").update(original).digest("hex");
      result.sha1 = sha1;
      result.originalBytes = original.length;

      const existing = await client.fetch<string | null>(
        '*[_type == "sanity.imageAsset" && source.id == $sha1][0]._id',
        { sha1 },
      );
      if (existing) {
        result.status = "existing";
        result.assetId = existing;
        if (options.write) {
          checkpoint[image.canonical] = { assetId: existing, sha1, originalBytes: original.length, status: "existing", at: new Date().toISOString() };
          saveAssetCheckpoint(checkpoint);
        }
        return;
      }

      const optimized = await optimizeImage(original);
      Object.assign(result, {
        uploadedBytes: optimized.data.length,
        mode: optimized.mode,
        width: optimized.width,
        height: optimized.height,
      });
      if (!options.write) return;

      const asset = await client.assets.upload("image", optimized.data, {
        filename: filenameFor(image, optimized.extension),
        source: { name: IMPORT_SOURCE_NAME, id: sha1, url: image.resolvedUrl ?? image.canonical },
      });
      result.status = "uploaded";
      result.assetId = asset._id;
      checkpoint[image.canonical] = {
        assetId: asset._id,
        sha1,
        originalBytes: original.length,
        uploadedBytes: optimized.data.length,
        mode: optimized.mode,
        width: optimized.width,
        height: optimized.height,
        status: "uploaded",
        at: new Date().toISOString(),
      };
      saveAssetCheckpoint(checkpoint);
    } catch (error) {
      result.status = "failed";
      result.error = error instanceof Error ? error.message : String(error);
    } finally {
      done += 1;
      if (done % 10 === 0 || done === needs.size) console.log(`  ${done}/${needs.size}`);
    }
  });

  results.sort((a, b) => a.canonical.localeCompare(b.canonical));
  const count = (status: AssetResult["status"]) => results.filter((result) => result.status === status).length;
  const sum = (values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
  const prepared = results.filter((result) => result.uploadedBytes !== undefined);
  const modes = prepared.reduce<Record<string, number>>((all, result) => ({ ...all, [result.mode!]: (all[result.mode!] ?? 0) + 1 }), {});
  const shared = [...needs.values()].filter((need) => need.projects.length > 1);
  // Different legacy paths with identical bytes resolve to one Sanity asset.
  const bySha1 = new Map<string, AssetResult[]>();
  for (const result of results) if (result.sha1) bySha1.set(result.sha1, [...(bySha1.get(result.sha1) ?? []), result]);
  const identical = [...bySha1.values()].filter((group) => group.length > 1);

  const summary = {
    mode: options.write ? "write" : "dry-run",
    collection: options.collection,
    projects: plans.map((plan) => plan.key),
    photos: results.length,
    checkpoint: count("checkpoint"),
    existing: count("existing"),
    uploaded: count("uploaded"),
    planned: count("planned"),
    failed: count("failed"),
    originalBytes: sum(prepared.map((result) => result.originalBytes)),
    preparedBytes: sum(prepared.map((result) => result.uploadedBytes)),
    modes,
    identicalGroups: identical.length,
  };

  const markdown = [
    `# Asset import — ${summary.mode}`,
    "",
    `Collection \`${summary.collection}\`; projects: ${summary.projects.map((key) => `\`${key}\``).join(", ")}.`,
    "",
    "| Photos | From checkpoint | Already in Sanity | Uploaded | To upload | Failed |",
    "| ---: | ---: | ---: | ---: | ---: | ---: |",
    `| ${summary.photos} | ${summary.checkpoint} | ${summary.existing} | ${summary.uploaded} | ${summary.planned} | ${summary.failed} |`,
    "",
    `Prepared photos: ${formatBytes(summary.originalBytes)} → ${formatBytes(summary.preparedBytes)}. ` +
      `Modes: ${Object.entries(modes).map(([mode, total]) => `${mode} ${total}`).join(", ") || "none"}.`,
    "",
    ...(shared.length
      ? ["## Photos used by several projects", "", ...shared.map((need) => `- \`${need.image.canonical}\`: ${need.projects.join(", ")}`), ""]
      : []),
    ...(identical.length
      ? [
          "## Identical photos under different paths",
          "",
          ...identical.map((group) => `- ${group.map((result) => `\`${result.canonical}\` (${result.projects.join(", ")})`).join(" = ")}`),
          "",
        ]
      : []),
    ...(summary.failed
      ? ["## Failures", "", ...results.filter((result) => result.status === "failed").map((result) => `- \`${result.canonical}\`: ${result.error}`), ""]
      : []),
  ].join("\n");

  const files = writeReport("assets", { summary, results }, markdown);
  console.log(markdown);
  console.log(`Report: ${files.md}`);
  if (summary.failed) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
