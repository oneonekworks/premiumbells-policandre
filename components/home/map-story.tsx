import Link from 'next/link';
import type {CSSProperties} from 'react';
import {EuropeMap, type MapDot, type MapLeader} from '@/components/map/europe-map';
import {SanityImage} from '@/components/sanity-image';
import {mapCountries, placeLonLat, project, type MapCountry} from '@/lib/europe-map';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {craftMetal, type Metal} from '@/lib/shell';
import type {HomeContent} from '@/sanity/home';
import {projectPath, worksPath} from '@/sanity/portfolio-routes';

// "Din lucrările noastre", the v6.2 map story (boards V6HomeDesktop,
// V6HomeMobileA): title row, then the Europe map across the content width
// with a dot per work, eight photo pins (four in Romania, one per country
// abroad) joined to their place by dashed leaders, and the works per country
// as a glass island over the Atlantic. Phones: the map with dots only (it opens
// the Hartă view), a swipe rail of the same pins, the countries as chips.
// A pin opens the work (the Project panel from V5 on).

type Project = NonNullable<HomeContent['latestWorks']>[number];
type Section = NonNullable<HomeContent['works']>;

type Pin = {
  key: string;
  country: MapCountry;
  title: string;
  line: string;
  metal: Metal;
  lonLat: [number, number] | null;
  project?: Project;
};

// Hand-placed card positions from the board (percent of the 1200 × 700 box):
// four around Romania, one per country abroad. Cards are 11.5% wide, about
// 158 units tall at 1200.
const slots: Record<'ro' | Exclude<MapCountry, 'RO'>, [number, number][]> = {
  ro: [[72.31, 8.81], [84.9, 8.81], [63.85, 33.29], [63.85, 56.48]],
  MD: [[86.4, 73.56]], GR: [[74.75, 74.53]], ES: [[40.92, 75.17]], BE: [[57.46, 7.51]],
};
const pinWidth = 138;
const pinHeight = 158;
// Placeholder pins (no work in that country yet) keep the board's bar colours.
const placeholderMetal: Record<MapCountry, Metal> = {RO: 'gold', MD: 'gilt', ES: 'bronze', BE: 'gold', GR: 'gilt'};
const countryLabels: {country: MapCountry; at: [number, number]; anchor?: 'start'}[] = [
  {country: 'RO', at: [1010, 347.6]}, {country: 'MD', at: [1096, 262], anchor: 'start'},
  {country: 'ES', at: [414.3, 515.5]}, {country: 'BE', at: [633.3, 290]}, {country: 'GR', at: [975.5, 534.7]},
];

const hasPhoto = (work: Project) => Boolean(work.slug && work.categorySlug && work.coverImage?.asset);
const countryOf = (work: Project) => (work.location?.country ?? 'RO') as MapCountry;

function choosePins(works: Project[], dictionary: Dictionary): Pin[] {
  const t = dictionary.home6;
  const name = (country: MapCountry) => (country === 'GR' ? t.athos : dictionary.countries[country]);
  const toPin = (work: Project): Pin => {
    const country = countryOf(work);
    const place = country === 'RO'
      ? [work.categoryTitle, work.location?.county].filter(Boolean).join(' · ')
      : country === 'GR' ? t.athos : [name(country), work.location?.locality ?? t.locality].join(' · ');
    return {
      key: work._id, country, title: work.title ?? '', line: place,
      metal: craftMetal(work.craft), lonLat: placeLonLat(work.location ?? {}), project: work,
    };
  };

  const placeable = works.filter((work) => hasPhoto(work) && placeLonLat(work.location ?? {}));
  const counties = new Set<string>();
  const romania = placeable.filter((work) => {
    if (countryOf(work) !== 'RO' || counties.has(work.location?.county ?? '')) return false;
    counties.add(work.location?.county ?? '');
    return true;
  }).slice(0, 4).map(toPin);

  const abroad = mapCountries.filter((country) => country !== 'RO').map((country): Pin => {
    const work = placeable.find((candidate) => countryOf(candidate) === country);
    if (work) return toPin(work);
    return {
      key: `placeholder-${country}`, country, title: country === 'GR' ? t.monastery : t.parish,
      line: country === 'GR' ? t.athos : `${name(country)} · ${t.locality}`,
      metal: placeholderMetal[country], lonLat: placeLonLat({country}),
    };
  });
  return [...romania, ...abroad];
}

/** Card positions for the wide map: the board's slots, Romania's by where its dots are. */
function placePins(pins: Pin[]) {
  const romania = pins.filter((pin) => pin.country === 'RO')
    .map((pin) => ({pin, at: pin.lonLat ? project(pin.lonLat, 'wide') : [0, 0]}))
    .sort((a, b) => a.at[1] - b.at[1]);
  const north = romania.slice(0, 2).sort((a, b) => a.at[0] - b.at[0]);
  const south = romania.slice(2).sort((a, b) => a.at[1] - b.at[1]);
  const placed = new Map<string, [number, number]>();
  [...north, ...south].forEach(({pin}, index) => placed.set(pin.key, slots.ro[index]));
  for (const pin of pins) if (pin.country !== 'RO') placed.set(pin.key, slots[pin.country][0]);
  return placed;
}

/** The dashed leader: from the nearest point of the card to its dot. */
function leaderFor(pin: Pin, slot: [number, number]): MapLeader | null {
  if (!pin.lonLat) return null;
  const [x, y] = project(pin.lonLat, 'wide');
  const left = (slot[0] / 100) * 1200;
  const top = (slot[1] / 100) * 700;
  const from: [number, number] = [Math.min(Math.max(x, left), left + pinWidth), Math.min(Math.max(y, top), top + pinHeight)];
  if (from[0] === x && from[1] === y) return null;
  return {key: pin.key, from, to: [x, y]};
}

function PinCard({pin, lang, className, style, size, photoLabel}: {
  pin: Pin; lang: Lang; className: string; style?: CSSProperties; size: 'map' | 'rail'; photoLabel: string;
}) {
  const work = pin.project;
  const body = (
    <>
      <span className="relative block aspect-[16/10] overflow-hidden rounded-[9px] bg-band">
        {work?.coverImage?.asset ? (
          <SanityImage image={{...work.coverImage, alt: ''}} ratio={16 / 10} sizes={size === 'map' ? '138px' : '168px'} />
        ) : (
          <span aria-hidden="true" className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,#eef2f1_0_8px,#e3eae8_8px_16px)] text-[11px] font-semibold text-ink-soft">
            {photoLabel}
          </span>
        )}
      </span>
      <span className="block px-1 pb-[3px] pt-2">
        <i aria-hidden="true" className={`bar-${pin.metal} mb-1.5 block h-0.5 w-[18px] rounded-sm`} />
        <b className={`block truncate font-display font-semibold leading-[1.1] ${size === 'map' ? 'text-[17px]' : 'text-[19px]'}`}>{pin.title}</b>
        <small className="mt-0.5 block text-[12px] leading-[1.3] text-ink-soft">{pin.line}</small>
      </span>
    </>
  );
  const frame = `block rounded-[14px] bg-white p-1.5 text-ink shadow-e2 ${className}`;
  if (!work?.slug || !work.categorySlug) return <div className={frame} style={style}>{body}</div>;
  return (
    <Link href={localizedHref(lang, projectPath(work.categorySlug, work.slug))} aria-haspopup="dialog" style={style}
      className={`${frame} transition-[translate,box-shadow] duration-300 ease-light hover:z-[3] hover:-translate-y-1 hover:shadow-e3 focus-visible:z-[3] focus-visible:-translate-y-1 focus-visible:shadow-e3 motion-reduce:still`}>
      {body}
    </Link>
  );
}

export function HomeMapStory({section, works, places, lang, dictionary}: {
  section: Section;
  works: Project[];
  places: HomeContent['places'];
  lang: Lang;
  dictionary: Dictionary;
}) {
  if (section.enabled === false || !section.heading) return null;
  const t = dictionary.home6;
  const pins = choosePins(works, dictionary);
  const slotOf = placePins(pins);
  const pinPlaces = new Set(pins.map((pin) => pin.project?._id).filter(Boolean));

  const dots: MapDot[] = [
    ...places.flatMap((place) => {
      const lonLat = placeLonLat(place);
      return lonLat && !pinPlaces.has(place._id) ? [{key: place._id, lonLat}] : [];
    }),
    ...pins.flatMap((pin) => (pin.lonLat ? [{key: pin.key, lonLat: pin.lonLat, large: true}] : [])),
  ];
  const leaders = pins.flatMap((pin) => {
    const slot = slotOf.get(pin.key);
    const leader = slot ? leaderFor(pin, slot) : null;
    return leader ? [leader] : [];
  });

  const counts = new Map<string, number>();
  for (const place of places) counts.set(place.country ?? 'RO', (counts.get(place.country ?? 'RO') ?? 0) + 1);
  const countryName = (country: MapCountry) => (country === 'GR' ? t.athos : dictionary.countries[country]);
  const rows = mapCountries.map((country) => {
    const count = counts.get(country) ?? 0;
    return {
      country, name: countryName(country),
      count: count ? (country === 'RO' ? plural(lang, count, t.works) : String(count)) : t.count,
      href: localizedHref(lang, `${worksPath}?tara=${country.toLowerCase()}`),
    };
  });
  const mapLabel = t.mapLabel.replace('{countries}', mapCountries.map(countryName).join(', '));
  const allHref = localizedHref(lang, worksPath);
  const mapHref = localizedHref(lang, `${worksPath}?vedere=harta`);

  return (
    <section id="lucrari" aria-labelledby="home-works" className="m-white scroll-mt-header py-22 lg:pb-34 lg:pt-40">
      <div className="mx-auto max-w-(--container-page) px-5 md:px-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <p className="kicker mb-3 md:mb-4">{t.worksKicker}</p>
            <h2 id="home-works" className="section-title">{section.heading}</h2>
          </div>
          {section.lead && <p className="max-w-110 text-[0.9375rem] leading-normal text-ink-soft md:text-[1.0625rem] md:leading-[1.55]">{section.lead}</p>}
        </div>

        {/* Desktop: the wide map with pins and the island. */}
        <EuropeMap size="wide" dots={dots} leaders={leaders} label={mapLabel}
          labels={countryLabels.map(({country, at, anchor}) => ({text: dictionary.countries[country].split(' · ')[0], at, anchor}))}
          className="mt-14 hidden overflow-hidden rounded-panel bg-[linear-gradient(180deg,#f1f5f4,#e9efed)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.9)] xl:block">
          {pins.map((pin) => {
            const slot = slotOf.get(pin.key)!;
            return (
              <PinCard key={pin.key} pin={pin} lang={lang} size="map" photoLabel={t.photo}
                className="absolute z-[2] w-[11.5%]" style={{left: `${slot[0]}%`, top: `${slot[1]}%`}} />
            );
          })}
          <nav aria-label={t.mapPlaces} className="glass-light absolute left-6 top-6 z-[2] w-66 rounded-card px-5 pb-5 pt-2.5 shadow-e2">
            {rows.map((row) => (
              <Link key={row.country} href={row.href} prefetch={false}
                className="flex items-baseline justify-between gap-4 border-b border-hairline px-0.5 py-[9px] text-ink transition-[padding,color] duration-(--duration-fade) ease-light last-of-type:border-b-0 hover:pl-2 hover:text-teal-700">
                <b className="font-display text-[1.25rem] font-semibold leading-[1.1]">{row.name}</b>
                <span className="text-[0.8125rem] text-ink-soft">{row.count}</span>
              </Link>
            ))}
            <div className="mt-3 flex flex-col items-start gap-1 border-t border-hairline pt-4">
              <Link href={allHref} className="btn btn-primary min-h-11.5 px-5.5 text-[0.9375rem]">{t.allWorks}</Link>
              <Link href={mapHref} prefetch={false} className="text-link text-[0.9375rem]">{t.openMap} →</Link>
            </div>
          </nav>
        </EuropeMap>
      </div>

      {/* Below 1200px: map with dots, pin rail, country chips (the pins need the full width). */}
      <div className="xl:hidden">
        <Link href={mapHref} prefetch={false} aria-label={t.openMapLabel}
          className="mx-3 mt-6 block rounded-[22px] bg-[linear-gradient(180deg,#f1f5f4,#e9efed)] p-2.5 md:mx-6">
          <EuropeMap size="compact" dots={dots} label={mapLabel} className="overflow-hidden rounded-[14px]" />
        </Link>
        <ul aria-label={t.mapRail}
          className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-3 pt-4 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          {pins.map((pin) => (
            <li key={pin.key} className="w-42 flex-none snap-start">
              <PinCard pin={pin} lang={lang} size="rail" photoLabel={t.photo} className="relative" />
            </li>
          ))}
        </ul>
        <div className="px-5 md:px-6">
          <nav aria-label={t.mapPlaces} className="-mx-5 mt-1 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden">
            {rows.map((row) => (
              <Link key={row.country} href={row.href} prefetch={false}
                className="inline-flex h-11 flex-none items-center gap-1.5 rounded-pill border border-hairline bg-white px-3.5 text-ink">
                <b className="text-[0.875rem] font-semibold">{row.name}</b>
                <span className="text-[0.8125rem] text-ink-soft">{row.count}</span>
              </Link>
            ))}
          </nav>
          <Link href={allHref} className="btn btn-primary mt-6 flex w-full">{t.allWorks}</Link>
          <Link href={mapHref} prefetch={false} className="text-link mt-1 flex justify-center text-[0.9375rem]">{t.openMap} →</Link>
        </div>
      </div>
    </section>
  );
}
