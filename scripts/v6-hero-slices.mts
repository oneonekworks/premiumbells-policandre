// Sets the homepage triptych's own photos (homePage.hero.slices[].image), so
// the slices stop falling back to the small service covers (user's picks,
// 2026-11-18): Policandre = Drobeta-Turnu Severin, existing asset (contact
// sheet no. 13); Clopote and Recondiționare = two new uploads. Hotspots keep
// the subject inside the wide, short crop of an open slice.
// Dry run by default. Export the dataset first and add --write only after the
// user's explicit OK:
//   npx tsx scripts/v6-hero-slices.mts [--write]
import { createReadStream } from "node:fs";
import { createWriteClient } from "./lib/import-run";

const write = process.argv.includes("--write");
const client = createWriteClient();

const hotspot = (x: number, y: number) => ({ _type: "sanity.imageHotspot", x, y, width: 0.6, height: 0.5 });
const alt = (ro: string) => ({ _type: "localeString", ro });
const picks = [
  { service: "policandre", existing: "image-a25cf55e4614d6d6570caff01b8afe3ec0256a53-3200x2134-jpg", hotspot: hotspot(0.5, 0.42),
    alt: "Policandru cu coroană regală, aprins, în Catedrala din Drobeta-Turnu Severin" },
  { service: "clopote", upload: ".migration/uploads/hero-clopote-inscriptie.jpg", hotspot: hotspot(0.6, 0.5),
    alt: "Clopot cu inscripție și icoana Sfântului Ioan Botezătorul în relief" },
  { service: "reconditionare-policandre", upload: ".migration/uploads/hero-reconditionare-detaliu.webp", hotspot: hotspot(0.56, 0.5),
    alt: "Piesă turnată de policandru, lustruită după recondiționare" },
];

const home = await client.fetch(`{
  "slices": *[_id == "homePage"][0].hero.slices[]{_key, "service": service->slug.ro.current, "image": image.asset._ref},
  "draft": defined(*[_id == "drafts.homePage"][0])
}`);
if (home.draft) throw new Error("drafts.homePage exists: publish or discard it in the Studio first.");
const plan = picks.map((pick) => {
  const slice = home.slices.find((s: { service: string }) => s.service === pick.service);
  if (!slice) throw new Error(`No slice for ${pick.service}`);
  return { ...pick, key: slice._key, current: slice.image ?? "(service cover)" };
});
for (const p of plan) console.log(`${p.service} [${p.key}]: ${p.current} → ${p.existing ?? `upload ${p.upload}`}  hotspot ${p.hotspot.x},${p.hotspot.y}`);

if (!write) {
  console.log("Dry run: nothing written. Add --write to upload the two photos and set the three slice images on the published homePage.");
} else {
  const patch = client.patch("homePage");
  for (const p of plan) {
    const ref = p.existing ?? (await client.assets.upload("image", createReadStream(p.upload!), { filename: p.upload!.split("/").pop() }))._id;
    patch.set({ [`hero.slices[_key=="${p.key}"].image`]: {
      _type: "imageWithMetadata", asset: { _type: "reference", _ref: ref }, hotspot: p.hotspot, alt: alt(p.alt),
    } });
    console.log(`${p.service}: ${ref}`);
  }
  const result = await patch.commit();
  console.log(`homePage is now at ${result._rev}.`);
}
