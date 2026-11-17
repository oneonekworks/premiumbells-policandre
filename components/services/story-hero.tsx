import Link from 'next/link';
import type {ReactNode} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {SanityImageValue} from '@/sanity/image';

/**
 * Story hero v6.2, the one hero of every service page (boards V6Clopotar…,
 * V6ClopoteCuJug, V6ServicePolicandre …; components.md "Story hero"):
 * breadcrumb (+ an optional slot, the bell type switch) → split grid: H1 in the
 * craft's metal + teal italic line + lead + "Pe scurt" ×3 | main photo with two
 * framed insets from the page's own story. No buttons or links in the hero;
 * the one exception is a photo control (Mărește, Urmăriți filmul, Priviți de
 * aproape): top-right on the photo (phones too: the boards put it bottom-right, under the second inset). Insets are not
 * links and sit over beams, sky or floor, never over the subject. Phones: text,
 * photo (300 tall), insets over its bottom edge, then Pe scurt.
 */

export type Crumb = {label: string; href?: string | null};
export type HeroInset = {image: SanityImageValue | null; title: string; line?: string | null};
export type HeroFact = {figure: string; line: string};
/** The craft metals plus graphite (Fără balans, Clopotar electronic). */
export type HeroMetal = 'gold' | 'bronze' | 'gilt' | 'graphite';

export const metalWord: Record<HeroMetal, string> = {gold: 'mw-gold', bronze: 'mw-bronze', gilt: 'mw-gilt', graphite: 'mw-graphite'};
export const metalBar: Record<HeroMetal, string> = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt', graphite: 'bar-graphite'};

/** H1 sizes from the boards: phone px, then the desktop clamp. */
const titleSizes = {
  default: 'text-[4.75rem] lg:text-[clamp(4rem,7vw,6.5rem)]',      // Policandre, Uși (76)
  wide: 'text-[4.5rem] lg:text-[clamp(4rem,7vw,6.5rem)]',          // Iconostase (72)
  words: 'text-[3.875rem] lg:text-[clamp(4rem,7vw,6.5rem)]',       // Clopote cu jug, Clopotar electronic (62)
  large: 'text-[4.75rem] lg:text-[clamp(5rem,9vw,8.25rem)]',        // La comandă (132)
  long: 'text-[3.625rem] lg:text-[clamp(3.75rem,6.2vw,5.5rem)]',    // Recondiționare (58 / 88)
  long2: 'text-[3.875rem] lg:text-[clamp(3.75rem,6.4vw,5.75rem)]',  // Automatizări (62 / 92)
} as const;
export type TitleSize = keyof typeof titleSizes;

export function Breadcrumb({items, label}: {items: Crumb[]; label: string}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2.5 text-caption text-ink-soft">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          // Phones drop "Acasă" (boards: "Servicii / Policandre").
          return (
            <li key={`${item.label}-${index}`} className={`flex items-center gap-2.5 ${index === 0 && items.length > 2 ? 'max-md:hidden' : ''}`}>
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

/** Styles for the hero's photo control (a glass pill on the photo). */
export const photoControlClass =
  'glass-light absolute right-3 top-3 z-[1] inline-flex h-11 items-center gap-1.5 rounded-pill px-3.5 text-caption font-semibold text-ink shadow-e1 hover:bg-white lg:right-4 lg:top-4 lg:gap-2 lg:px-4.5 lg:text-ui';

function Inset({inset, className}: {inset: HeroInset; className: string}) {
  return (
    <figure className={`pointer-events-none absolute z-[2] m-0 rounded-[14px] bg-white px-[5px] pt-[5px] shadow-e3 lg:rounded-image lg:px-1.5 lg:pt-1.5 ${className}`}>
      <span className="relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-band lg:rounded-[11px]">
        {inset.image?.asset ? <SanityImage image={inset.image} ratio={3 / 2} sizes="244px" />
          : <span className="grid h-full place-items-center bg-teal-tint text-[0.75rem] text-ink-soft">[fotografie]</span>}
      </span>
      <figcaption className="px-1 pb-2 pt-[7px] text-[0.75rem] leading-[1.3] text-ink-soft lg:px-1.5 lg:pb-2.5 lg:pt-[9px] lg:text-[0.8125rem]">
        <b className="block text-[0.8125rem] font-semibold text-ink lg:text-caption">{inset.title}</b>
        {inset.line}
      </figcaption>
    </figure>
  );
}

export function StoryHero({
  crumbs, crumbLabel, slot, title, metal, subline, sublineEm = 0.36, titleSize = 'default', lead, factsLabel, facts, factsAsStats = false,
  photo, photoRatio = 4 / 3, plate = false, place, insets, control, wide = false, tight = false,
}: {
  crumbs: Crumb[];
  crumbLabel: string;
  /** Between the breadcrumb and the grid: the bell pages' type switch. */
  slot?: ReactNode;
  title: string;
  metal: HeroMetal;
  subline?: string | null;
  /** The teal italic line as a fraction of the H1 (desktop); boards use .36, .4 or .42. */
  sublineEm?: number;
  titleSize?: TitleSize;
  lead?: string | null;
  /** "Pe scurt". */
  factsLabel: string;
  facts: HeroFact[];
  /** Policandre on phones: the facts as a stats list (figure 48) without the label. */
  factsAsStats?: boolean;
  photo: SanityImageValue | null;
  /** 4:3 by default; Clopotar 16:10, La comandă (the 3D plate) 5:7. */
  photoRatio?: number;
  /** The photo is a drawing on a white plate, shown whole (La comandă). */
  plate?: boolean;
  /** Glass label on the photo, bottom-left (Uși: the church). */
  place?: string | null;
  insets: [HeroInset, HeroInset] | [];
  /** One photo control (client component), styled with photoControlClass. */
  control?: ReactNode;
  /** La comandă: 7fr | 5fr, gap 64. */
  wide?: boolean;
  /** 112 below the hero instead of 128 (La comandă, Clopotar). */
  tight?: boolean;
}) {
  const [first, second] = insets;
  const factList = facts.length ? (
    <div className={`mt-36 px-5 md:px-0 lg:mt-8 lg:max-w-[540px] ${factsAsStats ? 'max-lg:mt-36' : ''}`}>
      <p className={`text-caption font-semibold text-ink-soft lg:text-meta ${factsAsStats ? 'max-lg:sr-only' : ''}`}>{factsLabel}</p>
      <ul className={`mt-3 border-t border-hairline ${factsAsStats ? 'max-lg:mt-8 max-lg:border-t-0' : ''}`}>
        {facts.slice(0, 3).map((fact) => (
          <li key={fact.figure} className={`grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 border-b border-hairline py-[11px] lg:grid-cols-[104px_minmax(0,1fr)] lg:gap-4 lg:py-3 ${
            factsAsStats ? 'max-lg:grid-cols-[84px_minmax(0,1fr)] max-lg:items-center max-lg:gap-4 max-lg:border-b-0 max-lg:py-3.5 max-lg:[&+li]:border-t max-lg:[&+li]:border-hairline' : ''
          }`}>
            <b className={`whitespace-nowrap font-display font-semibold leading-none text-teal-900 lg:text-[1.75rem] ${factsAsStats ? 'text-[3rem] leading-[.9] max-lg:text-ink' : 'text-[1.375rem]'}`}>{fact.figure}</b>
            <span className="text-meta leading-[1.45] text-ink-soft lg:text-base">{fact.line}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <section className={`m-hero pb-18 pt-7 lg:pt-11 ${tight ? 'lg:pb-28' : 'lg:pb-32'}`}>
      <div className="mx-auto max-w-(--container-page) md:px-6">
        <div className="px-5 md:px-0">
          <Breadcrumb items={crumbs} label={crumbLabel} />
          {slot}
        </div>
        <div className={`flex flex-col lg:grid lg:items-center ${wide ? 'mt-4 lg:mt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-16' : 'mt-4 lg:mt-8 lg:grid-cols-2 lg:gap-x-20'}`}>
          {/* Phones: text, photo, Pe scurt (the left column dissolves into the flex order). */}
          <div className="contents lg:block">
            <div className="order-1 px-5 md:px-0">
              <h1 className={`display leading-[.95] ${titleSizes[titleSize]}`} style={{['--sub' as string]: `${sublineEm}em`}}>
                <span className={`mw ${metalWord[metal]}`}>{title}</span>
                {subline ? <span className="mt-2.5 block text-[1.625rem] italic leading-[1.15] text-teal-700 lg:mt-3.5 lg:text-(length:--sub)">{subline}</span> : null}
              </h1>
              {lead ? <p className={`mt-5 text-[1.0625rem] leading-[1.6] text-ink-soft md:text-lead ${wide ? 'lg:mt-8 lg:max-w-[560px]' : 'lg:mt-7 lg:max-w-[540px]'}`}>{lead}</p> : null}
            </div>
            <div className="order-3">{factList}</div>
          </div>
          <div className="relative order-2 mx-3 mt-8 md:mx-0 lg:mt-0">
            <div className={`relative overflow-hidden rounded-[24px] shadow-e3 max-lg:h-[300px] lg:aspect-(--ratio) ${plate ? 'bg-white p-3 lg:p-4' : 'bg-band'}`}
              style={{['--ratio' as string]: String(photoRatio)}}>
              {plate ? (
                <span className="relative block size-full">
                  <SanityImage image={photo} priority sizes="(max-width: 1024px) 100vw, 480px" />
                </span>
              ) : <SanityImage image={photo} cover priority sizes="(max-width: 1024px) 100vw, 600px" />}
              {place ? (
                <span className="glass-light absolute left-3 top-3 inline-flex h-[34px] items-center rounded-pill px-3 text-[0.8125rem] font-medium text-ink lg:bottom-4 lg:left-4 lg:top-auto lg:h-10 lg:px-4 lg:text-caption">{place}</span>
              ) : null}
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
