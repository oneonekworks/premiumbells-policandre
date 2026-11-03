import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ManifestAsset } from "./legacy-media";
import {
  checkPrices,
  createMediaResolver,
  issueCollector,
  localeString,
  localeText,
  paragraphsToBlocks,
  resolvePointer,
  shortKey,
  sourceHashOf,
  type DocumentPlan,
  type SourceLoader,
} from "./legacy-documents";

// Maps the reviewed seed (config/legacy-services.json) to `service` drafts.
// Every text comes from the seed; images, bell tables and sets come from the
// legacy files through `file#path` pointers. Bell rows read only weight,
// diameter, height and note; sets only the title (weights) and audio. IDs are
// `legacy-service-<path>` (`/servicii/clopote/cu-jug` → `legacy-service-clopote-cu-jug`).

export const SERVICES_SEED_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../config/legacy-services.json");
const SEED_SOURCE = "scripts/config/legacy-services.json";

type Media = string | string[];
type SeedSection =
  | { type: "gallery"; heading?: string; images: Media; captions?: string }
  | { type: "steps"; heading?: string; steps: Array<{ title: string; text?: string; images?: Media }> }
  | { type: "models"; heading?: string; models: Array<{ title: string; description?: string; descriptionFrom?: string; cover: string; gallery?: Media; anchorId?: string }> }
  | { type: "bellSizes"; heading?: string; rows: string; note?: string }
  | { type: "bellSets"; heading?: string; sets: string | Array<{ title: string; weightsKg: number[]; withElectronicRinger?: boolean; description?: string }> }
  | { type: "catalogue"; heading?: string; families: string[] };

export interface SeedService {
  path: string;
  status: "active" | "hidden";
  displayOrder: number;
  title: string;
  cardLabel?: string;
  summary: string;
  cover: string;
  coverAlt?: string;
  body?: string[];
  relatedCategory?: string;
  sections: SeedSection[];
}

export function loadServicesSeed(file = SERVICES_SEED_FILE): SeedService[] {
  const seed = JSON.parse(readFileSync(file, "utf8")) as { schemaVersion: number; services: SeedService[] };
  if (seed.schemaVersion !== 1 || !Array.isArray(seed.services)) throw new Error(`Unsupported services seed: ${file}`);
  return seed.services;
}

export const serviceDocumentId = (servicePath: string) => `legacy-service-${servicePath.replace(/^\/servicii\//, "").replace(/\//g, "-")}`;

/** "25 kg" → 25, "19.5 cm" → 19.5. */
const measure = (raw: unknown, unit: string) => {
  const match = String(raw ?? "").trim().match(new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*${unit}$`, "i"));
  return match ? Number(match[1].replace(",", ".")) : undefined;
};

export interface ServicesContext {
  load: SourceLoader;
  legacyRoot: string;
  manifest: Map<string, ManifestAsset>;
  resolveAsset: (canonical: string) => string | undefined;
  seed: SeedService[];
}

export function mapServices(context: ServicesContext): DocumentPlan[] {
  const paths = new Set(context.seed.map((service) => service.path));
  return context.seed.map((service) => mapService(service, context, paths));
}

function mapService(service: SeedService, context: ServicesContext, paths: Set<string>): DocumentPlan {
  const { issues, issue } = issueCollector();
  const review: string[] = [];
  const media = createMediaResolver(context, issue);
  const segments = service.path.replace(/^\/servicii\//, "").split("/");
  const slug = segments[segments.length - 1];
  const parentPath = segments.length > 1 ? `/servicii/${segments[0]}` : undefined;
  if (segments.length > 2) issue("error", "too-deep", "Services are at most two levels deep.");
  if (parentPath && !paths.has(parentPath)) issue("error", "missing-parent", `Parent ${parentPath} is not in the seed.`);

  /** A media spec: a pointer (`file#path`) or plain legacy references from the seed. */
  const mediaList = (spec: Media | undefined, role: string): { refs: unknown[]; file: string } => {
    if (!spec) return { refs: [], file: SEED_SOURCE };
    if (Array.isArray(spec)) return { refs: spec, file: "data/servicePages.js" };
    if (!spec.includes("#")) return { refs: [spec], file: "data/servicePages.js" };
    const { file, value } = resolvePointer(context.load, spec);
    if (value === undefined) issue("error", "bad-pointer", `${role}: ${spec} resolves to nothing.`);
    return { refs: Array.isArray(value) ? value : value === undefined ? [] : [value], file };
  };
  const single = (spec: string, role: string, extra?: Record<string, unknown>) => {
    const { refs, file } = mediaList(spec, role);
    return media.image(refs[0], file, role, extra);
  };
  const images = (spec: Media | undefined, role: string, captions?: string) => {
    const { refs, file } = mediaList(spec, role);
    const captionList = captions ? (resolvePointer(context.load, captions).value as unknown[]) : [];
    return media.gallery(refs, file, role, captionList);
  };
  const heading = (value?: string) => (value ? { heading: localeString(value) } : {});

  const sections = service.sections.map((section, index) => {
    const _key = `${section.type}${index}`;
    const role = `${section.type} ${index + 1}`;
    switch (section.type) {
      case "gallery":
        return { _type: "sectionGallery", _key, ...heading(section.heading), images: images(section.images, role, section.captions) };
      case "steps":
        return {
          _type: "sectionSteps", _key, ...heading(section.heading),
          steps: section.steps.map((step, stepIndex) => ({
            _type: "step", _key: `step${stepIndex}`, title: localeString(step.title),
            ...(step.text ? { text: localeText(step.text) } : {}),
            images: images(step.images, `${role} step ${stepIndex + 1}`),
          })),
        };
      case "models":
        return {
          _type: "sectionModels", _key, ...heading(section.heading),
          models: section.models.map((model, modelIndex) => {
            let description = model.description;
            if (model.descriptionFrom) {
              const value = resolvePointer(context.load, model.descriptionFrom).value;
              description = (Array.isArray(value) ? value : [value]).map((line) => String(line ?? "").replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
              review.push(`Legacy text used as is for "${model.title}"`);
            }
            const modelRole = `${role} "${model.title}"`;
            const cover = single(model.cover, `${modelRole} cover`, { alt: localeString(model.title) });
            const gallery = images(model.gallery, `${modelRole} gallery`);
            return {
              _type: "model", _key: shortKey(`${service.path}:${model.title}:${modelIndex}`), title: localeString(model.title),
              ...(description ? { description: localeText(description) } : {}),
              ...(cover ? { cover } : {}), ...(gallery.length ? { gallery } : {}),
              ...(model.anchorId ? { anchorId: model.anchorId } : {}),
            };
          }),
        };
      case "bellSizes": {
        const { value } = resolvePointer(context.load, section.rows);
        const rows = (value as Array<Record<string, unknown>> ?? []).flatMap((row, rowIndex) => {
          const weightKg = measure(row.weight, "kg");
          if (weightKg === undefined) {
            issue("error", "bad-bell-row", `${role} row ${rowIndex + 1}: weight "${String(row.weight)}"`);
            return [];
          }
          const diameterCm = measure(row.diameter, "cm");
          const heightCm = measure(row.height, "cm");
          if ((row.diameter && diameterCm === undefined) || (row.height && heightCm === undefined)) {
            issue("error", "bad-bell-row", `${role} row ${rowIndex + 1}: "${String(row.diameter)}" / "${String(row.height)}"`);
          }
          const note = String(row.note ?? "").trim();
          return [{ _type: "bellSize", _key: `row${rowIndex}`, weightKg, ...(diameterCm ? { diameterCm } : {}), ...(heightCm ? { heightCm } : {}), ...(note ? { note } : {}) }];
        });
        return { _type: "sectionBellSizes", _key, ...heading(section.heading), rows, ...(section.note ? { note: localeText(section.note) } : {}) };
      }
      case "bellSets": {
        const sets = typeof section.sets === "string"
          ? ((resolvePointer(context.load, section.sets).value as Array<Record<string, unknown>>) ?? []).map((set, setIndex) => {
            const title = String(set.title ?? "");
            const weightsKg = [...title.matchAll(/(\d+(?:\.\d+)?)\s*kg/gi)].map((match) => Number(match[1]));
            if (!weightsKg.length) issue("error", "bad-bell-set", `${role} set ${setIndex + 1}: "${title}"`);
            const audio = set.audioSrc ? media.file(set.audioSrc, resolvePointer(context.load, section.sets as string).file, `${role} set ${setIndex + 1} audio`) : undefined;
            return {
              title: `Set de ${weightsKg.length} clopote`, weightsKg, withElectronicRinger: /clopotar electronic/i.test(title),
              ...(audio ? { audio } : {}),
            };
          })
          : section.sets;
        return {
          _type: "sectionBellSets", _key, ...heading(section.heading),
          sets: sets.map((set, setIndex) => ({
            _type: "bellSet", _key: `set${setIndex}`, title: localeString(set.title), weightsKg: set.weightsKg,
            withElectronicRinger: Boolean(set.withElectronicRinger),
            ...("description" in set && set.description ? { description: localeText(set.description) } : {}),
            ...("audio" in set && set.audio ? { audio: set.audio } : {}),
          })),
        };
      }
      case "catalogue":
        return { _type: "sectionCatalogue", _key, ...heading(section.heading), families: section.families };
      default:
        issue("error", "unknown-section", `Unknown section type in the seed.`);
        return { _type: "unknown", _key };
    }
  });

  const coverImage = single(service.cover, "cover", service.coverAlt ? { alt: localeString(service.coverAlt) } : {});
  if (!coverImage) issue("error", "missing-cover", "No usable cover image.");

  const document = {
    _id: serviceDocumentId(service.path),
    _type: "service",
    publishedLanguages: ["ro"],
    title: localeString(service.title),
    slug: { _type: "localeSlug", ro: { _type: "slug", current: slug } },
    ...(parentPath ? { parent: { _type: "reference", _ref: serviceDocumentId(parentPath) } } : {}),
    status: service.status,
    ...(service.cardLabel ? { cardLabel: localeString(service.cardLabel) } : {}),
    summary: localeText(service.summary),
    ...(coverImage ? { coverImage } : {}),
    displayOrder: service.displayOrder,
    ...(service.body?.length ? { body: { _type: "localeBlockContent", ro: paragraphsToBlocks(service.body) } } : {}),
    sections,
    legacy: {
      _type: "legacySource",
      collection: "services",
      legacySlug: service.path,
      sourceFile: SEED_SOURCE,
      sourceHash: sourceHashOf(service),
    },
  };
  const plan: DocumentPlan = {
    key: `services:${service.path}`, collection: "services", document, images: media.needs, issues, review,
    ...(parentPath ? { parentId: serviceDocumentId(parentPath) } : {}),
    ...(service.relatedCategory ? { relatedCategorySlug: service.relatedCategory } : {}),
  };
  checkPrices(plan);
  return plan;
}
