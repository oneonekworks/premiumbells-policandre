import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {ArrowRightIcon} from '@/components/site/icons';
import {numberLocale} from '@/components/services/shared';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {readingMinutes, type BlogCard} from '@/sanity/blog';

// Post cards and the kind · date · reading time line, shared by the blog
// listing, the home teaser, "Alte articole" and "Din blog".

export const postPath = (slug: string) => `/blog/${slug}`;

export const longDate = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(numberLocale(lang), {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(date));

type Meta = Pick<BlogCard, 'kind' | 'publishedAt' | 'textLength'>;

export function PostMeta({post, lang, dictionary, className = ''}: {post: Meta; lang: Lang; dictionary: Dictionary; className?: string}) {
  const t = dictionary.homeSections;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft ${className}`}>
      {post.kind && <span className="font-semibold uppercase tracking-[0.14em] text-teal-700">{t.kinds[post.kind]}</span>}
      {post.kind && post.publishedAt && <span aria-hidden="true" className="text-line">—</span>}
      {post.publishedAt && <time dateTime={post.publishedAt}>{longDate(post.publishedAt, lang)}</time>}
      {post.textLength ? <span>· {t.readingTime.replace('{minutes}', String(readingMinutes(post.textLength)))}</span> : null}
    </p>
  );
}

/** A card linking to a post; `size="feature"` is the wide first card of the listing. */
export function PostCard({post, lang, dictionary, size = 'default', heading: Heading = 'h3', priority = false}: {
  post: BlogCard;
  lang: Lang;
  dictionary: Dictionary;
  size?: 'default' | 'feature';
  heading?: 'h2' | 'h3';
  priority?: boolean;
}) {
  if (!post.slug) return null;
  const href = localizedHref(lang, postPath(post.slug));
  const feature = size === 'feature';
  const cover = post.cover && {...post.cover, alt: photoAlt(post.cover, post.title ?? '')};

  return (
    <article className={`group relative flex flex-col ${feature ? 'gap-7 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12' : ''}`}>
      <div className={`relative overflow-hidden rounded-lg bg-stone ${feature ? 'aspect-[3/2] lg:col-span-7' : 'aspect-[3/2]'}`}>
        <SanityImage image={cover} ratio={3 / 2} priority={priority}
          sizes={feature ? '(max-width: 1024px) 100vw, 44rem' : '(max-width: 768px) 100vw, 33vw'}
          className="transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className={feature ? 'lg:col-span-5' : 'mt-5'}>
        <PostMeta post={post} lang={lang} dictionary={dictionary} />
        <Heading className={`mt-3 font-display font-semibold text-teal-900 ${feature ? 'text-3xl leading-tight sm:text-4xl' : 'text-2xl leading-snug'}`}>
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-teal-700">{post.title}</Link>
        </Heading>
        {post.excerpt && (
          <p className={`mt-3 leading-relaxed text-ink-soft ${feature ? 'text-lg' : 'line-clamp-3'}`}>{post.excerpt}</p>
        )}
        {feature ? (
          <span aria-hidden="true" className="mt-6 inline-flex items-center gap-2 font-medium text-teal-700">
            {dictionary.blog.readMore}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : post.author?.name && <p className="mt-4 text-sm text-ink">{post.author.name}</p>}
      </div>
    </article>
  );
}

/** Two or three cards in a row (home teaser, "Alte articole", "Din blog"). */
export function PostGrid({posts, lang, dictionary, columns = 3}: {
  posts: BlogCard[];
  lang: Lang;
  dictionary: Dictionary;
  columns?: 2 | 3;
}) {
  return (
    <ul className={`grid gap-x-6 gap-y-12 ${columns === 2 ? 'sm:grid-cols-2' : 'md:grid-cols-3'}`}>
      {posts.map((post) => (
        <li key={post._id}><PostCard post={post} lang={lang} dictionary={dictionary} /></li>
      ))}
    </ul>
  );
}
