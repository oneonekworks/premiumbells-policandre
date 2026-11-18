import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {numberLocale} from '@/components/services/shared';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {readingMinutes, type BlogCard} from '@/sanity/blog';

// Post card · with byline (v6.2; boards V6HomeDesktopB, V6HomeMobileB,
// V6Blog, V6Article): a break-out card with the text left-aligned: kind ·
// date · time, the serif title (3 lines), the excerpt (2 lines), then the
// author with a round portrait. Without an author it is the compact card. The
// tray is band 80% on white sections (homepage) and white 55% on the band
// (Blog list, "Citiți și"). Also the meta line and the post addresses.

export const postPath = (slug: string) => `/blog/${slug}`;

export const longDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

export const shortDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

type Meta = Pick<BlogCard, 'kind' | 'publishedAt' | 'textLength'>;

/** "Articol · 17 feb. 2023 · 6 min": the kind in teal 600, the full date on hover. */
export function MetaLine({post, lang, dictionary}: {post: Meta; lang: Lang; dictionary: Dictionary}) {
  const kind = post.kind ? dictionary.homeSections.kinds[post.kind] : null;
  return (
    <>
      {kind && <b className="font-semibold text-teal-700">{kind}</b>}
      {post.publishedAt && <>{kind ? ' · ' : ''}<time dateTime={post.publishedAt} title={longDate(post.publishedAt, lang)}>{shortDate(post.publishedAt, lang)}</time></>}
      {post.textLength ? ` · ${readingMinutes(post.textLength)} min` : null}
    </>
  );
}

export function BylineCard({post, lang, dictionary, className = '', sizes = '(min-width: 1024px) 33vw, 300px', heading: Heading = 'h3', ground = 'white'}: {
  post: BlogCard;
  lang: Lang;
  dictionary: Dictionary;
  className?: string;
  sizes?: string;
  heading?: 'h2' | 'h3';
  /** The section the card sits on: the tray is the other ground, translucent. */
  ground?: 'white' | 'band';
}) {
  if (!post.slug) return null;
  const author = post.author;

  return (
    <Link href={localizedHref(lang, postPath(post.slug))}
      className={`post-card group relative flex flex-col px-2.5 pb-5 text-ink outline-offset-8 md:px-3.5 md:pb-7 ${className}`}>
      <span aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 top-11 rounded-card border border-white/90 transition-[background-color,box-shadow] duration-(--duration-card) ease-light group-hover:bg-white group-hover:shadow-e1 group-focus-visible:bg-white group-focus-visible:shadow-e1 md:top-16 md:rounded-tray ${ground === 'band' ? 'bg-white/55' : 'bg-band/80'}`} />
      <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.125rem] bg-band shadow-e2 transition-[translate,box-shadow] duration-(--duration-card) ease-light group-hover:-translate-y-3 group-hover:shadow-e3 group-focus-visible:-translate-y-3 group-focus-visible:shadow-e3 group-active:-translate-y-1 motion-reduce:transform-none md:rounded-card">
        <span className="absolute inset-0 transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.04] motion-reduce:transform-none">
          <SanityImage image={post.cover && {...post.cover, alt: ''}} ratio={4 / 3} sizes={sizes} />
        </span>
      </span>
      <span className="relative mt-4 block px-1 text-caption text-ink-soft md:mt-5.5 md:px-1.5 md:text-meta">
        <MetaLine post={post} lang={lang} dictionary={dictionary} />
      </span>
      <Heading className="text-clamp-3 relative mt-2 px-1 font-display text-[1.625rem] font-semibold leading-[1.12] tracking-[-0.01em] decoration-teal-700 decoration-1 underline-offset-[6px] group-hover:underline group-focus-visible:underline md:mt-2.5 md:px-1.5 md:text-[1.875rem]">
        {post.title}
      </Heading>
      {post.excerpt && (
        <span className="text-clamp-2 relative mb-4.5 mt-2 px-1 text-[0.9375rem] leading-[1.55] text-ink-soft md:mb-6 md:mt-3 md:px-1.5 md:text-base md:leading-[1.6]">
          {post.excerpt}
        </span>
      )}
      {author?.name && (
        <span className="relative mx-1 mt-auto flex items-center gap-2.5 border-t border-hairline pt-3.5 md:mx-1.5 md:gap-3 md:pt-4.5">
          <Avatar author={author} />
          <span>
            <b className="block text-[0.9375rem] font-semibold leading-[1.3]">{author.name}</b>
            {author.role && <small className="block text-[0.8125rem] leading-[1.35] text-ink-soft">{author.role}</small>}
          </span>
        </span>
      )}
    </Link>
  );
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((word) => word[0]).filter((letter) => /\p{Lu}/u.test(letter)).slice(-2).join('');

/** Round portrait (36, 32 on phones) with a white ring; the initials when there is no photo. */
export function Avatar({author}: {author: NonNullable<BlogCard['author']>}) {
  return (
    <span aria-hidden="true"
      className="relative grid size-8 flex-none place-items-center overflow-hidden rounded-pill bg-teal-tint text-[0.75rem] font-semibold text-teal-900 shadow-[0_0_0_2px_#fff,var(--shadow-e1)] md:size-9 md:text-[0.8125rem]">
      {author.portrait?.asset
        ? <SanityImage image={{...author.portrait, alt: ''}} ratio={1} sizes="36px" />
        : initials(author.name ?? '')}
    </span>
  );
}
