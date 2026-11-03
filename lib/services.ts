// Pure helpers for service pages (paths, the overview tree, catalogue
// formatting), shared by the routes and unit-tested in tests/services.test.ts.
import type {SERVICES_QUERY_RESULT} from '@/sanity/types';

type ServiceListItem = SERVICES_QUERY_RESULT[number];

export const servicesPath = '/servicii';

/** Internal (Romanian-segment) path of a service, or of a variant under `parentSlug`. */
export function servicePath(parentSlug: string | null | undefined, slug: string): string {
  return parentSlug ? `${servicesPath}/${parentSlug}/${slug}` : `${servicesPath}/${slug}`;
}

export type ServiceNode = ServiceListItem & {variants: ServiceListItem[]};

/** Top-level services in order, each with its public variants; orphaned variants are dropped. */
export function serviceTree(services: readonly ServiceListItem[]): ServiceNode[] {
  return services
    .filter((service) => !service.parentId)
    .map((parent) => ({...parent, variants: services.filter((service) => service.parentId === parent._id)}));
}

/** Cache key for getCatalogItems, so ["horos", "policandre"] and the reverse share one read. */
export const catalogKey = (families: readonly string[] | null | undefined) =>
  [...new Set(families ?? [])].sort().join(',');

/**
 * DOM ids a catalogue card answers to: its legacy anchors (`Policandru-7`)
 * and its slug, so old `#Policandru-N` links open the right card.
 */
export function catalogAnchors(item: {anchorIds?: string[] | null; slug?: string | null; _id: string}): string[] {
  const ids = [...(item.anchorIds ?? []), item.slug ?? item._id.replace(/^.*\./, '')];
  return [...new Set(ids.filter(Boolean))];
}

/** Centimetres as shown on the site: metres from 100 cm ("3,1 m"), else "85 cm". */
export function formatLength(cm: number, locale: string): string {
  if (cm >= 100) return `${new Intl.NumberFormat(locale, {maximumFractionDigits: 2}).format(cm / 100)} m`;
  return `${new Intl.NumberFormat(locale, {maximumFractionDigits: 1}).format(cm)} cm`;
}
