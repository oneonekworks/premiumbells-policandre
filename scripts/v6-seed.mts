// Seeds the v6 "Clarity" content (docs/design-plan.md, V2 step 4) as DRAFTS,
// one step at a time, from the published documents plus the board copy in
// docs/design/clarity-v6/copy. Dry run by default: prints every changed field,
// the length and price checks, and any existing draft it would replace.
// Nothing is published; review the drafts in the Studio. Export the dataset
// before `--write`.
//
//   npx tsx scripts/v6-seed.mts --step home              # a. plan only
//   npx tsx scripts/v6-seed.mts --step services --write  # b. write drafts
//   npx tsx scripts/v6-seed.mts --step categories        # c.
//
// Steps: home (a) · services (b) · categories (c). Step d (BE / GR countries)
// has nothing to change: no work in Belgium or Greece is in the CMS yet.
import { parseArgs } from "node:util";
import type { SanityDocument } from "@sanity/client";
import { createWriteClient } from "./lib/import-run";
import { findPriceTextInValue } from "./lib/price-text";

const { values } = parseArgs({ options: { step: { type: "string" }, write: { type: "boolean" } } });
const steps = ["home", "services", "categories"] as const;
type Step = (typeof steps)[number];
if (!steps.includes(values.step as Step)) throw new Error(`--step must be one of ${steps.join(", ")}`);
const step = values.step as Step;

const ro = (text: string) => ({ _type: "localeString", ro: text });
const ref = (id: string) => ({ _type: "reference", _ref: id });
const image = (assetId: string) => ({ _type: "imageWithMetadata", asset: ref(assetId) });

type Fields = Record<string, unknown>;
/** Field limits from the Studio schema, checked here so a draft never fails validation. */
const limits: Record<string, number> = { shortName: 24, cardLabel: 60, figure: 8, line: 50, title: 24, insetLine: 32, offerLine: 120, label: 60, sliceLine: 48, lead: 160, intro: 200 };
const tooLong: string[] = [];
const check = (where: string, field: keyof typeof limits, text?: string) => {
  if (text && text.length > limits[field]) tooLong.push(`${where} · ${field} "${text}" (${text.length} > ${limits[field]})`);
};

// ── a. Home page ──────────────────────────────────────────────────────────
function homeChanges(published: SanityDocument): Fields {
  const section = (name: string) => ({ ...((published[name] ?? {}) as Fields) });
  const hero = section("hero");
  const slices = (hero.slices as Fields[]).filter((slice) => slice._key !== "iconostase");
  const figures = [
    { _type: "heroFigure", _key: "foundries", source: "manual", value: 12, label: ro("turnătorii reprezentate, cele mai cotate din lumea ortodoxă") },
    { _type: "heroFigure", _key: "works", source: "projects", label: ro("lucrări în parohii și mănăstiri") },
    // Manual: the CMS has works in RO, MD and ES only; Belgium and Athos come later.
    { _type: "heroFigure", _key: "countries", source: "manual", value: 5, label: ro("țări: România, Moldova, Spania, Belgia și Grecia (Muntele Athos)") },
  ];
  figures.forEach((figure) => check("hero.figures", "label", figure.label.ro));
  const slice = { _type: "heroSlice", _key: "reconditionare", service: ref("legacy-service-reconditionare-policandre"), line: ro("Policandre și clopote · curățate, lustruite, lăcuite") };
  check("hero.slices", "sliceLine", slice.line.ro);
  const services = { ...section("services"), lead: ro("Policandre turnate la Moscova și Iaroslavl, clopote de până la 16 tone, iconostase din marmură și lemn cu aur, uși din cupru.") };
  const works = { ...section("works"), heading: ro("Din lucrările noastre"), lead: ro("Peste 60 de lucrări, din România și Moldova până în Spania, Belgia și la Muntele Athos.") };
  const blog = { ...section("blog"), intro: ro("Articole, rapoarte și videoclipuri din lucrările noastre") };
  check("services", "lead", services.lead.ro);
  check("works", "lead", works.lead.ro);
  check("blog", "intro", blog.intro.ro);
  return {
    hero: {
      ...hero,
      highlight: ro("produse în lumea ortodoxă, clasa Premium"),
      figures,
      slices: [...slices, slice],
    },
    services,
    works,
    blog,
  };
}

// ── b. Services ───────────────────────────────────────────────────────────
type Fact = [figure: string, line: string];
type Inset = [assetId: string, title: string, line: string];
type ServiceSeed = { shortName?: string; cardLabel?: string; facts?: Fact[]; insets?: [Inset, Inset]; status?: "hidden" };

const dej = {
  glob: "image-1b710442a52db25373ce84a46e3b705081315391-1898x2842-webp",
  below: "image-0fa6d6c2dbb24b89e4357825a6a44c3b916fa409-1837x2750-webp",
  lit: "image-6fb13b0ad6989c1c6bcd65d718a35e9ebd33a83b-1831x2741-webp",
};

// Copy: docs/design/clarity-v6/copy/<page>.md (hero "Pe scurt" and the two
// insets). Photos picked from each page's own works in Sanity, matching the
// boards' inset captions.
const serviceSeeds: Record<string, ServiceSeed> = {
  "legacy-service-policandre": {
    cardLabel: "1–7 nivele, clasa premium",
    facts: [["1–7", "nivele, după înălțimea naosului"], ["11", "lucrări cu policandre"], ["3", "stiluri: „brad”, „horă”, bizantin"]],
    insets: [[dej.glob, "Glob și căni aurite", "Dej III, 2023"], [dej.below, "Văzut de jos", "3 nivele, aprins"]],
  },
  "legacy-service-policandre-la-comanda": {
    shortName: "Proiecte la comandă",
    cardLabel: "După naosul dumneavoastră",
    facts: [["3D", "proiect înainte de turnare"], ["4", "pași, de la naos la turnare"], ["Bronz", "turnat masiv"]],
    insets: [
      ["image-49a23919f4d840ccdec6e1b2553dc564a3a82c0e-1130x1600-jpg", "Proiect 3D", "fiecare nivel, desenat"],
      [dej.lit, "Turnat după proiect", "Dej III, 2023"],
    ],
  },
  "legacy-service-reconditionare-policandre": {
    shortName: "Recondiționare",
    cardLabel: "Policandre și clopote",
    facts: [["4", "etape: șlefuire, purificare, sudură, lustruire"], ["2022", "Catedrala Sf. Alexandru, Alexandria"], ["Lac", "opțional, pentru o durabilitate mai lungă"]],
    insets: [
      ["image-acda84ceb360003b0b369c79d377e605e73b8d46-2048x1366-webp", "Șlefuire", "etapa 1 din 4"],
      ["image-2a68ee58a293862ec2524e13cda268b3218dd70b-2048x1366-webp", "În catedrală", "Alexandria, 2022"],
    ],
  },
  "legacy-service-clopote-cu-jug": {
    cardLabel: "Cu balans, până la 16 tone",
    facts: [["16 t", "cel mai mare clopot cu jug"], ["2", "juguri: din stejar sau din oțel"], ["Inclus", "transportul până la biserică și TVA"]],
    insets: [
      ["image-f6db0e479c7c4d9be691c595ad74b777e26d61a2-2052x3109-webp", "Todirești II", "270 kg, 2022"],
      ["image-8363ae79259363c0236f6477a3a97b1d0fdc5b03-1068x1600-jpg", "Bolintin Vale", "clopot cu jug, 2021"],
    ],
  },
  "legacy-service-clopote-fara-balans": {
    facts: [["Fixe", "doar limba se trage, ca la Athos"], ["Automat", "opțional, cu clopotarul electronic"], ["Inclus", "transportul până la biserică și TVA"]],
    insets: [
      ["image-3ffdf52cc00c1fbda0d4d72405fbc507efd77e19-3050x2031-webp", "Adâncata", "set de clopote fixe, 2022"],
      ["image-2da94d9a7cd29b280504ff394714b2f126d16137-3200x2400-jpg", "Pantocrator", "trase ca la Athos, 2017"],
    ],
  },
  "legacy-service-clopotar-electronic": {
    shortName: "Clopotar electronic",
    cardLabel: "Pentru clopote fixe",
    facts: [["1000", "melodii de înregistrat, și cele de la Athos"], ["10 ani", "memoria se păstrează la o pană de curent"], ["50 m", "raza telecomenzii de buzunar, opțională"]],
    insets: [
      ["image-d6f33027c6c4affec87310b64adf798ff4b084ca-576x1024-jpg", "Motor pe limbă", "clopotul sună natural"],
      ["image-75af31a6063c83a1506ff18251638da40fb4e7ac-1024x576-jpg", "Montaj în clopotniță", "motoare și panou electric"],
    ],
  },
  "legacy-service-automatizari-clopote-cu-balans": {
    // No insets: Sanity has only the product sheets; the boards' motor and
    // controller photos are not uploaded yet.
    shortName: "Automatizări",
    cardLabel: "Pentru clopote cu balans",
    facts: [["5", "seturi, pentru 2 sau 3 clopote"], ["620 kg", "cel mai mare clopot din seturi"], ["2", "telecomenzi în fiecare set"]],
  },
  "legacy-service-iconostase": {
    cardLabel: "Marmură, lemn cu aur",
    facts: [["2", "materiale: marmură și lemn aurit"], ["Pristol", "și jertfelnic din marmură, sculptate manual"], ["4", "pași, de la măsurători la montaj"]],
    insets: [
      ["image-3692c8a13c8f3c6fd8f5cf7f392475eb99943c77-3002x2001-webp", "Capitelul", "marmură cu frunze aurite"],
      ["image-ce94f3bbb8ea3432e7f1c7b18d32fd628b34d98f-3002x2001-webp", "Ușa diaconească", "înger în relief, aurit"],
    ],
  },
  "legacy-service-usi": {
    shortName: "Uși",
    cardLabel: "Cupru, cu sfinți în relief",
    facts: [["Cupru", "turnat, cu sfinți și scene în relief"], ["Pe măsură", "după înălțimea și lățimea ușii"], ["Proiect", "după desenul dumneavoastră"]],
    insets: [
      ["image-03976b67fd48364a4c881c11deb4efd4edc0a68d-2048x1364-jpg", "Mântuitorul pe timpan", "cupru turnat"],
      ["image-0e016b31859b45493ade9f1903ae275a9e600673-2048x1364-jpg", "Sfinți în relief", "detaliu"],
    ],
  },
  "legacy-service-iconostase-marmura": { shortName: "Marmură" },
  "legacy-service-iconostase-lemn-aur": { shortName: "Lemn sculptat cu aur" },
  "legacy-service-iconostase-pristol-marmura": { shortName: "Pristol și jertfelnic" },
  "legacy-service-iconostase-iconostas-bronz": { shortName: "Bronz", status: "hidden" },
};

function serviceChanges(id: string): Fields {
  const seed = serviceSeeds[id];
  const changes: Fields = {};
  if (seed.shortName) { check(id, "shortName", seed.shortName); changes.shortName = ro(seed.shortName); }
  if (seed.cardLabel) { check(id, "cardLabel", seed.cardLabel); changes.cardLabel = ro(seed.cardLabel); }
  if (seed.status) changes.status = seed.status;
  if (seed.facts) {
    changes.heroFacts = seed.facts.map(([figure, line], index) => {
      check(id, "figure", figure); check(id, "line", line);
      return { _type: "heroFact", _key: `fact${index}`, figure: ro(figure), line: ro(line) };
    });
  }
  if (seed.insets) {
    changes.heroInsets = seed.insets.map(([assetId, title, line], index) => {
      check(id, "title", title); check(id, "insetLine", line);
      return { _type: "heroInset", _key: `inset${index}`, image: image(assetId), title: ro(title), line: ro(line) };
    });
  }
  return changes;
}

// ── c. Work categories ────────────────────────────────────────────────────
const categorySeeds: Record<string, { craft: string; offerLine: string }> = {
  "f13530fe-3014-4a41-995a-4553121456dd": { craft: "policandre", offerLine: "Doriți un policandru asemănător?" },
  "93fcd11a-4076-4de2-8312-e450b78a7f80": { craft: "clopote", offerLine: "Doriți clopote asemănătoare?" },
  "category-automatizari": { craft: "clopote", offerLine: "Doriți o automatizare asemănătoare?" },
  "category-reconditionari": { craft: "reconditionari", offerLine: "Aveți un policandru sau un clopot de recondiționat?" },
  "category-usi": { craft: "iconostase-usi", offerLine: "Doriți uși asemănătoare?" },
};
function categoryChanges(id: string): Fields {
  const seed = categorySeeds[id];
  check(id, "offerLine", seed.offerLine);
  return { craft: seed.craft, offerLine: ro(seed.offerLine) };
}

// ── Run ───────────────────────────────────────────────────────────────────
const plan: Record<Step, { ids: string[]; changes: (doc: SanityDocument) => Fields }> = {
  home: { ids: ["homePage"], changes: homeChanges },
  services: { ids: Object.keys(serviceSeeds), changes: (doc) => serviceChanges(doc._id) },
  categories: { ids: Object.keys(categorySeeds), changes: (doc) => categoryChanges(doc._id) },
};

const client = createWriteClient();
const { ids, changes } = plan[step];
const published = await client.getDocuments(ids);
const drafts = await client.getDocuments(ids.map((id) => `drafts.${id}`));
const output: SanityDocument[] = [];
const allChanges: Record<string, Fields> = {};

ids.forEach((id, index) => {
  const doc = published[index];
  if (!doc) throw new Error(`Published document ${id} is missing.`);
  const changed = changes(doc);
  allChanges[id] = changed;
  const draft = { ...doc, ...changed, _id: `drafts.${id}` } as SanityDocument;
  delete (draft as Partial<SanityDocument>)._rev;
  output.push(draft);
});

const prices = findPriceTextInValue(allChanges, {});
console.log(JSON.stringify(allChanges, null, 2));
console.log(`\nLength check: ${tooLong.length ? `\n  ${tooLong.join("\n  ")}` : "all within the Studio limits"}`);
console.log(`Price check on the new values: ${prices.length ? JSON.stringify(prices) : "nothing found"}`);
const existing = drafts.filter(Boolean).map((draft) => draft!._id);
console.log(`Existing drafts: ${existing.length ? `${existing.join(", ")} (they would be replaced)` : "none"}`);
if (prices.some((finding) => finding.level === "error")) throw new Error("Price text found; nothing written.");
if (tooLong.length) console.log("Some values exceed the Studio limits; fix them before --write.");

if (!values.write) {
  console.log(`\nDry run: nothing written. Add --write to create ${output.length} draft(s).`);
} else {
  if (tooLong.length) throw new Error("Values exceed the Studio limits; nothing written.");
  const transaction = client.transaction();
  output.forEach((draft) => transaction.createOrReplace(draft));
  const result = await transaction.commit();
  console.log(`\nWrote ${output.length} draft(s) (transaction ${result.transactionId}). Nothing published.`);
}
