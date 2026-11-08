import Link from 'next/link';
import type {ReactNode} from 'react';
import {longDate, postPath} from '@/components/blog/post-card';
import {SanityImage} from '@/components/sanity-image';
import {numberLocale} from '@/components/services/shared';
import {ArrowRightIcon, PhoneIcon} from '@/components/site/icons';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath} from '@/lib/services';
import {aboutAnchor, linkHref, type Contact, type LinkValue} from '@/lib/site-links';
import {youtubeId} from '@/lib/video';
import {readingMinutes, type BlogCard} from '@/sanity/blog';
import type {CatalogDownload, HomeContent} from '@/sanity/home';
import type {SanityImageValue} from '@/sanity/image';
import type {CATEGORIES_QUERY_RESULT} from '@/sanity/types';
import {categoryPath, projectPath, worksPath} from '@/sanity/portfolio-routes';
import {BellPlayer} from './listening-strip';
import {Triptych, type TriptychSlice} from './triptych';
import {VideoFacade, type FacadeVideo} from './video-facade';
import {WorksMap} from './works-map';

// The home page sections of the v5.10 redesign (docs/design-handoff/spec/
// homepage.md), in their fixed order: hero, services (+ catalogues), works,
// about, listening strip, journal (+ testimonial); the offer is the footer.
// Each returns nothing when it is switched off or has nothing to show.

type Base = {lang: Lang; dictionary: Dictionary};
type Section<K extends keyof HomeContent> = NonNullable<HomeContent[K]>;

/** Anchors of the sections, for the rail and in-page links. */
export const homeAnchors = {
  top: 'inceput', services: 'servicii', works: 'lucrari', about: aboutAnchor, audio: 'ascultati', journal: 'jurnal',
} as const;

const sectionSpace = 'mt-20 lg:mt-40 scroll-mt-header';

function SmartLink({href, className, children}: {href: string; className: string; children: ReactNode}) {
  return href.startsWith('/')
    ? <Link href={href} className={className}>{children}</Link>
    : <a href={href} className={className} {...(/^https?:/.test(href) ? {rel: 'noopener', target: '_blank'} : {})}>{children}</a>;
}

/** A button from a `siteLink`; nothing when the target is not public. */
function LinkButton({link, lang, contact, className}: {
  link: (LinkValue & {label?: string | null}) | null | undefined;
  lang: Lang;
  contact: Contact;
  className: string;
}) {
  const href = linkHref(link, lang, contact);
  if (!href || !link?.label) return null;
  return (
    <SmartLink href={href} className={className}>
      {link.kind === 'phone' && <PhoneIcon className="size-4" />}
      {link.label}
    </SmartLink>
  );
}

function TextLink({href, children}: {href: string; children: ReactNode}) {
  return (
    <SmartLink href={href}
      className="group inline-flex min-h-11 items-center gap-2 text-ui font-semibold text-teal-700 underline decoration-teal-700/0 decoration-1 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-teal-700">
      {children}
      <ArrowRightIcon className="size-4 transition-transform duration-(--duration-line) group-hover:translate-x-1" />
    </SmartLink>
  );
}

type Block = {_key: string; children?: {_key: string; text?: string; marks?: string[]}[]};

/** Short bold-only texts (craft facts, about lead): one element per block. */
function BoldLines({blocks, as: Tag = 'p', className = '', boldClass = 'font-semibold text-ink'}: {
  blocks: Block[] | null | undefined;
  as?: 'p' | 'li';
  className?: string;
  boldClass?: string;
}) {
  return (blocks ?? []).map((block) => (
    <Tag key={block._key} className={className}>
      {(block.children ?? []).map((span) => span.marks?.includes('strong')
        ? <strong key={span._key} className={boldClass}>{span.text}</strong>
        : <span key={span._key}>{span.text}</span>)}
    </Tag>
  ));
}

type HomeService = NonNullable<NonNullable<NonNullable<Section<'services'>['groups']>[number]['services']>[number]>;
const serviceHref = (service: HomeService, lang: Lang) =>
  localizedHref(lang, servicePath(service.parentSlug, service.slug ?? ''));
const isPublic = (service: HomeService | null | undefined): service is HomeService =>
  Boolean(service?.public && service.slug && service.title);

// ---------- 1 · Hero ----------

/** "policandre" → "policandrele": the Romanian definite plural of these feminine and neuter plurals. */
const articulated = (word: string, lang: Lang) => (lang === 'ro' && word.endsWith('e') ? `${word}le` : word);

export function HomeHero({home, lang, dictionary, contact}: Base & {home: HomeContent; contact: Contact}) {
  const hero = home.hero;
  if (!hero) return null;
  const t = dictionary.home5;
  const lower = (text: string) => text.toLocaleLowerCase(lang);

  const slices: TriptychSlice[] = (hero.slices ?? []).flatMap((slice, index) => {
    const service = slice.service;
    if (!isPublic(service)) return [];
    const title = service.title!;
    const word = index === 0 ? title : lower(title);
    return [{
      key: slice._key,
      title,
      word,
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
  const badgeHref = linkHref(hero.badge, lang, contact);

  const badge = badgeHref && hero.badge?.label ? (
    <SmartLink href={badgeHref}
      className="order-0 mb-5 inline-flex min-h-11 items-center gap-3 self-start rounded-pill bg-surface py-1.5 pl-1.5 pr-4 text-[0.9375rem] font-medium text-ink shadow-e1 transition-colors hover:bg-teal-tint">
      <span className="rounded-pill bg-teal-tint px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-teal-900">Nou</span>
      {hero.badge.label}
      <ArrowRightIcon className="size-4" />
    </SmartLink>
  ) : null;

  const between = (
    <div className="order-3 mt-8 flex flex-col gap-6 lg:order-2 lg:mt-5 lg:flex-row lg:items-center lg:justify-between">
      {hero.tagline && <p className="font-display text-claim italic text-ink">{hero.tagline}</p>}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton link={hero.primaryCta} lang={lang} contact={contact} className="btn btn-primary" />
          <LinkButton link={hero.secondaryCta} lang={lang} contact={contact} className="btn btn-secondary" />
        </div>
        {figures.length ? (
          <dl className="flex gap-6 border-t border-hairline pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            {figures.map((figure) => (
              <div key={figure.key} className="flex flex-col-reverse">
                <dt className="text-caption text-ink-soft">{figure.label}</dt>
                <dd className="font-display text-[2.125rem] leading-none text-ink">{figure.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );

  return (
    <section id={homeAnchors.top} aria-labelledby="home-title" className="container-site flex flex-col pt-3">
      {slices.length === 3 ? (
        <Triptych slices={slices} joiner={[', ', ` ${t.and} `]} before={badge} between={between}
          labels={{pause: t.pause, play: t.play}} />
      ) : (
        <>
          {badge}
          <h1 id="home-title" className="order-1 font-display text-hero-line text-ink">{hero.title}</h1>
          {between}
        </>
      )}
    </section>
  );
}

// ---------- 2 · Services and catalogues ----------

/** Card widths on the 12-column grid after the 2-column heading. */
const spans: Record<number, string[]> = {
  1: ['lg:col-span-10'],
  2: ['lg:col-span-5', 'lg:col-span-5'],
  3: ['lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3'],
  4: ['lg:col-span-3', 'lg:col-span-3', 'lg:col-span-2', 'lg:col-span-2'],
};

function ServiceCard({service, lang, className, priority = false}: {service: HomeService; lang: Lang; className: string; priority?: boolean}) {
  const title = service.title ?? '';
  return (
    <li className={className}>
      <Link href={serviceHref(service, lang)} className="card card-lift group flex h-full flex-col p-2">
        <span className="card-photo relative block flex-1 rounded-[0.875rem] bg-sunk">
          <SanityImage image={service.coverImage && {...service.coverImage, alt: ''}} cover priority={priority}
            sizes="(min-width: 1024px) 33vw, 50vw" />
          {service.cardLabel && (
            <span aria-hidden="true"
              className="glass-light absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] translate-y-1.5 truncate rounded-pill px-3 py-1.5 text-micro font-semibold text-ink opacity-0 transition-[opacity,translate] duration-(--duration-fade) ease-light group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
              {service.cardLabel}
            </span>
          )}
        </span>
        <span className="grid h-[3.625rem] grid-cols-[1fr_auto] items-start gap-3 px-2 pt-3 lg:h-16">
          <span className="text-clamp-2 text-[0.9375rem] font-semibold leading-tight text-ink lg:text-base">{title}</span>
          <span aria-hidden="true"
            className="-mt-1.5 grid size-9 place-items-center rounded-pill bg-teal-tint text-teal-900 transition-colors duration-(--duration-line) group-hover:bg-teal-900 group-hover:text-white">
            <ArrowRightIcon className="size-4 transition-transform duration-(--duration-line) group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
    </li>
  );
}

export function HomeServices({section, catalogues, lang}: Base & {section: Section<'services'>; catalogues: ReactNode}) {
  const groups = (section.groups ?? [])
    .map((group) => ({...group, services: (group.services ?? []).filter(isPublic)}))
    .filter((group) => group.title && group.services.length);
  if (section.enabled === false || !section.heading || !groups.length) return null;

  return (
    <section id={homeAnchors.services} aria-labelledby="home-services" className="container-site mt-16 scroll-mt-header">
      <h2 id="home-services" className="section-title">{section.heading}</h2>
      <div className="mt-10 space-y-10 lg:space-y-4">
        {groups.map((group, groupIndex) => {
          const widths = spans[Math.min(group.services.length, 4)];
          const count = group.services.length;
          return (
            <ul key={group._key} aria-label={group.title ?? undefined}
              className="grid grid-cols-2 gap-2.5 lg:auto-rows-[16.5rem] lg:grid-cols-12 lg:gap-(--spacing-gap-services)">
              <li className="col-span-2 border-t-2 border-ink px-1 pt-4 lg:col-span-2">
                <h3 className="font-display text-craft text-ink">{group.title}</h3>
                {group.facts?.length ? (
                  <ul className="mt-3 space-y-1.5 text-[0.8125rem] leading-normal text-ink-soft lg:mt-3.5 lg:text-[0.875rem]">
                    <BoldLines blocks={group.facts} as="li" />
                  </ul>
                ) : null}
              </li>
              {group.services.slice(0, 4).map((service, index) => {
                const wide = index === 0 || (index === count - 1 && (count - 1) % 2 === 1);
                return (
                  <ServiceCard key={service._id} service={service} lang={lang} priority={groupIndex === 0 && index === 0}
                    className={`${wide ? 'col-span-2 h-[12.25rem]' : 'h-44'} lg:h-auto ${widths[index]}`} />
                );
              })}
            </ul>
          );
        })}
      </div>
      {catalogues}
    </section>
  );
}

const megabytes = (bytes: number, lang: Lang) =>
  `${new Intl.NumberFormat(numberLocale(lang), {maximumFractionDigits: 1}).format(bytes / 1048576)} MB`;

export function HomeCatalogues({section, downloads, lang, dictionary}: Base & {section: Section<'catalogues'>; downloads: CatalogDownload[]}) {
  const items = downloads.filter((item) => item.url && item.title);
  if (section.enabled !== true || !section.heading || !items.length) return null;
  const t = dictionary.home5;
  return (
    <div className="card mx-auto mt-10 grid w-[min(100%,47.5rem)] gap-5 rounded-menu p-4 sm:grid-cols-[13.75rem_1fr] sm:gap-7">
      <div aria-hidden="true" className="relative hidden h-49 items-center justify-center rounded-image bg-sunk sm:flex">
        {items.slice(0, 2).map((item, index) => (
          <span key={item._id}
            className={`relative h-37 w-26 overflow-hidden rounded-md bg-surface shadow-e3 ${index === 0 ? '-rotate-4 translate-x-3' : 'rotate-3 -translate-x-3'}`}>
            <SanityImage image={item.cover && {...item.cover, alt: ''}} ratio={104 / 148} sizes="104px" />
          </span>
        ))}
      </div>
      <div className="py-2">
        <h3 className="font-display text-[2.5rem] leading-none text-ink">{section.heading}</h3>
        <ul className="mt-4 space-y-2">
          {items.map((item) => {
            const size = item.size ? megabytes(item.size, lang) : 'PDF';
            return (
              <li key={item._id} className="grid grid-cols-[1fr_2.75rem] items-center gap-3 rounded-[0.875rem] bg-ground p-1.5 pl-4 transition-colors hover:bg-teal-tint">
                <a href={item.url!} target="_blank" rel="noopener" className="min-w-0 py-1">
                  <span className="block truncate text-[0.9375rem] font-semibold text-ink">{item.title}</span>
                  <span className="text-micro font-semibold text-teal-700">{t.readOnline} →</span>
                </a>
                <a href={`${item.url}?dl=`} download aria-label={t.download.replace('{title}', item.title!).replace('{size}', size)}
                  className="grid size-11 place-items-center rounded-pill bg-teal-900 text-white transition-colors hover:bg-teal-950">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true" className="size-4"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ---------- 3 · Works ----------

type HomeProject = NonNullable<HomeContent['latestWorks']>[number];

/**
 * The wall: 10 tiles and the map on a 6 × 3 grid at 1200px and up (large,
 * tall, wide and small tiles, no holes); fewer columns let the same sizes
 * flow densely. A portrait photo is moved into the tall slots when there is one.
 */
const wallSlots = [
  'col-span-2 row-span-2 min-[75rem]:col-start-1 min-[75rem]:row-start-1',
  'row-span-2 min-[75rem]:col-start-3 min-[75rem]:row-start-1',
  'col-span-2 min-[75rem]:col-start-4 min-[75rem]:row-start-1',
  'min-[75rem]:col-start-6 min-[75rem]:row-start-1',
  'min-[75rem]:col-start-4 min-[75rem]:row-start-2',
  'min-[75rem]:col-start-5 min-[75rem]:row-start-2',
  'min-[75rem]:col-start-6 min-[75rem]:row-start-2',
  'min-[75rem]:col-start-1 min-[75rem]:row-start-3',
  'min-[75rem]:col-start-2 min-[75rem]:row-start-3',
  'col-span-2 min-[75rem]:col-start-3 min-[75rem]:row-start-3',
];
const tallSlots = [1];
const ratio = (project: HomeProject) => {
  const {width, height} = project.coverImage ?? {};
  return width && height ? width / height : 1;
};

function arrangeWall(projects: HomeProject[]) {
  const tiles = projects.slice(0, wallSlots.length);
  for (const slot of tallSlots) {
    if (!tiles[slot] || ratio(tiles[slot]) < 0.9) continue;
    const portrait = tiles.findIndex((project, index) => index > slot && ratio(project) < 0.9);
    if (portrait > 0) [tiles[slot], tiles[portrait]] = [tiles[portrait], tiles[slot]];
  }
  return tiles;
}

export function HomeWorks({section, projects, categories, places, lang, dictionary}: Base & {
  section: Section<'works'>;
  projects: HomeProject[];
  categories: CATEGORIES_QUERY_RESULT;
  places: HomeContent['places'];
}) {
  const shown = arrangeWall(projects.filter((project) => project.slug && project.categorySlug && project.coverImage?.asset));
  if (section.enabled === false || !section.heading || !shown.length) return null;
  const t = dictionary.home5;
  const total = places.length;
  const works = plural(lang, total, dictionary.portfolio.projects);
  const countries = new Set(places.flatMap((place) => place.country ?? [])).size;
  const country = (code: string | null) => (code ? dictionary.countries[code as keyof Dictionary['countries']] ?? code : null);

  return (
    <section id={homeAnchors.works} aria-labelledby="home-works" className={`container-site ${sectionSpace}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="home-works" className="section-title">{section.heading}</h2>
        <nav aria-label={dictionary.portfolio.categories} className="-mx-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
          <ul className="flex gap-2">
            <li>
              <Link href={localizedHref(lang, worksPath)} aria-current="true" className="chip">
                {t.all} <span className="text-chip-count-on">{total}</span>
              </Link>
            </li>
            {categories.filter((category) => category.slug && category.projectCount).map((category) => (
              <li key={category._id}>
                <Link href={localizedHref(lang, categoryPath(category.slug!))} className="chip">
                  {category.title} <span className="text-ink-soft">{category.projectCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <ul className="mt-8 grid grid-flow-dense auto-rows-[clamp(150px,16vw,228px)] grid-cols-2 gap-(--spacing-gap-wall) md:grid-cols-4 min-[75rem]:grid-cols-6">
        {shown.map((project, index) => {
          const place = [project.location?.locality ?? project.location?.county, country(project.location?.country ?? null)]
            .filter(Boolean).join(', ');
          const title = project.title ?? '';
          return (
            <li key={project._id} className={wallSlots[index]}>
              <Link href={localizedHref(lang, projectPath(project.categorySlug!, project.slug!))}
                className="group relative block size-full overflow-hidden rounded-tile bg-sunk">
                <span className="absolute inset-0 transition-transform duration-(--duration-fade) ease-light group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transform-none">
                  <SanityImage image={project.coverImage && {...project.coverImage, alt: photoAlt(project.coverImage, [title, place].filter(Boolean).join(', '))}}
                    cover sizes={index === 0 ? '(min-width: 1200px) 33vw, 100vw' : '(min-width: 1200px) 17vw, 50vw'} />
                </span>
                <span className="glass-light absolute inset-x-2 bottom-2 rounded-caption px-3 py-2 opacity-0 transition-opacity duration-(--duration-fade) group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                  <span className="block truncate text-micro font-semibold text-ink lg:text-[0.8125rem]">{title}</span>
                  <span className="block truncate text-micro text-ink-soft">{[place, project.year].filter(Boolean).join(' · ')}</span>
                </span>
              </Link>
            </li>
          );
        })}
        <li className="col-span-2 row-span-2 md:row-span-1 min-[75rem]:col-start-5 min-[75rem]:row-start-3">
          <Link href={localizedHref(lang, worksPath)}
            className="card card-lift group grid size-full grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-tile p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <span className="col-span-2 self-stretch md:col-span-1 md:row-span-1">
              <WorksMap places={places} />
            </span>
            <span className="col-span-2 md:col-span-1">
              <span className="block font-display text-[1.75rem] leading-tight text-ink">
                {t.mapTitle.replace('{works}', works).replace('{countries}', plural(lang, countries, t.countries))}
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-teal-700">
                {t.seeWorks} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        </li>
      </ul>

      <div className="mt-10 flex justify-center">
        <Link href={localizedHref(lang, worksPath)} className="btn btn-primary">
          {t.allWorks.replace('{works}', works)}
        </Link>
      </div>
    </section>
  );
}

// ---------- 4 · About ----------

function aboutVideo(video: Section<'about'>['video'], fallbackTitle: string): FacadeVideo | null {
  const title = video?.title ?? fallbackTitle;
  const id = video?.provider === 'youtube' ? youtubeId(video.url) : null;
  if (id) return {provider: 'youtube', id, title};
  if (video?.provider === 'file' && video.file) return {provider: 'file', src: video.file, title};
  return null;
}

/** A long quote shortened at the last clause break before `max` characters. */
function shorten(text: string, max = 200) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf('. '));
  return `${(at > 80 ? cut.slice(0, at) : cut.slice(0, cut.lastIndexOf(' '))).trim()}…`;
}

export function HomeAbout({section, lang, dictionary, contact}: Base & {section: Section<'about'>; contact: Contact}) {
  if (section.enabled === false || !section.heading || !section.poster?.asset) return null;
  const statement = section.statement;
  const quote = statement?.shortQuote ?? (statement?.quote ? shorten(statement.quote) : null);
  const role = statement?.role;

  return (
    <section id={homeAnchors.about} aria-labelledby="home-about" className={`container-site ${sectionSpace}`}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-18">
        <div>
          <h2 id="home-about" className="section-title">{section.heading}</h2>
          <BoldLines blocks={section.lead} className="mt-6 text-[1.0625rem] leading-normal text-ink lg:text-[1.25rem]" />
          {section.points?.length ? (
            <ul className="mt-8">
              {section.points.map((point) => (
                <li key={point._key}
                  className="grid grid-cols-[5.25rem_1fr] items-baseline gap-5 border-t border-hairline py-3.5 last:border-b lg:grid-cols-[7rem_1fr]">
                  <span className="font-display text-key text-ink">{point.key}</span>
                  <span className="text-body text-ink-soft">{point.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 empty:hidden">
            <LinkButton link={section.cta} lang={lang} contact={contact} className="btn btn-primary" />
          </div>
        </div>
        <VideoFacade
          poster={{...section.poster, alt: section.poster.alt ?? section.heading}}
          video={aboutVideo(section.video, section.videoCaption ?? section.heading)}
          caption={section.videoCaption}
          playLabel={dictionary.homeSections.playVideo}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {statement && quote ? (
        <figure className={`mt-20 grid gap-8 border-t border-hairline pt-12 lg:items-center lg:gap-14 ${statement.portrait?.asset ? 'lg:grid-cols-[28.5rem_1fr]' : ''}`}>
          {statement.portrait?.asset && (
            <div className="arch-low relative aspect-[3/2] bg-sunk">
              <SanityImage image={{...statement.portrait, alt: statement.portrait.alt ?? statement.name ?? ''}} ratio={3 / 2}
                sizes="(max-width: 1024px) 100vw, 456px" />
            </div>
          )}
          <div>
            <blockquote className="font-display text-quote text-ink">
              <p>„{quote}”</p>
            </blockquote>
            {statement.context && <p className="mt-5 text-body text-ink-soft">{statement.context}</p>}
            <figcaption className="mt-3 text-body text-ink-soft">
              <span className="font-semibold text-ink">{statement.name}</span>{role ? ` · ${role}` : ''}
            </figcaption>
          </div>
        </figure>
      ) : null}
    </section>
  );
}

// ---------- 5 · Listening strip ----------

export function HomeAudio({section, lang, dictionary, contact}: Base & {section: Section<'audio'>; contact: Contact}) {
  const recording = section.recording;
  if (section.enabled === false || !recording?.url || !recording.title) return null;
  const t = dictionary.home5;
  const linkTarget = linkHref(section.link, lang, contact);
  const art = recording.artwork as SanityImageValue | null;

  return (
    <section id={homeAnchors.audio} aria-labelledby="home-audio" className="container-site mt-20 scroll-mt-header lg:mt-30">
      <div className="card grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-5 rounded-menu p-4 lg:grid-cols-[6.5rem_minmax(0,18.75rem)_1fr_auto] lg:gap-8 lg:py-5 lg:pl-5 lg:pr-8">
        <div className="arch relative h-24 w-18 bg-sunk lg:h-34 lg:w-26">
          {art?.asset && <SanityImage image={{...art, alt: ''}} ratio={104 / 136} sizes="104px" />}
        </div>
        <div className="min-w-0">
          <h2 id="home-audio" className="font-display text-[2.25rem] leading-none text-ink lg:text-[2.75rem]">{recording.title}</h2>
          <p className="mt-2 text-caption text-ink-soft">{[t.listen, recording.context].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 lg:contents">
          <BellPlayer
            src={recording.url}
            type={recording.mimeType ?? 'audio/mpeg'}
            title={recording.title}
            duration={recording.durationSeconds ?? null}
            waveform={recording.waveform ?? null}
            labels={{play: t.playAudio, pause: t.pauseAudio}}
            aside={linkTarget && section.link?.label ? (
              <div className="mt-4 lg:mt-0"><TextLink href={linkTarget}>{section.link.label}</TextLink></div>
            ) : null}
          />
        </div>
      </div>
    </section>
  );
}

// ---------- 6 · Journal (+ testimonial) ----------

const shortDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

export function HomeJournal({section, testimonial, posts, lang, dictionary}: Base & {
  section: Section<'blog'>;
  testimonial: Section<'testimonial'> | null;
  posts: BlogCard[];
}) {
  if (section.enabled === false || !section.heading || !posts.length) return null;
  const t = dictionary.home5;
  const voice = testimonial?.enabled === true && testimonial.testimonial?.quote ? testimonial.testimonial : null;

  return (
    <section id={homeAnchors.journal} aria-labelledby="home-journal" className={`container-site ${sectionSpace}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="home-journal" className="section-title">{voice ? t.withTestimonial : section.heading}</h2>
        <TextLink href={localizedHref(lang, '/blog')}>{dictionary.homeSections.allPosts}</TextLink>
      </div>

      {voice && (
        <figure className="card mt-10 grid gap-6 rounded-menu p-6 lg:grid-cols-[10rem_1fr] lg:items-center lg:gap-10 lg:p-10">
          {voice.portrait?.asset && (
            <div className="arch relative aspect-[3/4] w-28 bg-sunk lg:w-full">
              <SanityImage image={{...voice.portrait, alt: voice.portrait.alt ?? voice.name ?? ''}} ratio={3 / 4} sizes="160px" />
            </div>
          )}
          <div>
            <blockquote className="font-display text-quote text-ink"><p>„{voice.quote}”</p></blockquote>
            <figcaption className="mt-4 text-body text-ink-soft">
              <span className="font-semibold text-ink">{voice.name}</span>
              {[voice.role, voice.context].filter(Boolean).map((part) => ` · ${part}`)}
            </figcaption>
          </div>
        </figure>
      )}

      <ul className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-10">
        {posts.map((post) => (
          <li key={post._id}>
            <Link href={localizedHref(lang, postPath(post.slug!))} className="card-lift card-bare group flex h-full flex-col rounded-image outline-offset-8">
              <span className="card-photo relative block aspect-[3/2] rounded-image bg-sunk">
                <SanityImage image={post.cover && {...post.cover, alt: ''}} ratio={3 / 2} sizes="(max-width: 1024px) 100vw, 33vw" />
              </span>
              <span className="mt-5 flex flex-wrap gap-x-1.5 text-caption text-ink-soft">
                {post.kind && <span className="font-semibold text-teal-700">{dictionary.homeSections.kinds[post.kind]}</span>}
                {post.publishedAt && <><span aria-hidden="true">·</span><time dateTime={post.publishedAt} title={longDate(post.publishedAt, lang)}>{shortDate(post.publishedAt, lang)}</time></>}
                {post.textLength ? <><span aria-hidden="true">·</span><span>{dictionary.homeSections.readingTime.replace('{minutes}', String(readingMinutes(post.textLength)))}</span></> : null}
              </span>
              <span className="text-clamp-3 mt-3 min-h-[3.3em] font-display text-post-title text-ink decoration-teal-700 decoration-1 underline-offset-[6px] group-hover:underline">
                {post.title}
              </span>
              {post.excerpt && <span className="text-clamp-3 mt-3 text-body text-ink-soft">{post.excerpt}</span>}
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-ui font-semibold text-teal-700">
                {t.readArticle}
                <ArrowRightIcon className="size-4 transition-transform duration-(--duration-line) group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
