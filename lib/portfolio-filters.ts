// Search and filters for a category grid. The state lives in the query string
// (`?cauta=iasi&an=2021&judet=botosani&pagina=2`, same names under /en) so a
// filtered view can be shared and Back/Forward works. The page filters one
// cached list of every card on the server (see getCategoryProjects), so a
// search costs no Sanity request.

type SearchParams = Record<string, string | string[] | undefined>;

export type Filterable = {
  title: string | null;
  year: number | null;
  location: {locality?: string; county?: string; country?: 'MD' | 'RO' | 'ES'} | null;
};

export type Filters = {query: string; year: number | null; county: string | null};
export type FilterOption<T> = {value: T; label: string; count: number};
export type FilterOptions = {years: FilterOption<number>[]; counties: FilterOption<string>[]};

export const SEARCH_MAX_LENGTH = 80;
export const MOLDOVA = 'moldova';
export const noFilters: Filters = {query: '', year: null, county: null};

/**
 * Lower-case text without diacritics or punctuation, so "Iași", "IASI" and
 * "iasi" compare equal (both ș and the legacy cedilla ş).
 */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** URL value for a county: "Caraș-Severin" → "caras-severin". */
export const countySlug = (county: string) => fold(county).replaceAll(' ', '-');

// Moldovan projects are grouped under the country: two of three have no raion.
function countyOf(project: Filterable): string | null {
  if (project.location?.country === 'MD') return MOLDOVA;
  return project.location?.county ? countySlug(project.location.county) : null;
}

/** Years (newest first) and counties (Romanian order, Moldova last) present in the list. */
export function filterOptions(projects: Filterable[], countries: Record<string, string>): FilterOptions {
  const years = new Map<number, number>();
  const counties = new Map<string, {label: string; count: number}>();
  for (const project of projects) {
    if (project.year) years.set(project.year, (years.get(project.year) ?? 0) + 1);
    const county = countyOf(project);
    if (!county) continue;
    const label = county === MOLDOVA ? countries.MD : project.location!.county!.trim();
    const entry = counties.get(county);
    counties.set(county, {label: entry?.label ?? label, count: (entry?.count ?? 0) + 1});
  }
  const collator = new Intl.Collator('ro');
  return {
    years: [...years].sort(([a], [b]) => b - a).map(([value, count]) => ({value, label: String(value), count})),
    counties: [...counties]
      .map(([value, {label, count}]) => ({value, label, count}))
      .sort((a, b) => Number(a.value === MOLDOVA) - Number(b.value === MOLDOVA) || collator.compare(a.label, b.label)),
  };
}

const single = (value: string | string[] | undefined) => (typeof value === 'string' ? value : '');

/**
 * Reads `cauta`, `an` and `judet`. A year or county the category does not
 * have is ignored rather than showing an empty grid for a mistyped link.
 */
export function parseFilters(params: SearchParams, options: FilterOptions): Filters {
  const query = single(params.cauta).replace(/\s+/g, ' ').trim().slice(0, SEARCH_MAX_LENGTH);
  const year = Number(single(params.an));
  const county = single(params.judet);
  return {
    query,
    year: options.years.some((option) => option.value === year) ? year : null,
    county: options.counties.some((option) => option.value === county) ? county : null,
  };
}

export const hasFilters = (filters: Filters) => Boolean(filters.query || filters.year || filters.county);

/**
 * Every word of the search must appear in the title or place (locality,
 * county, country name); year and county must match exactly.
 */
export function applyFilters<T extends Filterable>(projects: T[], filters: Filters, countries: Record<string, string>): T[] {
  const words = fold(filters.query).split(' ').filter(Boolean);
  return projects.filter((project) => {
    if (filters.year && project.year !== filters.year) return false;
    if (filters.county && countyOf(project) !== filters.county) return false;
    if (!words.length) return true;
    const {locality, county, country} = project.location ?? {};
    const text = fold([project.title, locality, county, country && countries[country]].filter(Boolean).join(' '));
    return words.every((word) => text.includes(word));
  });
}

/** Grid URL for these filters and page; defaults are left out. */
export function filtersHref(basePath: string, filters: Filters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.query) params.set('cauta', filters.query);
  if (filters.year) params.set('an', String(filters.year));
  if (filters.county) params.set('judet', filters.county);
  if (page > 1) params.set('pagina', String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
