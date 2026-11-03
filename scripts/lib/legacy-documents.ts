import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  classifyMediaReference,
  loadDefaultExport,
  loadMediaExclusionRegistry,
  stableId,
  type ManifestAsset,
} from "./legacy-media";
import type { ImageNeed, IssueSeverity, MappingIssue } from "./legacy-portfolio";
import { stableStringify } from "./legacy-portfolio";
import { findPriceText, findPriceTextInValue } from "./price-text";
import { extractConstants } from "./legacy-source";

// Shared pieces of the Phase 6 services and catalogue importers: reading
// legacy sources through `file#path` pointers, resolving media to (pending)
// Sanity assets, and the price block that runs on every planned document.

export type SanityDocumentPlan = { _id: string; _type: string } & Record<string, unknown>;

export interface DocumentPlan {
  key: string;
  collection: "services" | "catalog";
  document: SanityDocumentPlan;
  images: ImageNeed[];
  issues: MappingIssue[];
  /** Legacy data not imported or changed on the way, for editorial review. */
  review: string[];
  /** Services: the parent's document ID; written first. */
  parentId?: string;
  /** Services: `workCategory.slug.ro` resolved to a reference when writing. */
  relatedCategorySlug?: string;
}

/** Reads a legacy file's data: default export of data modules, else top-level literal consts. */
export type SourceLoader = (file: string) => unknown;

export function createSourceLoader(legacyRoot: string, transform: (value: unknown) => unknown = (value) => value): SourceLoader {
  const cache = new Map<string, unknown>();
  return (file) => {
    if (!cache.has(file)) {
      const absolute = path.join(legacyRoot, file);
      const value = file.endsWith(".json")
        ? JSON.parse(readFileSync(absolute, "utf8"))
        : file.startsWith("data/") ? loadDefaultExport(absolute) : extractConstants(absolute);
      cache.set(file, transform(value));
    }
    return cache.get(file);
  };
}

/** Removes every `price` key, recursively (the "price keys do not matter" check). */
export function withoutPriceKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutPriceKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "price").map(([key, item]) => [key, withoutPriceKeys(item)]));
  }
  return value;
}

/**
 * Resolves `file#path`: `a.b`, `[n]`, `[a:b]` and `[*]` steps from the file's
 * data. Returns the single value, or a flat list when a slice or `[*]` is used.
 */
export function resolvePointer(load: SourceLoader, pointer: string): { file: string; value: unknown } {
  const [file, expression = ""] = pointer.split("#");
  let values: unknown[] = [load(file)];
  let many = false;
  for (const [, key, index] of expression.matchAll(/\.?([A-Za-z_$][\w$]*)|\[([^\]]+)\]/g)) {
    if (key !== undefined) {
      values = values.map((value) => (value as Record<string, unknown> | undefined)?.[key]);
    } else if (index === "*" || index.includes(":")) {
      many = true;
      const [from, to] = index === "*" ? [undefined, undefined] : index.split(":").map((part) => (part ? Number(part) : undefined));
      values = values.flatMap((value) => (Array.isArray(value) ? value.slice(from, to) : []));
    } else {
      values = values.map((value) => (Array.isArray(value) ? value[Number(index)] : undefined));
    }
  }
  return { file, value: many ? values : values[0] };
}

export const shortKey = (value: string) => stableId(value).slice(0, 12);
export const sourceHashOf = (value: unknown) => createHash("sha256").update(stableStringify(value)).digest("hex");

export function issueCollector() {
  const issues: MappingIssue[] = [];
  return { issues, issue: (severity: IssueSeverity, code: string, message: string) => issues.push({ severity, code, message }) };
}

export interface MediaContext {
  legacyRoot: string;
  manifest: Map<string, ManifestAsset>;
  /** Sanity asset ID for an uploaded canonical reference, if known. */
  resolveAsset: (canonical: string) => string | undefined;
}

let registryExclusions: Set<string> | undefined;
const excludedByRegistry = (canonical: string) =>
  (registryExclusions ??= new Set(loadMediaExclusionRegistry().exclusions.map((entry) => entry.canonical))).has(canonical);

/**
 * Turns legacy media references into asset references, collecting what the
 * asset importer must upload. Unknown, excluded or unavailable media become
 * issues instead of references.
 */
export function createMediaResolver(context: MediaContext, issue: ReturnType<typeof issueCollector>["issue"]) {
  const needs: ImageNeed[] = [];
  const resolve = (raw: unknown, sourceFile: string, role: string, kind: "image" | "file" = "image") => {
    if (typeof raw !== "string" || !raw.trim()) {
      issue("error", "missing-media", `${role}: no media reference.`);
      return undefined;
    }
    const classified = classifyMediaReference(raw, { legacyRoot: context.legacyRoot, sourceFile, usageType: "structured-data" });
    const expected = kind === "file" ? "audio" : "image";
    if (!classified || classified.kind !== expected) {
      issue("error", "unrecognised-media", `${role}: not an ${expected} reference: ${raw}`);
      return undefined;
    }
    const asset = context.manifest.get(classified.canonical);
    if (!asset) {
      issue("error", "not-in-manifest", `${role}: ${classified.canonical} is missing from the media manifest.`);
      return undefined;
    }
    if (asset.migrationDisposition === "exclude" || excludedByRegistry(classified.canonical)) {
      issue("warning", "excluded-media", `${role}: ${classified.canonical} is excluded from migration and skipped.`);
      return undefined;
    }
    if (asset.remote && !asset.remote.ok) {
      issue("error", "unavailable-media", `${role}: ${classified.canonical} was unavailable (HTTP ${asset.remote.status ?? "?"}).`);
      return undefined;
    }
    if (classified.localFile && !existsSync(classified.localFile)) {
      issue("error", "missing-local-media", `${role}: local file is missing: ${classified.localFile}`);
      return undefined;
    }
    if (!needs.some((need) => need.canonical === classified.canonical)) {
      needs.push({ canonical: classified.canonical, role, kind, localFile: classified.localFile, resolvedUrl: classified.resolvedUrl ?? asset.resolvedUrl });
    }
    const assetId = context.resolveAsset(classified.canonical);
    return { canonical: classified.canonical, ref: { _type: "reference" as const, _ref: assetId ?? `pending-${shortKey(classified.canonical)}` } };
  };

  /** One image object, or undefined (with an issue). */
  const image = (raw: unknown, sourceFile: string, role: string, extra: Record<string, unknown> = {}) => {
    const resolved = resolve(raw, sourceFile, role);
    return resolved && { _type: "imageWithMetadata", asset: resolved.ref, ...extra, _canonical: resolved.canonical };
  };

  /** An array of images with stable `_key`s; repeats are dropped with a warning. */
  const gallery = (raws: unknown[], sourceFile: string, role: string, captions: unknown[] = []) => {
    const seen = new Set<string>();
    return raws.flatMap((raw, index) => {
      const caption = typeof captions[index] === "string" ? (captions[index] as string).trim() : "";
      const item = image(raw, sourceFile, `${role} ${index + 1}`, caption ? { caption: localeString(caption) } : {});
      if (!item) return [];
      if (seen.has(item._canonical)) {
        issue("warning", "duplicate-image", `${role}: repeats ${item._canonical}`);
        return [];
      }
      seen.add(item._canonical);
      const { _canonical, ...rest } = item;
      return [{ _key: shortKey(_canonical), ...rest }];
    });
  };

  const file = (raw: unknown, sourceFile: string, role: string) => {
    const resolved = resolve(raw, sourceFile, role, "file");
    return resolved && { _type: "file", asset: resolved.ref };
  };

  /** One image object without the internal canonical reference. */
  const single = (raw: unknown, sourceFile: string, role: string, extra?: Record<string, unknown>) => {
    const item: Partial<NonNullable<ReturnType<typeof image>>> | undefined = image(raw, sourceFile, role, extra);
    if (item) delete item._canonical;
    return item;
  };

  return { needs, image: single, gallery, file };
}

export const localeString = (ro: string) => ({ _type: "localeString", ro });
export const localeText = (ro: string) => ({ _type: "localeText", ro });

/**
 * The price block: any currency or amount in a planned document (provenance
 * and media filenames included) is an error; pricing words are review notes.
 */
export function checkPrices(plan: Pick<DocumentPlan, "document" | "images" | "issues" | "review">) {
  const findings = [
    ...findPriceTextInValue(plan.document),
    ...plan.images.flatMap((need) => findPriceText(decodeURIComponent(path.posix.basename(need.canonical)), `file ${need.canonical}`)),
  ];
  for (const finding of findings) {
    if (finding.level === "error") {
      plan.issues.push({ severity: "error", code: "price-text", message: `${finding.path ?? "?"}: „${finding.match}” (${finding.message})` });
    } else {
      plan.review.push(`Pricing word at ${finding.path ?? "?"}: „${finding.match}”`);
    }
  }
}

// Diacritics and spelling for legacy catalogue words; applied word by word
// and listed in the report. Extend when a dry run shows a new word.
const WORD_FIXES: Record<string, string> = {
  aplica: "Aplică", lumanari: "lumânări", lumânari: "lumânări", lumanare: "lumânare", sfesnic: "Sfeșnic", șfesnic: "Sfeșnic",
  imparatesc: "împărătesc", marmura: "marmură", alama: "alamă", sectii: "secții", sectiuni: "secțiuni", inaltimea: "Înălțimea",
  lant: "lanț", strana: "strană", pana: "până", uneu: "unei",
};

/** Fixes known legacy spellings, keeping the case of the first letter. */
export function fixWords(text: string): string {
  return text.replace(/[\p{L}]+/gu, (word) => {
    const fixed = WORD_FIXES[word.toLowerCase()];
    if (!fixed) return word;
    const upper = word[0] === word[0].toUpperCase();
    return (upper ? fixed[0].toUpperCase() : fixed[0].toLowerCase()) + fixed.slice(1);
  });
}

/** Plain paragraphs to Portable Text; `[text](href)` becomes a link. */
export function paragraphsToBlocks(paragraphs: string[]) {
  return paragraphs.map((paragraph, index) => {
    const children: Array<Record<string, unknown>> = [];
    const markDefs: Array<Record<string, unknown>> = [];
    let last = 0;
    for (const match of paragraph.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      if (match.index! > last) children.push({ _type: "span", _key: `s${children.length}`, marks: [], text: paragraph.slice(last, match.index) });
      const key = `l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: key, href: match[2] });
      children.push({ _type: "span", _key: `s${children.length}`, marks: [key], text: match[1] });
      last = match.index! + match[0].length;
    }
    if (last < paragraph.length) children.push({ _type: "span", _key: `s${children.length}`, marks: [], text: paragraph.slice(last) });
    return { _type: "block", _key: `p${index}`, style: "normal", markDefs, children };
  });
}
