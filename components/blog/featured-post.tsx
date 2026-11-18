import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import type {FilmVideo} from '@/components/site/film-layer';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {youtubeId} from '@/lib/video';
import type {BlogListPost, BlogStory} from '@/sanity/blog';
import {Avatar, MetaLine, postPath} from './byline-card';
import {FilmPill} from './film-pill';

// Featured post · story preview (v6.2; boards V6Blog, V6BlogMobile): the
// newest post, condensed so it can be read without opening it. Cover 7/12
// with two framed inset photos from the story (top-right, bottom-left;
// phones: both over the cover's bottom edge) and a film pill | kind · date ·
// time, the title (the one link, stretched over the block), the excerpt,
// Pe scurt ×3 and the byline. Hover: the cover lifts 6, the photo grows
// 1.03, the insets drift apart 10, the title underlines. Without the story
// fields it is the plain featured layout: cover | text (and the excerpt on
// phones too).

function storyVideo(video: BlogStory['video']): FilmVideo | null {
  if (!video) return null;
  const title = video.title ?? '';
  const id = video.provider === 'youtube' ? youtubeId(video.url) : null;
  if (id) return {provider: 'youtube', id, title};
  return video.provider === 'file' && video.file ? {provider: 'file', src: video.file, title} : null;
}

export function FeaturedPost({post, lang, dictionary}: {post: BlogListPost; lang: Lang; dictionary: Dictionary}) {
  if (!post.slug) return null;
  const t = dictionary.blog;
  const title = post.title ?? '';
  const insets = (post.story?.insets ?? []).filter((inset) => inset.image?.asset);
  const story = insets.length === 2 ? insets : [];
  const highlights = (post.story?.highlights ?? []).filter((row) => row.figure && row.line).slice(0, 3);
  const video = storyVideo(post.story?.video ?? null);
  const rich = story.length > 0 || highlights.length > 0;
  const author = post.author;

  return (
    <article className={`fp group relative px-3 text-ink lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:px-0 ${rich ? 'lg:gap-18' : 'lg:gap-14'}`}>
      <div className={`relative ${story.length ? 'mb-21 lg:mb-0' : ''}`}>
        <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-band shadow-e3 transition-transform duration-(--duration-card) ease-light lg:rounded-panel lg:group-hover:-translate-y-1.5 motion-reduce:still">
          <span className="absolute inset-0 transition-transform duration-500 ease-light lg:group-hover:scale-[1.03] motion-reduce:still">
            <SanityImage image={post.cover && {...post.cover, alt: photoAlt(post.cover, title)}} ratio={4 / 3} priority
              sizes="(min-width: 1440px) 700px, (min-width: 1024px) 50vw, 100vw" />
          </span>
        </span>
        {story.map((inset, index) => (
          <figure key={inset._key}
            className={`pointer-events-none absolute z-[1] m-0 rounded-[14px] bg-white px-[5px] pt-[5px] shadow-e3 transition-transform duration-[420ms] ease-light motion-reduce:still lg:rounded-image lg:px-1.5 lg:pt-1.5 ${index === 0
              ? 'bottom-[-64px] right-1 w-40 lg:bottom-auto lg:right-[-28px] lg:top-[-48px] lg:w-46 xl:w-59 lg:group-hover:translate-x-2.5 lg:group-hover:-translate-y-2.5'
              : 'bottom-[-84px] left-[-4px] w-44 lg:bottom-[-56px] lg:left-[-12px] lg:w-53 xl:w-68 lg:group-hover:-translate-x-2.5 lg:group-hover:translate-y-2.5 2xl:left-[-40px]'}`}>
            <span className="relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-band lg:rounded-[11px]">
              <SanityImage image={{...inset.image!, alt: photoAlt(inset.image!, inset.title ?? title)}} ratio={3 / 2} sizes="272px" />
            </span>
            <figcaption className="px-1 pb-2 pt-[7px] text-[0.75rem] leading-[1.3] text-ink-soft lg:px-1.5 lg:pb-2.5 lg:pt-[9px] lg:text-[0.8125rem]">
              <b className="block text-[0.8125rem] font-semibold text-ink lg:text-caption">{inset.title}</b>
              {inset.line}
            </figcaption>
          </figure>
        ))}
        {video && <FilmPill video={video} label={t.playFilm.replace('{title}', video.title || title)} text={video.title || t.film}
          short={t.film} close={t.closeFilm} />}
      </div>

      <div className={`px-2 lg:px-0 ${story.length ? '' : 'mt-6 lg:mt-0'}`}>
        <p className="text-caption text-ink-soft lg:text-meta"><MetaLine post={post} lang={lang} dictionary={dictionary} /></p>
        <h2 className="mt-2.5 font-display text-[2rem] font-semibold leading-[1.12] lg:mt-3.5 lg:text-[2.625rem] lg:leading-[1.1]">
          <Link href={localizedHref(lang, postPath(post.slug))}
            className="underline decoration-transparent decoration-1 underline-offset-8 transition-[text-decoration-color] duration-(--duration-line) ease-light after:absolute after:inset-0 after:z-[2] after:rounded-[1.5rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus group-hover:decoration-teal-700 lg:after:rounded-panel lg:focus-visible:after:outline-offset-8">
            {title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className={`mt-4 text-[1.0625rem] leading-[1.6] text-ink-soft ${highlights.length ? 'mb-7 max-lg:hidden' : 'mb-0'}`}>{post.excerpt}</p>
        )}
        {highlights.length > 0 && (
          <div className="mt-5.5 lg:mt-0">
            <p className="text-caption font-semibold text-ink-soft lg:text-meta">{t.summary}</p>
            <ul className="mt-2.5 border-t border-hairline lg:mt-3">
              {highlights.map((row) => (
                <li key={row._key} className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 border-b border-hairline py-[11px] lg:grid-cols-[112px_minmax(0,1fr)] lg:gap-4 lg:py-3">
                  <b className="whitespace-nowrap font-display text-[1.3125rem] font-semibold leading-none text-teal-900 lg:text-[1.75rem]">{row.figure}</b>
                  <span className="text-meta leading-[1.45] text-ink-soft lg:text-base">{row.line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {author?.name && (
          <div className="mt-5.5 flex items-center gap-2.5 lg:mt-7 lg:gap-3">
            <Avatar author={author} />
            <span>
              <b className="block text-[0.9375rem] font-semibold leading-[1.3]">{author.name}</b>
              {author.role && <small className="block text-[0.8125rem] leading-[1.35] text-ink-soft">{author.role}</small>}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
