import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { ManifestAsset } from "./lib/legacy-media";
import {
  findPlanConflicts,
  htmlToText,
  loadLegacyPortfolio,
  looksLikeSeveralFacts,
  mapLegacyProject,
  normalizeYouTubeUrl,
  parseSpecificationValue,
  projectDocumentId,
  selectWorks,
  slugFromPage,
  sourceHash,
  type LegacyWork,
  type MapContext,
} from "./lib/legacy-portfolio";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const legacyRoot = path.resolve(scriptDirectory, "../../rbells-tw");

const asset = (canonical: string, extra: Partial<ManifestAsset> = {}): [string, ManifestAsset] => [
  canonical,
  {
    id: canonical,
    canonical,
    origin: "gcs",
    kind: "image",
    references: [],
    presentInSource: false,
    referenced: true,
    migrationDisposition: "include",
    usages: [],
    remote: { checkedAt: "", ok: true, status: 200 },
    ...extra,
  } as ManifestAsset,
];

const work: LegacyWork = {
  _nr: 42,
  title: "Parohia Ziua Crucii, Iași",
  subtitle: "Clopot 310kg, 2022",
  year: "2022",
  briefInfo: "2022",
  page: "2022-parohia-ziua-crucii-iasi",
  country: "România",
  cover: "https://storage.googleapis.com/rbells/lucrarile-noastre/a/cover.jpg",
  description: "Montarea clopotelor ",
  descriptionLine2: " ",
  information: { Greutate: "310kg", Diametru: "" },
  gallery: ["lucrarile-noastre/a/1.jpg", "lucrarile-noastre/a/2.jpg", "lucrarile-noastre/a/gone.jpg"],
  videoGallery: ["https://www.youtube.com/embed/VQfXmk_547Q?si=tracking", "https://example.com/clip.mp4"],
};

const context = (overrides: Partial<MapContext> = {}): MapContext => ({
  collection: "worksClopote",
  index: 2,
  legacyRoot,
  categoryId: "category-clopote",
  manifest: new Map([
    asset("gcs://rbells/lucrarile-noastre/a/cover.jpg"),
    asset("gcs://rbells/lucrarile-noastre/a/1.jpg"),
    asset("gcs://rbells/lucrarile-noastre/a/2.jpg"),
    asset("gcs://rbells/lucrarile-noastre/a/gone.jpg", { migrationDisposition: "exclude" }),
  ]),
  override: { location: { locality: "Iași", county: "Iași", country: "RO" } },
  resolveAsset: (canonical) => `image-${path.posix.basename(canonical, ".jpg")}-100x100-jpg`,
  ...overrides,
});

test("derives slugs and deterministic public document IDs from the legacy page", () => {
  assert.equal(slugFromPage("2022-schitul_duca"), "schitul-duca");
  assert.equal(slugFromPage("2022-rosu-chiajna-sfintire"), "rosu-chiajna-sfintire");
  assert.equal(slugFromPage("Mănăstirea_Făget"), "manastirea-faget");
  const id = projectDocumentId("worksClopote", { page: "2022-schitul_duca" });
  assert.equal(id, "legacy-clopote-2022-schitul_duca");
  assert.match(id, /^[A-Za-z0-9_-]+$/, "dotted IDs would be private");
});

test("splits a single value and unit, and flags values holding several facts", () => {
  assert.deepEqual(parseSpecificationValue("310kg"), { value: "310", unit: "kg" });
  assert.deepEqual(parseSpecificationValue(" 0,8 m "), { value: "0,8", unit: "m" });
  assert.deepEqual(parseSpecificationValue("III nivele"), { value: "III nivele" });
  assert.equal(looksLikeSeveralFacts("460kg si 620kg"), true);
  assert.equal(looksLikeSeveralFacts("310kg"), false);
});

test("turns legacy description HTML into plain text lines", () => {
  assert.equal(
    htmlToText("<h3>Automatizare 10 clopote. </h3><br /> Pe <strong>muntele Athos</strong> , <em>dangatele</em>.￼"),
    "Automatizare 10 clopote.\nPe muntele Athos, dangatele.",
  );
  assert.equal(htmlToText(" "), "");
  assert.equal(htmlToText(undefined), "");
});

test("normalises YouTube embeds to watch URLs without tracking", () => {
  assert.equal(
    normalizeYouTubeUrl("https://www.youtube.com/embed/VQfXmk_547Q?si=uBMU3KEVSfB5Gg2A"),
    "https://www.youtube.com/watch?v=VQfXmk_547Q",
  );
  assert.equal(normalizeYouTubeUrl("https://example.com/clip.mp4"), undefined);
});

test("maps a legacy record to a Romanian-only project draft", () => {
  const plan = mapLegacyProject(work, context());
  const { document } = plan;
  assert.equal(document._id, "legacy-clopote-2022-parohia-ziua-crucii-iasi");
  assert.deepEqual(document.publishedLanguages, ["ro"]);
  assert.equal(document.slug.current, "parohia-ziua-crucii-iasi");
  assert.equal(document.year, 2022);
  assert.equal(document.summary?.ro, "Montarea clopotelor");
  assert.equal(document.location.locality, "Iași");
  assert.equal(document.coverImage?.asset._ref, "image-cover-100x100-jpg");
  assert.deepEqual(document.gallery.map((image) => image.asset._ref), ["image-1-100x100-jpg", "image-2-100x100-jpg"]);
  assert.equal(new Set(document.gallery.map((image) => image._key)).size, 2);
  assert.deepEqual(document.specifications?.map(({ label, value, unit }) => [label.ro, value, unit]), [["Greutate", "310", "kg"]]);
  assert.deepEqual(document.videos?.map((video) => [video.url, video.title.ro]), [
    ["https://www.youtube.com/watch?v=VQfXmk_547Q", "Parohia Ziua Crucii, Iași – video 1"],
  ]);
  assert.equal(document.featured, false);
  assert.equal(document.legacy.legacyId, "42");
  assert.equal(document.legacy.sourceHash, sourceHash(work));
  assert.ok(!JSON.stringify(document).includes("price"));
  assert.deepEqual(plan.issues.map((issue) => issue.code).sort(), ["excluded-image", "unsupported-video"]);
  assert.deepEqual(plan.review, ['subtitle not imported: "Clopot 310kg, 2022"']);
});

test("drops placeholder specification values such as \"-\"", () => {
  const { document, issues } = mapLegacyProject({ ...work, information: { Greutate: "-" } }, context());
  assert.equal(document.specifications, undefined);
  assert.equal(issues.some((issue) => issue.code === "several-facts"), false);
});

test("is deterministic, so re-running produces the same document", () => {
  assert.deepEqual(mapLegacyProject(work, context()).document, mapLegacyProject(work, context()).document);
});

test("blocks records without a cover or usable photos, and in maintenance", () => {
  const plan = mapLegacyProject(
    { ...work, cover: undefined, gallery: ["lucrarile-noastre/a/gone.jpg"], _isInMaintenance: true },
    context(),
  );
  const errors = plan.issues.filter((issue) => issue.severity === "error").map((issue) => issue.code).sort();
  assert.deepEqual(errors, ["empty-gallery", "maintenance", "missing-cover"]);
});

test("uses overrides for split specifications and marks unresolved assets as pending", () => {
  const plan = mapLegacyProject(
    { ...work, information: { Greutate: "460kg si 620kg" } },
    context({
      override: {
        location: { locality: "Roșu, Chiajna", county: "Ilfov", country: "RO" },
        specifications: [{ label: "Greutate", value: "460", unit: "kg" }, { label: "Greutate", value: "620", unit: "kg" }],
      },
      resolveAsset: () => undefined,
    }),
  );
  assert.equal(plan.document.specifications?.length, 2);
  assert.ok(plan.document.gallery.every((image) => image.asset._ref.startsWith("pending-")));
  assert.ok(!plan.issues.some((issue) => issue.code === "several-facts"));
  assert.ok(plan.issues.some((issue) => issue.code === "asset-not-uploaded"));
});

test("reports duplicate slugs within one import", () => {
  const first = mapLegacyProject(work, context());
  const second = mapLegacyProject({ ...work, page: "2023-parohia-ziua-crucii-iasi" }, context());
  assert.deepEqual(findPlanConflicts([first, second]).map((issue) => issue.code), ["duplicate-slug"]);
});

test("finds the three representative Clopote records in the legacy data", () => {
  const portfolio = loadLegacyPortfolio(legacyRoot);
  const selected = selectWorks(portfolio, "worksClopote", [
    "2022-schitul_duca",
    "2022-parohia-ziua-crucii-iasi",
    "2022-rosu-chiajna-sfintire",
  ]);
  assert.equal(selected.length, 3);
  assert.throws(() => selectWorks(portfolio, "worksClopote", ["does-not-exist"]), /No worksClopote record/);
});
