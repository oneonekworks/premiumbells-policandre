import Link from 'next/link';
import type {ReactNode} from 'react';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt, subject} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {specText} from '@/lib/projects';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {ProjectCard} from '@/sanity/portfolio';
import {projectPath} from '@/sanity/portfolio-routes';
import type {SanityImageValue} from '@/sanity/image';
import {metalBar, type HeroMetal} from './story-hero';

// Pieces shared by the v6 service pages (boards V6Service*, V6Clopote*,
// V6Clopotar*, V6Automatizari*): the section frame, the section head, the
// numbered steps, the quiet thumbnail links ("nudges") and the works cards.

/** `.sec` on the boards: 136 above and below (88 on phones), white or band. */
export function Section({ground, id, className = '', children}: {
  ground: 'white' | 'band';
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${ground === 'band' ? 'm-band' : 'm-white on-white'} py-22 lg:py-34 ${className}`}>
      {children}
    </section>
  );
}

/** `.wrap`: 1248 with 24 gutters (20 on phones). */
export const wrap = 'mx-auto max-w-(--container-page) px-5 md:px-6';

/** Kicker + H2 (+ a line); `aside` sits right of it on desktop (a link or a filter). */
export function SectionHead({kicker, title, lead, aside, children, className = '', onDark = false}: {
  kicker?: string | null;
  title: string;
  lead?: string | null;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div className={`grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end ${className}`}>
      <div>
        {kicker ? <p className={`kicker mb-3 md:mb-4 ${onDark ? 'text-on-dark-soft' : ''}`}>{kicker}</p> : null}
        <h2 className="section-title max-lg:text-[2.5rem]">{title}</h2>
        {lead ? <p className={`mt-3 text-caption leading-[1.5] md:mt-4 md:text-body ${onDark ? 'text-on-dark-soft' : 'text-ink-soft'}`}>{lead}</p> : null}
        {children}
      </div>
      {aside ? <div className="max-lg:hidden">{aside}</div> : null}
    </div>
  );
}

export type Step = {title: string; text?: string | null};

/** Numbered steps (Cum lucrăm): 4 columns with a metal bar; phones, rows with the number left. */
export function Steps({steps, metal, className = ''}: {steps: Step[]; metal: HeroMetal; className?: string}) {
  return (
    <ol className={`mt-8 grid gap-0 lg:mt-16 lg:gap-10 ${steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} ${className}`}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-t border-hairline py-5.5 lg:block lg:border-0 lg:py-0 lg:pt-7">
          <i aria-hidden="true" className={`absolute left-0 top-[-2px] h-[3px] w-7 rounded-[2px] lg:top-0 ${metalBar[metal]}`} />
          <b className="font-display text-[3.25rem] font-semibold leading-[.85] lg:block lg:text-[4.5rem] lg:leading-[.9]">{index + 1}</b>
          <div>
            <h3 className="font-display text-2xl font-semibold leading-[1.1] lg:mt-4 lg:text-[1.75rem]">{step.title}</h3>
            {step.text ? <p className="mt-1.5 text-meta leading-[1.5] text-ink-soft lg:mt-2 lg:text-base lg:leading-[1.55]">{step.text}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export type Nudge = {href: string; image: SanityImageValue | null; question: string; name: string; why?: string | null; contain?: boolean};

/** Thumbnail link (.nudge): quiet at rest, white + e1 on hover; the whole row is the link. */
export function Nudges({items, className = ''}: {items: Nudge[]; className?: string}) {
  if (!items.length) return null;
  return (
    <div className={`flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-4 ${className}`}>
      {items.map((item) => (
        <Link key={item.href} href={item.href}
          className="flex items-center gap-3.5 rounded-[24px] p-2.5 text-left text-ink transition-[background-color,box-shadow] duration-(--duration-fade) ease-(--ease-light) hover:bg-white hover:shadow-e1 focus-visible:bg-white focus-visible:shadow-e1 lg:inline-flex lg:gap-6 lg:py-3 lg:pl-3 lg:pr-8">
          <span className="relative block h-[72px] w-24 flex-none overflow-hidden rounded-[14px] bg-white shadow-e1 lg:h-24 lg:w-32 lg:rounded-image">
            <SanityImage image={item.image && {...item.image, alt: ''}} cover={!item.contain} sizes="128px" className={item.contain ? 'p-1' : ''} />
          </span>
          <span className="block">
            <span className="block text-caption text-ink-soft lg:text-meta">{item.question}</span>
            <span className="mt-0.5 block font-display text-2xl font-semibold leading-[1.1] lg:text-[1.875rem]">{item.name}</span>
            {item.why ? <span className="mt-0.5 block text-caption leading-[1.45] text-ink-soft lg:mt-1 lg:text-base">{item.why}</span> : null}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** "Dej, Cluj · 3 nivele · 2023": place, the first specification, year. */
export function workLine(work: Pick<ProjectCard, 'location' | 'year' | 'displayDate' | 'keySpec'>, countries: Dictionary['countries']) {
  const place = [work.location?.locality, work.location?.county].filter(Boolean).join(', ');
  const country = work.location?.country && work.location.country !== 'RO' ? countries[work.location.country as keyof typeof countries] : null;
  const spec = specText(work.keySpec);
  return [place || country, spec, work.displayDate ?? work.year].filter(Boolean).join(' · ');
}

/**
 * Works as break-out cards (text left): 4 (or 3) columns on desktop, a swipe
 * rail of 280 cards on phones. Each opens the project.
 */
export function WorkCards({works, lang, categorySlug, metal, countries, columns = 4, hint}: {
  works: ProjectCard[];
  lang: Lang;
  categorySlug: string;
  metal: HeroMetal;
  countries: Dictionary['countries'];
  columns?: 3 | 4;
  /** "Vedeți lucrarea" glass hint on hover (cards that open the Project panel). */
  hint?: string;
}) {
  return (
    <div className={`-mx-5 mt-7 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] md:mx-0 md:px-0 lg:mt-16 lg:grid lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:p-0 ${columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {works.map((work) => (
        <Link key={work._id} href={localizedHref(lang, projectPath(categorySlug, work.slug ?? ''))} scroll={false}
          aria-haspopup={hint ? 'dialog' : undefined}
          className="bo bo-left group w-[280px] flex-none snap-start lg:w-auto">
          <span className="ph relative">
            <SanityImage image={work.coverImage && {...work.coverImage, alt: photoAlt(work.coverImage, subject(work.title, work.location?.locality))}}
              ratio={4 / 3} sizes="(max-width: 1024px) 280px, 300px" />
            {hint ? (
              <span className="glass-light pointer-events-none absolute bottom-3 left-3 inline-flex h-9 items-center rounded-pill px-3.5 text-caption font-semibold text-ink opacity-0 transition-opacity duration-(--duration-fade) group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:hidden">{hint}</span>
            ) : null}
          </span>
          <span className="tx">
            <i className={`bar ${metalBar[metal]}`} aria-hidden="true" />
            <b className="!text-2xl">{work.title}</b>
            <small>{workLine(work, countries)}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** The phone's full-width button under a rail ("Toate cele 11 lucrări"); desktop shows the link in the head. */
export function RailButton({href, label}: {href: string; label: string}) {
  return (
    <div className="mt-4 lg:hidden">
      <Link href={href} className="btn btn-primary w-full">{label}</Link>
    </div>
  );
}

export function HeadLink({href, label, onDark = false}: {href: string; label: string; onDark?: boolean}) {
  return <Link href={href} className={`text-link ${onDark ? '!text-teal-tint' : ''}`}>{label}</Link>;
}
