// V8.1 step 2: the five copper door models on the Uși page (user's OK on the
// mapping and on the picks in docs/v8-usi-gallery-picks.md, 2026-11-21).
// Replaces `sectionModels.models[]` of the published Uși service with five
// models ordered by height (the seven legacy oak / bronze models are removed),
// each with: title, description, cover = the cut door front for the scale row,
// gallery = the picked originals, specifications Înălțime (mm) and, for
// Drobeta, Montate la. Also sets hero Pe scurt row 2.
// Originals are auto-rotated (EXIF) into .migration/uploads/usi/ before upload.
// Dry run by default. Export the dataset first; --write only after the OK:
//   npx tsx --env-file=.env.local scripts/v8-usi-models.mts [--write]
import { createReadStream, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createWriteClient } from "./lib/import-run";

const write = process.argv.includes("--write");
const client = createWriteClient();
const ID = "legacy-service-usi";
const ROOT = "/Users/amanoila/Dev/premiumbells/2026+ assets/UȘI CUPRU /";
const CACHE = ".migration/uploads/usi";

const ls = (ro: string) => ({ _type: "localeString", ro });
const lt = (ro: string) => ({ _type: "localeText", ro });
const spec = (key: string, label: string, value: string, unit?: string) =>
  ({ _key: key, _type: "specification", label: ls(label), value, ...(unit ? { unit } : {}) });

type Pick = { file: string; alt?: string };
type Model = { mm: number; name: string; description: string; place?: string; dir: string; front: string; frontAlt: string; photos: Pick[] };

const img = (prefix: string, names: Array<string | number>) => names.map((n) => ({ file: `${prefix}${n}.${typeof n === "number" ? "JPG" : "jpg"}` }));
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const models: Model[] = [
  {
    mm: 2900, name: "Sfânta Mahramă", dir: "Uși cupru 2900 mm",
    description: "Mântuitorul pe Mahramă, între doi îngeri, pe timpan; pe canate, crucea cu IC XC NIKA.",
    front: "usa-2900-front.jpg", frontAlt: "Ușa de 2,9 m, vedere din față",
    photos: [
      { file: "IMG_5128.JPG", alt: "Ușa din cupru de 2,9 m, cu Sfânta Mahramă pe timpan și cruci pe canate" },
      { file: "IMG_5152.JPG", alt: "Detaliu: crucea cu IC XC NIKA, turnată în cupru" },
      { file: "IMG_5129.JPG", alt: "Ușa de 2,9 m în atelier, cu un om alături, pentru scară" },
      ...img("IMG_", [5153, 5154, 5156, 5157, 5158]),
    ],
  },
  {
    mm: 3000, name: "Maica Domnului a Semnului", dir: "Uși cupru 3000 mm",
    description: "Maica Domnului „Semnul”, între doi îngeri, pe timpan; pe canate, crucea cu IC XC NIKA.",
    front: "usa-3000-front.jpg", frontAlt: "Ușa de 3 m, vedere din față, deschisă",
    photos: [
      { file: "IMG_5150.JPG", alt: "Ușa din cupru de 3 m, deschisă, cu Maica Domnului a Semnului pe timpan" },
      { file: "IMG_5148.JPG", alt: "Timpanul: Maica Domnului a Semnului, între doi îngeri" },
      { file: "IMG_5149.JPG", alt: "Canatul deschis, cu crucea turnată" },
    ],
  },
  {
    mm: 4000, name: "Drobeta-Turnu Severin", dir: "Uși Drobeta 4000 mm/0001 big 2/2. Usi Cupru Big",
    description: "Doi sfinți în relief pe canate, scene din Evanghelie pe laturi, Mântuitorul pe timpan; cu două uși laterale.",
    place: "Catedrala din Drobeta-Turnu Severin",
    front: "usa-4000-front.jpg", frontAlt: "Ușa de 4 m a Catedralei din Drobeta-Turnu Severin, vedere din față",
    photos: [
      { file: "03 - Usile 077.jpg", alt: "Ușa mare din cupru a Catedralei din Drobeta-Turnu Severin" },
      { file: "03 - Usile 060.jpg", alt: "Cele trei uși ale catedralei, cu ușa mare deschisă" },
      { file: "03 - Usile 018.jpg", alt: "Detaliu: o scenă din Evanghelie, în relief, pe latura ușii" },
      ...["001", "005", "013", "010", "012", "014", "015", "016", "017", "019", "020", "021", "022", "029", "030", "033", "037", "041", "044", "066", "069", "073", "084"]
        .map((n) => ({ file: `03 - Usile ${n}.jpg` })),
    ],
  },
  {
    mm: 4400, name: "Sfinți și praznice", dir: "USI CUPRU 4400 mm - current published on the site",
    description: "Doi sfinți în relief pe canate, un șir de praznice deasupra lor, Mântuitorul pe Mahramă pe timpan.",
    front: "usa-4400-front.jpg", frontAlt: "Ușa de 4,4 m, vedere din față",
    photos: [
      { file: "IMG_4872.jpg", alt: "Ușa din cupru de 4,4 m, cu doi sfinți, praznice și Mântuitorul pe timpan" },
      { file: "IMG_4878.jpg", alt: "Detaliu: un praznic în relief, din șirul de deasupra canatelor" },
      { file: "IMG_4895.jpg", alt: "Detaliu: cei doi sfinți în relief, de aproape" },
      ...img("IMG_", ["4871", "4906", "4873", "4874", "4876", "4877", ...range(4879, 4885).map(String), ...range(4887, 4893).map(String),
        "4896", "4897", "4903", "4904", "4905", "4907", "4915", "4916", "4917"]),
    ],
  },
  {
    mm: 5200, name: "Schimbarea la Față", dir: "Uși cupru 5200 mm ",
    description: "Schimbarea la Față pe timpan, doi arhangheli pe canate, tablele Legii și potirul deasupra lor, scene din Evanghelie pe laturi.",
    front: "usa-5200-front.jpg", frontAlt: "Ușa de 5,2 m, vedere din față",
    photos: [
      { file: "IMG_5124.JPG", alt: "Ușa din cupru de 5,2 m, cu Schimbarea la Față pe timpan și doi arhangheli" },
      { file: "IMG_5139.JPG", alt: "Detaliu: arhanghelul în relief, de aproape" },
      { file: "IMG_5143.JPG", alt: "Ușa de 5,2 m în atelier, cu doi oameni alături, pentru scară" },
      ...img("IMG_", [5134, 5136, 5137, 5140, 5141, 5146, 5159, 5160, 5161, 5162, 5131]),
    ],
  },
];

// Every source must exist before anything is uploaded.
const sources = models.flatMap((m) => [path.join(ROOT, "_fronts", m.front), ...m.photos.map((p) => path.join(ROOT, m.dir, p.file))]);
const missing = sources.filter((file) => !existsSync(file));
if (missing.length) throw new Error(`Missing files:\n${missing.join("\n")}`);

const doc = await client.fetch(`*[_id == $id][0]{_rev, heroFacts, "draft": defined(*[_id == "drafts." + $id][0]),
  "section": sections[_type == "sectionModels"][0]{_key, "models": models[]{_key, "title": title.ro}}}`, { id: ID });
if (!doc) throw new Error(`${ID} not found`);
if (doc.draft) throw new Error(`drafts.${ID} exists: publish or discard it in the Studio first.`);
if (!doc.section) throw new Error("No sectionModels section");

for (const m of models) console.log(`${(m.mm / 1000).toFixed(1).replace(".", ",")} m · ${m.name}: cover ${m.front}, ${m.photos.length} photos${m.place ? `, montate la ${m.place}` : ""}`);
console.log(`Removes: ${doc.section.models.map((m: { title: string }) => m.title).join(", ")}`);
console.log(`Hero Pe scurt row 2: "${doc.heroFacts?.[1]?.line?.ro}" → "de la 2,9 la 5,2 m, după ușa bisericii"`);
console.log(`${sources.length} files to upload.`);

if (!write) {
  console.log("Dry run: nothing written. Add --write to upload and replace the models on the published document.");
  process.exit(0);
}

mkdirSync(CACHE, { recursive: true });
/** Bakes the EXIF rotation in (full size, JPEG q92), then uploads; Sanity dedupes by content. */
async function upload(file: string) {
  const out = path.join(CACHE, path.basename(path.dirname(file)).replace(/\W+/g, "-") + "--" + path.basename(file).replace(/\s+/g, "-").replace(/\.\w+$/, ".jpg"));
  if (!existsSync(out)) await sharp(file).rotate().jpeg({ quality: 92, mozjpeg: true }).toFile(out);
  const asset = await client.assets.upload("image", createReadStream(out), { filename: path.basename(file) });
  return asset._id;
}
const ref = (assetId: string) => ({ _type: "reference", _ref: assetId });
const key = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").slice(-20) || "k";

const built = [];
for (const m of models) {
  const coverId = await upload(path.join(ROOT, "_fronts", m.front));
  const gallery = [];
  for (const [i, p] of m.photos.entries()) {
    const assetId = await upload(path.join(ROOT, m.dir, p.file));
    gallery.push({ _key: `g${m.mm}${i}${key(p.file)}`.slice(0, 32), _type: "imageWithMetadata", asset: ref(assetId), ...(p.alt ? { alt: ls(p.alt) } : {}) });
    process.stdout.write(".");
  }
  built.push({
    _key: `usa${m.mm}`, _type: "model", title: ls(m.name), description: lt(m.description),
    cover: { _type: "imageWithMetadata", asset: ref(coverId), alt: ls(m.frontAlt) },
    gallery,
    specifications: [spec("inaltime", "Înălțime", String(m.mm), "mm"), ...(m.place ? [spec("montate", "Montate la", m.place)] : [])],
  });
  console.log(` ${m.mm}`);
}

const facts = [...(doc.heroFacts ?? [])];
if (facts[1]) facts[1] = { ...facts[1], line: ls("de la 2,9 la 5,2 m, după ușa bisericii") };
const res = await client.transaction()
  .patch(ID, (p) => p.ifRevisionId(doc._rev).set({ [`sections[_key=="${doc.section._key}"].models`]: built, heroFacts: facts }))
  .commit();
console.log(`Written: ${res.transactionId}`);
