// Hand-made test documents for the Phase 7 home page and its browser tests
// (tests/browser/home.spec.ts). Dry run by default: prints the plan.
//
//   npm run home:test-docs                          # plan only, no writes
//   npm run home:test-docs -- --write               # create or replace them, published
//   npm run home:test-docs -- --write --hide audio  # the same with one section switched off
//   npm run home:test-docs -- --delete              # remove them (homePage only while it is the test one)
//
// Export the dataset first. Photos and the MP3 reuse existing assets; no
// uploads. Post 1 carries every article block (headings, quote, lists,
// marks, external and internal links, figure, gallery, video, audio) and the
// related project and service for the blog checks (tests/browser/blog.spec.ts). IDs start with `test-phase7-`, except the `homePage` singleton,
// which the importer replaces in step 9. Romanian only.
import { parseArgs } from "node:util";
import { createClient } from "@sanity/client";
import { API_VERSION, createWriteClient } from "./lib/import-run";
import { findPriceTextInValue } from "./lib/price-text";

const sections = ["services", "testimonial", "audio", "blog", "about"] as const;
const { values } = parseArgs({
  options: { write: { type: "boolean" }, delete: { type: "boolean" }, hide: { type: "string" } },
});
if (values.hide && !sections.includes(values.hide as (typeof sections)[number])) {
  throw new Error(`--hide takes one of: ${sections.join(", ")}`);
}

export const testHomeTitle = "Policandre, clopote și iconostase";
const testIds = {
  person: "test-phase7-person",
  testimonial: "test-phase7-testimonial",
  audio: "test-phase7-audio",
  posts: ["test-phase7-post-1", "test-phase7-post-2", "test-phase7-post-3"],
};

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1fzbw4s1",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: API_VERSION,
  useCdn: false,
  perspective: "published",
});

const ref = (id: string) => ({ _type: "reference", _ref: id });
const image = (assetId: string) => ({ _type: "imageWithMetadata", asset: ref(assetId) });
const ro = (text: string) => ({ _type: "localeString", ro: text });
const roText = (text: string) => ({ _type: "localeText", ro: text });
const block = (key: string, text: string, style = "normal") => ({
  _type: "block", _key: key, style, markDefs: [], children: [{ _type: "span", _key: `${key}s`, marks: [], text }],
});
const link = (label: string, fields: Record<string, unknown>) => ({ _type: "siteLink", label: ro(label), ...fields });

type TestDocument = { _id: string; _type: string } & Record<string, unknown>;
type Inputs = { photos: string[]; mp3: string; youtube: string; projects: string[]; service: string };

const span = (key: string, text: string, marks: string[] = []) => ({ _type: "span", _key: key, marks, text });
const listItem = (key: string, text: string, listItem: "bullet" | "number") => ({ ...block(key, text), listItem, level: 1 });

/** Every `articleBody` block type once, for the article page checks. */
function richBody({ photos, mp3, youtube, projects, service }: Inputs, photo: (index: number) => string) {
  return [
    block("lead", "Primul paragraf al articolului de test. Textul are suficiente cuvinte pentru un timp de citire realist. ".repeat(3)),
    block("h2a", "Un subtitlu de test", "h2"),
    {
      _type: "block", _key: "marks", style: "normal",
      markDefs: [
        { _type: "link", _key: "ext", href: "https://www.putna.ro" },
        { _type: "internalLink", _key: "proj", reference: ref(projects[0]) },
        { _type: "internalLink", _key: "serv", reference: ref(service) },
        { _type: "internalLink", _key: "post", reference: ref(testIds.posts[1]) },
      ],
      children: [
        span("m1", "Un paragraf cu "), span("m2", "text îngroșat", ["strong"]), span("m3", ", "),
        span("m4", "text cursiv", ["em"]), span("m5", ", o "), span("m6", "legătură externă", ["ext"]),
        span("m7", ", o "), span("m8", "lucrare din portofoliu", ["proj"]), span("m9", ", un "),
        span("m10", "serviciu", ["serv"]), span("m11", " și un "), span("m12", "alt articol", ["post"]), span("m13", "."),
      ],
    },
    { _type: "imageWithMetadata", _key: "fig", asset: ref(photo(4)), alt: ro("Clopote montate în turn, fotografie de test"), caption: ro("Legendă de test pentru fotografie.") },
    block("h3a", "Un subtitlu de nivel trei", "h3"),
    listItem("ul1", "Primul punct al listei", "bullet"), listItem("ul2", "Al doilea punct al listei", "bullet"),
    listItem("ol1", "Primul pas", "number"), listItem("ol2", "Al doilea pas", "number"),
    block("quote", "Tot ce suflă să laude pe Domnul.", "blockquote"),
    { _type: "articleGallery", _key: "gal", images: photos.slice(0, 6).map((asset, index) => ({ _type: "imageWithMetadata", _key: `g${index}`, asset: ref(asset) })) },
    block("before-video", "Paragraf de test înainte de videoclip. ".repeat(4)),
    { _type: "video", _key: "vid", provider: "youtube", url: youtube, title: ro("Videoclip de test în articol"), poster: image(photo(5)) },
    { _type: "articleAudio", _key: "aud", title: "Înregistrare de test în articol", file: { _type: "file", asset: ref(mp3) } },
    block("end", "Ultimul paragraf al articolului de test. ".repeat(5)),
  ];
}

function plan(inputs: Inputs, hide?: string): TestDocument[] {
  const { photos, mp3, youtube, projects, service } = inputs;
  const photo = (index: number) => photos[index % photos.length];
  const enabled = (name: string) => name !== hide;

  const person = { _id: testIds.person, _type: "person", name: "Autor de test", role: ro("Director"), portrait: image(photo(1)) };
  const testimonial = {
    _id: testIds.testimonial, _type: "testimonial", name: "Persoană de test", role: ro("Director, Premium Bells"),
    context: ro("Mănăstire de test, 2016"), portrait: image(photo(1)), date: "2016-07-10",
    quote: roText("Text de test pentru mărturie: clopotele au fost binecuvântate la sfințirea turnului, iar comunitatea a participat la întreaga lucrare, de la proiect până la montaj."),
  };
  const audio = {
    _id: testIds.audio, _type: "audioFeature", title: ro("Înregistrare de test"),
    context: roText("Un set de clopote înregistrat la probă. Folosit doar pentru verificarea primei pagini."),
    audio: { _type: "file", asset: ref(mp3) }, artwork: image(photo(2)), durationSeconds: 41,
    transcript: roText("Înregistrarea nu are text vorbit."),
  };
  const kinds = ["article", "report", "video"];
  const posts = testIds.posts.map((id, index) => ({
    _id: id, _type: "blogPost", language: "ro", kind: kinds[index],
    title: `Articol de test numărul ${index + 1} despre clopote și policandre`,
    slug: { _type: "slug", current: `test-articol-${index + 1}` },
    publishedAt: `2023-02-${17 + index}`,
    excerpt: "Rezumat de test pentru cardul de pe prima pagină. Se șterge după verificare.",
    cover: image(photo(3 + index)), author: ref(testIds.person),
    body: index === 0 ? richBody(inputs, photo)
      : Array.from({ length: 6 * (index + 1) }, (_, n) => block(`p${n}`, "Paragraf de test pentru calculul timpului de citire. ".repeat(6))),
    // Post 1 links to both projects and the service; post 2 to the first project, so its "Din blog" lists two posts.
    ...(index === 0 ? {
      source: { text: "Text de test: Mănăstire de test", url: "https://www.putna.ro" },
      relatedProjects: projects.map((id, n) => ({ ...ref(id), _key: `rp${n}` })),
      relatedServices: [{ ...ref(service), _key: "rs0" }],
    } : index === 1 ? { relatedProjects: [{ ...ref(projects[0]), _key: "rp0" }] } : {}),
  }));
  const homePage = {
    _id: "homePage", _type: "homePage", publishedLanguages: ["ro"],
    hero: {
      title: ro(testHomeTitle), highlight: ro("produse în lumea ortodoxă, clasa Premium"),
      tagline: ro("Confecționate de către ortodocși pentru ortodocși"),
      lead: roText("Text de test pentru deschidere: lucrăm cu turnătorii și ateliere din Rusia și Grecia și montăm lucrările în biserici din România și Republica Moldova."),
      image: image(photo(0)),
      primaryCta: link("Vezi lucrările", { kind: "page", page: "works" }),
      secondaryCta: link("Cereți o ofertă", { kind: "phone" }),
    },
    services: {
      enabled: enabled("services"), eyebrow: ro("Descoperă"), heading: ro("Serviciile noastre"),
      intro: { _type: "localeBlockContent", ro: [block("i1", "Text de test pentru serviciile de pe prima pagină.")] },
    },
    catalogues: { enabled: false, heading: ro("Descarcă cataloagele noastre") },
    testimonial: { enabled: enabled("testimonial"), testimonial: ref(testIds.testimonial) },
    audio: { enabled: enabled("audio"), eyebrow: ro("Audio"), recording: ref(testIds.audio) },
    blog: { enabled: enabled("blog"), heading: ro("De pe blog"), intro: ro("Articole, rapoarte și video") },
    about: {
      enabled: enabled("about"), heading: ro("Despre noi"),
      body: { _type: "localeBlockContent", ro: [block("a1", "Text de test pentru secțiunea despre noi, cu turnătoriile partenere și lucrările montate.")] },
      poster: image(photo(6)),
      video: { _type: "video", provider: "youtube", url: youtube, title: ro("Videoclip de test despre noi") },
      cta: link("Vizitați lucrările noastre", { kind: "page", page: "works" }),
    },
    seo: { _type: "seo", metaTitle: ro("Premium Bells – pagină de test"), metaDescription: ro("Descriere de test pentru prima pagină.") },
  };
  return [person, testimonial, audio, ...posts, homePage];
}

async function main() {
  const ids = [testIds.person, testIds.testimonial, testIds.audio, ...testIds.posts];
  if (values.delete) {
    const homeTitle = await readClient.fetch<string | null>(`*[_id == "homePage"][0].hero.title.ro`);
    const client = createWriteClient();
    const transaction = client.transaction();
    // The home page goes first: it references the others.
    if (homeTitle === testHomeTitle) transaction.delete("homePage").delete("drafts.homePage");
    for (const id of [...testIds.posts, testIds.testimonial, testIds.audio, testIds.person]) transaction.delete(id).delete(`drafts.${id}`);
    await transaction.commit();
    console.log(`Deleted ${ids.length} test documents (and drafts)${homeTitle === testHomeTitle ? " and the test homePage" : "; homePage kept (not the test one)"}.`);
    return;
  }
  const photos = await readClient.fetch<string[]>(
    `*[_type == "project" && defined(coverImage.asset)] | order(_id asc)[0...8].coverImage.asset._ref`);
  const mp3 = await readClient.fetch<string | null>(`*[_type == "sanity.fileAsset" && mimeType == "audio/mpeg"] | order(originalFilename asc)[0]._id`);
  const youtube = await readClient.fetch<string | null>(`*[_type == "project" && defined(videos[provider == "youtube"][0].url)] | order(_id asc)[0].videos[provider == "youtube"][0].url`);
  // Two public projects with a category, and one active top-level service.
  const projects = await readClient.fetch<string[]>(
    `*[_type == "project" && defined(slug.current) && defined(category->slug.ro.current) && "ro" in coalesce(publishedLanguages, ["ro"])] | order(_id asc)[0...2]._id`);
  const service = await readClient.fetch<string | null>(
    `*[_type == "service" && status == "active" && !defined(parent) && defined(slug.ro.current)] | order(displayOrder asc, _id asc)[0]._id`);
  const existingHome = await readClient.fetch<string | null>(`*[_id == "homePage"][0].hero.title.ro`);
  if (photos.length < 6 || !mp3 || !youtube || projects.length < 2 || !service) {
    throw new Error("Not enough existing content to reuse (6 photos, an MP3, a YouTube link, 2 projects, a service).");
  }
  if (existingHome && existingHome !== testHomeTitle) throw new Error("A real homePage is published; refusing to replace it.");
  const documents = plan({ photos, mp3, youtube, projects, service }, values.hide);

  const hits = documents.flatMap((document) => findPriceTextInValue(document).map((hit) => `${document._id}: ${hit.path} „${hit.match}”`));
  if (hits.length) throw new Error(`Price text in the test documents:\n${hits.join("\n")}`);

  console.log(`${documents.length} test documents: ${documents.map(({ _id }) => _id).join(", ")}`);
  console.log(`Reusing ${photos.length} photos, 1 MP3 and 1 YouTube link; hidden section: ${values.hide ?? "none (catalogues stay off)"}.`);
  console.log(`Post 1 links to projects ${projects.join(", ")} and service ${service}.`);
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
