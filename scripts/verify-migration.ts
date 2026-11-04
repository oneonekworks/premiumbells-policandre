import { buildDocumentPlans, createWriteClient, isDocumentCollection, loadAssetCheckpoint, parseImportArgs, writeReport } from "./lib/import-run";

// Read-only reconciliation for the Phase 6 collections: every planned
// `services` or `catalog` document must exist in Sanity (draft or published)
// with the same media in the same order and its required fields.
//
//   npx tsx scripts/verify-migration.ts --collection services

/**
 * Asset references in document order (covers, galleries, sections, audio).
 * Fields are walked by name, since Sanity returns them in its own key order.
 */
const assetRefs = (value: unknown): string[] =>
  Array.isArray(value) ? value.flatMap(assetRefs)
    : value && typeof value === "object"
      ? Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).flatMap(([key, item]) => (key === "asset" ? [(item as { _ref?: string })?._ref ?? "?"] : key === "legacy" ? [] : assetRefs(item)))
      : [];

async function main() {
  const options = parseImportArgs();
  if (!isDocumentCollection(options.collection)) throw new Error("Use --collection services or --collection catalog.");
  const checkpoint = loadAssetCheckpoint();
  const { plans } = buildDocumentPlans(options, (canonical) => checkpoint[canonical]?.assetId);
  const client = createWriteClient();
  const ids = plans.flatMap((plan) => [plan.document._id, `drafts.${plan.document._id}`]);
  const remote = new Map((await client.fetch<Array<Record<string, unknown> & { _id: string }>>("*[_id in $ids]", { ids }))
    .map((document) => [document._id, document]));

  const rows = plans.map((plan) => {
    const id = plan.document._id;
    const found = remote.get(`drafts.${id}`) ?? remote.get(id);
    const problems: string[] = [];
    if (!found) problems.push("missing");
    else {
      const expected = assetRefs(plan.document);
      const actual = assetRefs(found);
      if (expected.length !== actual.length) problems.push(`media ${actual.length}/${expected.length}`);
      else if (expected.some((ref, index) => !ref.startsWith("pending-") && ref !== actual[index])) problems.push("media order differs");
      const sections = (plan.document.sections as unknown[] | undefined)?.length;
      if (sections !== undefined && (found.sections as unknown[] | undefined)?.length !== sections) problems.push("section count differs");
      for (const field of plan.collection === "services" ? ["title", "slug", "coverImage", "summary"] : ["title", "family", "image"]) {
        if (!found[field]) problems.push(`no ${field}`);
      }
    }
    return { key: plan.key, id, state: found ? (found._id.startsWith("drafts.") ? "draft" : "published") : "—", problems };
  });
  const markdown = [
    `# Verify ${options.collection}`, "",
    `${rows.filter((row) => !row.problems.length).length}/${rows.length} documents match.`, "",
    "| Record | State | Problems |", "| --- | --- | --- |",
    ...rows.map((row) => `| ${row.key} | ${row.state} | ${row.problems.join("; ") || "ok"} |`), "",
  ].join("\n");
  const files = writeReport(`verify-${options.collection}`, rows, markdown);
  console.log(markdown);
  console.log(`Report: ${files.md}`);
  if (rows.some((row) => row.problems.length)) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
