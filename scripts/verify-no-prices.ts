import { execFileSync } from "node:child_process";
import { createWriteClient, writeReport } from "./lib/import-run";
import { findPriceText, findPriceTextInValue, type PriceFinding } from "./lib/price-text";

// Read-only price check over the dataset: every string of every service,
// catalogue item, project and work category (drafts included) and the original
// filename of every asset.
// Currency or amounts are errors and fail the run; pricing words are listed
// for review. With `--export <file.tar.gz>` it checks a dataset export
// instead of the live dataset.
//
//   npx tsx scripts/verify-no-prices.ts
//   npx tsx scripts/verify-no-prices.ts --export .migration/backups/<name>.tar.gz

type Document = Record<string, unknown> & { _id: string; _type: string; originalFilename?: string };

// Projects too: their texts appear as related works on service pages.
const CONTENT_TYPES = ["service", "catalogItem", "project", "workCategory"];
const ASSET_TYPES = ["sanity.imageAsset", "sanity.fileAsset"];

async function loadDocuments(exportFile: string | undefined): Promise<{ source: string; documents: Document[] }> {
  if (exportFile) {
    const ndjson = execFileSync("tar", ["-xzOf", exportFile, "*/data.ndjson"], { maxBuffer: 512 * 1024 * 1024 }).toString("utf8");
    const documents = ndjson.split("\n").filter(Boolean).map((line) => JSON.parse(line) as Document);
    return { source: exportFile, documents: documents.filter((document) => [...CONTENT_TYPES, ...ASSET_TYPES].includes(document._type)) };
  }
  const documents = await createWriteClient().fetch<Document[]>(
    "*[_type in $content] + *[_type in $assets]{_id, _type, originalFilename}",
    { content: CONTENT_TYPES, assets: ASSET_TYPES },
  );
  return { source: "dataset production (drafts included)", documents };
}

async function main() {
  const flag = process.argv.indexOf("--export");
  const { source, documents } = await loadDocuments(flag >= 0 ? process.argv[flag + 1] : undefined);
  const hits = documents.flatMap((document) => {
    const findings: PriceFinding[] = ASSET_TYPES.includes(document._type)
      ? findPriceText(document.originalFilename ?? "", "originalFilename")
      : findPriceTextInValue(document, { skip: ["migratedAt"] }); // import timestamps read as thousands
    return findings.map((finding) => ({ id: document._id, type: document._type, ...finding }));
  });
  const errors = hits.filter((hit) => hit.level === "error");
  const warnings = hits.filter((hit) => hit.level === "warning");
  const counts = [...CONTENT_TYPES, ...ASSET_TYPES].map((type) => `${type} ${documents.filter((document) => document._type === type).length}`);
  const line = (hit: (typeof hits)[number]) => `- \`${hit.id}\` ${hit.path ?? "?"}: „${hit.match}” (${hit.message})`;
  const markdown = [
    "# Price check", "",
    `Source: ${source}. Checked: ${counts.join(", ")}.`, "",
    `${errors.length} errors, ${warnings.length} pricing words to review.`, "",
    ...(errors.length ? ["## Errors", "", ...errors.map(line), ""] : []),
    ...(warnings.length ? ["## To review", "", ...warnings.map(line), ""] : []),
  ].join("\n");
  const files = writeReport("verify-no-prices", { source, hits }, markdown);
  console.log(markdown);
  console.log(`Report: ${files.md}`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
