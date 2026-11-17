import Link from 'next/link';
import type {ReactNode} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {Metal} from '@/lib/shell';
import type {SanityImageValue} from '@/sanity/image';

/**
 * Story hero v6.2, the one hero of every service page (boards V6Clopotar…,
 * V6ClopoteCuJug, V6ServicePolicandre …; components.md "Story hero"):
 * breadcrumb (+ an optional slot, the bell type switch) → split grid: H1 in the
 * craft's metal + teal italic line + lead + "Pe scurt" ×3 | main photo with two
 * framed insets from the page's own story. No buttons or links in the hero;
 * the one exception is a photo control (Mărește, Urmăriți filmul, Priviți de
 * aproape) top-right on the photo. Insets are not links and sit over beams,
 * sky or floor, never over the subject. Phones: text, photo, insets over its
 * bottom edge, then Pe scurt.
 */

export type Crumb = {label: string; href?: string | null};
export type HeroInset = {image: SanityImageValue | null; title: string; line?: string | null};
export type HeroFact = {figure: string; line: string};

const metalWord = {gold: 'mw-gold', bronze: 'mw-bronze', gilt: 'mw-gilt'} as const;

export function Breadcrumb({items, label}: {items: Crumb[]; label: string}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2.5 text-caption text-ink-soft">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2.5">
              {last || !item.href
                ? <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink' : undefined}>{item.label}</span>
                : <Link href={item.href} className="inline-flex min-h-8 items-center hover:underline hover:underline-offset-4">{item.label}</Link>}
              {last ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Styles for the hero's photo control (a glass pill, top-right on the photo). */
export const photoControlClass =
  'glass-light absolute right-4 top-4 z-[1] inline-flex h-11 items-center gap-2 rounded-pill px-4.5 text-ui font-semibold text-ink shadow-e1 hover:bg-white';

function Inset({inset, className}: {inset: HeroInset; className: string}) {
  return (
    <figure className={`pointer-events-none absolute z-[2] m-0 rounded-[14px] bg-white px-[5px] pt-[5px] shadow-e3 md:rounded-image md:px-1.5 md:pt-1.5 ${className}`}>
      <span className="relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-band md:rounded-[11px]">
        <SanityImage image={inset.image} ratio={3 / 2} sizes="244px" />
      </span>
      <figcaption className="px-1 pb-2 pt-[7px] text-[0.75rem] leading-[1.3] text-ink-soft md:px-1.5 md:pb-2.5 md:pt-[9px] md:text-[0.8125rem]">
        <b className="block text-[0.8125rem] font-semibold text-ink md:text-caption">{inset.title}</b>
        {inset.line}
      </figcaption>
    </figure>
  );
}

export function StoryHero({crumbs, crumbLabel, slot, title, metal, subline, lead, factsLabel, facts, photo, photoRatio = 4 / 3, insets, control, long = false}: {
  crumbs: Crumb[];
  crumbLabel: string;
  /** Between the breadcrumb and the grid: the bell pages' type switch. */
  slot?: ReactNode;
  title: string;
  metal: Metal;
  subline?: string | null;
  lead?: string | null;
  /** "Pe scurt". */
  factsLabel: string;
  facts: HeroFact[];
  photo: SanityImageValue | null;
  /** 4:3 by default; Clopotar 16:10, La comandă (the 3D plate) 5:7. */
  photoRatio?: number;
  insets: [HeroInset, HeroInset] | [];
  /** One photo control (client component), styled with photoControlClass. */
  control?: ReactNode;
  /** Long single words (Recondiționare, Automatizări) take a smaller H1. */
  long?: boolean;
}) {
  const [first, second] = insets;
  const factList = facts.length ? (
    <div className="mt-36 max-w-[540px] px-5 md:px-0 lg:mt-8">
      <p className="text-caption font-semibold text-ink-soft md:text-meta">{factsLabel}</p>
      <ul className="mt-3 border-t border-hairline">
        {facts.slice(0, 3).map((fact) => (
          <li key={fact.figure} className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 border-b border-hairline py-[11px] md:grid-cols-[104px_minmax(0,1fr)] md:gap-4 md:py-3">
            <b className="whitespace-nowrap font-display text-[1.375rem] font-semibold leading-none text-teal-900 md:text-[1.75rem]">{fact.figure}</b>
            <span className="text-meta leading-[1.45] text-ink-soft md:text-base">{fact.line}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <section className="m-hero pb-18 pt-7 lg:pb-30 lg:pt-11">
      <div className="mx-auto max-w-(--container-page) md:px-6">
        <div className="px-5 md:px-0">
          <Breadcrumb items={crumbs} label={crumbLabel} />
          {slot}
        </div>
        <div className="mt-4 flex flex-col lg:mt-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-20">
          {/* Phones: text, photo, Pe scurt (the left column dissolves into the flex order). */}
          <div className="contents lg:block">
            <div className="order-1 px-5 md:px-0">
              <h1 className={`display leading-[.95] ${long ? 'text-[clamp(3.25rem,6vw,5.5rem)]' : 'text-[clamp(3.875rem,7vw,6.5rem)]'}`}>
                <span className={`mw ${metalWord[metal]}`}>{title}</span>
                {subline ? <span className="mt-2.5 block text-[1.625rem] italic leading-[1.15] text-teal-700 md:mt-3.5 md:text-[.42em]">{subline}</span> : null}
              </h1>
              {lead ? <p className="mt-5 max-w-[540px] text-[1.0625rem] leading-[1.6] text-ink-soft md:mt-7 md:text-lead">{lead}</p> : null}
            </div>
            <div className="order-3">{factList}</div>
          </div>
          <div className="relative order-2 mx-3 mt-8 md:mx-0 lg:mt-0">
            <div className="relative overflow-hidden rounded-[24px] bg-band shadow-e3" style={{aspectRatio: photoRatio}}>
              <SanityImage image={photo} cover priority sizes="(max-width: 1024px) 100vw, 600px" />
              {control}
            </div>
            {first ? <Inset inset={first} className="-bottom-32 -left-1 w-[168px] lg:-left-16 lg:-top-12 lg:bottom-auto lg:w-[200px]" /> : null}
            {second ? <Inset inset={second} className="-bottom-26 right-1 w-[156px] lg:-bottom-14 lg:-right-10 lg:w-[220px]" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
