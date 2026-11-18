// Sets project.bellTypes from docs/v6-bell-types-proposal.md (V2 step 4e):
// only the rows marked "sigur" or "probabil" (user's choice, 2026-11-18); the
// "de verificat" and "?" rows stay empty, so those works still show under both
// bell types until an editor marks them in the Studio. Existing values are
// never overwritten. Dry run by default. Export the dataset first and add
// --write only after the user's explicit OK:
//   npx tsx scripts/v6-bell-types.mts [--write]
import { readFileSync } from "node:fs";
import { createWriteClient } from "./lib/import-run";

const write = process.argv.includes("--write");
const client = createWriteClient();
const values: Record<string, string> = { "cu jug": "cu-jug", "fără balans": "fara-balans" };

const rows = readFileSync("docs/v6-bell-types-proposal.md", "utf8").split("\n")
  .map((line) => line.match(/^\| \d+ \| (.+?) \| \*\*(.+?)\*\* \| (.+?) \| .+? \| `(.+?)` \|$/))
  .filter((match): match is RegExpMatchArray => Boolean(match))
  .map(([, title, proposal, confidence, id]) => ({title, id, confidence, types: proposal.split(" + ").map((word) => values[word]).filter(Boolean)}));
const chosen = rows.filter((row) => ["sigur", "probabil"].includes(row.confidence) && row.types.length);

const current: {_id: string; bellTypes: string[] | null}[] = await client.fetch(
  `*[_id in $ids]{_id, bellTypes}`, {ids: chosen.map((row) => row.id)});
const byId = new Map(current.map((doc) => [doc._id, doc]));
const drafts: string[] = await client.fetch(`*[_id in $ids]._id`, {ids: chosen.map((row) => `drafts.${row.id}`)});
const missing = chosen.filter((row) => !byId.has(row.id));
if (missing.length) throw new Error(`Not found: ${missing.map((row) => row.id).join(", ")}`);
if (drafts.length) throw new Error(`Open drafts, publish or discard first: ${drafts.join(", ")}`);
const todo = chosen.filter((row) => !byId.get(row.id)!.bellTypes?.length);

console.log(`${rows.length} rows; ${chosen.length} sure/probable; ${todo.length} to set (${chosen.length - todo.length} already set).`);
for (const row of todo) console.log(`  ${row.types.join(" + ").padEnd(20)} ${row.confidence.padEnd(9)} ${row.title}`);
const count = (type: string) => todo.filter((row) => row.types.includes(type)).length;
console.log(`cu-jug ${count("cu-jug")} · fara-balans ${count("fara-balans")}`);

if (!write) {
  console.log("Dry run: nothing written. Add --write to set them (one transaction, published documents).");
} else {
  const transaction = client.transaction();
  for (const row of todo) transaction.patch(row.id, (patch) => patch.set({bellTypes: row.types}));
  const result = await transaction.commit();
  console.log(`Done: ${todo.length} works, transaction ${result.transactionId}.`);
}
