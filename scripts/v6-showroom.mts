// Uploads the temporary showroom photo and sets siteSettings.showroom
// (Strada Agricultori 110, Buftea; docs/design-plan.md, V2 step 4 f).
// Dry run by default. Export the dataset first and add --write only after the
// user's explicit OK:
//   npx tsx scripts/v6-showroom.mts .migration/uploads/showroom-buftea-temporar.webp [--write]
import { createReadStream, existsSync } from "node:fs";
import { createWriteClient } from "./lib/import-run";

const file = process.argv[2];
const write = process.argv.includes("--write");
if (!file || !existsSync(file)) throw new Error("Pass the photo path.");

const showroom = { town: "Buftea", street: "Strada Agricultori 110", postcode: "070000" };
const client = createWriteClient();
const current = await client.fetch(`*[_id == "siteSettings"][0].showroom`);
console.log("Current:", JSON.stringify(current), "\nNew:", JSON.stringify({ ...showroom, photo: file }));

if (!write) {
  console.log("Dry run: nothing written. Add --write to upload the photo and set the showroom.");
} else {
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: "showroom-buftea-temporar.webp", title: "Showroom Buftea (temporar)",
  });
  const result = await client.patch("siteSettings").set({
    showroom: { ...showroom, photo: { _type: "imageWithMetadata", asset: { _type: "reference", _ref: asset._id } } },
  }).commit();
  console.log(`Uploaded ${asset._id}; siteSettings is now at ${result._rev}.`);
}
