import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildDocumentPlans, loadManifest, parseImportArgs } from "./lib/import-run";
import { countBlocks, htmlToInline, toSpans } from "./lib/legacy-article";
import { indexManifest } from "./lib/legacy-portfolio";
import { loadHomeSeed, mapPhase7 } from "./lib/legacy-home";

// Phase 7 importer essentials: the three articles convert with the block
// counts of the legacy pages, marks survive, the Raport price sentence blocks
// the record without its override, and a second run plans the same
// documents. Needs ../rbells-tw and the media manifest, like the other tests.

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyRoot = path.resolve(repo, "../rbells-tw");
const manifestFile = path.join(repo, ".migration/legacy-media-manifest.json");
const options = (collection: string) => ({ ...parseImportArgs([]), collection, manifestFile, legacyRoot });
const plans = (collection: string) => buildDocumentPlans(options(collection), () => undefined).plans;

test("the three articles convert with the legacy block counts and no errors", () => {
  const blog = plans("blog");
  const counts = Object.fromEntries(blog.map((plan) => [plan.key, countBlocks(plan.document.body as Array<{ _type: string }>)]));
  assert.deepEqual(counts, {
    "blog:clopotele-manastirii-putna": { paragraphs: 13, headings: 2, quotes: 1, listItems: 3, figures: 6, embeds: 1 },
    "blog:raport-18-ianuarie-2023": { paragraphs: 9, headings: 5, quotes: 0, listItems: 2, figures: 15, embeds: 0 },
    // The MP4 and its "Video" heading wait for YouTube (decision 2).
    "blog:clopotar-electronic-pt-clopote-fixe": { paragraphs: 10, headings: 2, quotes: 1, listItems: 0, figures: 3, embeds: 0 },
  });
  const errors = [...blog, ...plans("global"), ...plans("home")]
    .flatMap((plan) => plan.issues.filter((issue) => issue.severity === "error").map((issue) => `${plan.key}: ${issue.message}`));
  assert.deepEqual(errors, []);
});

test("marks and spaces follow the browser rendering", () => {
  const putna = plans("blog").find((plan) => plan.key === "blog:clopotele-manastirii-putna")!;
  const spans = (putna.document.body as Array<{ children?: Array<{ text: string; marks: string[] }> }>).flatMap((block) => block.children ?? []);
  assert.ok(spans.some((span) => span.text === "Buga" && span.marks.join() === "strong"));
  const text = spans.map((span) => span.text).join("");
  assert.match(text, /Stareț, arhimandritul/); // a space the JSX rule would drop
  assert.doesNotMatch(text, /Gherasim Soca/); // moved to `source`
  assert.deepEqual(toSpans(htmlToInline("creat de <strong>Belltron</strong> în <em>urmă</em>", [], "x"), "k").map(({ text, marks }) => [text, marks.join()]),
    [["creat de ", ""], ["Belltron", "strong"], [" în ", ""], ["urmă", "em"]]);
});

test("the Raport price sentence blocks the post without its override", () => {
  const seed = loadHomeSeed();
  const raport = seed.posts.find((post) => post.slug === "raport-18-ianuarie-2023")!;
  raport.replacements = raport.replacements.filter((item) => !item.find.startsWith("In preț"));
  const [plan] = mapPhase7("blog", {
    legacyRoot, manifest: indexManifest(loadManifest(manifestFile)), resolveAsset: () => undefined,
    seed: { ...seed, posts: [raport] },
  });
  assert.deepEqual(plan.issues.filter((issue) => issue.severity === "error").map((issue) => issue.code), ["price-word"]);
});

test("a second run plans identical documents", () => {
  for (const collection of ["global", "home", "blog"]) {
    assert.deepEqual(JSON.stringify(plans(collection).map((plan) => plan.document)), JSON.stringify(plans(collection).map((plan) => plan.document)), collection);
  }
});
