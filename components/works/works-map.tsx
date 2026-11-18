'use client';

import Link from 'next/link';
import {useState} from 'react';
import {EuropeMap} from '@/components/map/europe-map';
import {SanityImage} from '@/components/sanity-image';
import {mapCountries, placeLonLat, project, type MapSize} from '@/lib/europe-map';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {craftMetal, placeOf, samePlace, shortPlace, type Place, type PlaceRow} from '@/lib/works';
import type {BrowserWork} from './work-tile';

type T = Dictionary['works6'];

// Country names on the drawings, from the homepage map story.
const countryLabels: {country: (typeof mapCountries)[number]; at: [number, number]; anchor?: 'start'}[] = [
  {country: 'RO', at: [1010, 347.6]}, {country: 'MD', at: [1096, 262], anchor: 'start'},
  {country: 'ES', at: [414.3, 515.5]}, {country: 'BE', at: [633.3, 290]}, {country: 'GR', at: [975.5, 534.7]},
];

/**
 * Works at the same county centre are spread on a small ring so each dot can
 * be pointed at; positions in percent of the drawing.
 */
function dotPositions(works: BrowserWork[], size: MapSize) {
  const {width, height} = size === 'wide' ? {width: 1200, height: 700} : {width: 800, height: 603};
  const groups = new Map<string, BrowserWork[]>();
  for (const work of works) {
    const lonLat = placeLonLat(work.location ?? {});
    if (!lonLat) continue;
    const key = lonLat.join(',');
    groups.set(key, [...(groups.get(key) ?? []), work]);
  }
  const ring = size === 'wide' ? 9 : 7;
  return [...groups.entries()].flatMap(([key, group]) => {
    const [x, y] = project(key.split(',').map(Number) as [number, number], size);
    return group.map((work, index) => {
      const angle = (index / group.length) * Math.PI * 2 - Math.PI / 2;
      const r = group.length > 1 ? ring * Math.min(1.6, 0.6 + group.length / 6) : 0;
      return {
        work,
        left: Math.round(((x + r * Math.cos(angle)) / width) * 10000) / 100,
        top: Math.round(((y + r * Math.sin(angle)) / height) * 10000) / 100,
      };
    });
  });
}

/**
 * Hartă view v6.2 (components.md "Map view (Works)"): the homepage map,
 * every work a dot; hover / focus / tap shows the small photo card (it opens
 * the Project panel); the counties and countries as a glass island over the
 * Atlantic (phones: chips under the map). Hovering a row rings its dots; a
 * click filters the gallery to that place.
 */
export function WorksMap({works, rows, place, count, onPick, onOpen, countries, t}: {
  works: BrowserWork[];
  rows: {romania: PlaceRow[]; abroad: PlaceRow[]};
  place: Place | null;
  count: string;
  onPick: (place: Place) => void;
  onOpen: () => void;
  countries: Record<string, string>;
  t: T;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Place | null>(null);
  const lit = hovered ?? place;

  const dots = (size: MapSize) => dotPositions(works, size).map(({work, left, top}) => {
    const on = active === work._id;
    const ringed = Boolean(lit && samePlace(placeOf(work), lit));
    return (
      <div key={work._id} className={`absolute ${on ? 'z-[4]' : 'z-[1]'}`} style={{left: `${left}%`, top: `${top}%`}}
        onMouseEnter={() => setActive(work._id)} onMouseLeave={() => setActive((id) => (id === work._id ? null : id))}>
        <button type="button" aria-label={`${work.title}, ${shortPlace(work, countries)}`} aria-expanded={on}
          onClick={() => setActive(on ? null : work._id)} onFocus={() => setActive(work._id)}
          className="absolute left-0 top-0 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full">
          <span aria-hidden="true" className={`block rounded-full border-2 border-[#fffefb] bg-teal-700 transition-[width,height,box-shadow] duration-(--duration-line) ${
            on || ringed ? 'size-3.5 shadow-[0_0_0_4px_rgb(15_107_99/0.25)]' : size === 'wide' ? 'size-2.5' : 'size-[7px] border-[1.5px]'}`} />
        </button>
        {on ? (
          <Link href={work.href} scroll={false} aria-haspopup="dialog" onClick={onOpen}
            className="absolute left-0 top-0 z-[3] block w-[150px] -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-[14px] bg-white p-1.5 text-ink shadow-e3 after:absolute after:-bottom-1.5 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rotate-45 after:rounded-[2px] after:bg-white">
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[9px] bg-band">
              <SanityImage image={work.image && {...work.image, alt: ''}} ratio={16 / 10} sizes="150px" />
            </span>
            <span className="relative z-[1] block px-1 pb-[3px] pt-2">
              <i aria-hidden="true" className={`bar-${craftMetal(work.craft)} mb-1.5 block h-0.5 w-[18px] rounded-sm`} />
              <b className="block truncate font-display text-[1.0625rem] font-semibold leading-[1.1]">{work.title}</b>
              <small className="mt-0.5 block text-[0.75rem] leading-[1.3] text-ink-soft">{[work.categoryTitle, shortPlace(work, countries)].filter(Boolean).join(' · ')}</small>
            </span>
          </Link>
        ) : null}
      </div>
    );
  });

  const labels = countryLabels.map(({country, at, anchor}) => ({text: countries[country].split(' · ')[0], at, anchor}));
  const group = (title: string, items: PlaceRow[], phone: boolean) => items.length ? (
    <>
      <p className={phone ? 'mb-2 mt-4 text-[0.8125rem] font-semibold text-ink-soft' : 'mb-0.5 mt-3.5 text-[0.8125rem] font-semibold tracking-[0.02em] text-ink-soft first:mt-0'}>{title}</p>
      <div className={phone ? 'flex flex-wrap gap-2' : ''}>
        {items.map((row) => {
          const on = samePlace(row.place, place);
          return (
            <button key={`${row.place.kind}:${row.place.value}`} type="button" aria-pressed={on} onClick={() => onPick(row.place)}
              onMouseEnter={() => setHovered(row.place)} onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(row.place)} onBlur={() => setHovered(null)}
              className={phone
                ? `inline-flex h-11 items-center gap-1.5 rounded-pill border bg-white px-3.5 text-ink ${on ? 'border-[1.5px] border-teal-700 bg-teal-tint' : 'border-hairline'}`
                : `-mx-2 grid w-[calc(100%+16px)] grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2.5 rounded-[10px] border-t border-hairline p-2 text-left text-ink transition-colors duration-(--duration-line) hover:bg-teal-tint ${on ? 'bg-teal-tint' : ''}`}>
              <b className={phone ? 'text-[0.875rem] font-semibold' : 'font-display text-xl font-semibold leading-[1.1]'}>{row.name}</b>
              <span className={`text-[0.8125rem] text-ink-soft ${phone ? '' : 'text-right'}`}>{row.count}</span>
            </button>
          );
        })}
      </div>
    </>
  ) : null;

  return (
    <>
      <EuropeMap size="wide" dots={[]} labels={labels} label={t.mapLabel}
        className="mt-8 hidden rounded-panel bg-[linear-gradient(180deg,#f1f5f4,#e9efed)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.9)] [&>img]:rounded-panel [&>svg]:rounded-panel lg:block">
        {dots('wide')}
        <nav aria-label={t.island.label} className="glass-light absolute bottom-6 left-6 top-6 z-[5] flex w-66 flex-col rounded-card px-4.5 pb-2 pt-4.5 shadow-e2">
          <p className="text-caption font-semibold leading-[1.3] text-ink">{t.island.title.replace('{count}', count)}</p>
          <p className="mt-1.5 text-[0.8125rem] leading-[1.45] text-ink-soft">{t.island.hint}</p>
          <div className="mt-3 min-h-0 flex-1 overflow-auto px-2 [scrollbar-width:thin]">
            {group(t.island.romania, rows.romania, false)}
            {group(t.island.abroad, rows.abroad, false)}
          </div>
        </nav>
      </EuropeMap>

      <div className="mt-5 lg:hidden">
        <div className="mx-3 rounded-[22px] bg-[linear-gradient(180deg,#f1f5f4,#e9efed)] p-2.5 md:mx-0">
          <EuropeMap size="compact" dots={[]} label={t.mapLabel} className="rounded-[14px] [&>img]:rounded-[14px]">
            {dots('compact')}
          </EuropeMap>
        </div>
        <nav aria-label={t.island.label} className="px-5 md:px-0">
          <p className="mt-5 text-caption font-semibold text-ink">{t.island.title.replace('{count}', count)}</p>
          <p className="mt-1 text-[0.8125rem] leading-[1.45] text-ink-soft">{t.island.hint}</p>
          {group(t.island.romania, rows.romania, true)}
          {group(t.island.abroad, rows.abroad, true)}
        </nav>
      </div>
    </>
  );
}
