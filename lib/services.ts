// Pure helpers for service pages (paths, catalogue formatting), shared by
// the routes and unit-tested in tests/services.test.ts.

export const servicesPath = '/servicii';

/** Anchor of the homepage services section, where "Servicii" links point (no /servicii page in v6). */
export const servicesAnchor = 'servicii';

/**
 * Variants that a parent page renders as its own content (routes.md):
 * /servicii/clopote is Clopote cu jug; /servicii/clopote/cu-jug redirects there.
 */
export const defaultVariants: Record<string, string> = {clopote: 'cu-jug'};

/** Internal (Romanian-segment) path of a service, or of a variant under `parentSlug`. */
export function servicePath(parentSlug: string | null | undefined, slug: string): string {
  if (parentSlug && defaultVariants[parentSlug] === slug) return `${servicesPath}/${parentSlug}`;
  return parentSlug ? `${servicesPath}/${parentSlug}/${slug}` : `${servicesPath}/${slug}`;
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
