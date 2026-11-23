import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt, subject} from '@/lib/alt';
import {craftMetal, tileMeta, type WorkLike} from '@/lib/works';
import type {SanityImageValue} from '@/sanity/image';

/** A work as the Works page sends it to the browser. */
export type BrowserWork = WorkLike & {href: string; image: (SanityImageValue & {width?: number | null; height?: number | null}) | null};

const metalBar = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt'} as const;

/**
 * Works wall tile v6.3b (components.md "Works wall · v6.3b"): one 4:5 photo,
 * flat, no text on the wall. Hover / keyboard focus zooms the photo and fades
 * in the parish with "craft · place · year" on a teal-night gradient (CSS
 * only, none on touch screens). The link carries the same words for screen
 * readers and opens the Project panel.
 */
export function WorkTile({work, countries, priority = false}: {
  work: BrowserWork;
  countries: Record<string, string>;
  priority?: boolean;
}) {
  const meta = tileMeta(work, countries);
  const alt = work.image ? photoAlt(work.image, subject(work.title, work.location?.locality)) : '';
  return (
    <Link href={work.href} scroll={false} aria-haspopup="dialog" aria-label={[work.title, meta].filter(Boolean).join(', ')}
      className="ww-tile">
      <SanityImage image={work.image && {...work.image, alt}} cover priority={priority}
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 34vw, 50vw" />
      <span aria-hidden="true" className="ww-ov">
        <i className={`mb-2.5 block h-[3px] w-[22px] rounded-[2px] ${metalBar[craftMetal(work.craft)]}`} />
        <b className="block font-display text-[1.625rem] font-semibold leading-[1.12]">{work.title}</b>
        <span className="mt-1 block truncate text-caption leading-[1.4] text-[#d3e2de]">{meta}</span>
      </span>
    </Link>
  );
}
