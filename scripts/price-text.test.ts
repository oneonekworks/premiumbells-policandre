import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { priceRules as studioRules, priceLevel as studioLevel } from "../../studio-premiumbells/lib/priceText";
import { findPriceTextInValue, priceLevel, priceRules } from "./lib/price-text";

const fixtures = new URL("../../studio-premiumbells/lib/priceText.fixtures.json", import.meta.url);
const { cases } = JSON.parse(readFileSync(fixtures, "utf8")) as {
  cases: { level: "error" | "warning" | null; note: string; text: string }[];
};

test("the scripts copy matches the Studio rules", () => {
  assert.deepEqual(priceRules, studioRules);
});

test("every shared fixture gets its expected level in both copies", () => {
  assert.ok(cases.length >= 30);
  for (const { level, note, text } of cases) {
    assert.equal(priceLevel(text), level, `${note}: ${text}`);
    assert.equal(studioLevel(text), level, `Studio, ${note}: ${text}`);
  }
});

test("walks a planned document, including legacy filenames when not skipped", () => {
  const document = {
    _id: "legacy-service-usi",
    title: { ro: "Uși" },
    coverImage: { alt: { ro: "Jertfelnic, costa 9000€" } },
    legacy: { sourceFile: "pages/servicii/usi.js", legacySlug: "preturi-usi" },
  };
  const paths = new Set(findPriceTextInValue(document).map(({ path }) => path));
  assert.deepEqual([...paths], ["coverImage.alt.ro", "legacy.legacySlug"]);
});
