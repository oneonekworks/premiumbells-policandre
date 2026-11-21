// Seeds the v5.10 home page fields (docs/design-schema-proposal.md §3) as a
// DRAFT of the `homePage` singleton, from the published document plus the copy
// in docs/design-handoff/content/homepage.ro.json. Dry run by default: prints
// the changed sections. Nothing is published; review the
// draft in the Studio. Export the dataset before `--write`.
//
//   npx tsx scripts/home-v510-seed.mts            # plan only
//   npx tsx scripts/home-v510-seed.mts --write    # create or replace drafts.homePage
//
// Not changed here: service card labels and the testimonial (published
// documents of their own, separate approvals), images (the slices fall back
// to the service photos), the "Nou" badge (empty at launch).
import { parseArgs } from "node:util";
import { createWriteClient } from "./lib/import-run";

const { values } = parseArgs({ options: { write: { type: "boolean" } } });

const ref = (id: string) => ({ _type: "reference", _ref: id });
const keyedRef = (key: string, id: string) => ({ ...ref(id), _key: key });
const ro = (text: string) => ({ _type: "localeString", ro: text });

/** "**bold** plain" → one Portable Text block with strong marks. */
function boldBlock(key: string, text: string) {
  const children = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part, index) => {
    const bold = part.startsWith("**");
    return { _type: "span", _key: `${key}s${index}`, marks: bold ? ["strong"] : [], text: bold ? part.slice(2, -2) : part };
  });
  return { _type: "block", _key: key, style: "normal", markDefs: [], children };
}
const boldText = (key: string, lines: string[]) =>
  ({ _type: "localeBoldText", ro: lines.map((line, index) => boldBlock(`${key}${index}`, line)) });

const service = {
  policandre: "legacy-service-policandre",
  laComanda: "legacy-service-policandre-la-comanda",
  reconditionare: "legacy-service-reconditionare-policandre",
  clopote: "legacy-service-clopote",
  cuJug: "legacy-service-clopote-cu-jug",
  faraBalans: "legacy-service-clopote-fara-balans",
  clopotar: "legacy-service-clopotar-electronic",
  automatizari: "legacy-service-automatizari-clopote-cu-balans",
  iconostase: "legacy-service-iconostase",
  usi: "legacy-service-usi",
};
const statementId = "legacy-testimonial-putna";

const client = createWriteClient();
const published = await client.getDocument("homePage");
if (!published) throw new Error("The published homePage is missing.");
const existingDraft = await client.getDocument("drafts.homePage");

type Section = Record<string, unknown>;
const section = (name: string) => ({ ...((published[name] ?? {}) as Section) });
const without = (object: Section, ...keys: string[]) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));

const hero = {
  // Title left empty: the headline is built from the three slice services.
  ...without(section("hero"), "title", "badge"),
  figures: [
    { _type: "heroFigure", _key: "works", source: "projects", label: ro("lucrări") },
    { _type: "heroFigure", _key: "countries", source: "countries", label: ro("țări") },
    { _type: "heroFigure", _key: "foundries", source: "manual", value: 12, label: ro("turnătorii") },
  ],
  slices: [
    { _type: "heroSlice", _key: "policandre", service: ref(service.policandre), line: ro("1–7 nivele · turnate masiv, lăcuite sau aurite") },
    { _type: "heroSlice", _key: "clopote", service: ref(service.clopote), line: ro("Până la 16 tone · cu jug sau fără balans") },
    { _type: "heroSlice", _key: "iconostase", service: ref(service.iconostase), line: ro("Marmură, lemn cu aur, bronz") },
  ],
};

const services = {
  ...section("services"),
  enabled: true,
  groups: [
    {
      _type: "craftGroup", _key: "policandre", title: ro("Policandre"),
      facts: boldText("p", [
        "**Moscova și Iaroslavl**: turnate masiv, clasa premium",
        "Stil clasic **„brad”** și **„horă”**",
        "**Grecia**: stil bizantin, des solicitat în România",
      ]),
      services: [keyedRef("p1", service.policandre), keyedRef("p2", service.laComanda), keyedRef("p3", service.reconditionare)],
    },
    {
      _type: "craftGroup", _key: "clopote", title: ro("Clopote"),
      facts: boldText("c", ["Cu jug sau **fără balans**", "Până la **16 tone**"]),
      services: [
        keyedRef("c1", service.cuJug), keyedRef("c2", service.faraBalans),
        keyedRef("c3", service.clopotar), keyedRef("c4", service.automatizari),
      ],
    },
    {
      _type: "craftGroup", _key: "iconostase", title: ro("Iconostase și uși"),
      facts: boldText("i", ["**Marmură**, **lemn cu aur**, **bronz**"]),
      services: [keyedRef("i1", service.iconostase), keyedRef("i2", service.usi)],
    },
  ],
};

const catalogues = { ...section("catalogues"), heading: ro("Cataloage") };

const works = { enabled: true, heading: ro("Lucrările noastre") };

const about = {
  ...without(section("about"), "cta"),
  lead: boldText("a", [
    "S.C. Premium Bells SRL este compania ce reprezintă cele mai mari și mai cotate turnătorii de clopote din lumea ortodoxă — din **Iaroslavl** și **Kamensk-Uralsky**, dar și compania **Belltron** din Italia, astfel promovând:",
  ]),
  points: [
    { _type: "aboutPoint", _key: "tone", key: ro("16 tone"), text: ro("cele mai tradiționale clopote, până la 16 tone,") },
    { _type: "aboutPoint", _key: "athos", key: ro("Athos"), text: ro("clopote fără balans, trase de sfoară, asemeni tradiției de pe Sfântul Munte Athos,") },
    { _type: "aboutPoint", _key: "balans", key: ro("Balans"), text: ro("dar și stilul occidental prin balansare, complexitate ornamentală tradițională și icoane canonice ortodoxe.") },
  ],
  videoCaption: ro("În turnătorie"),
  statement: ref(statementId),
};

const audio = {
  ...section("audio"),
  link: { _type: "siteLink", kind: "document", label: ro("Seturi de clopote după note"), document: ref(service.clopote) },
};

const blog = { ...section("blog"), heading: ro("Din jurnal") };

// The Denis statement moves to Despre noi; this slot is for a client.
const testimonial = { enabled: false };

const changed = { hero, services, catalogues, works, about, audio, blog, testimonial };
const draft = { ...published, ...changed, _id: "drafts.homePage" };
delete (draft as Record<string, unknown>)._rev;

console.log(JSON.stringify(changed, null, 2));
console.log(`Existing draft: ${existingDraft ? `yes (rev ${existingDraft._rev}), it would be replaced` : "none"}`);

if (!values.write) {
  console.log("\nDry run: nothing written. Add --write to create drafts.homePage.");
} else {
  const result = await client.createOrReplace(draft);
  console.log(`\nWrote ${result._id} (rev ${result._rev}). Nothing published.`);
}
