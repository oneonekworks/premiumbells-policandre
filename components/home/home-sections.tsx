import Link from 'next/link';
import {PortableText} from 'next-sanity';
import type {ReactNode} from 'react';
import {portableText} from '@/components/portfolio/project-details';
import {SanityImage} from '@/components/sanity-image';
import {ArrowRightIcon, ChevronDownIcon, PhoneIcon} from '@/components/site/icons';
import {numberLocale} from '@/components/services/shared';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath, servicesPath} from '@/lib/services';
import {aboutAnchor, linkHref, type Contact, type LinkValue} from '@/lib/site-links';
import {youtubeId} from '@/lib/video';
import {readingMinutes, type BlogCard} from '@/sanity/blog';
import type {CatalogDownload, HomeContent} from '@/sanity/home';
import type {ServiceListItem} from '@/sanity/services';
import {VideoFacade, type FacadeVideo} from './video-facade';

// The home page sections, in the fixed legacy order (decision 4). Each one
// returns nothing when it is switched off or has nothing to show; page.tsx
// decides which content each receives.

type Base = {lang: Lang; dictionary: Dictionary};
type Section<K extends keyof HomeContent> = NonNullable<HomeContent[K]>;

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
  const phone = link.kind === 'phone';
  return (
    <SmartLink href={href} className={className}>
      {phone && <PhoneIcon className="size-4" />}
      {link.label}
      {!phone && <ArrowRightIcon className="size-4" />}
    </SmartLink>
  );
}

function SectionIntro({eyebrow, heading, intro, id, light = false}: {
  eyebrow?: string | null;
  heading: string;
  intro?: ReactNode;
  id: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={`eyebrow ${light ? 'text-gold-200' : ''}`}>{eyebrow}</p>}
      <h2 id={id} className={`mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl ${light ? 'text-paper' : 'text-teal-900'}`}>
        {heading}
      </h2>
      {intro && <div className={`mt-5 space-y-4 text-lg leading-relaxed ${light ? 'text-paper/80' : 'text-ink-soft'}`}>{intro}</div>}
    </div>
  );
}

function MoreLink({href, children}: {href: string; children: ReactNode}) {
  return (
    <Link href={href} className="group inline-flex min-h-11 items-center gap-2 font-medium text-teal-700 hover:text-teal-900">
      {children}
      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function HomeHero({hero, lang, contact}: {hero: Section<'hero'>; lang: Lang; contact: Contact}) {
  if (!hero.title) return null;
  const badgeHref = linkHref(hero.badge, lang, contact);

  return (
    <section aria-labelledby="home-title" className="container-site pt-4 sm:pt-6">
      <div className="relative isolate overflow-hidden rounded-xl bg-teal-950 text-paper">
        <SanityImage image={hero.image} cover priority sizes="(max-width: 1216px) 100vw, 1216px" className="-z-20" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-teal-950/95 via-teal-950/75 to-teal-950/50 lg:bg-gradient-to-r lg:from-teal-950/90 lg:via-teal-950/60 lg:to-teal-950/5" />
        <div className="flex min-h-[34rem] flex-col justify-end px-6 py-12 sm:min-h-[38rem] sm:px-12 sm:py-16 lg:justify-center lg:px-16 lg:py-24">
          <div className="max-w-2xl">
            {badgeHref && hero.badge?.label && (
              <SmartLink href={badgeHref} className="mb-7 inline-flex min-h-9 items-center gap-2 rounded-full bg-paper/10 px-4 text-sm ring-1 ring-paper/25 backdrop-blur-sm transition-colors hover:bg-paper/20">
                {hero.badge.label}
                <ArrowRightIcon className="size-3.5" />
              </SmartLink>
            )}
            <h1 id="home-title" className="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              {hero.title}
              {hero.highlight && <span className="mt-2 block text-gold-200">{hero.highlight}</span>}
            </h1>
            {hero.tagline && (
              <p className="mt-7 flex items-center gap-3 font-display text-xl italic text-gold-200 sm:text-2xl">
                <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold-500" />
                {hero.tagline}
              </p>
            )}
            {hero.lead && <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg">{hero.lead}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton link={hero.primaryCta} lang={lang} contact={contact} className="btn btn-light" />
              <LinkButton link={hero.secondaryCta} lang={lang} contact={contact} className="btn btn-outline-light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeServices({section, services, lang, dictionary}: Base & {section: Section<'services'>; services: ServiceListItem[]}) {
  if (!section.heading || !services.length) return null;
  return (
    <section aria-labelledby="home-services" className="container-site py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionIntro
          id="home-services" eyebrow={section.eyebrow} heading={section.heading}
          intro={section.intro?.length ? <PortableText value={section.intro} components={portableText} /> : null}
        />
        <MoreLink href={localizedHref(lang, servicesPath)}>{dictionary.homeSections.allServices}</MoreLink>
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service._id} className="group relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
              <SanityImage
                image={service.coverImage && {...service.coverImage, alt: photoAlt(service.coverImage, service.title ?? '')}}
                ratio={4 / 3}
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <span aria-hidden="true" className="mt-4 block h-0.5 w-8 bg-gold-500 sm:mt-5" />
            <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-teal-900 sm:mt-4 sm:text-3xl">
              <Link href={localizedHref(lang, servicePath(null, service.slug ?? ''))} className="after:absolute after:inset-0 group-hover:text-teal-700">
                {service.title}
              </Link>
            </h3>
            {service.summary && <p className="mt-2 line-clamp-3 hidden leading-relaxed text-ink-soft sm:block">{service.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

const megabytes = (bytes: number, lang: Lang) =>
  `${new Intl.NumberFormat(numberLocale(lang), {maximumFractionDigits: 1}).format(bytes / 1048576)} MB`;

export function HomeCatalogues({section, downloads, lang, dictionary}: Base & {section: Section<'catalogues'>; downloads: CatalogDownload[]}) {
  if (section.enabled !== true || !section.heading || !downloads.length) return null;
  const {homeSections: t} = dictionary;
  return (
    <section aria-labelledby="home-catalogues" className="border-t border-line">
      <div className="container-site py-20 sm:py-28">
        <SectionIntro id="home-catalogues" heading={section.heading} intro={section.intro ? <p>{section.intro}</p> : null} />
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {downloads.map((item) => item.url && (
            <li key={item._id}>
              <a href={`${item.url}?dl=`} download className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-stone shadow-lg shadow-teal-950/10 ring-1 ring-line">
                  <SanityImage image={item.cover && {...item.cover, alt: ''}} ratio={3 / 4} sizes="(max-width: 768px) 50vw, 25vw"
                    className="transition-transform duration-700 group-hover:scale-[1.03]" />
                </span>
                <span className="mt-4 block font-display text-2xl font-semibold leading-tight text-teal-900 group-hover:text-teal-700">
                  {item.title}{item.edition && <span className="text-ink-soft"> {item.edition}</span>}
                </span>
                <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-teal-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="size-4"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t.download}
                </span>
                <span className="mt-0.5 block text-sm text-ink-soft">
                  {[item.size ? megabytes(item.size, lang) : null, item.language && item.language !== lang ? t.fileLanguage[item.language] : null].filter(Boolean).join(' · ')}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeTestimonial({section, dictionary}: {section: Section<'testimonial'>; dictionary: Dictionary}) {
  const item = section.testimonial;
  if (section.enabled === false || !item?.quote) return null;
  const by = [item.role, item.context].filter(Boolean).join(' · ');
  return (
    <section aria-labelledby="home-testimonial" className="bg-stone">
      <div className="container-site py-20 sm:py-28">
        <h2 id="home-testimonial" className="sr-only">{dictionary.homeSections.testimonial}</h2>
        <figure className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-16">
          {item.portrait?.asset && (
            <div className="relative aspect-[4/5] w-32 overflow-hidden rounded-lg bg-line md:w-full">
              <SanityImage image={{...item.portrait, alt: item.portrait.alt ?? item.name ?? ''}} ratio={4 / 5} sizes="15rem" />
            </div>
          )}
          <div className={item.portrait?.asset ? '' : 'md:col-span-2'}>
            <svg viewBox="0 0 48 36" aria-hidden="true" className="h-8 w-11 text-gold-500"><path fill="currentColor" d="M0 36V21.6C0 9.5 6.2 2.3 18.6 0l2 4.6C13.8 6.5 10.4 10.4 10.2 16.4H19V36H0Zm29 0V21.6C29 9.5 35.2 2.3 47.6 0l2 4.6c-6.8 1.9-10.2 5.8-10.4 11.8H48V36H29Z" /></svg>
            <blockquote className="mt-6 font-display text-2xl font-medium leading-snug text-teal-900 sm:text-3xl sm:leading-snug">
              <p>{item.quote}</p>
            </blockquote>
            <figcaption className="mt-8 border-l-2 border-gold-500 pl-4">
              <span className="block font-semibold text-ink">{item.name}</span>
              {by && <span className="mt-0.5 block text-sm text-ink-soft">{by}</span>}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

export function HomeAudio({section, dictionary}: {section: Section<'audio'>; dictionary: Dictionary}) {
  const recording = section.recording;
  if (section.enabled === false || !recording?.url || !recording.title) return null;
  const {homeSections: t} = dictionary;
  return (
    <section aria-labelledby="home-audio" className="bg-teal-950 text-paper">
      <div className="container-site grid items-center gap-10 py-20 sm:py-24 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-16">
        {recording.artwork?.asset && (
          <div className="relative aspect-square w-40 overflow-hidden rounded-full ring-1 ring-gold-500/40 ring-offset-8 ring-offset-teal-950 md:w-full">
            <SanityImage image={{...recording.artwork, alt: ''}} ratio={1} sizes="18rem" />
          </div>
        )}
        <div className={`max-w-2xl ${recording.artwork?.asset ? '' : 'md:col-span-2'}`}>
          <SectionIntro id="home-audio" light eyebrow={section.eyebrow} heading={recording.title}
            intro={recording.context ? <p>{recording.context}</p> : null} />
          <audio controls preload="none" aria-label={recording.title} className="mt-8 w-full max-w-xl">
            <source src={recording.url} type={recording.mimeType ?? 'audio/mpeg'} />
          </audio>
          {recording.durationSeconds ? <p className="mt-3 text-sm text-paper/70">{t.duration}: {clock(recording.durationSeconds)}</p> : null}
          {recording.transcript && (
            <details className="group mt-6 max-w-xl text-paper/85">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-medium text-gold-200 [&::-webkit-details-marker]:hidden">
                {t.transcript}
                <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{recording.transcript}</p>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

const longDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

export function HomeBlog({section, posts, lang, dictionary}: Base & {section: Section<'blog'>; posts: BlogCard[]}) {
  if (section.enabled === false || !section.heading || !posts.length) return null;
  const {homeSections: t} = dictionary;
  return (
    <section aria-labelledby="home-blog" className="container-site py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionIntro id="home-blog" heading={section.heading} intro={section.intro ? <p>{section.intro}</p> : null} />
        <MoreLink href={localizedHref(lang, '/blog')}>{t.allPosts}</MoreLink>
      </div>
      <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
        {posts.map((post) => (
          <li key={post._id} className="group relative flex flex-col">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-stone">
              <SanityImage image={post.cover && {...post.cover, alt: photoAlt(post.cover, post.title ?? '')}} ratio={3 / 2}
                sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <p className="mt-5 flex flex-wrap gap-x-2 text-sm text-ink-soft">
              {post.kind && <span className="font-semibold uppercase tracking-[0.14em] text-teal-700">{t.kinds[post.kind]}</span>}
              {post.publishedAt && <time dateTime={post.publishedAt}>{longDate(post.publishedAt, lang)}</time>}
              {post.textLength ? <span>· {t.readingTime.replace('{minutes}', String(readingMinutes(post.textLength)))}</span> : null}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-snug text-teal-900">
              <Link href={localizedHref(lang, `/blog/${post.slug}`)} className="after:absolute after:inset-0 group-hover:text-teal-700">{post.title}</Link>
            </h3>
            {post.excerpt && <p className="mt-2 line-clamp-3 leading-relaxed text-ink-soft">{post.excerpt}</p>}
            {post.author?.name && <p className="mt-4 text-sm text-ink">{post.author.name}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function aboutVideo(video: Section<'about'>['video'], fallbackTitle: string): FacadeVideo | null {
  const title = video?.title ?? fallbackTitle;
  const id = video?.provider === 'youtube' ? youtubeId(video.url) : null;
  if (id) return {provider: 'youtube', id, title};
  if (video?.provider === 'file' && video.file) return {provider: 'file', src: video.file, title};
  return null;
}

export function HomeAbout({section, lang, dictionary, contact}: Base & {section: Section<'about'>; contact: Contact}) {
  if (section.enabled === false || !section.heading || !section.poster?.asset) return null;
  return (
    <section id={aboutAnchor} aria-labelledby="home-about" className="scroll-mt-header border-t border-line bg-stone">
      <div className="container-site grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionIntro id="home-about" heading={section.heading}
            intro={section.body?.length ? <PortableText value={section.body} components={portableText} /> : null} />
          <div className="mt-8">
            <LinkButton link={section.cta} lang={lang} contact={contact} className="btn btn-primary" />
          </div>
        </div>
        <div className="lg:col-span-7">
          <VideoFacade
            poster={{...section.poster, alt: section.poster.alt ?? section.heading}}
            video={aboutVideo(section.video, section.heading)}
            playLabel={dictionary.homeSections.playVideo}
            sizes="(max-width: 1024px) 100vw, 44rem"
          />
        </div>
      </div>
    </section>
  );
}
