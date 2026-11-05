import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArticleBody} from '@/components/blog/article-body';
import {PostGrid, PostMeta, postPath} from '@/components/blog/post-card';
import {SanityImage} from '@/components/sanity-image';
import {ArrowRightIcon} from '@/components/site/icons';
import {photoAlt} from '@/lib/alt';
import {getDictionary, type Dictionary} from '@/lib/i18n/dictionaries';
import {isLang, localizedHref, type Lang} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {servicePath} from '@/lib/services';
import {getShell} from '@/lib/shell';
import {site} from '@/lib/site';
import {getBlogPost, getBlogPosts, type BlogPost} from '@/sanity/blog';
import {sanityImageUrl} from '@/sanity/image';
import {projectPath, routeLang} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/blog/[post]'>;

async function load(params: Props['params']) {
  const {lang: langParam, post: slug} = await params;
  const lang = routeLang(langParam);
  const post = await getBlogPost(lang, slug);
  if (!post?.slug) notFound();
  return {lang, post, dictionary: getDictionary(lang)};
}

/** Internal path per language: this post and its translations (`translationOf`, both ways). */
function postPaths(lang: Lang, post: BlogPost) {
  const paths: Partial<Record<Lang, string>> = {[lang]: postPath(post.slug!)};
  for (const translation of post.translations ?? []) {
    if (translation.slug && translation.language && isLang(translation.language)) paths[translation.language] = postPath(translation.slug);
  }
  return paths;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang, post} = await load(params);
  const share = post.seo?.shareImage?.asset ? post.seo.shareImage : post.cover;
  const image = share ? sanityImageUrl(share, 1200, 630) : undefined;
  const description = post.seo?.description ?? truncate(post.excerpt);
  return {
    title: post.seo?.title ?? post.title,
    description,
    alternates: languageAlternates(lang, postPaths(lang, post)),
    openGraph: {
      type: 'article',
      title: post.title ?? undefined,
      description,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: image && share ? [{url: image, width: 1200, height: 630, alt: photoAlt(share, post.title ?? '')}] : undefined,
    },
    ...(post.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

/** schema.org BlogPosting; the publisher comes from the site settings. */
function blogPosting(lang: Lang, post: BlogPost, publisher: string) {
  const url = new URL(localizedHref(lang, postPath(post.slug!)), site.url).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.excerpt ? {description: post.excerpt} : {}),
    ...(post.cover?.asset ? {image: sanityImageUrl(post.cover, 1200, 630)} : {}),
    ...(post.publishedAt ? {datePublished: post.publishedAt} : {}),
    inLanguage: lang,
    url,
    mainEntityOfPage: url,
    ...(post.author?.name ? {author: {'@type': 'Person', name: post.author.name, ...(post.author.role ? {jobTitle: post.author.role} : {})}} : {}),
    publisher: {'@type': 'Organization', name: publisher, logo: {'@type': 'ImageObject', url: new URL('/brand/logo-mark.png', site.url).href}},
  };
}

function Byline({post, dictionary}: {post: BlogPost; dictionary: Dictionary}) {
  const {author, source} = post;
  if (!author?.name && !source?.text) return null;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5 border-y border-line py-5">
      {author?.name && (
        <div className="flex items-center gap-4">
          {author.portrait?.asset && (
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-stone">
              <SanityImage image={{...author.portrait, alt: ''}} ratio={1} sizes="3rem" />
            </span>
          )}
          <p className="leading-tight">
            <span className="block text-xs uppercase tracking-[0.14em] text-ink-soft">{dictionary.blog.publisher}</span>
            <span className="mt-1 block font-semibold text-ink">{author.name}</span>
            {author.role && <span className="block text-sm text-ink-soft">{author.role}</span>}
          </p>
        </div>
      )}
      {source?.text && (
        <p className="leading-tight">
          <span className="block text-xs uppercase tracking-[0.14em] text-ink-soft">{dictionary.blog.source}</span>
          <span className="mt-1 block text-ink">
            {source.url
              ? <a href={source.url} rel="noopener" target="_blank" className="underline decoration-line underline-offset-4 hover:text-teal-700">{source.text}</a>
              : source.text}
          </span>
        </p>
      )}
    </div>
  );
}

const publicRelated = (post: BlogPost) => ({
  projects: post.relatedProjects.filter((project) => project.slug && project.categorySlug),
  services: post.relatedServices.filter((service) => service.slug),
});
const hasRelated = (post: BlogPost) => {
  const {projects, services} = publicRelated(post);
  return projects.length + services.length > 0;
};

function Related({post, lang, dictionary}: {post: BlogPost; lang: Lang; dictionary: Dictionary}) {
  const {projects, services} = publicRelated(post);
  if (!projects.length && !services.length) return null;
  const card = (key: string, href: string, title: string | null, image: BlogPost['cover'], detail: string | number | null) => (
    <li key={key} className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
        <SanityImage image={image && {...image, alt: photoAlt(image, title ?? '')}} ratio={4 / 3}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-teal-900">
        <Link href={href} className="after:absolute after:inset-0 group-hover:text-teal-700">{title}</Link>
      </h3>
      {detail ? <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{detail}</p> : null}
    </li>
  );

  return (
    <div className="space-y-14">
      {projects.length > 0 && (
        <section aria-labelledby="lucrari-legate">
          <h2 id="lucrari-legate" className="mb-8 font-display text-3xl font-semibold text-teal-900">{dictionary.blog.relatedWorks}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {projects.map((project) => card(project._id, localizedHref(lang, projectPath(project.categorySlug!, project.slug!)),
              project.title, project.coverImage, project.year))}
          </ul>
        </section>
      )}
      {services.length > 0 && (
        <section aria-labelledby="servicii-legate">
          <h2 id="servicii-legate" className="mb-8 font-display text-3xl font-semibold text-teal-900">{dictionary.blog.relatedServices}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {services.map((service) => card(service._id, localizedHref(lang, servicePath(service.parentSlug, service.slug!)),
              service.title, service.coverImage, service.summary))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default async function BlogPostPage({params}: Props) {
  const {lang, post, dictionary} = await load(params);
  const [posts, shell] = await Promise.all([getBlogPosts(lang), getShell(lang, dictionary)]);
  const others = posts.filter((other) => other._id !== post._id && other.slug).slice(0, 2);
  const blogHref = localizedHref(lang, '/blog');
  const title = post.title ?? '';
  const jsonLd = blogPosting(lang, post, shell.company.name);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
      <article className="container-site pb-20 pt-10 sm:pb-28 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-ink-soft">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href={localizedHref(lang, '/')} className="hover:text-teal-700">{dictionary.nav.home}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={blogHref} className="hover:text-teal-700">{dictionary.nav.blog}</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="line-clamp-1 text-ink">{title}</li>
            </ol>
          </nav>
          <header>
            <PostMeta post={post} lang={lang} dictionary={dictionary} />
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-teal-900 sm:text-5xl lg:text-6xl">{title}</h1>
            {post.excerpt && <p className="mt-6 text-xl leading-relaxed text-ink-soft">{post.excerpt}</p>}
            <Byline post={post} dictionary={dictionary} />
          </header>
        </div>

        {post.cover?.asset && (
          <div className="relative mx-auto mt-12 aspect-[3/2] max-w-5xl overflow-hidden rounded-xl bg-stone sm:aspect-[16/9]">
            <SanityImage image={{...post.cover, alt: photoAlt(post.cover, title)}} cover priority sizes="(max-width: 1024px) 100vw, 64rem" />
          </div>
        )}

        <div className="mx-auto mt-12 max-w-3xl sm:mt-16">
          <ArticleBody post={post} lang={lang} dictionary={dictionary} />
        </div>
      </article>

      {(others.length > 0 || hasRelated(post)) && <div className="border-t border-line bg-stone">
        <div className="container-site space-y-16 py-16 sm:py-20">
          <Related post={post} lang={lang} dictionary={dictionary} />
          {others.length > 0 && (
            <section aria-labelledby="alte-articole">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h2 id="alte-articole" className="font-display text-3xl font-semibold text-teal-900">{dictionary.blog.otherPosts}</h2>
                <Link href={blogHref} className="group inline-flex min-h-11 items-center gap-2 font-medium text-teal-700 hover:text-teal-900">
                  {dictionary.homeSections.allPosts}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <PostGrid posts={others} lang={lang} dictionary={dictionary} columns={2} />
            </section>
          )}
        </div>
      </div>}
    </>
  );
}
