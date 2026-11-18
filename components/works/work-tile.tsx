import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt, subject} from '@/lib/alt';
import {captionLines, craftMetal, type TileShape, type WorkLike} from '@/lib/works';
import type {SanityImageValue} from '@/sanity/image';

/** A work as the Works page sends it to the browser. */
export type BrowserWork = WorkLike & {href: string; image: (SanityImageValue & {width?: number | null; height?: number | null}) | null};

// Grid spans per shape. Phones (2 columns): F full width × 2 rows, FW full
// width, T tall. From 768 (4 columns): L 2 × 2, W 2 × 1, T 1 × 2.
const phoneSpan: Record<TileShape, string> = {
  F: 'col-span-2 row-span-2', FW: 'col-span-2 row-span-1', T: 'col-span-1 row-span-2',
  S: 'col-span-1 row-span-1', L: 'col-span-1 row-span-1', W: 'col-span-1 row-span-1',
};
const desktopSpan: Record<TileShape, string> = {
  L: 'md:col-span-2 md:row-span-2', W: 'md:col-span-2 md:row-span-1', T: 'md:col-span-1 md:row-span-2',
  S: 'md:col-span-1 md:row-span-1', F: 'md:col-span-1 md:row-span-1', FW: 'md:col-span-1 md:row-span-1',
};
export const tileSpan = (shapes: {desktop: TileShape; phone: TileShape}) => `${phoneSpan[shapes.phone]} ${desktopSpan[shapes.desktop]}`;

const metalBar = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt'} as const;

/**
 * Project tile v6.2 (components.md "Project tile"): one tile = one work, the
 * caption always on (glass strip: metal bar, parish, craft · place · what ·
 * year), hover lifts −6 with e3 and the photo 1.03. Opens the Project panel.
 */
export function WorkTile({work, shapes, countries, and, priority = false, sizes}: {
  work: BrowserWork;
  shapes: {desktop: TileShape; phone: TileShape};
  countries: Record<string, string>;
  and: string;
  priority?: boolean;
  sizes: string;
}) {
  const lines = captionLines(work, countries, and);
  const featured = shapes.desktop === 'L';
  const bigPhone = shapes.phone === 'F' || shapes.phone === 'FW';
  const alt = work.image ? photoAlt(work.image, subject(work.title, work.location?.locality)) : '';
  return (
    <Link href={work.href} scroll={false} aria-haspopup="dialog"
      className={`wt group relative block overflow-hidden rounded-[14px] bg-band text-ink md:rounded-image ${tileSpan(shapes)}`}>
      <SanityImage image={work.image && {...work.image, alt}} cover sizes={sizes} priority={priority} className="wt-img" />
      <span className={`glass-light absolute bottom-2 left-2 max-w-[calc(100%-16px)] rounded-[10px] px-3 py-[9px] md:max-w-[calc(100%-20px)] md:rounded-caption md:py-3 md:pl-3.5 md:pr-4 ${
        featured ? 'md:bottom-5 md:left-5' : 'md:bottom-3 md:left-3'} ${shapes.phone === 'F' ? 'max-md:bottom-3 max-md:left-3 max-md:px-3.5 max-md:py-3' : ''}`}>
        <i aria-hidden="true" className={`mb-1.5 block h-[3px] w-[18px] rounded-[2px] md:mb-2 md:w-[22px] ${metalBar[craftMetal(work.craft)]}`} />
        <b className={`block font-display font-semibold leading-[1.1] ${shapes.phone === 'F' ? 'text-2xl' : 'text-[1.1875rem]'} ${featured ? 'md:text-[1.875rem]' : 'md:text-[1.375rem]'}`}>
          {work.title}
        </b>
        <span className="mt-px block text-caption leading-[1.35] text-ink-soft md:mt-0.5">
          <span className="md:hidden">{bigPhone ? lines.big : lines.short}</span>
          <span className="max-md:hidden">{lines.full}</span>
        </span>
      </span>
    </Link>
  );
}
