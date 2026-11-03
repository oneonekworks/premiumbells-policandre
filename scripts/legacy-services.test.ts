import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildDocumentPlans, parseImportArgs } from "./lib/import-run";
import { checkPrices, withoutPriceKeys } from "./lib/legacy-documents";

// Phase 6 importer: the essentials only (prices never reach a planned
// document; the real sources map without errors). Needs ../rbells-tw and the
// media manifest, like the portfolio tests.

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const options = (collection: string) => ({ ...parseImportArgs([]), collection, manifestFile: path.join(repo, ".migration/legacy-media-manifest.json"), legacyRoot: path.resolve(repo, "../rbells-tw") });

for (const collection of ["services", "catalog"]) {
  test(`${collection}: price keys in the legacy data do not change any planned document`, () => {
    // Compared as JSON: legacy data modules are evaluated in a separate VM realm.
    const documents = (transform?: (value: unknown) => unknown) =>
      JSON.parse(JSON.stringify(buildDocumentPlans(options(collection), () => undefined, transform).plans.map((plan) => plan.document)));
    assert.deepEqual(documents(withoutPriceKeys), documents());
  });
}

test("the real sources map without errors; merged and skipped records are as decided", () => {
  const services = buildDocumentPlans(options("services"), () => undefined);
  const catalog = buildDocumentPlans(options("catalog"), () => undefined);
  const errors = [...services.plans, ...catalog.plans].flatMap((plan) => plan.issues.filter((issue) => issue.severity === "error").map((issue) => `${plan.key}: ${issue.message}`));
  assert.deepEqual(errors, []);
  assert.equal(services.plans.length, 17);
  assert.equal(catalog.plans.length, 52);
  const merged = catalog.plans.find((plan) => plan.key === "catalog:policandre#10")!;
  assert.deepEqual(merged.document.anchorIds, ["Policandru-10", "Policandru-11"]);
  assert.ok(catalog.skipped.some(({ key }) => key === "catalog:componente#1"));
});

test("a planned document with an amount is blocked; pricing words go to review", () => {
  const plan = { document: { _id: "x", _type: "service", summary: { ro: "Jertfelnic, costa 9000€" }, note: "Prețul e negociabil" }, images: [], issues: [], review: [] as string[] };
  checkPrices(plan);
  assert.ok(plan.issues.some((issue: { code: string }) => issue.code === "price-text"));
  assert.ok(plan.review.length > 0);
});
