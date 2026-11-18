import {PortableText, type PortableTextComponents} from 'next-sanity';
import Link from 'next/link';
import {VideoFacade, type FacadeVideo} from '@/components/home/video-facade';
import {LightboxGroup, LightboxTrigger} from '@/components/services/lightbox-group';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {documentPath, type LinkTarget} from '@/lib/site-links';
import {youtubeId} from '@/lib/video';
import type {BlogBlock, BlogPost} from '@/sanity/blog';

// The article body in the v6 type (boards V6Article, V6ArticleMobile): text
// in the 680 column (17–18 px, 1.75), the first paragraph as the lead (19–21),
// pull quotes in teal italic Cormorant. Landscape photos, galleries and films
// break out to 1180 (`.article-grid` > `.wide`); portrait photos stay in the
// column. Every photo opens one Lightbox with all the article's photos.
// Photos without a description get one from the article title.

type Block<T extends BlogBlock['_type']> = Extract<BlogBlock, {_type: T}>;
type Photo = Block<'imageWithMetadata'>;

const ratioOf = (image: Photo) => (image.width && image.height ? image.width / image.height : 3 / 2);
const wideSizes = '(min-width: 1228px) 1180px, 100vw';

/** The article's photos in reading order, keyed by block / image key, for the Lightbox. */
function articlePhotos(post: BlogPost) {
  const photos: Photo[] = [];
  for (const block of post.body ?? []) {
    if (block._type === 'imageWithMetadata' && block.asset) photos.push(block);
    if (block._type === 'articleGallery') photos.push(...(block.images ?? []).filter((image) => image.asset) as Photo[]);
  }
  return photos;
}

function Figure({image, index, title, open}: {image: Photo; index: number; title: string; open: string}) {
  if (!image.asset) return null;
  const ratio = ratioOf(image);
  const wide = ratio >= 1.2;
  const alt = photoAlt(image, title);
  return (
    <figure className={`my-10 lg:my-14 ${wide ? 'wide' : ''}`}>
      <LightboxTrigger index={index} label={`${open}: ${alt}`} className="group block w-full">
        <span className="relative block overflow-hidden rounded-image bg-band lg:rounded-card" style={{aspectRatio: ratio}}>
          <span className="absolute inset-0 transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.02] motion-reduce:transform-none">
            <SanityImage image={{...image, alt}} ratio={ratio} sizes={wide ? wideSizes : '(min-width: 768px) 680px, 100vw'} />
          </span>
        </span>
      </LightboxTrigger>
      {image.caption && <figcaption className="mx-auto mt-3 max-w-(--container-text) text-caption leading-[1.5] text-ink-soft">{image.caption}</figcaption>}
    </figure>
  );
}

function ArticleGallery({block, start, title, labels}: {block: Block<'articleGallery'>; start: number; title: string; labels: Dictionary}) {
  const images = (block.images ?? []).filter((image) => image.asset);
  if (!images.length) return null;
  return (
    <section aria-label={labels.blog.gallery} className="wide my-10 lg:my-14">
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {images.map((image, index) => {
          const alt = photoAlt(image, title, {index, total: images.length, template: labels.portfolio.photoOf});
          return (
            <li key={image._key}>
              <LightboxTrigger index={start + index} label={`${labels.portfolio.lightbox.open}: ${alt}`}
                className="group relative block aspect-square w-full overflow-hidden rounded-[0.875rem] bg-band md:rounded-image">
                <span className="absolute inset-0 transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.03] motion-reduce:transform-none">
                  <SanityImage image={{...image, alt}} ratio={1} sizes="(min-width: 1228px) 390px, (min-width: 768px) 33vw, 50vw" />
                </span>
              </LightboxTrigger>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ArticleVideo({block, title, dictionary}: {block: Block<'video'>; title: string; dictionary: Dictionary}) {
  const label = block.title ?? title;
  const id = block.provider === 'youtube' ? youtubeId(block.url) : null;
  const video: FacadeVideo | null = id ? {provider: 'youtube', id, title: label}
    : block.provider === 'file' && block.file ? {provider: 'file', src: block.file, title: label} : null;
  if (!video) return null;
  const poster = block.poster?.asset ? {...block.poster, alt: photoAlt(block.poster, label)}
    : id ? {url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`} : null;
  return (
    <figure className="wide my-10 lg:my-14">
      {poster ? (
        <VideoFacade poster={poster} video={video} playLabel={dictionary.homeSections.playVideo} sizes={wideSizes} />
      ) : (
        <video controls preload="none" playsInline aria-label={label} className="aspect-video w-full rounded-card bg-band">
          <source src={video.provider === 'file' ? video.src : ''} />
        </video>
      )}
      {block.title && <figcaption className="mx-auto mt-3 max-w-(--container-text) text-caption text-ink-soft">{block.title}</figcaption>}
    </figure>
  );
}

function ArticleAudio({block, dictionary}: {block: Block<'articleAudio'>; dictionary: Dictionary}) {
  if (!block.url) return null;
  return (
    <figure className="my-10 rounded-card bg-band px-5 py-5 md:px-6">
      <figcaption className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-caption font-semibold text-ink-soft">{dictionary.blog.listen}</span>
        {block.title && <span className="font-display text-[1.375rem] font-semibold leading-[1.2]">{block.title}</span>}
      </figcaption>
      <audio controls preload="none" aria-label={block.title ?? dictionary.blog.listen} className="mt-4 w-full">
        <source src={block.url} type="audio/mpeg" />
      </audio>
    </figure>
  );
}

const textLink = 'text-teal-700 underline decoration-1 underline-offset-4 hover:decoration-2';

/** Plain text of a block, to size long quotes down. */
const blockText = (value: unknown) =>
  ((value as {children?: {text?: string}[]})?.children ?? []).map((span) => span.text ?? '').join('');

function components(lang: Lang, title: string, dictionary: Dictionary, photoIndex: Map<string, number>): PortableTextComponents {
  return {
    block: {
      normal: ({children}) => <p className="mb-6 mt-0">{children}</p>,
      h2: ({children}) => <h2 className="mb-5 mt-14 font-display text-[2rem] font-semibold leading-[1.1] lg:text-[2.5rem]">{children}</h2>,
      h3: ({children}) => <h3 className="mb-3 mt-10 font-display text-[1.625rem] font-semibold leading-[1.15] lg:text-[1.875rem]">{children}</h3>,
      // Pull quote: teal italic, 34 / 44; a long quote steps down so it stays a quote, not a wall.
      blockquote: ({children, value}) => (
        <blockquote className={`my-10 font-display font-medium italic leading-[1.15] text-teal-700 lg:my-14 ${blockText(value).length > 160
          ? 'text-[1.625rem] lg:text-[2rem]' : 'text-[2.125rem] lg:text-[2.75rem]'}`}>{children}</blockquote>
      ),
    },
    list: {
      bullet: ({children}) => <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-teal-700">{children}</ul>,
      number: ({children}) => <ol className="mb-6 list-decimal space-y-2 pl-6 marker:text-teal-700">{children}</ol>,
    },
    marks: {
      link: ({value, children}) => {
        const href = (value as {href?: string})?.href ?? '';
        if (!href) return <>{children}</>;
        const external = /^https?:\/\//.test(href);
        return <a href={href} className={textLink} {...(external ? {rel: 'noopener', target: '_blank'} : {})}>{children}</a>;
      },
      // A link to a document that is not public in this language is plain text.
      internalLink: ({value, children}) => {
        const path = documentPath((value as {target?: LinkTarget})?.target ?? null, lang);
        if (!path) return <>{children}</>;
        return <Link href={localizedHref(lang, path)} className={textLink}>{children}</Link>;
      },
    },
    types: {
      imageWithMetadata: ({value}) => {
        const image = value as Photo;
        return <Figure image={image} index={photoIndex.get(image._key) ?? 0} title={title} open={dictionary.portfolio.lightbox.open} />;
      },
      articleGallery: ({value}) => {
        const block = value as Block<'articleGallery'>;
        const first = (block.images ?? []).find((image) => image.asset);
        return <ArticleGallery block={block} start={first ? photoIndex.get(first._key) ?? 0 : 0} title={title} labels={dictionary} />;
      },
      video: ({value}) => <ArticleVideo block={value as Block<'video'>} title={title} dictionary={dictionary} />,
      articleAudio: ({value}) => <ArticleAudio block={value as Block<'articleAudio'>} dictionary={dictionary} />,
    },
  };
}

export function ArticleBody({post, lang, dictionary}: {post: BlogPost; lang: Lang; dictionary: Dictionary}) {
  if (!post.body?.length) return null;
  const title = post.title ?? '';
  const photos = articlePhotos(post);
  const photoIndex = new Map(photos.map((photo, index) => [photo._key, index]));
  return (
    <LightboxGroup sets={[{title, images: photos}]} labels={dictionary.portfolio.lightbox} title={title}>
      {/* The excerpt is the card text; on the page the first paragraph is the lead. */}
      <div className="article-grid text-[1.0625rem] leading-[1.75] text-ink lg:text-lg [&>:first-child]:mt-0 [&>p:first-child]:text-[1.1875rem] [&>p:first-child]:leading-[1.6] lg:[&>p:first-child]:text-[1.3125rem]">
        <PortableText value={post.body} components={components(lang, title, dictionary, photoIndex)} />
      </div>
    </LightboxGroup>
  );
}
