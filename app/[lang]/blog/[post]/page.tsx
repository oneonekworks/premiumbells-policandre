import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArticleBody} from '@/components/blog/article-body';
import {BylineCard, MetaLine, postPath} from '@/components/blog/byline-card';
import {SanityImage} from '@/components/sanity-image';
import {workLine} from '@/components/services/blocks';
import {Breadcrumb} from '@/components/services/story-hero';
import {photoAlt, subject} from '@/lib/alt';
import {getDictionary, type Dictionary} from '@/lib/i18n/dictionaries';
import {isLang, localizedHref, type Lang} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {servicePath} from '@/lib/services';
import {craftMetal, getShell, type Metal, type Shell} from '@/lib/shell';
import {site} from '@/lib/site';
import {getBlogPost, getBlogPosts, type BlogPost} from '@/sanity/blog';
import {sanityImageUrl} from '@/sanity/image';
import {projectPath, routeLang} from '@/sanity/portfolio-routes';

// Article v6 (boards V6Article, V6ArticleMobile; pages.md "Article"): white
// hero (breadcrumb Jurnal / kind, kind · date · time, H1 up to 72, cover 16:9
// r28, 4:3 on phones), the body in the 680 column (article-body.tsx), then
// the band: "Citiți și" ×2 byline cards and the works and services the post
// is about (works open the Project panel over the article). The footer is
// the only dark panel.

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

/** Who published the post and whose text it is, in one quiet line under the body. */
function Credits({post, dictionary}: {post: BlogPost; dictionary: Dictionary}) {
  const {author, source} = post;
  if (!author?.name && !source?.text) return null;
  return (
    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-hairline pt-5 text-caption leading-[1.5] text-ink-soft lg:mt-6">
      {author?.name && <span>{dictionary.blog.publisher} <b className="font-semibold text-ink">{author.name}</b>{author.role ? `, ${author.role}` : ''}</span>}
      {source?.text && (
        <span>
          {dictionary.blog.source}:{' '}
          {source.url
            ? <a href={source.url} rel="noopener" target="_blank" className="text-teal-700 underline decoration-1 underline-offset-4">{source.text}</a>
            : <span className="text-ink">{source.text}</span>}
        </span>
      )}
    </p>
  );
}

const metalBar: Record<Metal, string> = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt'};

/** The works (→ Project panel) and services the post is about, as break-out cards. */
function Related({post, lang, dictionary, shell}: {post: BlogPost; lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const projects = post.relatedProjects.filter((project) => project.slug && project.categorySlug);
  const services = post.relatedServices.filter((service) => service.slug);
  if (!projects.length && !services.length) return null;
  const serviceMetal = (href: string) =>
    shell.serviceGroups.find((group) => group.href === href || group.items.some((item) => item.href === href))?.metal ?? 'gold';
  const cards = [
    ...projects.map((project) => ({
      key: project._id, href: localizedHref(lang, projectPath(project.categorySlug!, project.slug!)), work: true,
      title: project.title ?? '', line: workLine(project, dictionary.countries), metal: craftMetal(project.craft),
      image: project.coverImage && {...project.coverImage, alt: photoAlt(project.coverImage, subject(project.title, project.location?.locality))},
    })),
    ...services.map((service) => {
      const href = localizedHref(lang, servicePath(service.parentSlug, service.slug!));
      return {
        key: service._id, href, work: false, title: service.title ?? '', line: service.cardLabel ?? '', metal: serviceMetal(href),
        image: service.coverImage && {...service.coverImage, alt: service.coverImage.alt ?? ''},
      };
    }),
  ];

  return (
    <section aria-labelledby="din-articol" className="mt-18 first:mt-0 lg:mt-28">
      <h2 id="din-articol" className="font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.015em] lg:text-[2.5rem]">{dictionary.blog.related}</h2>
      <ul className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {cards.map((card) => (
          <li key={card.key} className="flex">
            <Link href={card.href} scroll={card.work ? false : undefined} aria-haspopup={card.work ? 'dialog' : undefined}
              className="bo bo-left group w-full">
              <span className="ph relative">
                <SanityImage image={card.image} ratio={4 / 3} sizes="(min-width: 1024px) 300px, (min-width: 480px) 50vw, 100vw" />
                {card.work ? (
                  <span className="glass-light pointer-events-none absolute bottom-3 left-3 inline-flex h-9 items-center rounded-pill px-3.5 text-caption font-semibold text-ink opacity-0 transition-opacity duration-(--duration-fade) group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:hidden">{dictionary.services.seeWork}</span>
                ) : null}
              </span>
              <span className="tx">
                <i className={`bar ${metalBar[card.metal]}`} aria-hidden="true" />
                <b className="lg:!text-2xl">{card.title}</b>
                {card.line ? <small>{card.line}</small> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function BlogPostPage({params}: Props) {
  const {lang, post, dictionary} = await load(params);
  const t = dictionary.blog;
  const [posts, shell] = await Promise.all([getBlogPosts(lang), getShell(lang, dictionary)]);
  const others = posts.filter((other) => other._id !== post._id && other.slug).slice(0, 2);
  const title = post.title ?? '';
  const jsonLd = blogPosting(lang, post, shell.company.name);
  const kind = (post.kind && dictionary.homeSections.kinds[post.kind]) || title;
  const related = post.relatedProjects.length + post.relatedServices.length > 0;

  return (
    <div className="v6-page mood-subtle">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
      <article>
        <header className="m-hero pb-10 pt-7 lg:pb-18 lg:pt-11">
          <div className="mx-auto max-w-[65.5rem] px-5 md:px-6">
            <Breadcrumb label={dictionary.services.breadcrumb} items={[{label: t.title, href: localizedHref(lang, '/blog')}, {label: kind}]} />
            <p className="mt-5 text-caption text-ink-soft lg:mt-8 lg:text-meta"><MetaLine post={post} lang={lang} dictionary={dictionary} /></p>
            <h1 className="mt-3 font-display text-[2.75rem] font-medium leading-[1.06] tracking-[-0.015em] lg:mt-4 lg:text-[clamp(3rem,5vw,4.5rem)] lg:leading-[1.04]">{title}</h1>
          </div>
          {post.cover?.asset && (
            <div className="mx-auto mt-7 max-w-[76.75rem] px-3 md:px-6 lg:mt-14">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-band shadow-e3 md:aspect-video lg:rounded-panel">
                <SanityImage image={{...post.cover, alt: photoAlt(post.cover, title)}} cover priority sizes="(min-width: 1228px) 1180px, 100vw" />
              </div>
            </div>
          )}
        </header>

        <div className="m-white pb-22 pt-4 lg:pb-34 lg:pt-6">
          <ArticleBody post={post} lang={lang} dictionary={dictionary} />
          <div className="article-grid"><Credits post={post} dictionary={dictionary} /></div>
        </div>
      </article>

      {(others.length > 0 || related) && (
        <section aria-labelledby={others.length ? 'cititi-si' : undefined} className="m-band px-5 pb-22 pt-18 md:px-0 lg:py-34">
          <div className="mx-auto max-w-(--container-page) md:px-6">
            {others.length > 0 && (
              <>
                <p className="kicker mb-3 md:mb-4">{t.kicker}</p>
                <h2 id="cititi-si" className="section-title">{t.readAlso}</h2>
                <ul className="mt-8 flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-8 lg:mt-16">
                  {others.map((other) => (
                    <li key={other._id} className="flex">
                      <BylineCard post={other} lang={lang} dictionary={dictionary} ground="band" className="w-full"
                        sizes="(min-width: 1248px) 600px, (min-width: 768px) 50vw, 100vw" />
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Related post={post} lang={lang} dictionary={dictionary} shell={shell} />
          </div>
        </section>
      )}
    </div>
  );
}
