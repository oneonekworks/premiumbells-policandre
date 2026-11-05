import {PortableText, type PortableTextComponents} from 'next-sanity';
import Link from 'next/link';
import {VideoFacade} from '@/components/home/video-facade';
import {Gallery} from '@/components/portfolio/gallery';
import {VideoEmbed} from '@/components/portfolio/video-embed';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {documentPath, type LinkTarget} from '@/lib/site-links';
import {youtubeId} from '@/lib/video';
import type {BlogBlock, BlogPost} from '@/sanity/blog';

// Renderers for every `articleBody` block. Text keeps a comfortable reading
// measure; figures, galleries and video step out a little wider on large
// screens. Photos without a description get one from the article title.

type Block<T extends BlogBlock['_type']> = Extract<BlogBlock, {_type: T}>;

const wide = 'lg:-mx-16';

function Figure({image, title}: {image: Block<'imageWithMetadata'>; title: string}) {
  if (!image.asset) return null;
  const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
  return (
    <figure className={`my-12 ${wide}`}>
      <div className="relative overflow-hidden rounded-lg bg-stone" style={{aspectRatio: ratio}}>
        <SanityImage image={{...image, alt: photoAlt(image, title)}} ratio={ratio} sizes="(max-width: 1024px) 100vw, 52rem" />
      </div>
      {image.caption && <figcaption className="mt-3 text-sm leading-relaxed text-ink-soft">{image.caption}</figcaption>}
    </figure>
  );
}

function ArticleGallery({block, title, dictionary}: {block: Block<'articleGallery'>; title: string; dictionary: Dictionary}) {
  const images = (block.images ?? []).filter((image) => image.asset).map((image, index, all) => ({
    ...image,
    alt: photoAlt(image, title, {index, total: all.length, template: dictionary.portfolio.photoOf}),
  }));
  if (!images.length) return null;
  return (
    <section aria-label={dictionary.blog.gallery} className={`my-12 ${wide}`}>
      <Gallery images={images} labels={dictionary.portfolio} />
    </section>
  );
}

function ArticleVideo({block, title, dictionary}: {block: Block<'video'>; title: string; dictionary: Dictionary}) {
  const label = block.title ?? title;
  const id = block.provider === 'youtube' ? youtubeId(block.url) : null;
  const video = id ? {provider: 'youtube' as const, id, title: label}
    : block.provider === 'file' && block.file ? {provider: 'file' as const, src: block.file, title: label} : null;
  if (!video) return null;
  return (
    <div className={`my-12 ${wide}`}>
      {block.poster?.asset ? (
        <figure>
          <VideoFacade poster={{...block.poster, alt: photoAlt(block.poster, label)}} video={video}
            playLabel={dictionary.homeSections.playVideo} sizes="(max-width: 1024px) 100vw, 52rem" />
          {block.title && <figcaption className="mt-3 text-sm text-ink-soft">{block.title}</figcaption>}
        </figure>
      ) : (
        <VideoEmbed video={block} playLabel={dictionary.homeSections.playVideo} />
      )}
    </div>
  );
}

function ArticleAudio({block, dictionary}: {block: Block<'articleAudio'>; dictionary: Dictionary}) {
  if (!block.url) return null;
  return (
    <figure className="my-10 rounded-lg border border-line bg-stone p-5 sm:p-6">
      <figcaption className="flex items-baseline gap-3">
        <span className="eyebrow">{dictionary.blog.listen}</span>
        {block.title && <span className="font-display text-xl font-semibold text-teal-900">{block.title}</span>}
      </figcaption>
      <audio controls preload="none" aria-label={block.title ?? dictionary.blog.listen} className="mt-4 w-full">
        <source src={block.url} type="audio/mpeg" />
      </audio>
    </figure>
  );
}

function components(lang: Lang, title: string, dictionary: Dictionary): PortableTextComponents {
  return {
    block: {
      normal: ({children}) => <p className="my-6">{children}</p>,
      h2: ({children}) => <h2 className="mb-4 mt-14 font-display text-3xl font-semibold leading-tight text-teal-900 sm:text-4xl">{children}</h2>,
      h3: ({children}) => <h3 className="mb-3 mt-10 font-display text-2xl font-semibold leading-snug text-teal-900">{children}</h3>,
      blockquote: ({children}) => (
        <blockquote className="my-10 border-l-2 border-gold-500 pl-6 font-display text-2xl italic leading-snug text-teal-900">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({children}) => <ul className="my-6 list-disc space-y-2 pl-6 marker:text-gold-500">{children}</ul>,
      number: ({children}) => <ol className="my-6 list-decimal space-y-2 pl-6 marker:text-gold-700">{children}</ol>,
    },
    marks: {
      link: ({value, children}) => {
        const href = (value as {href?: string})?.href ?? '';
        if (!href) return <>{children}</>;
        const external = /^https?:\/\//.test(href);
        return (
          <a href={href} className="text-teal-700 underline decoration-teal-700/40 underline-offset-4 hover:decoration-teal-700"
            {...(external ? {rel: 'noopener', target: '_blank'} : {})}>{children}</a>
        );
      },
      // A link to a document that is not public in this language is plain text.
      internalLink: ({value, children}) => {
        const path = documentPath((value as {target?: LinkTarget})?.target ?? null, lang);
        if (!path) return <>{children}</>;
        return (
          <Link href={localizedHref(lang, path)} className="text-teal-700 underline decoration-teal-700/40 underline-offset-4 hover:decoration-teal-700">
            {children}
          </Link>
        );
      },
    },
    types: {
      imageWithMetadata: ({value}) => <Figure image={value as Block<'imageWithMetadata'>} title={title} />,
      articleGallery: ({value}) => <ArticleGallery block={value as Block<'articleGallery'>} title={title} dictionary={dictionary} />,
      video: ({value}) => <ArticleVideo block={value as Block<'video'>} title={title} dictionary={dictionary} />,
      articleAudio: ({value}) => <ArticleAudio block={value as Block<'articleAudio'>} dictionary={dictionary} />,
    },
  };
}

export function ArticleBody({post, lang, dictionary}: {post: BlogPost; lang: Lang; dictionary: Dictionary}) {
  if (!post.body?.length) return null;
  return (
    // The excerpt is the card text; on the page the first paragraph is the lead.
    <div className="text-lg leading-[1.8] text-ink [&>:first-child]:mt-0 [&>p:first-child]:text-xl [&>p:first-child]:leading-relaxed [&>p:first-child]:text-ink-soft sm:[&>p:first-child]:text-2xl">
      <PortableText value={post.body} components={components(lang, post.title ?? '', dictionary)} />
    </div>
  );
}
