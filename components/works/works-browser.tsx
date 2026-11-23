'use client';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {EuropeMap} from '@/components/map/europe-map';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import type {Lang} from '@/lib/i18n/routing';
import {placeLonLat} from '@/lib/europe-map';
import {
  bellTypes, craftCategories, filterWorks, MAP_SLOT, parseWorksState, placeRows, samePlace, selection,
  visibleCount, worksHref, type BellType, type Craft, type Place, type WorkCategory, type WorksState,
} from '@/lib/works';
import {sanityImageUrl} from '@/sanity/image';
import {setProjectList, type ListItem} from './project-list';
import {WorkTile, type BrowserWork} from './work-tile';
import {WorksMap} from './works-map';

type T = Dictionary['works6'];

export type BrowserCategory = WorkCategory & {title: string | null};

// The craft's dark tone for its active chip (components.md "Works filter row").
const chipOn: Record<Craft, string> = {
  policandre: 'bg-[#6e5020] border-[#6e5020]', clopote: 'bg-graphite border-graphite',
  'iconostase-usi': 'bg-[#7a3f1e] border-[#7a3f1e]', reconditionari: 'bg-teal-900 border-teal-900',
};
const craftBar: Record<Craft, string> = {policandre: 'bar-gold', clopote: 'bar-bronze', 'iconostase-usi': 'bar-gilt', reconditionari: 'bar-gold'};
const moodClass: Record<Craft, string> = {policandre: 'fx-pol', clopote: 'fx-clo', 'iconostase-usi': 'fx-ico', reconditionari: 'fx-rec'};

const placeKey = (place: Place | null) => (place ? `${place.kind}:${place.value}` : '');
const same = (a: WorksState, b: WorksState) =>
  a.category === b.category && a.tip === b.tip && a.query === b.query && placeKey(a.place) === placeKey(b.place)
  && a.view === b.view && a.page === b.page;

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>;
}
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
}
function PinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>;
}
function CrossIcon({className = ''}: {className?: string}) {
  return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={className}><path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

/**
 * Lucrările noastre v6.2: the one filter bar (craft chips, bell type after
 * Clopote, search, Galerie | Hartă) that docks under the header, the craft
 * mood on the band, the wall of tiles with the map tile in its first row, and
 * the Hartă view. State lives in the address; clicks update it with the
 * History API (Next keeps usePathname / useSearchParams in step), so the
 * page filters instantly, Back works and a shared link renders the same view
 * on the server. While a project is open over the wall (its address is a
 * project path) the wall keeps the last list state.
 */
export function WorksBrowser({works, categories, base, initial, lang, t, countries, athos, projects, children}: {
  works: BrowserWork[];
  categories: BrowserCategory[];
  /** The Works path in this language (`/lucrarile-noastre`). */
  base: string;
  initial: WorksState;
  lang: Lang;
  t: T;
  countries: Record<string, string>;
  athos: string;
  /** Plural forms for "60 de lucrări". */
  projects: readonly string[];
  /** The hero, rendered on the server. */
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = useMemo(() => {
    if (!pathname.startsWith(base)) return null;
    const rest = pathname.slice(base.length).split('/').filter(Boolean);
    if (rest.length > 1) return null;
    return parseWorksState(rest[0] ? decodeURIComponent(rest[0]) : null, new URLSearchParams(params.toString()));
  }, [pathname, params, base]);
  // A project address keeps the wall as it was (stored from earlier renders).
  const [kept, setKept] = useState(initial);
  if (fromUrl && !same(fromUrl, kept)) setKept(fromUrl);
  // No "Toate" view: an address without a category (an old history entry) shows Policandre.
  const craftHref = useMemo(() => craftCategories(categories), [categories]);
  const loose = fromUrl ?? kept;
  const state = useMemo(() => (loose.category ? loose : {...loose, category: craftHref.policandre ?? null}), [loose, craftHref]);

  const {craft} = selection(state, categories);

  const inView = useMemo(() => filterWorks(works, state, categories, countries, {place: false}), [works, state, categories, countries]);
  const matches = useMemo(() => filterWorks(works, state, categories, countries), [works, state, categories, countries]);
  const shown = matches.slice(0, visibleCount(state.page));
  const rows = useMemo(() => placeRows(inView, countries, athos), [inView, countries, athos]);
  const placeName = state.place ? [...rows.romania, ...rows.abroad].find((row) => samePlace(row.place, state.place))?.name
    ?? (state.place.kind === 'tara' ? countries[state.place.value.toUpperCase()]?.split(' · ')[0] : state.place.value) : null;

  const total = plural(lang, matches.length, projects);
  const count = craft === 'clopote' && state.tip ? t.typed.replace('{count}', total).replace('{type}', t.bellLong[state.tip]) : total;
  const listLabel = (craft === 'clopote' && state.tip ? t.bellLong[state.tip] : craft ? t.crafts[craft] : t.all)
    + (placeName ? ` · ${placeName}` : '');

  // ---------- Address ----------
  const band = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const pageBar = useRef<HTMLDivElement>(null);
  // Desktop: the shelf shows once the wall moves (at the top the band itself is
  // behind the bar). Phones: the fixed strip takes over once the page bar has scrolled away.
  const [scrolled, setScrolled] = useState(false);
  const [docked, setDocked] = useState(false);
  const go = (next: Partial<WorksState>, mode: 'push' | 'replace' = 'push') => {
    const target: WorksState = {...state, page: 1, ...next};
    const href = worksHref(base, target);
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', href);
    // Changing the filter once the wall has scrolled brings the wall back to its top
    // (the page has no hero, so that is the top of the page).
    if (scrollY > 0 && !('page' in next)) {
      scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  };
  const pickCraft = (value: Craft) => go({category: craftHref[value] ?? null, tip: null});
  const pickTip = (tip: BellType) => go({tip: state.tip === tip ? null : tip});
  const pickView = (view: WorksState['view']) => go({view});
  const pickPlace = (place: Place | null) => go({place, view: 'galerie'});

  // ---------- Fixed top shelf (CHANGES-v6.3 §5) ----------
  useEffect(() => {
    // The header reads this: on Works it keeps its look while scrolling and,
    // on desktop, never hides (header-frame.tsx).
    document.documentElement.toggleAttribute('data-works-shelf', true);
    let frame = 0;
    const update = () => {
      frame = 0;
      const area = band.current?.getBoundingClientRect();
      const bar = pageBar.current?.getBoundingClientRect();
      if (!area) return;
      setScrolled(scrollY > 0);
      // Phones: the chips + search rows have gone under the header (bottom 72; 84 from 1024).
      const headerBottom = innerWidth >= 1024 ? 84 : 72;
      setDocked(Boolean(bar && bar.height && bar.bottom < headerBottom + 56) && area.bottom > headerBottom + 160);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, {passive: true});
    addEventListener('resize', onScroll);
    return () => {
      document.documentElement.removeAttribute('data-works-shelf');
      removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame);
    };
  }, []);

  // ---------- Search (typed text goes to the address after a pause) ----------
  const [draft, setDraft] = useState(state.query);
  const [searchOpen, setSearchOpen] = useState(Boolean(state.query));
  const [syncedQuery, setSyncedQuery] = useState(state.query);
  if (syncedQuery !== state.query) { setSyncedQuery(state.query); setDraft(state.query); }
  const field = useRef<HTMLInputElement>(null);
  const phoneField = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (draft.trim() === state.query) return;
    const timer = setTimeout(() => go({query: draft.replace(/\s+/g, ' ').trim()}, 'replace'), 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text starts the timer
  }, [draft]);

  // Phones: keep the active chip in view in both chip rows (Clopote at the
  // start, so its bell types follow it).
  const chipRows = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    for (const row of chipRows.current) {
      const on = row?.querySelector<HTMLElement>('[data-craft-on]');
      if (!row || !on || row.scrollWidth <= row.clientWidth) continue;
      const left = row.scrollLeft + on.getBoundingClientRect().left - row.getBoundingClientRect().left - 12;
      row.scrollTo({left: Math.max(0, left), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }, [craft, state.tip, docked]);

  // Register the filtered list for the Project panel when a tile opens it.
  const register = () => setProjectList({
    label: listLabel,
    items: matches.map((work): ListItem => ({
      href: work.href, title: work.title ?? '', category: work.categoryTitle ?? '',
      thumb: work.image?.asset ? sanityImageUrl(work.image, 72, 96) ?? null : null,
    })),
  });

  // ---------- Pieces ----------
  const craftButtons = (phone: boolean, docks = false) => {
    const chip = (value: Craft, label: string) => {
      const on = value === craft;
      return (
        <button key={value} type="button" aria-pressed={on} onClick={() => pickCraft(value)}
          data-craft-on={on ? '' : undefined}
          className={phone
            ? `inline-flex flex-none items-center rounded-pill border font-medium transition-colors duration-(--duration-line) ${docks ? 'h-10 px-3.5 text-[0.875rem]' : 'h-11 px-4.5 text-[0.9375rem]'} ${on ? `${chipOn[value]} text-white` : 'border-hairline bg-white text-ink hover:bg-teal-tint'}`
            : `inline-flex h-10 flex-none items-center whitespace-nowrap rounded-pill px-4 text-[0.9375rem] font-medium transition-colors duration-(--duration-line) ${on ? `${chipOn[value]} text-white` : 'text-ink hover:bg-teal-tint'}`}>
          <i aria-hidden="true" className={`mr-2 inline-block h-[3px] w-4 flex-none rounded-[2px] ${craftBar[value]}`} />
          {label}
        </button>
      );
    };
    const sub = craft === 'clopote' ? (
      phone ? (
        <>
          <span aria-hidden="true" className="my-2 w-px flex-none self-stretch bg-hairline" />
          {bellTypes.map((tip) => {
            const on = state.tip === tip;
            return (
              <button key={tip} type="button" aria-pressed={on} aria-label={on ? t.bellOff[tip] : t.bellOnly[tip]} onClick={() => pickTip(tip)}
                className={`works-sub inline-flex flex-none items-center gap-1.5 rounded-pill px-3.5 text-[0.875rem] font-medium ${docks ? 'h-10' : 'h-11'} ${on ? 'border-[1.5px] border-graphite bg-white text-graphite' : 'border border-[rgb(51_54_59/0.3)] text-ink'}`}>
                {t.bell[tip]}{on && docks ? ` · ${matches.length}` : ''}{on ? <CrossIcon /> : null}
              </button>
            );
          })}
        </>
      ) : (
        <span role="group" aria-label={t.bellGroup} className="works-sub ml-1 mr-1.5 inline-flex items-center gap-1 overflow-hidden border-l border-hairline pl-2">
          {bellTypes.map((tip) => {
            const on = state.tip === tip;
            return (
              <button key={tip} type="button" aria-pressed={on} aria-label={on ? t.bellOff[tip] : t.bellOnly[tip]} onClick={() => pickTip(tip)}
                className={`inline-flex h-8 flex-none items-center gap-1.5 whitespace-nowrap rounded-pill px-3 text-[0.875rem] font-medium transition-colors duration-(--duration-line) ${on ? 'bg-white text-graphite shadow-[inset_0_0_0_1.5px_var(--color-graphite)]' : 'text-ink hover:bg-teal-tint'}`}>
                {t.bell[tip]}{on ? <CrossIcon /> : null}
              </button>
            );
          })}
        </span>
      )
    ) : null;
    return (
      <>
        {chip('policandre', t.crafts.policandre)}
        {chip('clopote', t.crafts.clopote)}
        {sub}
        {chip('iconostase-usi', t.crafts['iconostase-usi'])}
        {chip('reconditionari', t.crafts.reconditionari)}
      </>
    );
  };

  const viewToggle = (iconsOnly: boolean, className = '') => (
    <div role="group" aria-label={t.viewGroup} className={`inline-flex flex-none gap-0.5 rounded-pill ${className}`}>
      {(['galerie', 'harta'] as const).map((view) => {
        const on = state.view === view;
        const label = view === 'galerie' ? t.gallery : t.map;
        return (
          <button key={view} type="button" aria-pressed={on} aria-label={iconsOnly ? label : undefined} onClick={() => pickView(view)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-pill text-[0.9375rem] font-medium transition-colors duration-(--duration-line) ${iconsOnly ? 'w-11' : 'px-4'} ${on ? 'bg-teal-900 text-white' : 'text-ink hover:bg-teal-tint'}`}>
            {view === 'galerie' ? <GridIcon /> : <PinIcon />}
            {iconsOnly ? null : label}
          </button>
        );
      })}
    </div>
  );

  // Map card (Works wall v6.3b): the one tile with text, always visible.
  const countryCount = new Set(inView.map((work) => work.location?.country || 'RO')).size;
  const mapWorks = plural(lang, inView.length, projects);
  const mapCountries = plural(lang, countryCount, t.mapTile.countries);
  const mapTile = (
    <button key="map" type="button" onClick={() => pickView('harta')}
      aria-label={t.mapTile.label.replace('{works}', mapWorks).replace('{countries}', mapCountries)}
      className="ww-tile ww-map text-left text-ink">
      <span aria-hidden="true" className="absolute inset-x-0 top-16.5 block md:top-1/2 md:-translate-y-[44%]">
        <EuropeMap size="compact" label="" src="/maps/europe-800x603-land.svg"
          dots={inView.flatMap((work) => { const lonLat = placeLonLat(work.location ?? {}); return lonLat ? [{key: work._id, lonLat}] : []; })} />
      </span>
      <span className="absolute inset-x-3.5 top-3.5 block md:inset-x-6 md:top-5.5">
        <b className="block font-display text-[1.625rem] font-semibold leading-none md:text-[2.5rem]">{t.mapTile.title}</b>
        <span className="mt-1 block text-caption font-semibold text-ink-soft md:mt-2">{mapWorks} · {mapCountries}</span>
      </span>
      <span className="ww-go absolute bottom-3.5 left-3.5 text-caption font-semibold text-teal-700 md:bottom-5.5 md:left-6 md:text-[0.9375rem]">
        {t.mapTile.link} →
      </span>
    </button>
  );

  const wallKey = `${state.category}|${state.tip}|${state.query}|${state.place?.value}`;
  const tiles: ReactNode[] = shown.map((work, index) => (
    <WorkTile key={work._id} work={work} countries={countries} priority={index < 3} />
  ));
  tiles.splice(Math.min(MAP_SLOT, tiles.length), 0, mapTile);

  const moreHref = worksHref(base, {...state, page: state.page + 1});
  const remaining = matches.length - shown.length;

  const searchDesktop = (
    <>
      <button type="button" aria-label={t.search} aria-expanded={searchOpen} onClick={() => { setSearchOpen(true); requestAnimationFrame(() => field.current?.focus()); }}
        className="grid size-11 flex-none place-items-center rounded-full border border-hairline bg-white text-ink transition-colors hover:bg-teal-tint">
        <SearchIcon />
      </button>
      {searchOpen ? (
        <div className="absolute right-0 top-1/2 z-[2] flex h-12 w-75 -translate-y-1/2 items-center gap-1 rounded-pill border border-hairline bg-white pl-4 pr-1 shadow-e1">
          <SearchIcon />
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t.search}</span>
            <input ref={field} type="search" value={draft} placeholder={t.searchPlaceholder} maxLength={80}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Escape') { setSearchOpen(false); } }}
              className="h-10 w-full bg-transparent px-2 text-[0.9375rem] text-ink outline-none placeholder:text-ink-soft [&::-webkit-search-cancel-button]:hidden" />
          </label>
          <button type="button" aria-label={t.closeSearch} onClick={() => { setSearchOpen(false); setDraft(''); }}
            className="grid size-10 flex-none place-items-center rounded-full hover:bg-teal-tint"><CrossIcon /></button>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {children}
      <section ref={band} aria-label={t.title} className={`m-band fxs relative isolate -mt-18 pb-22 pt-22 lg:-mt-21 lg:pb-34 lg:pt-28 ${craft ? moodClass[craft] : ''}`}>
        <div className="fxg" aria-hidden="true"><i className="g-pol" /><i className="g-clo" /><i className="g-ico" /><i className="g-rec" /></div>
        {/* Desktop shelf (CHANGES-v6.3 §5): band + the craft's mood behind the header and the
            bar, fading out over 24 px; the wall passes under it. Sticky inside the band, so it
            leaves with the band and never covers the footer; shown once the wall has moved. */}
        <div aria-hidden="true"
          className={`wshelf pointer-events-none sticky top-0 z-[18] -mb-22 -mt-28 hidden h-50 isolate xl:block ${scrolled ? '' : 'invisible'}`}>
          <div className="fxg" aria-hidden="true"><i className="g-pol" /><i className="g-clo" /><i className="g-ico" /><i className="g-rec" /></div>
        </div>
        <div ref={sentinel} id="lucrari-filtre" aria-hidden="true" className="h-0" />

        {/* Desktop (board V6Works): the category pill, then search + Galerie | Hartă at the right.
            It looks the same at the top of the page and while the wall scrolls under it. */}
        <div role="region" aria-label={t.filters}
          className="sticky top-28 z-[19] mx-auto hidden max-w-300 items-center justify-between gap-3 xl:flex">
          <div role="group" aria-label={t.categoryGroup} className="glass-light flex min-w-0 items-center gap-0.5 rounded-pill p-1 shadow-e1">
            {craftButtons(false)}
          </div>
          <div className="relative flex flex-none items-center gap-2">
            {searchDesktop}
            {/* With the bell types in, the labels give way below 1536 (they do not fit 1200 with everything else). */}
            {craft === 'clopote'
              ? <>{viewToggle(true, 'glass-light p-1 shadow-e1 2xl:hidden')}{viewToggle(false, 'glass-light p-1 shadow-e1 max-2xl:hidden')}</>
              : viewToggle(false, 'glass-light p-1 shadow-e1')}
          </div>
        </div>

        {/* Phones and tablets: the chip row, then search + view. */}
        <div ref={pageBar} className="mx-auto max-w-300 md:px-6 xl:hidden">
          <div role="group" aria-label={t.categoryGroup} ref={(node) => { chipRows.current[0] = node; }}
            className="flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
            {craftButtons(true)}
          </div>
          <div className="mt-3 flex items-center gap-2 px-5 md:px-0">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t.search}</span>
              <input ref={phoneField} type="search" value={draft} placeholder={t.searchPlaceholder} maxLength={80}
                onChange={(event) => setDraft(event.target.value)}
                className="h-12 w-full rounded-pill border border-hairline bg-white px-4 text-base text-ink placeholder:text-ink-soft" />
            </label>
            {viewToggle(true, 'glass-light p-1 shadow-e1')}
          </div>
        </div>
        {/* …and once that has scrolled away, a fixed strip (band + mood, 20 px fade) with the chip
            row and the search and map icons; it follows the header up when the header hides. */}
        <div role="region" aria-label={t.filters} inert={!docked}
          className={`wshelf works-strip fixed inset-x-0 top-0 z-[19] isolate xl:hidden ${docked ? '' : 'invisible'}`}>
          <div className="fxg" aria-hidden="true"><i className="g-pol" /><i className="g-clo" /><i className="g-ico" /><i className="g-rec" /></div>
          <div className="mx-auto flex max-w-300 items-center gap-1 pl-3 pr-2 md:px-6">
            <div role="group" aria-label={t.categoryGroup} ref={(node) => { chipRows.current[1] = node; }}
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {craftButtons(true)}
            </div>
            <button type="button" aria-label={t.search} onClick={() => { scrollTo({top: 0}); phoneField.current?.focus({preventScroll: true}); }}
              className="grid size-11 flex-none place-items-center rounded-full border border-hairline bg-white text-ink"><SearchIcon /></button>
            <button type="button" aria-label={state.view === 'harta' ? t.gallery : t.map} onClick={() => pickView(state.view === 'harta' ? 'galerie' : 'harta')}
              className="grid size-11 flex-none place-items-center rounded-full border border-hairline bg-white text-ink">{state.view === 'harta' ? <GridIcon /> : <PinIcon />}</button>
          </div>
        </div>

        {placeName && state.view === 'galerie' ? (
          <p className="mt-5 flex justify-center px-5 lg:mt-6">
            <button type="button" onClick={() => pickPlace(null)} aria-label={t.placeOff.replace('{place}', placeName)}
              className="inline-flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-teal-700 bg-teal-tint px-4 text-caption font-semibold text-teal-900">
              <PinIcon />{placeName}<CrossIcon />
            </button>
          </p>
        ) : null}

        {state.view === 'harta' ? (
          <div key={`map|${wallKey}`} className="works-fade mx-auto max-w-300 md:px-6 xl:px-0">
            <WorksMap works={inView} rows={rows} place={state.place} count={plural(lang, inView.length, projects)}
              onPick={pickPlace} onOpen={register} countries={countries} t={t} />
          </div>
        ) : matches.length ? (
          <>
            {/* The wall runs edge to edge: 16 from the screen (phones 8), wider than the bar above it. */}
            <div key={wallKey} onClickCapture={(event) => { if ((event.target as Element).closest('a[href]')) register(); }}
              className="works-fade mt-4 grid grid-cols-2 gap-1 px-2 md:mt-6 md:grid-cols-3 md:gap-1.5 md:px-4 lg:grid-cols-4">
              {tiles}
            </div>
            <div className="mt-6 flex flex-col-reverse items-stretch gap-2.5 px-5 md:mt-14 md:flex-row md:items-center md:justify-center md:gap-5">
              <p className="text-center text-caption text-ink-soft md:text-[0.9375rem]">{t.shown.replace('{shown}', String(shown.length)).replace('{total}', count)}</p>
              {remaining > 0 ? (
                <Link href={moreHref} scroll={false} prefetch={false} onClick={(event) => { event.preventDefault(); go({page: state.page + 1}, 'replace'); }}
                  className="btn btn-primary">{t.more.replace('{n}', String(Math.min(24, remaining)))}</Link>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mx-5 mt-8 rounded-card bg-white/60 p-8 text-center md:mx-auto md:max-w-300">
            <p className="text-body text-ink-soft">{t.none}</p>
            <button type="button" onClick={() => go({tip: null, query: '', place: null})} className="btn btn-secondary mt-5">{t.reset}</button>
          </div>
        )}
      </section>
    </>
  );
}
