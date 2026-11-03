import type { ManifestAsset } from "./legacy-media";
import {
  checkPrices,
  createMediaResolver,
  fixWords,
  issueCollector,
  localeString,
  localeText,
  sourceHashOf,
  type DocumentPlan,
  type SourceLoader,
} from "./legacy-documents";

// Maps rbells-tw/data/catalog.json (`ru.iaroslavl`) to `catalogItem` drafts.
// Prices are never read: only the fields below are. IDs are
// `legacy-catalog-<family>-<NN>`, NN = 1-based position in the legacy list,
// which for chandeliers is also the old `#Policandru-N` anchor.

export const CATALOG_SOURCE_FILE = "data/catalog.json";

/** Legacy list → catalogue family (chandeliers split on `isHoros`). */
const LISTS: Record<string, { source: string; family: (record: LegacyCatalogRecord) => string }> = {
  policandre: { source: "policandre", family: (record) => (record.isHoros ? "horos" : "policandre") },
  componente: { source: "componentePolicandre", family: () => "componente" },
  aplice: { source: "apliceList", family: () => "aplice" },
  analog: { source: "analogChivotPristolList", family: () => "analoghii-chivoturi" },
  sfesnice: { source: "sfesniceList", family: () => "sfesnice" },
};

export interface LegacyCatalogRecord {
  _id?: string;
  title?: string;
  nr?: string;
  levels?: string;
  height?: string;
  diameter?: string;
  width?: string;
  depth?: string;
  weight?: string;
  candles?: string;
  subtitle?: string;
  descripton?: string;
  dimension?: string;
  image?: string;
  isHoros?: boolean;
  refId?: string;
  type?: Record<string, { refId?: string }>;
  [key: string]: unknown;
}

export interface CatalogOverride {
  skip?: string;
  /** Key of the record this one duplicates; its anchors move there. */
  merge?: string;
  title?: string;
  summary?: string;
  /** Numeric fields to set; null drops the legacy value (handled in `specifications`). */
  fields?: Partial<Record<"levels" | "candles" | "heightCm" | "diameterCm" | "widthCm" | "depthCm" | "weightKg", number | null>>;
  specifications?: Array<{ label: string; value: string; unit?: string }>;
  /** Extra photos (legacy references) after the main image. */
  gallery?: string[];
  note?: string;
}

const FINISHES: Record<string, string> = { varnished: "varnished", gilded: "gilded" };
const text = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/** "1.1" → 1.1, "4 Kg" → 4, "" → undefined, prose → NaN. */
export function parseAmount(raw: unknown): number | undefined {
  const value = text(raw);
  if (!value) return undefined;
  const match = value.match(/^(\d+(?:[.,]\d+)?)\s*(?:kg|m|cm)?$/i);
  return match ? Number(match[1].replace(",", ".")) : Number.NaN;
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Title without HTML: `<span class='p-number'> 4</span>` becomes "nr. 4". */
export function catalogTitle(raw: unknown, fixSpelling = true): string {
  const plain = text(String(raw ?? "").replace(/<span[^>]*>\s*([^<]*?)\s*<\/span>/g, "nr. $1").replace(/<[^>]+>/g, ""));
  return (fixSpelling ? fixWords(plain) : plain).replace(/\s*,\s*$/, "").replace(/\s+,/g, ",");
}

export interface CatalogContext {
  load: SourceLoader;
  legacyRoot: string;
  manifest: Map<string, ManifestAsset>;
  overrides: Record<string, CatalogOverride>;
  resolveAsset: (canonical: string) => string | undefined;
}

export function mapLegacyCatalog(context: CatalogContext): { plans: DocumentPlan[]; skipped: Array<{ key: string; reason: string }> } {
  const root = (context.load(CATALOG_SOURCE_FILE) as { ru: { iaroslavl: Record<string, LegacyCatalogRecord[]> } }).ru.iaroslavl;
  const plans: DocumentPlan[] = [];
  const skipped: Array<{ key: string; reason: string }> = [];
  const merged = new Map<string, string[]>();

  for (const [list, { source, family }] of Object.entries(LISTS)) {
    (root[source] ?? []).forEach((record, index) => {
      const position = index + 1;
      const key = `catalog:${list}#${position}`;
      const override = context.overrides[key];
      const anchors = list === "policandre" ? [`Policandru-${position}`] : [];
      if (override?.merge) {
        merged.set(override.merge, [...(merged.get(override.merge) ?? []), ...anchors]);
        skipped.push({ key, reason: `merged into ${override.merge}${override.note ? ` (${override.note})` : ""}` });
        return;
      }
      if (override?.skip) {
        skipped.push({ key, reason: override.skip });
        return;
      }
      plans.push(mapRecord(record, { key, list, position, family: family(record), anchors, override, context }));
    });
  }
  for (const plan of plans) {
    const extra = merged.get(plan.key);
    if (extra) plan.document.anchorIds = [...((plan.document.anchorIds as string[]) ?? []), ...extra];
  }
  return { plans, skipped };
}

function mapRecord(
  record: LegacyCatalogRecord,
  { key, list, position, family, anchors, override, context }: {
    key: string; list: string; position: number; family: string; anchors: string[]; override?: CatalogOverride; context: CatalogContext;
  },
): DocumentPlan {
  const { issues, issue } = issueCollector();
  const review: string[] = [];
  const media = createMediaResolver(context, issue);

  const legacyTitle = text(record.title).replace(/<[^>]+>/g, "");
  const title = override?.title ?? catalogTitle(record.title);
  if (!title) issue("error", "missing-title", "No title.");
  if (override?.title || title !== catalogTitle(record.title, false)) review.push(`Title "${title}" (legacy "${legacyTitle}")`);

  // Numbers: chandeliers and sfeșnice are in metres, aplice in centimetres.
  const fields: Record<string, number> = {};
  const metres = list !== "aplice";
  const setNumber = (field: string, raw: unknown, scale: number, integer = false) => {
    if (override?.fields && field in override.fields) return;
    const value = parseAmount(raw);
    if (value === undefined) return;
    if (Number.isNaN(value)) {
      issue("error", "prose-value", `${field}: "${text(raw)}" is not a number; add an override (fields/specifications).`);
      return;
    }
    if (value > 0) fields[field] = integer ? Math.round(value) : round(value * scale);
  };
  setNumber("levels", record.levels, 1, true);
  setNumber("candles", record.candles, 1, true);
  setNumber("heightCm", record.height, metres ? 100 : 1);
  setNumber("diameterCm", record.diameter, metres ? 100 : 1);
  setNumber("widthCm", record.width, 1);
  setNumber("depthCm", record.depth, 1);
  setNumber("weightKg", record.weight, 1);
  const dimension = text(record.dimension).match(/^([\d.]+)\s*x\s*([\d.]+)\s*m$/i);
  if (dimension) Object.assign(fields, { widthCm: round(Number(dimension[1]) * 100), depthCm: round(Number(dimension[2]) * 100) });
  else if (text(record.dimension)) issue("error", "prose-value", `dimension: "${text(record.dimension)}"`);
  const height = text(record.descripton).match(/^Inaltimea\s*-\s*([\d.]+)\s*m$/i);
  if (height) fields.heightCm = round(Number(height[1]) * 100);
  else if (text(record.descripton)) issue("error", "prose-value", `descripton: "${text(record.descripton)}"`);
  for (const [field, value] of Object.entries(override?.fields ?? {})) if (value !== null && value !== undefined) fields[field] = value;

  // Finishes and codes; a single code without a finish becomes a detail row.
  const variants = Object.entries(record.type ?? {}).flatMap(([finish, value]) => {
    const raw = text(value?.refId);
    if (!raw) return [];
    const code = raw.replace(/\s+/g, "");
    if (code !== raw) review.push(`Code "${raw}" → "${code}" (spaces removed)`);
    if (!FINISHES[finish]) issue("error", "unknown-finish", `Unknown finish "${finish}".`);
    const expected = finish === "gilded" ? "11" : "12";
    if (!code.endsWith(expected)) review.push(`Check: ${finish} code ${code} does not end in ${expected}`);
    return [{ _type: "catalogVariant", _key: finish, finish: FINISHES[finish] ?? finish, referenceCode: code }];
  });
  const codes = variants.map((variant) => variant.referenceCode);
  if (codes.length === 2 && codes[0].slice(0, -2) !== codes[1].slice(0, -2)) review.push(`Check: finish codes differ in more than the suffix (${codes.join(", ")})`);

  const specifications = [
    ...(record.refId ? [{ label: "Cod de referință", value: text(record.refId).replace(/\s+/g, "") }] : []),
    ...(override?.specifications ?? []),
  ].map((spec, index) => ({ _type: "specification", _key: `spec${index}`, label: localeString(spec.label), value: spec.value, ...("unit" in spec && spec.unit ? { unit: spec.unit } : {}) }));

  // Data checks the plan lists for review (decision 6: imported as they are).
  const titleLevels = legacyTitle.match(/(\d+)\s+nivel/);
  if (titleLevels && fields.levels !== undefined && Number(titleLevels[1]) !== fields.levels) review.push(`Check: title says ${titleLevels[1]} levels, data says ${fields.levels}`);
  const titleNumber = legacyTitle.match(/nr\.?\s*(\d+)\s*$/) ?? String(record.title ?? "").match(/p-number'>\s*(\d+)/);
  const number = text(record.nr);
  if (titleNumber && number && titleNumber[1] !== number) review.push(`Check: title number ${titleNumber[1]}, catalogue number ${number}`);
  if (list === "policandre" && !number) review.push("Check: no catalogue number");

  const summary = override?.summary ?? fixWords(text(record.subtitle));
  if (record.subtitle && !override?.summary) review.push(`Subtitle imported as the description: "${text(record.subtitle)}"`);
  const special = (record.specialDetails as { subTitle?: string } | undefined)?.subTitle;
  if (special && !override?.specifications) issue("error", "unmapped-detail", `specialDetails.subTitle "${special}"; add an override.`);

  const image = media.image(record.image, CATALOG_SOURCE_FILE, "image", { alt: localeString(title) });
  if (!image) issue("error", "missing-image", "No usable image.");
  const gallery = media.gallery(override?.gallery ?? [], CATALOG_SOURCE_FILE, "gallery");

  const document = {
    _id: `legacy-catalog-${family}-${String(position).padStart(2, "0")}`,
    _type: "catalogItem",
    publishedLanguages: ["ro"],
    title: localeString(title),
    family,
    ...(number ? { number: `nr. ${number}` } : {}),
    ...(summary ? { summary: localeText(summary) } : {}),
    ...fields,
    madeToOrder: false,
    ...(image ? { image } : {}),
    ...(gallery.length ? { gallery } : {}),
    ...(variants.length ? { variants } : {}),
    ...(specifications.length ? { specifications } : {}),
    ...(anchors.length ? { anchorIds: anchors } : {}),
    displayOrder: position * 10,
    legacy: {
      _type: "legacySource",
      collection: `catalog.${list}`,
      legacyId: text(record._id) || undefined,
      sourceFile: CATALOG_SOURCE_FILE,
      sourceHash: sourceHashOf({ ...record, type: Object.fromEntries(Object.entries(record.type ?? {}).map(([finish, value]) => [finish, value?.refId])), price: undefined, specialDetails: undefined }),
    },
  };
  const plan: DocumentPlan = { key, collection: "catalog", document, images: media.needs, issues, review };
  checkPrices(plan);
  return plan;
}
