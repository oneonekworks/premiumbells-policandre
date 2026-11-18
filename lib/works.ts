// Lucrările noastre v6.2 (boards V6Works, V6WorksSticky + Mobile): the state
// of the one filter bar, read from the address, and the pure functions the
// wall, the Hartă view and the Project panel share. The page reads every work
// once (getWorks) and filters it here, on the server for the first paint and
// in the browser after a click.
//
// Address: /lucrarile-noastre[/<category>][?tip=&cauta=&judet=|tara=&vedere=harta&pagina=]
// The path segment is a work category. The first category of a craft stands
// for the whole craft (/lucrarile-noastre/clopote = Clopote + Automatizări);
// any other category filters to itself (/lucrarile-noastre/automatizari), so
// existing category URLs keep working (design-plan V0, decision 1).

import {fold, countySlug} from './portfolio-filters';
import {specText} from './projects';

export const crafts = ['policandre', 'clopote', 'iconostase-usi', 'reconditionari'] as const;
export type Craft = (typeof crafts)[number];
export const bellTypes = ['cu-jug', 'fara-balans'] as const;
export type BellType = (typeof bellTypes)[number];
export type WorksView = 'galerie' | 'harta';
export type Metal = 'gold' | 'bronze' | 'gilt';

/** A work category's craft (workCategory.craft) → its metal: gold for
 * Policandre and Recondiționări, bronze for Clopote, gilt for Iconostase și uși. */
export function craftMetal(craft: string | null | undefined): Metal {
  return craft === 'clopote' ? 'bronze' : craft === 'iconostase-usi' ? 'gilt' : 'gold';
}
export type Place = {kind: 'judet' | 'tara'; value: string};

export type WorksState = {
  /** The path segment (a category slug), or null for Toate. */
  category: string | null;
  tip: BellType | null;
  query: string;
  place: Place | null;
  view: WorksView;
  page: number;
};

export type WorkCategory = {slug: string | null; craft: string | null; displayOrder?: number | null};

export type WorkLike = {
  _id: string;
  title: string | null;
  slug: string | null;
  categorySlug: string | null;
  categoryTitle: string | null;
  craft: string | null;
  bellTypes: string[] | null;
  featured: boolean | null;
  year: number | null;
  location: {locality?: string; county?: string; country?: string} | null;
  specs: {value: string | null; unit: string | null; label: string | null}[] | null;
};

export const FIRST_PAGE = 10;
export const PAGE_STEP = 24;
export const SEARCH_MAX = 80;
const countries = ['ro', 'md', 'es', 'be', 'gr'];

const single = (value: string | string[] | undefined | null) => (typeof value === 'string' ? value : '');

/** The address → the bar's state. Unknown values are ignored, not errors. */
export function parseWorksState(category: string | null, params: Record<string, string | string[] | undefined> | URLSearchParams): WorksState {
  const get = (key: string) => (params instanceof URLSearchParams ? params.get(key) : single(params[key])) ?? '';
  const tip = get('tip') as BellType;
  const judet = get('judet').trim().toLowerCase();
  const tara = get('tara').trim().toLowerCase();
  const page = Number(get('pagina'));
  return {
    category,
    tip: bellTypes.includes(tip) ? tip : null,
    query: get('cauta').replace(/\s+/g, ' ').trim().slice(0, SEARCH_MAX),
    place: judet ? {kind: 'judet', value: judet} : countries.includes(tara) ? {kind: 'tara', value: tara} : null,
    view: get('vedere') === 'harta' ? 'harta' : 'galerie',
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 50) : 1,
  };
}

/** The first category (display order) of each craft: its chip's address. */
export function craftCategories(categories: WorkCategory[]): Partial<Record<Craft, string>> {
  const result: Partial<Record<Craft, string>> = {};
  const sorted = [...categories].sort((a, b) => (a.displayOrder ?? 1e6) - (b.displayOrder ?? 1e6));
  for (const category of sorted) {
    const craft = category.craft as Craft;
    if (category.slug && crafts.includes(craft) && !result[craft]) result[craft] = category.slug;
  }
  return result;
}

/** Which craft chip is on, and whether the path narrows it to one category. */
export function selection(state: WorksState, categories: WorkCategory[]): {craft: Craft | null; only: string | null} {
  if (!state.category) return {craft: null, only: null};
  const category = categories.find((item) => item.slug === state.category);
  const craft = (category?.craft as Craft) ?? null;
  if (!craft) return {craft: null, only: null};
  return {craft, only: craftCategories(categories)[craft] === state.category ? null : state.category};
}

/** The county or country a work is listed under in the Hartă island. */
export function placeOf(work: Pick<WorkLike, 'location'>): Place | null {
  const country = (work.location?.country ?? 'RO').toLowerCase();
  if (country !== 'ro') return countries.includes(country) ? {kind: 'tara', value: country} : null;
  return work.location?.county ? {kind: 'judet', value: countySlug(work.location.county)} : null;
}

const inPlace = (work: WorkLike, place: Place) => {
  if (place.kind === 'tara') return (work.location?.country ?? 'RO').toLowerCase() === place.value;
  const own = placeOf(work);
  return own?.kind === 'judet' && own.value === place.value;
};

export const hasBellType = (work: Pick<WorkLike, 'bellTypes'>, tip: BellType) =>
  !work.bellTypes?.length || work.bellTypes.includes(tip);

/**
 * Toate: CMS featured first, then the crafts alternating (Policandre, Clopote,
 * Iconostase și uși, Recondiționări), each in the CMS order. A filtered list
 * keeps the CMS order (featured, display order, newest).
 */
export function orderWorks<T extends WorkLike>(works: T[]): T[] {
  const featured = works.filter((work) => work.featured);
  const queues = crafts.map((craft) => works.filter((work) => !work.featured && work.craft === craft));
  const other = works.filter((work) => !work.featured && !crafts.includes(work.craft as Craft));
  const mixed: T[] = [];
  for (let round = 0; queues.some((queue) => queue.length > round); round++) {
    for (const queue of queues) if (queue[round]) mixed.push(queue[round]);
  }
  return [...featured, ...mixed, ...other];
}

/** Craft (+ category), bell type, place, then every search word in title or place. */
export function filterWorks<T extends WorkLike>(
  works: T[], state: WorksState, categories: WorkCategory[], countryNames: Record<string, string>,
  {place = true}: {place?: boolean} = {},
): T[] {
  const {craft, only} = selection(state, categories);
  const words = fold(state.query).split(' ').filter(Boolean);
  const matches = works.filter((work) => {
    if (craft && work.craft !== craft) return false;
    if (only && work.categorySlug !== only) return false;
    if (craft === 'clopote' && state.tip && !hasBellType(work, state.tip)) return false;
    if (place && state.place && !inPlace(work, state.place)) return false;
    if (!words.length) return true;
    const {locality, county, country} = work.location ?? {};
    const text = fold([work.title, locality, county, country && countryNames[country], work.categoryTitle].filter(Boolean).join(' '));
    return words.every((word) => text.includes(word));
  });
  if (!craft) return orderWorks(matches);
  // Bell type: works marked with the type first, then the ones not marked yet.
  if (craft === 'clopote' && state.tip) {
    return [...matches.filter((work) => work.bellTypes?.length), ...matches.filter((work) => !work.bellTypes?.length)];
  }
  return matches;
}

/** Address of a state; defaults are left out. `base` is the Works path. */
export function worksHref(base: string, state: WorksState): string {
  const params = new URLSearchParams();
  if (state.tip) params.set('tip', state.tip);
  if (state.query) params.set('cauta', state.query);
  if (state.place) params.set(state.place.kind, state.place.value);
  if (state.view === 'harta') params.set('vedere', 'harta');
  if (state.page > 1) params.set('pagina', String(state.page));
  const path = state.category ? `${base}/${state.category}` : base;
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const visibleCount = (page: number) => FIRST_PAGE + PAGE_STEP * (page - 1);

// ---------- Captions ----------

/** "Dej, Cluj" in Romania, "Lleida, Spania" abroad; the locality alone when it names the county. */
export function placeText(work: Pick<WorkLike, 'location'>, countryNames: Record<string, string>): string {
  const {locality, county, country = 'RO'} = work.location ?? {};
  const second = country === 'RO' ? county : countryNames[country]?.split(' · ')[0];
  const parts = [locality, second].map((part) => part?.trim()).filter(Boolean) as string[];
  if (parts.length === 2 && fold(parts[0]) === fold(parts[1])) parts.pop();
  return parts.join(', ');
}

/** County in Romania, the country abroad: the phone tiles' short place. */
export function shortPlace(work: Pick<WorkLike, 'location'>, countryNames: Record<string, string>): string {
  const {locality, county, country = 'RO'} = work.location ?? {};
  if (country !== 'RO') return countryNames[country]?.split(' · ')[0] ?? '';
  return county?.trim() || locality?.trim() || '';
}

/**
 * What was made, from the specifications: values that share the first label
 * are joined ("170 și 42 kg"); otherwise the first one ("11 clopote").
 */
export function whatText(work: Pick<WorkLike, 'specs'>, and = 'și'): string | null {
  const specs = (work.specs ?? []).filter((spec) => spec.value?.trim());
  if (!specs.length) return null;
  const first = specs[0];
  const same = specs.filter((spec) => spec.label === first.label && spec.unit === first.unit);
  if (same.length < 2 || !first.unit) return specText(first);
  const values = same.slice(0, 3).map((spec) => spec.value!.trim());
  return `${values.slice(0, -1).join(', ')} ${and} ${values.at(-1)} ${first.unit}`;
}

/** Caption lines: full (desktop), phone (big tile: + year) and short (small phone tile). */
export function captionLines(work: WorkLike, countryNames: Record<string, string>, and?: string) {
  const craft = work.categoryTitle ?? '';
  const year = work.year ? String(work.year) : null;
  const place = placeText(work, countryNames);
  const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ');
  return {
    full: join(craft, place, whatText(work, and), year),
    big: join(craft, place, year),
    short: join(craft, shortPlace(work, countryNames)),
  };
}

// ---------- Wall layout ----------

export type TileShape = 'L' | 'T' | 'W' | 'S' | 'F' | 'FW';

// One block of the board's wall, in reading order. Desktop (4 columns): the
// featured 2 × 2, a tall tile, two small ones (the second is the map tile in the
// first block), two small, a wide one, tall, 2 × 2, two small. Phone (2
// columns): the first work full width × 2, tall, two small, the map tile (full
// width), two small, full width, tall, two small.
const desktopCycle: TileShape[] = ['L', 'T', 'S', 'S', 'S', 'S', 'W', 'T', 'L', 'S', 'S'];
const phoneCycle: TileShape[] = ['F', 'T', 'S', 'S', 'FW', 'S', 'S', 'FW', 'T', 'S', 'S'];
/** Where the map tile sits in the first block. */
export const MAP_SLOT = {desktop: 3, phone: 4};

/** The shapes of tile `index` (0-based among works, map tile not counted). */
export function tileShapes(index: number): {desktop: TileShape; phone: TileShape} {
  const desktop = index < MAP_SLOT.desktop ? index : index + 1;
  const phone = index < MAP_SLOT.phone ? index : index + 1;
  return {desktop: desktopCycle[desktop % desktopCycle.length], phone: phoneCycle[phone % phoneCycle.length]};
}

// ---------- Hartă island ----------

export type PlaceRow = {place: Place; name: string; count: number};

/** România by county (alphabetical), then the countries abroad, with counts. */
export function placeRows(works: WorkLike[], countryNames: Record<string, string>, athos: string): {romania: PlaceRow[]; abroad: PlaceRow[]} {
  const rows = new Map<string, PlaceRow>();
  for (const work of works) {
    const place = placeOf(work);
    if (!place) continue;
    const key = `${place.kind}:${place.value}`;
    const name = place.kind === 'judet'
      ? work.location!.county!.trim()
      : place.value === 'gr' ? athos : countryNames[place.value.toUpperCase()]?.split(' · ')[0] ?? place.value;
    const row = rows.get(key);
    rows.set(key, {place, name: row?.name ?? name, count: (row?.count ?? 0) + 1});
  }
  const collator = new Intl.Collator('ro');
  const all = [...rows.values()];
  return {
    romania: all.filter((row) => row.place.kind === 'judet').sort((a, b) => collator.compare(a.name, b.name)),
    abroad: all.filter((row) => row.place.kind === 'tara').sort((a, b) => countries.indexOf(a.place.value) - countries.indexOf(b.place.value)),
  };
}

export const samePlace = (a: Place | null, b: Place | null) => Boolean(a && b && a.kind === b.kind && a.value === b.value);
