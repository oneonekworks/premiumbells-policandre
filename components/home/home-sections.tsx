import Link from 'next/link';
import type {ReactNode} from 'react';
import {BylineCard} from '@/components/blog/byline-card';
import {SanityImage} from '@/components/sanity-image';
import {numberLocale} from '@/components/services/shared';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath} from '@/lib/services';
import type {Metal} from '@/lib/shell';
import {aboutAnchor, linkHref, type Contact} from '@/lib/site-links';
import {youtubeId} from '@/lib/video';
import type {BlogCard} from '@/sanity/blog';
import type {CatalogDownload, HomeContent} from '@/sanity/home';
import {BellPlayer} from './listening-strip';
import {Triptych, type TriptychSlice} from './triptych';
import {VideoFacade, type FacadeVideo} from './video-facade';

// The homepage of design v6 "Clarity" (boards V6HomeDesktop + B,
// V6HomeMobileA + B; docs/design/clarity-v6/pages.md), in its fixed order:
// hero (white) → Serviciile noastre + Cataloage (band) → map story (white,
// map-story.tsx) → Despre noi (band) → Director (dark panel) → Ascultați
// (band) → Din jurnal (white) → footer. No buttons in the hero; the offer is
// the header phone, the footer and the phone bottom bar. Each section returns
// nothing when it is switched off or has nothing to show.

type Base = {lang: Lang; dictionary: Dictionary};
type Section<K extends keyof HomeContent> = NonNullable<HomeContent[K]>;

/** Anchors of the sections, for in-page links ("Servicii" breadcrumbs go to #servicii). */
export const homeAnchors = {
  top: 'inceput', services: 'servicii', works: 'lucrari', about: aboutAnchor, audio: 'ascultati', journal: 'jurnal',
} as const;

/** Page container: 1248 with 24 gutters (1200 content), 20 on phones. */
const page = 'mx-auto w-full max-w-(--container-page) px-5 md:px-6';
/** Wide container: 1360 with 16 gutters (1328 content). */
const wide = 'mx-auto w-full max-w-[85rem] px-5 md:px-4';

type HomeService = NonNullable<NonNullable<NonNullable<Section<'services'>['groups']>[number]['services']>[number]>;
const serviceHref = (service: HomeService, lang: Lang) =>
  localizedHref(lang, servicePath(service.parentSlug, service.slug ?? ''));
const isPublic = (service: HomeService | null | undefined): service is HomeService =>
  Boolean(service?.public && service.slug && service.title);
const serviceName = (service: HomeService) => service.shortName ?? service.title ?? '';
/** Craft families in menu order; a group's metal follows its position (as in the menus). */
const metals: Metal[] = ['gold', 'bronze', 'gilt'];

type Block = {_key: string; children?: {_key: string; text?: string; marks?: string[]}[]};
/** Plain text of short bold-only blocks; the v6 boards set them without bold. */
const plainText = (blocks: Block[] | null | undefined) =>
  (blocks ?? []).map((block) => (block.children ?? []).map((span) => span.text ?? '').join('')).join(' ');

// ---------- 1 · Hero ----------

/**
 * The "see" form of a service word: definite plural for the plurals
 * ("policandrele", "clopotele"), definite singular for the -re nouns
 * ("recondiționarea").
 */
const articulated = (word: string, lang: Lang) => {
  if (lang !== 'ro') return word;
  if (/[aei]re$/.test(word)) return `${word.slice(0, -1)}ea`;
  return word.endsWith('e') ? `${word}le` : word;
};

export function HomeHero({home, lang, dictionary}: Base & {home: HomeContent}) {
  const hero = home.hero;
  if (!hero) return null;
  const t = dictionary.home5;
  const lower = (text: string) => text.toLocaleLowerCase(lang);
  const groupMetal = new Map<string, Metal>();
  (home.services?.groups ?? []).forEach((group, index) =>
    (group.services ?? []).forEach((service) => service?._id && groupMetal.set(service._id, metals[index % 3])));

  const slices: TriptychSlice[] = (hero.slices ?? []).flatMap((slice, index) => {
    const service = slice.service;
    if (!isPublic(service)) return [];
    const title = serviceName(service);
    return [{
      key: slice._key,
      title,
      word: index === 0 ? title : lower(title),
      // A slice service outside the groups (Clopote, the parent page) takes the bell metal.
      metal: groupMetal.get(service._id) ?? (index === 1 ? 'bronze' : 'gold'),
      href: serviceHref(service, lang),
      line: slice.line,
      cta: `${t.see} ${articulated(lower(title), lang)}`,
      image: slice.image?.asset ? slice.image : service.coverImage,
    }];
  });

  const countries = new Set(home.places.flatMap((place) => place.country ?? [])).size;
  const figures = (hero.figures ?? []).flatMap((figure) => {
    const value = figure.source === 'projects' ? home.places.length : figure.source === 'countries' ? countries : figure.value;
    return typeof value === 'number' && figure.label ? [{key: figure._key, value, label: figure.label}] : [];
  });

  return (
    <section id={homeAnchors.top} aria-labelledby="home-title" className="m-hero -mt-18 pb-22 pt-28 text-center lg:-mt-21 lg:pb-20 lg:pt-34">
      <div className={page}>
        {hero.tagline && <p className="kicker">{hero.tagline}</p>}
        {slices.length !== 3 && (
          <h1 id="home-title" className="mt-4 font-display text-[2.875rem] leading-[1.02] text-ink md:mt-5 md:text-hero">{hero.title}</h1>
        )}
      </div>
      {slices.length === 3 && (
        <Triptych slices={slices} joiner={[', ', ` ${t.and} `]} highlight={hero.highlight}
          labels={{pause: t.pause, play: t.play}} />
      )}
      {figures.length ? (
        <div className={page}>
          <dl aria-label={dictionary.home6.figuresLabel}
            className="mx-auto mt-10 grid max-w-[62.5rem] text-left md:mt-14 md:grid-cols-3">
            {figures.map((figure) => (
              <div key={figure.key}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-4 border-hairline py-4 not-first:border-t md:grid-cols-[auto_minmax(0,1fr)] md:gap-4.5 md:px-8 md:py-1 md:not-first:border-l md:not-first:border-t-0">
                <dt className="font-display text-[3.25rem] font-semibold leading-[0.9] tracking-[-0.02em] text-ink md:text-[4rem]">
                  {new Intl.NumberFormat(numberLocale(lang)).format(figure.value)}
                </dt>
                <dd className="text-meta leading-[1.45] text-ink-soft md:max-w-[11.875rem]">{figure.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}

// ---------- 2 · Services and catalogues ----------

/** Service cards whose cover is a drawing on white: framed by a hairline, not a shadowed photo. */
const drawingServices = new Set(['policandre-la-comanda']);

export function HomeServices({section, catalogues, lang, dictionary}: Base & {section: Section<'services'>; catalogues: ReactNode}) {
  const cards = (section.groups ?? []).flatMap((group, index) =>
    (group.services ?? []).filter(isPublic).map((service) => ({service, metal: metals[index % 3]})));
  if (section.enabled === false || !section.heading || !cards.length) return null;

  return (
    <section id={homeAnchors.services} aria-labelledby="home-services" className="m-svc scroll-mt-header py-22 lg:pb-40 lg:pt-28">
      <div className={page}>
        <div className="text-center">
          <p className="kicker mb-3 md:mb-4">{dictionary.home6.servicesKicker}</p>
          <h2 id="home-services" className="section-title">{section.heading}</h2>
          {section.lead && <p className="mx-auto mt-4 max-w-160 text-[1.0625rem] leading-[1.6] text-ink-soft md:mt-5 md:text-lead">{section.lead}</p>}
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-16 md:grid-cols-3 md:gap-x-7 md:gap-y-10">
          {cards.map(({service, metal}, index) => {
            const first = index === 0;
            const drawing = drawingServices.has(service.slug ?? '');
            return (
              <li key={service._id} className={first ? 'col-span-2 md:col-span-1' : undefined}>
                <Link href={serviceHref(service, lang)} className="bo h-full max-md:before:top-9">
                  <span className={`ph relative ${first ? 'max-md:aspect-[16/10]' : ''} ${drawing ? 'bg-white outline-1 -outline-offset-1 outline-hairline' : ''}`}>
                    <SanityImage image={service.coverImage && {...service.coverImage, alt: service.coverImage.alt ?? ''}}
                      cover priority={first} sizes="(min-width: 768px) 33vw, 50vw" />
                  </span>
                  <span className="tx max-md:px-1.5 max-md:pb-[15px] max-md:pt-[13px]">
                    <i aria-hidden="true" className={`bar bar-${metal}`} />
                    <b className={first ? 'max-md:text-[1.75rem]' : undefined}>{serviceName(service)}</b>
                    {service.cardLabel && <small className="max-md:mt-1.5 max-md:leading-[1.35]">{service.cardLabel}</small>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {catalogues}
      </div>
    </section>
  );
}

const megabytes = (bytes: number, lang: Lang) =>
  `${new Intl.NumberFormat(numberLocale(lang), {maximumFractionDigits: 1}).format(bytes / 1048576)} MB`;

export function HomeCatalogues({section, downloads, lang, dictionary}: Base & {section: Section<'catalogues'>; downloads: CatalogDownload[]}) {
  const items = downloads.filter((item) => item.url && item.title).slice(0, 2);
  if (section.enabled !== true || !section.heading || !items.length) return null;
  const t = dictionary.home5;
  return (
    <div className="mt-22 text-center md:mt-36">
      <h3 className="font-display text-[2.25rem] font-medium leading-none tracking-[-0.015em] md:text-[3rem]">{section.heading}</h3>
      <p className="mt-3 text-[1.0625rem] leading-[1.6] text-ink-soft md:mt-4 md:text-lead">{dictionary.home6.cataloguesLead}</p>
      <ul className="mx-auto mt-8 grid grid-cols-2 gap-4 text-left md:mt-12 md:w-fit md:grid-cols-[repeat(2,15rem)] md:gap-12">
        {items.map((item) => {
          const size = item.size ? megabytes(item.size, lang) : 'PDF';
          return (
            <li key={item._id}>
              <a href={item.url!} target="_blank" rel="noopener" aria-label={`${t.readOnline}: ${item.title}`}
                className="block rounded-[0.875rem] bg-white p-1.5 shadow-e1 transition-[translate,box-shadow] duration-(--duration-fade) ease-light hover:-translate-y-1.5 hover:shadow-e2 focus-visible:-translate-y-1.5 motion-reduce:transform-none md:rounded-image md:p-2">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-[9px] bg-band md:rounded-[10px]">
                  <SanityImage image={item.cover && {...item.cover, alt: ''}} ratio={3 / 4} sizes="240px" />
                </span>
              </a>
              <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3 md:mt-4.5">
                <div>
                  <p className="text-[0.9375rem] font-semibold leading-[1.3] md:text-[1.0625rem]">{item.title}</p>
                  <a href={item.url!} target="_blank" rel="noopener" className="text-link min-h-8 text-[0.875rem] md:text-[0.9375rem]">{t.readOnline}</a>
                </div>
                <a href={`${item.url}?dl=`} download aria-label={t.download.replace('{title}', item.title!).replace('{size}', size)}
                  className="grid size-11 place-items-center rounded-pill bg-teal-900 text-white transition-colors duration-(--duration-line) hover:bg-teal-950">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------- 4 · Despre noi (light band) ----------

function aboutVideo(video: Section<'about'>['video'], fallbackTitle: string): FacadeVideo | null {
  const title = video?.title ?? fallbackTitle;
  const id = video?.provider === 'youtube' ? youtubeId(video.url) : null;
  if (id) return {provider: 'youtube', id, title};
  if (video?.provider === 'file' && video.file) return {provider: 'file', src: video.file, title};
  return null;
}

export function HomeAbout({section, dictionary}: Base & {section: Section<'about'>}) {
  if (section.enabled === false || !section.heading || !section.poster?.asset) return null;
  const t = dictionary.home6;
  const video = aboutVideo(section.video, section.videoCaption ?? section.heading);
  const lead = plainText(section.lead);

  return (
    <section id={homeAnchors.about} aria-labelledby="home-about" className="m-about scroll-mt-header py-18 md:py-32">
      <div className={`${wide} grid items-center gap-9 md:gap-12 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-18`}>
        <VideoFacade look="feature"
          poster={{...section.poster, alt: section.poster.alt ?? ''}}
          video={video}
          caption={<><b>{section.videoCaption ?? section.heading}</b> · {t.place} · {t.length}</>}
          playLabel={dictionary.homeSections.playVideo}
          sizes="(min-width: 1200px) 58vw, 100vw" />
        <div className="xl:pr-10">
          <h2 id="home-about" className="section-title">{section.heading}</h2>
          {lead && <p className="mt-4.5 text-[1.0625rem] leading-[1.6] md:mt-5 md:text-lead">{lead}</p>}
          {section.points?.length ? (
            <ul className="mt-7 border-t border-hairline md:mt-8 md:grid md:grid-cols-3 md:gap-6 md:pt-6">
              {section.points.map((point) => (
                <li key={point._key}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3.5 border-b border-hairline py-3.5 md:block md:border-0 md:p-0">
                  <b className="block font-display text-[1.875rem] font-medium leading-none md:text-[2.75rem]">{point.key}</b>
                  <span className="block text-meta leading-[1.45] text-ink-soft md:mt-2.5">{point.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------- 5 · Director (dark panel) ----------

/** A long quote shortened at the last clause break before `max` characters. */
function shorten(text: string, max = 200) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf('. '));
  return `${(at > 80 ? cut.slice(0, at) : cut.slice(0, cut.lastIndexOf(' '))).trim()}…`;
}

/** "**13 clopote** · 11 tone": bold between double asterisks. */
const boldParts = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
    part.startsWith('**') ? <b key={index} className="font-semibold text-on-dark">{part.slice(2, -2)}</b> : part);

export function HomeDirector({section, dictionary}: Base & {section: Section<'about'>}) {
  const statement = section.statement;
  const text = statement?.shortQuote ?? (statement?.quote ? shorten(statement.quote) : null);
  if (section.enabled === false || !statement || !text) return null;
  const portrait = statement.portrait?.asset ? statement.portrait : null;

  return (
    <section aria-label={statement.name ?? undefined} className="pb-10 pt-14 md:py-14">
      <figure className="dark-panel m-director my-0 pb-10 md:py-14">
        <div className={`${page} grid items-center md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16 md:px-6`}>
          {portrait && (
            <div className="relative -mt-8 md:mt-0 md:min-h-90 md:self-stretch">
              <div className="relative aspect-square overflow-hidden rounded-[22px] shadow-[0_24px_56px_rgb(0_0_0/0.32)] md:absolute md:inset-x-0 md:-inset-y-22 md:aspect-auto md:rounded-tray md:shadow-[0_32px_80px_rgb(0_0_0/0.36)]">
                <SanityImage image={{...portrait, alt: portrait.alt ?? statement.name ?? ''}} cover sizes="(min-width: 768px) 58vw, 100vw" />
              </div>
            </div>
          )}
          <div className="max-w-130 md:py-2">
            <span aria-hidden="true" className="quote-mark mt-6 h-10 text-[6.75rem] md:mt-0 md:h-12 md:text-[8rem]">“</span>
            <blockquote className="mt-1.5 font-display text-[1.625rem] font-medium leading-[1.22] tracking-[-0.015em] text-white md:mt-2 md:text-[clamp(1.625rem,2.2vw,1.9375rem)]">
              <p>{text}</p>
            </blockquote>
            <figcaption className="mt-6">
              <p className="text-base font-semibold md:text-[1.0625rem]">{statement.name}</p>
              {statement.role && <p className="mt-0.5 text-caption text-on-dark-soft md:mt-1 md:text-meta">{statement.role}</p>}
            </figcaption>
            <ul className="mt-5.5 border-t border-on-dark/18 pt-4 text-caption leading-normal text-on-dark-soft md:mt-7 md:flex md:flex-wrap md:gap-x-6 md:gap-y-1.5 md:pt-5 md:text-meta md:leading-[1.45]">
              {dictionary.home6.directorFacts.map((line) => <li key={line}>{boldParts(line)}</li>)}
            </ul>
          </div>
        </div>
      </figure>
    </section>
  );
}

// ---------- 6 · Ascultați ----------

export function HomeAudio({section, lang, dictionary, contact}: Base & {section: Section<'audio'>; contact: Contact}) {
  const recording = section.recording;
  if (section.enabled === false || !recording?.url || !recording.title) return null;
  const t = dictionary.home5;
  const linkTarget = linkHref(section.link, lang, contact);

  return (
    <section id={homeAnchors.audio} aria-labelledby="home-audio" className="m-listen scroll-mt-header py-14 md:py-24">
      <div className={`${page} flex justify-center`}>
        <div className="w-full md:w-auto md:flex-1 md:max-w-[55rem]">
          <BellPlayer
            src={recording.url}
            type={recording.mimeType ?? 'audio/mpeg'}
            title={recording.title}
            duration={recording.durationSeconds ?? null}
            waveform={recording.waveform ?? null}
            labels={{play: t.playAudio, pause: t.pauseAudio}}
            kicker={t.listen}
            context={recording.context ?? dictionary.home6.recordingPlace}
            link={linkTarget && section.link?.label ? (
              <Link href={linkTarget} className="text-link text-[0.875rem] md:text-[0.9375rem]">{section.link.label} →</Link>
            ) : null}
          />
        </div>
      </div>
    </section>
  );
}

// ---------- 7 · Din jurnal ----------

export function HomeJournal({section, posts, lang, dictionary}: Base & {section: Section<'blog'>; posts: BlogCard[]}) {
  if (section.enabled === false || !section.heading || !posts.length) return null;
  const all = (
    <Link href={localizedHref(lang, '/blog')} className="text-link">{dictionary.homeSections.allPosts}</Link>
  );

  return (
    <section id={homeAnchors.journal} aria-labelledby="home-journal" className="m-blog scroll-mt-header py-22 lg:py-40">
      <div className={wide}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 id="home-journal" className="section-title">{section.heading}</h2>
            {section.intro && <p className="mt-3 text-[1.0625rem] leading-[1.6] text-ink-soft md:mt-4 md:text-lead">{section.intro}</p>}
          </div>
          <div className="hidden md:block">{all}</div>
        </div>
      </div>
      <ul aria-label={dictionary.home6.journalLabel}
        className={`mt-8 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] md:mx-auto md:mt-14 md:grid md:max-w-[85rem] md:grid-cols-3 md:gap-8 md:overflow-visible md:px-4 md:pb-0 [&::-webkit-scrollbar]:hidden`}>
        {posts.map((post) => (
          <li key={post._id} className="flex w-75 flex-none snap-start md:w-auto">
            <BylineCard post={post} lang={lang} dictionary={dictionary} className="w-full" />
          </li>
        ))}
      </ul>
      <div className="mt-4 px-5 md:hidden">{all}</div>
    </section>
  );
}
