// Cache tags for published Sanity reads and the publish webhook that clears
// them. Every read also carries SANITY_TAG, so an unknown document type can
// clear everything. Projects are tagged by slug rather than ID so a new
// publish also clears a cached "not found" for that URL. Services share one
// tag (about 20 documents), which also clears cached 404s for new slugs.
export const SANITY_TAG = 'sanity';

export const cacheTags = {
  portfolioPage: 'sanity:portfolioPage',
  categories: 'sanity:workCategory',
  projectCounts: 'sanity:project-counts',
  categoryProjects: (categoryId: string) => `sanity:category-projects:${categoryId}`,
  project: (slug: string) => `sanity:project:${slug}`,
  services: 'sanity:service',
  catalog: (family: string) => `sanity:catalog:${family}`,
};

/**
 * Body sent by the Sanity webhook, from this projection (see
 * docs/architecture.md, "Publish webhook"):
 *
 * {_id, _type, "operation": delta::operation(),
 *  "before": before(){"slug": slug.current, "category": category._ref, "languages": publishedLanguages, "family": family},
 *  "after": after(){"slug": slug.current, "category": category._ref, "languages": publishedLanguages, "family": family}}
 *
 * `family` is only set on catalogue items; until the webhook projection has
 * it, a catalogue publish clears everything.
 */
export type PublishPayload = {
  _id?: string;
  _type?: string;
  operation?: 'create' | 'update' | 'delete';
  before?: DocumentState | null;
  after?: DocumentState | null;
};
type DocumentState = {slug?: string | null; category?: string | null; languages?: string[] | null; family?: string | null};

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const languageKey = (state?: DocumentState | null) => [...(state?.languages ?? ['ro'])].sort().join(',');

/** Tags to revalidate for one changed document; the smallest valid scope. */
export function revalidationTags(payload: PublishPayload): string[] {
  switch (payload._type) {
    case 'portfolioPage':
      return [cacheTags.portfolioPage];
    case 'workCategory':
      return [cacheTags.categories];
    case 'project': {
      const {before, after, operation} = payload;
      const slugs = [before?.slug, after?.slug].filter(isString);
      const categories = [before?.category, after?.category].filter(isString);
      // Without a slug or category the change cannot be scoped.
      if (!slugs.length || !categories.length) return [SANITY_TAG];
      // Category counts change only when a project appears, disappears, moves,
      // or changes language; edits to text or photos leave them alone.
      const countsChanged = operation !== 'update'
        || before?.category !== after?.category
        || isString(before?.slug) !== isString(after?.slug)
        || languageKey(before) !== languageKey(after);
      return [...new Set([
        ...slugs.map(cacheTags.project),
        ...categories.map(cacheTags.categoryProjects),
        ...(countsChanged ? [cacheTags.projectCounts] : []),
      ])];
    }
    case 'service':
      return [cacheTags.services];
    case 'catalogItem': {
      const families = [payload.before?.family, payload.after?.family].filter(isString);
      return families.length ? [...new Set(families.map(cacheTags.catalog))] : [SANITY_TAG];
    }
    default:
      return [SANITY_TAG];
  }
}
