import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyMediaReference,
  loadDefaultExport,
  stableId,
  type LegacyMediaManifest,
  type ManifestAsset,
} from "./legacy-media";

// Maps legacy portfolio records (rbells-tw/data/portfolio.js) to Sanity
// `project` documents. Pure apart from reading the legacy files: asset
// references are resolved through a callback so dry runs and tests need no
// Sanity access. See docs/content-model.md#legacy-field-mapping.

export const PORTFOLIO_SOURCE_FILE = "data/portfolio.js";
export const OVERRIDES_SCHEMA_VERSION = 1;

const defaultOverridesFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../config/legacy-overrides.json",
);

/** Legacy collection → `workCategory.slug.ro`. */
export const COLLECTION_CATEGORIES: Record<string, string> = {
  worksClopote: "clopote",
  worksPolicandre: "policandre",
  worksReconditionariPolicandre: "reconditionari-policandre",
  worksAutomatizari: "automatizari",
  worksUsi: "usi",
};

const COUNTRIES: Record<string, "RO" | "MD"> = {
  romania: "RO",
  moldova: "MD",
  "republica moldova": "MD",
};

export interface LegacyWork {
  _nr?: number;
  historyNr?: number;
  title?: string;
  subtitle?: string;
  year?: string | number;
  briefInfo?: string;
  page?: string;
  country?: string;
  cover?: string;
  description?: string;
  descriptionLine2?: string;
  current?: boolean;
  _isInMaintenance?: boolean;
  category?: string;
  information?: Record<string, unknown>;
  gallery?: string[];
  hasVideo?: boolean;
  videoGallery?: string[];
}

export interface ProjectOverride {
  slug?: string;
  location?: { locality: string; county?: string; country?: "RO" | "MD" };
  specifications?: Array<{ label: string; value: string; unit?: string }>;
  summary?: string;
  /** Existing document IDs this import supersedes; deleted when it is written. */
  replaces?: string[];
  note?: string;
}

export interface OverridesFile {
  schemaVersion: number;
  projects: Record<string, ProjectOverride>;
}

export type IssueSeverity = "error" | "warning";

export interface MappingIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
}

/** An image the project needs, identified by its manifest canonical reference. */
export interface ImageNeed {
  canonical: string;
  role: "cover" | "gallery";
  /** Local file (legacy public folder) or remote URL to read the original from. */
  localFile?: string;
  resolvedUrl?: string;
}

export interface SanityImage {
  _type: "imageWithMetadata";
  _key?: string;
  asset: { _type: "reference"; _ref: string };
}

export interface ProjectDocument {
  _id: string;
  _type: "project";
  publishedLanguages: string[];
  title: { _type: "localeString"; ro: string };
  slug: { _type: "slug"; current: string };
  category: { _type: "reference"; _ref: string };
  location: { locality?: string; county?: string; country: string };
  year?: number;
  summary?: { _type: "localeText"; ro: string };
  coverImage?: SanityImage;
  gallery: SanityImage[];
  videos?: Array<{
    _type: "video";
    _key: string;
    provider: "youtube";
    url: string;
    title: { _type: "localeString"; ro: string };
  }>;
  specifications?: Array<{
    _type: "specification";
    _key: string;
    label: { _type: "localeString"; ro: string };
    value: string;
    unit?: string;
  }>;
  featured: boolean;
  legacy: {
    _type: "legacySource";
    collection: string;
    legacyId?: string;
    legacySlug?: string;
    sourceFile: string;
    sourceHash: string;
    migratedAt?: string;
  };
}

export interface ProjectPlan {
  key: string;
  collection: string;
  index: number;
  legacy: LegacyWork;
  document: ProjectDocument;
  images: ImageNeed[];
  replaces: string[];
  issues: MappingIssue[];
  /** Legacy text not imported, for editorial review. */
  review: string[];
}

export interface MapContext {
  collection: string;
  index: number;
  legacyRoot: string;
  categoryId: string;
  manifest: Map<string, ManifestAsset>;
  override?: ProjectOverride;
  /** Sanity asset ID for an uploaded canonical reference, if known. */
  resolveAsset: (canonical: string) => string | undefined;
}

export function loadLegacyPortfolio(legacyRoot: string): Record<string, LegacyWork[]> {
  const value = loadDefaultExport(path.join(legacyRoot, PORTFOLIO_SOURCE_FILE));
  if (!value || typeof value !== "object") throw new Error("Legacy portfolio export is not an object.");
  return value as Record<string, LegacyWork[]>;
}

export function loadOverrides(file = defaultOverridesFile): OverridesFile {
  const parsed = JSON.parse(readFileSync(file, "utf8")) as OverridesFile;
  if (parsed.schemaVersion !== OVERRIDES_SCHEMA_VERSION || typeof parsed.projects !== "object") {
    throw new Error(`Unsupported overrides file: ${file}`);
  }
  return parsed;
}

export function indexManifest(manifest: LegacyMediaManifest): Map<string, ManifestAsset> {
  return new Map(manifest.assets.map((asset) => [asset.canonical, asset]));
}

export function projectKey(collection: string, work: LegacyWork): string {
  return `${collection}:${work.page ?? `nr-${work._nr ?? "unknown"}`}`;
}

/** Deterministic document ID from the collection and legacy page (no dots: dotted IDs are private). */
export function projectDocumentId(collection: string, work: LegacyWork): string {
  const category = COLLECTION_CATEGORIES[collection] ?? collection;
  const page = (work.page ?? `nr-${work._nr ?? "unknown"}`).replace(/[^A-Za-z0-9_-]+/g, "-");
  return `legacy-${category}-${page}`;
}

/** `2022-schitul_duca` → `schitul-duca`: no year prefix, underscores, or diacritics. */
export function slugFromPage(page: string): string {
  return page
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^\d{4}[-_]+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `310kg` → `{value: "310", unit: "kg"}`; anything else stays as written. */
export function parseSpecificationValue(raw: string): { value: string; unit?: string } {
  const value = raw.trim().replace(/\s+/g, " ");
  const match = /^(\d+(?:[.,]\d+)?)\s*(kg|g|t|mm|cm|m)$/i.exec(value);
  return match ? { value: match[1], unit: match[2].toLowerCase() } : { value };
}

/** Values joining several facts ("460kg si 620kg") need one row per fact. */
export function looksLikeSeveralFacts(value: string): boolean {
  return /\b(si|și|and)\b|[,;+/]|\d\s*[a-z]+\s+\d/i.test(value);
}

/** YouTube embed/watch/short URL → canonical watch URL without tracking parameters. */
export function normalizeYouTubeUrl(raw: string): string | undefined {
  const classified = classifyMediaReference(raw, {
    legacyRoot: "",
    sourceFile: PORTFOLIO_SOURCE_FILE,
    usageType: "structured-data",
  });
  return classified?.origin === "youtube" ? classified.resolvedUrl : undefined;
}

export function sourceHash(work: LegacyWork): string {
  return createHash("sha256").update(stableStringify(work)).digest("hex");
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

const shortKey = (value: string) => stableId(value).slice(0, 12);
const text = (value: unknown) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

export function mapLegacyProject(work: LegacyWork, context: MapContext): ProjectPlan {
  const { collection, override } = context;
  const key = projectKey(collection, work);
  const issues: MappingIssue[] = [];
  const review: string[] = [];
  const issue = (severity: IssueSeverity, code: string, message: string) =>
    issues.push({ severity, code, message });

  const title = text(work.title);
  if (!title) issue("error", "missing-title", "Legacy record has no title.");
  if (work._isInMaintenance) issue("error", "maintenance", "Legacy record is marked as in maintenance; not imported by default.");

  const slug = override?.slug ?? slugFromPage(work.page ?? "");
  if (!slug) issue("error", "missing-slug", "No legacy page to derive a slug from; add an override.");

  // Images: cover first, then the gallery in legacy order.
  const images: ImageNeed[] = [];
  const resolveImage = (raw: string, role: ImageNeed["role"]): SanityImage | undefined => {
    const classified = classifyMediaReference(raw, {
      legacyRoot: context.legacyRoot,
      sourceFile: PORTFOLIO_SOURCE_FILE,
      usageType: "structured-data",
    });
    if (!classified || classified.kind !== "image") {
      issue("error", "unrecognised-image", `${role}: not an image reference: ${raw}`);
      return undefined;
    }
    const asset = context.manifest.get(classified.canonical);
    if (!asset) {
      issue("error", "not-in-manifest", `${role}: ${classified.canonical} is missing from the media manifest; rerun the inventory.`);
      return undefined;
    }
    if (asset.migrationDisposition === "exclude") {
      issue("warning", "excluded-image", `${role}: ${classified.canonical} is excluded from migration and skipped.`);
      return undefined;
    }
    if (asset.remote && !asset.remote.ok) {
      issue("error", "unavailable-image", `${role}: ${classified.canonical} was unavailable (HTTP ${asset.remote.status ?? "?"}).`);
      return undefined;
    }
    if (classified.localFile && !existsSync(classified.localFile)) {
      issue("error", "missing-local-image", `${role}: local file is missing: ${classified.localFile}`);
      return undefined;
    }
    images.push({
      canonical: classified.canonical,
      role,
      localFile: classified.localFile,
      resolvedUrl: classified.resolvedUrl ?? asset.resolvedUrl,
    });
    const assetId = context.resolveAsset(classified.canonical);
    return {
      _type: "imageWithMetadata",
      asset: { _type: "reference", _ref: assetId ?? `pending-${shortKey(classified.canonical)}` },
    };
  };

  const coverImage = work.cover ? resolveImage(work.cover, "cover") : undefined;
  if (!coverImage) issue("error", "missing-cover", "No usable cover image.");

  const gallery: SanityImage[] = [];
  const seenAssets = new Set<string>();
  for (const raw of work.gallery ?? []) {
    const image = resolveImage(raw, "gallery");
    if (!image) continue;
    if (seenAssets.has(image.asset._ref)) {
      issue("warning", "duplicate-gallery-image", `Gallery repeats the same photo: ${raw}`);
      continue;
    }
    seenAssets.add(image.asset._ref);
    gallery.push({ ...image, _key: shortKey(images[images.length - 1].canonical) });
  }
  if (gallery.length === 0) issue("error", "empty-gallery", "Gallery has no usable photos.");

  const videos = (work.videoGallery ?? []).flatMap((raw, index, all) => {
    const url = normalizeYouTubeUrl(raw);
    if (!url) {
      issue("warning", "unsupported-video", `Video is not a YouTube URL and was skipped: ${raw}`);
      return [];
    }
    return [{
      _type: "video" as const,
      _key: shortKey(url),
      provider: "youtube" as const,
      url,
      title: { _type: "localeString" as const, ro: all.length > 1 ? `${title} – video ${index + 1}` : `${title} – video` },
    }];
  });

  let specifications: ProjectDocument["specifications"];
  if (override?.specifications) {
    specifications = override.specifications.map((row, index) => ({
      _type: "specification",
      _key: shortKey(`${index}:${row.label}:${row.value}`),
      label: { _type: "localeString", ro: row.label },
      value: row.value,
      ...(row.unit ? { unit: row.unit } : {}),
    }));
  } else {
    specifications = Object.entries(work.information ?? {}).flatMap(([label, raw], index) => {
      const rawValue = text(raw);
      if (!rawValue) return [];
      if (looksLikeSeveralFacts(rawValue)) {
        issue("warning", "several-facts", `${label} "${rawValue}" holds several facts; split it with an override.`);
      }
      const { value, unit } = parseSpecificationValue(rawValue);
      return [{
        _type: "specification" as const,
        _key: shortKey(`${index}:${label}:${value}`),
        label: { _type: "localeString" as const, ro: text(label) },
        value,
        ...(unit ? { unit } : {}),
      }];
    });
  }

  const legacyCountry = COUNTRIES[normalizeCountry(work.country)];
  if (work.country && !legacyCountry) issue("warning", "unknown-country", `Unknown legacy country "${work.country}"; defaulted to RO.`);
  const location = override?.location ?? { country: legacyCountry ?? "RO" };
  if (!override?.location) issue("warning", "missing-location", "No locality; add a location override (required to publish).");
  else if (legacyCountry && location.country && legacyCountry !== location.country) {
    review.push(`Legacy country "${work.country}" differs from the override ${location.country}.`);
  }

  const yearMatch = /\b(19|20)\d{2}\b/.exec(String(work.year ?? ""));
  const summaryText = override?.summary ?? [text(work.description), text(work.descriptionLine2)].filter(Boolean).join("\n");

  for (const [field, value] of [["subtitle", work.subtitle], ["briefInfo", work.briefInfo]] as const) {
    const fieldText = text(value);
    if (fieldText && fieldText !== yearMatch?.[0]) review.push(`${field} not imported: "${fieldText}"`);
  }
  if (work.current) review.push("Legacy `current: true`; `featured` left false pending a decision.");

  const document: ProjectDocument = {
    _id: projectDocumentId(collection, work),
    _type: "project",
    publishedLanguages: ["ro"],
    title: { _type: "localeString", ro: title },
    slug: { _type: "slug", current: slug },
    category: { _type: "reference", _ref: context.categoryId },
    location: { ...location, country: location.country ?? "RO" },
    ...(yearMatch ? { year: Number(yearMatch[0]) } : {}),
    ...(summaryText ? { summary: { _type: "localeText" as const, ro: summaryText } } : {}),
    ...(coverImage ? { coverImage } : {}),
    gallery,
    ...(videos.length ? { videos } : {}),
    ...(specifications.length ? { specifications } : {}),
    featured: false,
    legacy: {
      _type: "legacySource",
      collection,
      ...(work._nr !== undefined ? { legacyId: String(work._nr) } : {}),
      ...(work.page ? { legacySlug: work.page } : {}),
      sourceFile: PORTFOLIO_SOURCE_FILE,
      sourceHash: sourceHash(work),
    },
  };

  for (const image of images) {
    if (!context.resolveAsset(image.canonical)) {
      issue("warning", "asset-not-uploaded", `Not uploaded yet: ${image.canonical}`);
    }
  }

  return {
    key,
    collection,
    index: context.index,
    legacy: work,
    document,
    images,
    replaces: override?.replaces ?? [],
    issues,
    review,
  };
}

function normalizeCountry(value: unknown): string {
  return text(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Selects records from one collection, by legacy page or `_nr`; all when no filter is given. */
export function selectWorks(
  portfolio: Record<string, LegacyWork[]>,
  collection: string,
  projects: string[],
): Array<{ work: LegacyWork; index: number }> {
  const works = portfolio[collection];
  if (!Array.isArray(works)) throw new Error(`Unknown legacy collection: ${collection}`);
  const selected = works
    .map((work, index) => ({ work, index }))
    .filter(({ work }) => projects.length === 0 || projects.includes(work.page ?? "") || projects.includes(String(work._nr)));
  const missing = projects.filter(
    (project) => !selected.some(({ work }) => work.page === project || String(work._nr) === project),
  );
  if (missing.length) throw new Error(`No ${collection} record matches: ${missing.join(", ")}`);
  return selected;
}

/** Reports the same document ID or slug used twice within the planned import. */
export function findPlanConflicts(plans: ProjectPlan[]): MappingIssue[] {
  const conflicts: MappingIssue[] = [];
  for (const field of ["_id", "slug"] as const) {
    const seen = new Map<string, string>();
    for (const plan of plans) {
      const value = field === "_id" ? plan.document._id : plan.document.slug.current;
      const previous = seen.get(value);
      if (previous) {
        conflicts.push({ severity: "error", code: `duplicate-${field}`, message: `${previous} and ${plan.key} share ${field} "${value}".` });
      } else {
        seen.set(value, plan.key);
      }
    }
  }
  return conflicts;
}
