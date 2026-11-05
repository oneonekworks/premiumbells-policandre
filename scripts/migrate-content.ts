import { COLLECTION_CATEGORIES, stableStringify, type MappingIssue, type ProjectPlan } from "./lib/legacy-portfolio";
import type { DocumentPlan } from "./lib/legacy-documents";
import {
  buildDocumentPlans,
  buildPlans,
  createWriteClient,
  isDocumentCollection,
  loadAssetCheckpoint,
  parseImportArgs,
  writeReport,
  type ImportOptions,
} from "./lib/import-run";

// Creates or updates Sanity `project` drafts for the selected legacy records.
// Dry run by default. Run migrate-assets first; a project whose photos are not
// all uploaded is blocked in write mode. Documents get deterministic IDs and
// are written as drafts for editorial review; a project that is already
// published is left alone, and an unchanged draft is not rewritten.

type Status = "blocked" | "published-exists" | "unchanged" | "create" | "update" | "created" | "updated" | "failed";

interface ProjectResult {
  key: string;
  id: string;
  slug: string;
  status: Status;
  photos: string;
  videos: number;
  specifications: number;
  replaces: string[];
  issues: MappingIssue[];
  review: string[];
  error?: string;
}

const comparable = (document: Record<string, unknown>) => {
  const copy = structuredClone(document);
  for (const field of ["_id", "_rev", "_createdAt", "_updatedAt", "_system"]) delete copy[field];
  const legacy = copy.legacy as Record<string, unknown> | undefined;
  if (legacy) delete legacy.migratedAt;
  return stableStringify(copy);
};

async function main() {
  const options = parseImportArgs();
  if (isDocumentCollection(options.collection)) return importDocuments(options);
  const client = createWriteClient();
  const checkpoint = loadAssetCheckpoint();

  const categorySlug = COLLECTION_CATEGORIES[options.collection];
  const categoryId = await client.fetch<string | null>(
    '*[_type == "workCategory" && slug.ro.current == $slug && !(_id in path("drafts.**"))][0]._id',
    { slug: categorySlug },
  );
  if (!categoryId && options.write) throw new Error(`No published workCategory with slug "${categorySlug}".`);
  // A dry run can preview a collection before its category is created.
  if (!categoryId) console.warn(`No published workCategory with slug "${categorySlug}" yet; previewing with a placeholder.`);

  const { plans, conflicts, skipped } = buildPlans(options, categoryId ?? `category-pending-${categorySlug}`, (canonical) => checkpoint[canonical]?.assetId);
  console.log(`${options.write ? "WRITE" : "DRY RUN"}: ${plans.length} projects from ${options.collection}.`);

  const results: ProjectResult[] = [];
  // Oldest first (the legacy arrays list newest first), so creation order matches.
  for (const plan of [...plans].sort((a, b) => b.index - a.index)) {
    results.push(await processPlan(plan, conflicts, options.write, client));
  }
  results.reverse();

  const markdown = renderReport(options.write, options.collection, results, conflicts, skipped);
  const files = writeReport("content", { mode: options.write ? "write" : "dry-run", conflicts, skipped, results }, markdown);
  console.log(markdown);
  console.log(`Report: ${files.md}`);
  if (results.some((result) => result.status === "failed" || result.status === "blocked")) process.exitCode = 1;
}

async function processPlan(
  plan: ProjectPlan,
  conflicts: MappingIssue[],
  write: boolean,
  client: ReturnType<typeof createWriteClient>,
): Promise<ProjectResult> {
  const { document } = plan;
  const draftId = `drafts.${document._id}`;
  const issues = [...plan.issues, ...conflicts.filter((conflict) => conflict.message.includes(plan.key))];

  const own = [document._id, draftId, ...plan.replaces.flatMap((id) => [id, `drafts.${id}`])];
  const remote = await client.fetch<{
    published: string | null;
    draft: Record<string, unknown> | null;
    slugTakenBy: string[];
    replaces: string[];
  }>(
    `{
      "published": *[_id == $id][0]._id,
      "draft": *[_id == $draftId][0],
      "slugTakenBy": *[_type == "project" && slug.current == $slug && !(_id in $own)]._id,
      "replaces": *[_id in $own && !(_id in [$id, $draftId])]._id
    }`,
    { id: document._id, draftId, slug: document.slug.current, own },
  );
  for (const id of remote.slugTakenBy) {
    issues.push({ severity: "error", code: "slug-taken", message: `Slug "${document.slug.current}" is used by ${id}.` });
  }
  const pending = [document.coverImage, ...document.gallery].filter((image) => image?.asset._ref.startsWith("pending-")).length;
  if (write && pending) {
    issues.push({ severity: "error", code: "assets-pending", message: `${pending} photos are not uploaded; run migrate-assets --write first.` });
  }

  const result: ProjectResult = {
    key: plan.key,
    id: document._id,
    slug: document.slug.current,
    status: "create",
    photos: `${document.gallery.length}/${plan.legacy.gallery?.length ?? 0}`,
    videos: document.videos?.length ?? 0,
    specifications: document.specifications?.length ?? 0,
    replaces: remote.replaces,
    issues,
    review: plan.review,
  };

  if (issues.some((issue) => issue.severity === "error")) return { ...result, status: "blocked" };
  if (remote.published) return { ...result, status: "published-exists" };
  if (remote.draft) {
    if (comparable(remote.draft) === comparable({ ...document }) && remote.replaces.length === 0) {
      return { ...result, status: "unchanged" };
    }
    result.status = "update";
  }
  if (!write) return result;

  try {
    const transaction = client.transaction().createOrReplace({
      ...document,
      _id: draftId,
      legacy: { ...document.legacy, migratedAt: new Date().toISOString() },
    });
    for (const id of remote.replaces) transaction.delete(id);
    await transaction.commit({ visibility: "sync" });
    return { ...result, status: result.status === "update" ? "updated" : "created" };
  } catch (error) {
    return { ...result, status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

function renderReport(
  write: boolean,
  collection: string,
  results: ProjectResult[],
  conflicts: MappingIssue[],
  skipped: Array<{ key: string; reason: string }>,
): string {
  const lines = [
    `# Content import — ${write ? "write" : "dry-run"}`,
    "",
    `Collection \`${collection}\`. Documents are written as drafts (\`drafts.<id>\`) for review in the Studio.`,
    "",
    "| Project | Document ID | Slug | Photos (imported/legacy) | Videos | Details | Replaces | Status |",
    "| --- | --- | --- | ---: | ---: | ---: | --- | --- |",
    ...results.map((result) =>
      `| ${result.key} | \`${result.id}\` | \`${result.slug}\` | ${result.photos} | ${result.videos} | ${result.specifications} | ${result.replaces.join(", ") || "—"} | **${result.status}** |`),
    "",
  ];
  if (skipped.length) lines.push("## Skipped", "", ...skipped.map(({ key, reason }) => `- ${key}: ${reason}`), "");
  if (conflicts.length) lines.push("## Conflicts in the selection", "", ...conflicts.map((issue) => `- ${issue.message}`), "");
  for (const result of results) {
    const notes = [
      ...result.issues.map((issue) => `- ${issue.severity === "error" ? "**Error**" : "Warning"} \`${issue.code}\`: ${issue.message}`),
      ...result.review.map((note) => `- Review: ${note}`),
      ...(result.error ? [`- **Failed:** ${result.error}`] : []),
    ];
    // Collapse the per-photo "not uploaded yet" warnings into one line.
    const pending = result.issues.filter((issue) => issue.code === "asset-not-uploaded").length;
    const compact = notes.filter((note) => !note.includes("`asset-not-uploaded`"));
    if (pending) compact.push(`- Warning \`asset-not-uploaded\`: ${pending} photos not uploaded yet.`);
    if (compact.length) lines.push(`## ${result.key}`, "", ...compact, "");
  }
  return lines.join("\n");
}

// Phase 6: services (from the reviewed seed) and catalogue items; Phase 7:
// global (person, testimonial, audio), home and blog. Same rules
// as projects: drafts only, published documents left alone, unchanged drafts
// not rewritten, and a record with any error (price text included) blocked.
// Parents are written before their variants.
async function importDocuments(options: ImportOptions) {
  const client = createWriteClient();
  const checkpoint = loadAssetCheckpoint();
  const { plans, skipped } = buildDocumentPlans(options, (canonical) => checkpoint[canonical]?.assetId);
  console.log(`${options.write ? "WRITE" : "DRY RUN"}: ${plans.length} documents from ${options.collection}.`);

  const categorySlugs = [...new Set(plans.flatMap((plan) => (plan.relatedCategorySlug ? [plan.relatedCategorySlug] : [])))];
  const categories = Object.fromEntries((await client.fetch<Array<{ _id: string; slug: string }>>(
    '*[_type == "workCategory" && slug.ro.current in $slugs && !(_id in path("drafts.**"))]{_id, "slug": slug.ro.current}',
    { slugs: categorySlugs },
  )).map(({ _id, slug }) => [slug, _id]));
  const planned = new Set(plans.map((plan) => plan.document._id));

  const results: DocumentResult[] = [];
  for (const plan of [...plans].sort((a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)))) {
    results.push(await processDocument(plan, { client, write: options.write, categories, planned }));
  }
  results.sort((a, b) => plans.findIndex((plan) => plan.key === a.key) - plans.findIndex((plan) => plan.key === b.key));

  const lines = [
    `# Content import — ${options.write ? "write" : "dry-run"}`,
    "",
    `Collection \`${options.collection}\`. Documents are written as drafts (\`drafts.<id>\`) for review in the Studio.`,
    "",
    "| Record | Document ID | Media (to upload) | Status |",
    "| --- | --- | ---: | --- |",
    ...results.map((result) => `| ${result.key} | \`${result.id}\` | ${result.media} (${result.pending}) | **${result.status}** |`),
    "",
    ...(skipped.length ? ["## Skipped", "", ...skipped.map(({ key, reason }) => `- ${key}: ${reason}`), ""] : []),
  ];
  for (const result of results) {
    const notes = [
      ...result.issues.filter((issue) => issue.code !== "asset-not-uploaded")
        .map((issue) => `- ${issue.severity === "error" ? "**Error**" : "Warning"} \`${issue.code}\`: ${issue.message}`),
      ...result.review.map((note) => `- Review: ${note}`),
      ...(result.error ? [`- **Failed:** ${result.error}`] : []),
    ];
    if (notes.length) lines.push(`## ${result.key}`, "", ...notes, "");
  }
  const markdown = lines.join("\n");
  const files = writeReport(`content-${options.collection}`, { mode: options.write ? "write" : "dry-run", skipped, results }, markdown);
  console.log(markdown);
  console.log(`Report: ${files.md}`);
  if (results.some((result) => result.status === "failed" || result.status === "blocked")) process.exitCode = 1;
}

/** Document references (not assets) split by kind; weak ones may point at drafts. */
function documentReferences(value: unknown, found = { strong: [] as string[], weak: [] as string[] }) {
  if (Array.isArray(value)) value.forEach((item) => documentReferences(item, found));
  else if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (object._type === "reference" && typeof object._ref === "string" && !object._ref.startsWith("pending-") && !/^(image|file)-/.test(object._ref)) {
      (object._weak ? found.weak : found.strong).push(object._ref);
    }
    for (const [key, item] of Object.entries(object)) if (key !== "asset") documentReferences(item, found);
  }
  return found;
}

interface DocumentResult {
  key: string;
  id: string;
  status: Status;
  media: number;
  pending: number;
  issues: MappingIssue[];
  review: string[];
  error?: string;
}

async function processDocument(
  plan: DocumentPlan,
  { client, write, categories, planned }: {
    client: ReturnType<typeof createWriteClient>; write: boolean; categories: Record<string, string>; planned: Set<string>;
  },
): Promise<DocumentResult> {
  const document = structuredClone(plan.document);
  const draftId = `drafts.${document._id}`;
  const issues = [...plan.issues];
  if (plan.relatedCategorySlug) {
    const categoryId = categories[plan.relatedCategorySlug];
    if (categoryId) document.relatedCategory = { _type: "reference", _ref: categoryId };
    else issues.push({ severity: "error", code: "missing-category", message: `No published workCategory "${plan.relatedCategorySlug}".` });
  }
  // Services have a slug per language; posts one slug, unique within their language.
  const post = document._type === "blogPost";
  const slug = post
    ? (document.slug as { current?: string } | undefined)?.current
    : (document.slug as { ro?: { current?: string } } | undefined)?.ro?.current;
  const slugFilter = post
    ? `_type == "blogPost" && slug.current == $slug && language == $language`
    : `_type == "service" && slug.ro.current == $slug`;
  const references = documentReferences(document);
  const remote = await client.fetch<{
    published: string | null; draft: Record<string, unknown> | null; slugTakenBy: string[]; parent: string | null;
    publishedTargets: string[]; anyTargets: string[];
  }>(
    `{
      "published": *[_id == $id][0]._id,
      "draft": *[_id == $draftId][0],
      "slugTakenBy": *[defined($slug) && ${slugFilter} && !(_id in [$id, $draftId])]._id,
      "parent": *[_id in [$parent, "drafts." + $parent]][0]._id,
      "publishedTargets": *[_id in $strong]._id,
      "anyTargets": *[_id in $weak || _id in $weakDrafts]._id
    }`,
    {
      id: document._id, draftId, slug: slug ?? null, language: document.language ?? "ro", parent: plan.parentId ?? "",
      strong: references.strong, weak: references.weak, weakDrafts: references.weak.map((id) => `drafts.${id}`),
    },
  );
  for (const id of remote.slugTakenBy) issues.push({ severity: "error", code: "slug-taken", message: `Slug "${slug}" is used by ${id}.` });
  for (const id of references.strong.filter((target) => !remote.publishedTargets.includes(target))) {
    issues.push({ severity: "error", code: "missing-reference", message: `References ${id}, which is not published.` });
  }
  // Weak references point at documents another Phase 7 collection writes (global before home and blog).
  const found = new Set(remote.anyTargets.map((target) => target.replace(/^drafts\./, "")));
  for (const id of references.weak.filter((target) => !found.has(target) && !planned.has(target))) {
    issues.push(write
      ? { severity: "error", code: "missing-reference", message: `References ${id}, which does not exist yet; import its collection first.` }
      : { severity: "warning", code: "reference-pending", message: `References ${id}, written by another collection (import global first).` });
  }
  if (plan.parentId && !remote.parent && !planned.has(plan.parentId)) {
    issues.push({ severity: "error", code: "missing-parent", message: `Parent ${plan.parentId} does not exist and is not in this run.` });
  }
  const pending = JSON.stringify(document).match(/"_ref":"pending-/g)?.length ?? 0;
  if (write && pending) issues.push({ severity: "error", code: "assets-pending", message: `${pending} media are not uploaded; run migrate-assets --write first.` });

  const result: DocumentResult = { key: plan.key, id: document._id, status: "create", media: plan.images.length, pending, issues, review: plan.review };
  if (issues.some((issue) => issue.severity === "error")) return { ...result, status: "blocked" };
  if (remote.published) return { ...result, status: "published-exists" };
  if (remote.draft) {
    if (comparable(remote.draft) === comparable(document)) return { ...result, status: "unchanged" };
    result.status = "update";
  }
  if (!write) return result;
  try {
    await client.createOrReplace(
      // Only types with a `legacy` field carry provenance (projects, services, catalogue, blog).
      document.legacy
        ? { ...document, _id: draftId, legacy: { ...(document.legacy as object), migratedAt: new Date().toISOString() } }
        : { ...document, _id: draftId },
      { visibility: "sync" },
    );
    return { ...result, status: result.status === "update" ? "updated" : "created" };
  } catch (error) {
    return { ...result, status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
