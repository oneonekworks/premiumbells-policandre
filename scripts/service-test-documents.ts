// Hand-made test documents for the Phase 6 service routes and browser tests
// (tests/browser/services.spec.ts). Dry run by default: prints the plan.
//
//   npm run services:test-docs              # plan only, no writes
//   npm run services:test-docs -- --write   # create or replace them, published
//   npm run services:test-docs -- --delete  # remove them and any drafts
//
// Export the dataset first. Photos reuse existing image assets; no uploads.
// IDs start with `test-phase6-` and the documents are Romanian only.
import { parseArgs } from "node:util";
import { createClient } from "@sanity/client";
import { API_VERSION, createWriteClient } from "./lib/import-run";
import { findPriceTextInValue } from "./lib/price-text";

const { values } = parseArgs({ options: { write: { type: "boolean" }, delete: { type: "boolean" } } });

const testIds = {
  service: "test-phase6-service",
  variant: "test-phase6-variant",
  hidden: "test-phase6-hidden",
  catalog7: "test-phase6-catalog-07",
  catalog1: "test-phase6-catalog-01",
};

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1fzbw4s1",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: API_VERSION,
  useCdn: false,
  perspective: "published",
});

const key = (name: string) => name.replace(/[^a-z0-9]/gi, "").slice(0, 12);
const image = (ref: string, name: string) => ({ _type: "imageWithMetadata", _key: key(name), asset: { _type: "reference", _ref: ref } });
const ro = (text: string) => ({ _type: "localeString", ro: text });
const roText = (text: string) => ({ _type: "localeText", ro: text });
const slug = (roSlug: string, enSlug?: string) => ({
  _type: "localeSlug",
  ro: { _type: "slug", current: roSlug },
  ...(enSlug ? { en: { _type: "slug", current: enSlug } } : {}),
});

type TestDocument = { _id: string; _type: string } & Record<string, unknown>;

function plan(assets: string[], categoryId: string | null, youtube: string | null): TestDocument[] {
  const photo = (index: number) => assets[index % assets.length];
  const base = { publishedLanguages: ["ro"], status: "active" };
  const service = {
    _id: testIds.service, _type: "service", ...base,
    title: ro("Serviciu de test"), slug: slug("test-serviciu", "test-service"), displayOrder: 5,
    cardLabel: ro("Doar pentru teste"), summary: roText("Pagină de test pentru serviciile din etapa 6. Se șterge după verificare."),
    coverImage: image(photo(0), "cover"),
    body: { _type: "localeBlockContent", ro: [{ _type: "block", _key: "b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s1", marks: [], text: "Text de prezentare al serviciului de test." }] }] },
    ...(categoryId ? { relatedCategory: { _type: "reference", _ref: categoryId } } : {}),
    sections: [
      { _type: "sectionModels", _key: "models", heading: ro("Modele"), models: [
        { _type: "model", _key: "modela", title: ro("Model A"), anchorId: "Model-A", description: roText("Descrierea modelului A."),
          cover: image(photo(1), "modelacover"), gallery: [image(photo(2), "modela1"), image(photo(3), "modela2")],
          specifications: [{ _type: "specification", _key: "spec1", label: ro("Înălțime"), value: "250", unit: "cm" }] },
        { _type: "model", _key: "modelb", title: ro("Model B"), cover: image(photo(4), "modelbcover") },
      ] },
      { _type: "sectionBellSizes", _key: "sizes", heading: ro("Dimensiuni clopote"), rows: [
        { _type: "bellSize", _key: "r1", weightKg: 160, diameterCm: 65, heightCm: 55, note: "Mi" },
        { _type: "bellSize", _key: "r2", weightKg: 1100, diameterCm: 125, heightCm: 105, note: "Do" },
      ], note: roText("Include: limba, icoane, text, ornamente, jug de stejar și transport până la biserică.") },
      { _type: "sectionBellSets", _key: "sets", heading: ro("Seturi de clopote"), sets: [
        { _type: "bellSet", _key: "set1", title: ro("Set de 3 clopote"), weightsKg: [160, 80, 40], withElectronicRinger: true },
      ] },
      ...(youtube ? [{ _type: "sectionVideos", _key: "videos", heading: ro("Video"), videos: [
        { _type: "video", _key: "v1", provider: "youtube", url: youtube, title: ro("Videoclip de test") },
      ] }] : []),
      { _type: "sectionCatalogue", _key: "catalog", heading: ro("Catalog"), families: ["policandre"] },
      { _type: "sectionGallery", _key: "gallery", heading: ro("Galerie"), images: [image(photo(5), "g1"), image(photo(6), "g2")] },
    ],
  };
  const variant = {
    _id: testIds.variant, _type: "service", ...base, parent: { _type: "reference", _ref: testIds.service },
    title: ro("Variantă de test"), slug: slug("test-varianta"), displayOrder: 10,
    summary: roText("Variantă de test a serviciului de test."), coverImage: image(photo(7), "variantcover"),
    sections: [{ _type: "sectionCta", _key: "cta", label: ro("Cereți o ofertă"), contact: "phone" }],
  };
  const hidden = {
    ...variant, _id: testIds.hidden, status: "hidden", title: ro("Variantă ascunsă de test"), slug: slug("test-ascuns"), displayOrder: 20,
  };
  const catalogItem = (id: string, n: number, extra: Record<string, unknown>) => ({
    _id: id, _type: "catalogItem", publishedLanguages: ["ro"], family: "policandre", displayOrder: n,
    title: ro(`Policandru de test nr. ${n}`), number: `nr. ${n}`, image: image(photo(n), `cat${n}`), ...extra,
  });
  return [
    service, variant, hidden,
    catalogItem(testIds.catalog1, 1, { levels: 1, candles: 12, heightCm: 85, diameterCm: 70, weightKg: 40 }),
    catalogItem(testIds.catalog7, 7, {
      levels: 3, candles: 48, heightCm: 310, diameterCm: 160, weightKg: 250, anchorIds: ["Policandru-7"],
      variants: [{ _type: "catalogVariant", _key: "v1", finish: "gilded", referenceCode: "110311" }],
    }),
  ];
}

async function main() {
  const ids = Object.values(testIds);
  if (values.delete) {
    const client = createWriteClient();
    const transaction = client.transaction();
    for (const id of [...ids].reverse()) transaction.delete(id).delete(`drafts.${id}`);
    await transaction.commit();
    console.log(`Deleted ${ids.length} test documents (and drafts).`);
    return;
  }
  const assets = await readClient.fetch<string[]>(`*[_type == "sanity.imageAsset"] | order(_createdAt asc)[0...8]._id`);
  if (assets.length < 1) throw new Error("No image assets found to reuse.");
  const categoryId = await readClient.fetch<string | null>(`*[_type == "workCategory" && slug.ro.current == "clopote"][0]._id`);
  const youtube = await readClient.fetch<string | null>(`*[_type == "project" && defined(videos[provider == "youtube"][0].url)][0].videos[provider == "youtube"][0].url`);
  const documents = plan(assets, categoryId, youtube);

  const hits = documents.flatMap((document) => findPriceTextInValue(document).map((hit) => `${document._id}: ${hit.path} „${hit.match}”`));
  if (hits.length) throw new Error(`Price text in the test documents:\n${hits.join("\n")}`);

  console.log(`${documents.length} test documents: ${documents.map(({ _id }) => _id).join(", ")}`);
  console.log(`Reusing ${assets.length} image assets; related category ${categoryId ?? "none"}; video ${youtube ? "yes" : "none"}.`);
  if (!values.write) {
    console.log("Dry run. Pass --write to create them (published) or --delete to remove them.");
    return;
  }
  const client = createWriteClient();
  const transaction = client.transaction();
  for (const document of documents) transaction.createOrReplace(document);
  await transaction.commit();
  console.log("Written and published.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
