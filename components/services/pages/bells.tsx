import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {localizedHref} from '@/lib/i18n/routing';
import {bellTypes, cuJugCopy, faraBalansCopy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import type {ProjectCard} from '@/sanity/portfolio';
import {categoryPath} from '@/sanity/portfolio-routes';
import type {ServiceSection} from '@/sanity/services';
import {HeadLink, Section, SectionHead, WorkCards, wrap} from '../blocks';
import {BellGuide, type BellRow, type BellSet} from '../bell-guide';
import {StoryHero} from '../story-hero';
import {crumbs, heroFacts, heroInsets, relatedWorks, serviceBySlug, type PageProps} from './common';

type Of<T extends ServiceSection['_type']> = Extract<ServiceSection, {_type: T}>;
type BellType = keyof typeof bellTypes;

/** Mechanism pictograms (board type picker): the bell swinging on its yoke / fixed, clapper pulled by a rope. */
export function BellTypeIcon({type, className}: {type: BellType; className?: string}) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'cu-jug' ? (
        <>
          <path d="M8 8h32" /><path d="M14 8v-3M34 8v-3" />
          <g transform="rotate(-18 24 8)"><path d="M24 8v5" /><path d="M17 33c0-11 2.5-20 7-20s7 9 7 20l3 3H14z" /><path d="M24 36v3" /></g>
          <path d="M11 43q13 6 26 0" strokeDasharray="1.5 3.5" /><path d="M34.5 41.6 37 43l-2.6 1.3M13.5 41.6 11 43l2.6 1.3" />
        </>
      ) : (
        <>
          <path d="M6 8h36" /><path d="M8 8v-3M40 8v-3" /><path d="M20 8v5M28 8v5" />
          <path d="M17 33c0-11 2.5-20 7-20s7 9 7 20l3 3H14z" /><path d="M24 33v5" /><circle cx="24" cy="39.5" r="1.6" />
          <path d="M25.5 39.5c6 0 9-2 11-5s3-4 6-4" />
        </>
      )}
    </svg>
  );
}

/**
 * Type picker v6.2: "Ce fel de clopot căutați?" + two equal options in a band
 * tray; the current one a raised white card (aria-current), the other faded
 * with a teal arrow (it opens the other page).
 */
function TypePicker({current, question, hrefs}: {current: BellType; question: string; hrefs: Record<BellType, string>}) {
  const metal = current === 'cu-jug' ? 'text-[#6a4f38]' : 'text-[#3a3f42]';
  return (
    <div className="mt-4 lg:mb-12 lg:mt-7">
      <p id="tip-clopot" className="mb-2 text-caption font-semibold text-ink-soft lg:mb-2.5 lg:text-meta">{question}</p>
      <nav aria-labelledby="tip-clopot" className="grid grid-cols-2 gap-1 rounded-[22px] bg-band p-1 shadow-[inset_0_1px_2px_rgb(11_37_35/0.06)] lg:gap-1.5 lg:rounded-[26px] lg:p-1.5">
        {(Object.keys(bellTypes) as BellType[]).map((type) => {
          const on = type === current;
          const item = bellTypes[type];
          return (
            <Link key={type} href={hrefs[type]} aria-current={on ? 'page' : undefined}
              className={`group relative flex flex-col items-start gap-1.5 rounded-[18px] px-3 pb-4 pt-3 text-ink transition-[background-color,box-shadow] duration-(--duration-fade) ease-(--ease-light) lg:flex-row lg:items-center lg:gap-4.5 lg:rounded-card lg:py-4.5 lg:pl-5 lg:pr-7 ${
                on ? 'bg-white shadow-e2' : 'hover:bg-white/60'}`}>
              <BellTypeIcon type={type} className={`size-10 flex-none transition-[opacity,filter] duration-(--duration-fade) lg:size-14 ${on ? metal : 'text-ink-soft opacity-55 grayscale group-hover:opacity-90'}`} />
              <span>
                <b className={`block font-display text-[1.5625rem] font-semibold leading-[1.05] transition-[opacity,filter] duration-(--duration-fade) lg:text-[2.125rem] ${on ? '' : 'opacity-55 grayscale group-hover:opacity-90'}`}>{item.name}</b>
                <small className="mt-0.5 block text-[0.8125rem] leading-[1.3] text-ink-soft lg:text-meta lg:leading-[1.35]">
                  <span className="lg:hidden">{item.lineShort}</span><span className="max-lg:hidden">{item.line}</span>
                </small>
              </span>
              {on ? null : <i aria-hidden="true" className="absolute right-3.5 top-4 text-xl not-italic text-teal-700 transition-transform duration-(--duration-fade) group-hover:translate-x-1 lg:static lg:ml-auto lg:text-[1.375rem]">→</i>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Works for this bell type: tagged ones first, then works without a type (bell types are set later in the Studio). */
function typeWorks(works: ProjectCard[], type: BellType) {
  const tagged = works.filter((work) => work.bellTypes?.includes(type));
  const untagged = works.filter((work) => !work.bellTypes?.length);
  return [...tagged, ...untagged];
}

/** /servicii/clopote (Cu jug) and /servicii/clopote/fara-balans (boards V6ClopoteCuJug, V6ClopoteFaraBalans + Mobile). */
export async function BellsPage({lang, service, dictionary}: PageProps) {
  const type: BellType = service.slugs.ro === 'fara-balans' ? 'fara-balans' : 'cu-jug';
  const other: BellType = type === 'cu-jug' ? 'fara-balans' : 'cu-jug';
  const copy = type === 'cu-jug' ? cuJugCopy : faraBalansCopy;
  const kind = type === 'cu-jug' ? 'jug' as const : 'fix' as const;
  const sections = service.sections ?? [];
  const sizes = sections.find((section): section is Of<'sectionBellSizes'> => section._type === 'sectionBellSizes');
  const setsSection = sections.find((section): section is Of<'sectionBellSets'> => section._type === 'sectionBellSets');
  const included = sections.find((section): section is Of<'sectionIncluded'> => section._type === 'sectionIncluded');
  const [works, nudge, otherService] = await Promise.all([
    relatedWorks(lang, service), serviceBySlug(lang, copy.included.nudge.slug), serviceBySlug(lang, other),
  ]);
  const hrefs: Record<BellType, string> = {
    'cu-jug': localizedHref(lang, servicePath('clopote', 'cu-jug')),
    'fara-balans': localizedHref(lang, servicePath('clopote', 'fara-balans')),
  };

  const rows: BellRow[] = (sizes?.rows ?? []).flatMap((row) => (row.weightKg && row.diameterCm && row.heightCm
    ? [{key: row._key, weight: row.weightKg, diameter: row.diameterCm, height: row.heightCm, note: row.note ?? '—'}] : []));
  const sets: BellSet[] = (setsSection?.sets ?? []).flatMap((set, index) => (set.weightsKg?.length
    ? [{key: set._key, title: `Set ${index + 1}`, weights: set.weightsKg, ringer: Boolean(set.withElectronicRinger), audio: set.audio ?? null}] : []));
  const notes = sizes?.groupNotes;
  const listWorks = works ? typeWorks(works.works, type) : [];
  const shownWorks = listWorks.slice(0, 3);
  const allHref = works ? `${localizedHref(lang, categoryPath(works.slug))}?tip=${type}` : null;
  const includedItems = included?.items?.length ? included.items.map((item) => item.title ?? '') : copy.included.items;

  return (
    <div className="v6-page mood-subtle">
      <StoryHero
        crumbs={crumbs(lang, dictionary, 'Clopote')}
        crumbLabel={dictionary.services.breadcrumb}
        slot={<TypePicker current={type} question={copy.question} hrefs={hrefs} />}
        title={copy.hero.title} titleSize="words" sublineEm={0.4} metal={type === 'cu-jug' ? 'bronze' : 'graphite'}
        subline={copy.hero.subline} lead={copy.hero.lead}
        factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={heroInsets(service)}
      />

      {rows.length ? (
        <Section ground="band" id="dimensiuni">
          <div className={wrap}>
            <SectionHead kicker={copy.guide.kicker} title={copy.sizes.title} />
            <BellGuide kind={kind} rows={rows} sets={sets} initial={copy.sizes.initial}
              labels={{
                ...copy.guide, table: copy.sizes.title, short: copy.sizes.short, setsTitle: copy.sizes.sets,
                groupNotes: [notes?.upTo100 ?? null, notes?.upTo1000 ?? null, notes?.upTo5000 ?? null, notes?.over5000 ?? null],
              }} />
          </div>
        </Section>
      ) : null}

      <section className="dark-panel m-dark on-dark mt-2 px-5 pb-8 pt-14 lg:mt-4 lg:px-0 lg:py-22">
        <div className={`${wrap} max-md:px-0 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16`}>
          <div>
            <p className="kicker mb-3 !text-on-dark-soft md:mb-4">{copy.included.kicker}</p>
            <h2 className="display text-[2.25rem] lg:section-title">{included?.heading ?? copy.included.title}</h2>
            <ul className="mt-6 grid lg:mt-8 lg:grid-cols-2 lg:gap-x-10">
              {includedItems.map((item) => (
                <li key={item} className="flex min-h-12 items-center gap-3 border-t border-white/14 text-base lg:min-h-14 lg:text-[1.0625rem]">
                  <i aria-hidden="true" className="block h-[3px] w-6 flex-none rounded-[2px] bg-focus-on-dark" />{item}
                </li>
              ))}
            </ul>
          </div>
          {nudge ? (
            <Link href={nudge.href}
              className="mt-6 flex items-center gap-3 rounded-image border border-white/14 bg-white/6 p-2.5 text-on-dark transition-colors duration-(--duration-fade) hover:bg-white/12 focus-visible:bg-white/12 lg:mt-0 lg:gap-5 lg:rounded-card lg:p-3.5">
              <span className="relative block h-[66px] w-22 flex-none overflow-hidden rounded-[12px] bg-white lg:h-[99px] lg:w-33 lg:rounded-[14px]">
                <SanityImage image={nudge.coverImage && {...nudge.coverImage, alt: ''}} cover={!copy.included.nudge.contain} sizes="132px" className={copy.included.nudge.contain ? 'p-1' : ''} />
              </span>
              <span className="block">
                <span className="block text-caption text-on-dark-soft lg:text-meta">{copy.included.nudge.question}</span>
                <span className="mt-0.5 block font-display text-[1.4375rem] font-semibold leading-[1.1] lg:text-[1.875rem]">{copy.included.nudge.name}</span>
                <span className="mt-0.5 block text-caption leading-[1.45] text-on-dark-soft lg:mt-1 lg:text-base">{copy.included.nudge.why}</span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <Section ground="white" className="mt-2 lg:mt-4">
        <div className={wrap}>
          {shownWorks.length && works && allHref ? (
            <>
              <SectionHead kicker={copy.works.kicker} title={copy.works.title} aside={<HeadLink href={allHref} label={copy.works.all} />} />
              <WorkCards works={shownWorks} lang={lang} categorySlug={works.slug} metal={type === 'cu-jug' ? 'bronze' : 'graphite'}
                countries={dictionary.countries} columns={3} hint={dictionary.services.seeWork}
                list={{label: dictionary.works6.bellLong[type], works: listWorks}} />
              <div className="mt-3 lg:hidden"><HeadLink href={allHref} label={copy.works.all} /></div>
            </>
          ) : null}
          {otherService ? (
            <Link href={hrefs[other]}
              className="group mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-card bg-band p-3 pb-5 text-ink transition-[background-color,box-shadow] duration-(--duration-fade) hover:bg-white hover:shadow-e2 focus-visible:bg-white focus-visible:shadow-e2 max-md:-mx-2 lg:mt-18 lg:grid-cols-[auto_minmax(0,1fr)_220px] lg:gap-7 lg:rounded-[24px] lg:p-4 lg:pl-8">
              <span className="relative col-span-full block h-40 overflow-hidden rounded-[14px] lg:order-last lg:col-span-1 lg:h-35 lg:w-55 lg:rounded-image">
                <SanityImage image={otherService.coverImage && {...otherService.coverImage, alt: ''}} cover sizes="(max-width: 1024px) 100vw, 220px" />
              </span>
              <BellTypeIcon type={other} className="size-14 text-ink-soft max-lg:hidden" />
              <span className="block pl-2 lg:pl-0">
                <small className="block text-[0.8125rem] font-semibold text-ink-soft lg:text-caption">{copy.other}</small>
                <b className="mt-0.5 block font-display text-[1.875rem] font-semibold leading-[1.1] lg:mt-1 lg:text-[2.25rem]">
                  {bellTypes[other].other.name} <i aria-hidden="true" className="not-italic text-teal-700 max-lg:hidden">→</i>
                </b>
                <span className="mt-0.5 block text-caption text-ink-soft lg:mt-1 lg:text-meta">{bellTypes[other].other.line}</span>
              </span>
              <i aria-hidden="true" className="pr-2 text-[1.375rem] not-italic text-teal-700 lg:hidden">→</i>
            </Link>
          ) : null}
        </div>
      </Section>
    </div>
  );
}

