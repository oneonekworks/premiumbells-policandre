import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {numberLocale} from '@/components/services/shared';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {readingMinutes, type BlogCard} from '@/sanity/blog';
import {longDate, postPath} from './post-card';

// Post card · with byline (v6.2; boards V6HomeDesktopB, V6HomeMobileB,
// V6Blog): a break-out card with the text left-aligned: kind · date · time,
// the serif title (3 lines), the excerpt (2 lines), then the author with a
// round portrait. The tray is band-tinted on white sections. Used on the
// homepage journal, the Blog list and "Citiți și".

export const shortDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

export function BylineCard({post, lang, dictionary, className = '', sizes = '(min-width: 1024px) 33vw, 300px', heading: Heading = 'h3'}: {
  post: BlogCard;
  lang: Lang;
  dictionary: Dictionary;
  className?: string;
  sizes?: string;
  heading?: 'h2' | 'h3';
}) {
  if (!post.slug) return null;
  const kind = post.kind ? dictionary.homeSections.kinds[post.kind] : null;
  const author = post.author;

  return (
    <Link href={localizedHref(lang, postPath(post.slug))}
      className={`post-card group relative flex flex-col px-2.5 pb-5 text-ink outline-offset-8 md:px-3.5 md:pb-7 ${className}`}>
      <span aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-11 rounded-card border border-white/90 bg-band/80 transition-[background-color,box-shadow] duration-(--duration-card) ease-light group-hover:bg-white group-hover:shadow-e1 group-focus-visible:bg-white group-focus-visible:shadow-e1 md:top-16 md:rounded-tray" />
      <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.125rem] bg-band shadow-e2 transition-[translate,box-shadow] duration-(--duration-card) ease-light group-hover:-translate-y-3 group-hover:shadow-e3 group-focus-visible:-translate-y-3 group-focus-visible:shadow-e3 group-active:-translate-y-1 motion-reduce:transform-none md:rounded-card">
        <span className="absolute inset-0 transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.04] motion-reduce:transform-none">
          <SanityImage image={post.cover && {...post.cover, alt: ''}} ratio={4 / 3} sizes={sizes} />
        </span>
      </span>
      <span className="relative mt-4 block px-1 text-caption text-ink-soft md:mt-5.5 md:px-1.5 md:text-meta">
        {kind && <b className="font-semibold text-teal-700">{kind}</b>}
        {post.publishedAt && <>{kind ? ' · ' : ''}<time dateTime={post.publishedAt} title={longDate(post.publishedAt, lang)}>{shortDate(post.publishedAt, lang)}</time></>}
        {post.textLength ? ` · ${readingMinutes(post.textLength)} min` : null}
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
          <span className="relative size-8 flex-none overflow-hidden rounded-pill bg-band shadow-[0_0_0_2px_#fff,var(--shadow-e1)] md:size-9">
            <SanityImage image={author.portrait && {...author.portrait, alt: ''}} ratio={1} sizes="36px" />
          </span>
          <span>
            <b className="block text-[0.9375rem] font-semibold leading-[1.3]">{author.name}</b>
            {author.role && <small className="block text-[0.8125rem] leading-[1.35] text-ink-soft">{author.role}</small>}
          </span>
        </span>
      )}
    </Link>
  );
}
