// Copy of the Studio's price detector (studio-premiumbells/lib/priceText.ts),
// used by the importer and verify-no-prices to keep prices off the site.
// Keep the rules identical: scripts/price-text.test.ts runs the shared
// fixtures (studio-premiumbells/lib/priceText.fixtures.json) against both
// copies and checks the rule lists match.

export type PriceLevel = "error" | "warning";
export type PriceRule = { id: string; level: PriceLevel; pattern: string; message: string };
export type PriceFinding = { rule: string; level: PriceLevel; match: string; message: string; path?: string };

// Letters and digits in any script, so "costă" ends at the ă (\b does not).
const start = "(?<![\\p{L}\\p{N}])";
const end = "(?![\\p{L}\\p{N}])";
const digits = "\\d[\\d.,\\s]*";
const currency = "(?:€|eur|euro|euri|lei|ron)";

export const priceRules: PriceRule[] = [
  { id: "euro-sign", level: "error", pattern: "€", message: "semnul €" },
  { id: "euro-word", level: "error", pattern: `${start}(?:eur|euro|euri)${end}`, message: "moneda euro" },
  { id: "ron-word", level: "error", pattern: `${start}RON${end}`, message: "moneda RON" },
  { id: "vat", level: "error", pattern: `${start}tva${end}`, message: "TVA" },
  { id: "amount", level: "error", pattern: `${start}(?:\\d${digits}\\s*${currency}|${currency}\\s*\\d)${end}`, message: "o sumă de bani" },
  { id: "costs", level: "error", pattern: `${start}cost[aă]?${end}\\s+(?:(?:aproximativ|circa|între|intre|de la)\\s+)?\\d`, message: "„costă” urmat de o sumă" },
  { id: "lei-word", level: "warning", pattern: `${start}lei${end}`, message: "cuvântul „lei”" },
  { id: "price-word", level: "warning", pattern: `${start}pre[tțţ](?:ul|uri|urile|ului|urilor)?${end}`, message: "cuvântul „preț”" },
  { id: "negotiable", level: "warning", pattern: `${start}negociabil[ăa]?${end}`, message: "„negociabil”" },
  { id: "estimate", level: "warning", pattern: `${start}la estimare${end}`, message: "„la estimare”" },
  // 16.000 or 13.112 without a unit reads as a price; 1.100 kg does not.
  {
    id: "thousands",
    level: "warning",
    pattern: "(?<![\\d.,])\\d{1,3}(?:\\.\\d{3})+(?![\\d.,]|\\s*(?:kg|g|t|m|cm|mm|buc)(?![\\p{L}]))",
    message: "un număr care pare un preț",
  },
];

// RON is case-sensitive (uppercase only); the rest ignore case.
const compiled = priceRules.map((rule) => ({
  ...rule,
  regex: new RegExp(rule.pattern, rule.id === "ron-word" ? "gu" : "giu"),
}));

/** Every price-like match in one string, errors first. */
export function findPriceText(text: string, path?: string): PriceFinding[] {
  const findings: PriceFinding[] = [];
  for (const { id, level, regex, message } of compiled) {
    for (const match of text.matchAll(regex)) {
      findings.push({ rule: id, level, match: match[0].trim(), message, ...(path ? { path } : {}) });
    }
  }
  return findings.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
}

/** The most severe level found in the text, or null when it is clean. */
export function priceLevel(text: string): PriceLevel | null {
  return findPriceText(text)[0]?.level ?? null;
}

/**
 * Walks every string in a document (or any value), skipping keys that start
 * with `_` (ids, references, keys) and the keys listed in `skip`.
 */
export function findPriceTextInValue(value: unknown, { skip = [] }: { skip?: string[] } = {}, path = ""): PriceFinding[] {
  if (typeof value === "string") return findPriceText(value, path || undefined);
  if (Array.isArray(value)) return value.flatMap((item, index) => findPriceTextInValue(item, { skip }, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      key.startsWith("_") || skip.includes(key) ? [] : findPriceTextInValue(item, { skip }, path ? `${path}.${key}` : key),
    );
  }
  return [];
}
