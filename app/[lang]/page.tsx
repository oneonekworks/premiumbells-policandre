import type {Metadata} from 'next';
import {HomeAbout, HomeAudio, HomeCatalogues, HomeDirector, HomeHero, HomeJournal, HomeServices} from '@/components/home/home-sections';
import {HomeMapStory} from '@/components/home/map-story';
import {HomePlaceholder} from '@/components/home/home-placeholder';
import {photoAlt} from '@/lib/alt';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {languageAlternates} from '@/lib/seo';
import {getShell, type Shell} from '@/lib/shell';
import {site} from '@/lib/site';
import {getBlogPosts} from '@/sanity/blog';
import {getCatalogDownloads, getHomePage} from '@/sanity/home';
import {sanityImageUrl} from '@/sanity/image';
import {routeLang} from '@/sanity/portfolio-routes';
import {getSiteContent} from '@/sanity/site';

// Title, description and share image: the home page's own SEO fields, then
// the site defaults, then the hero.
export async function generateMetadata({params}: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = routeLang((await params).lang);
  const [home, {settings}] = await Promise.all([getHomePage(lang), getSiteContent(lang)]);
  const title = home?.seo?.title ?? settings?.seo?.title ?? home?.hero?.title ?? undefined;
  const description = home?.seo?.description ?? settings?.seo?.description ?? undefined;
  const share = home?.seo?.shareImage?.asset ? home.seo.shareImage
    : settings?.seo?.shareImage?.asset ? settings.seo.shareImage : home?.hero?.image;
  const image = share ? sanityImageUrl(share, 1200, 630) : undefined;
  const published = home?.publishedLanguages ?? ['ro'];

  return {
    ...(title ? {title: {absolute: title}} : {}),
    description,
    alternates: languageAlternates(lang, {ro: published.includes('ro') ? '/' : null, en: published.includes('en') ? '/' : null}),
    openGraph: {
      type: 'website',
      siteName: settings?.name ?? undefined,
      title: title ?? undefined,
      description,
      images: image && share ? [{url: image, width: 1200, height: 630, alt: photoAlt(share, title ?? settings?.name ?? '')}] : undefined,
    },
    ...(home?.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

/** schema.org Organization from the site settings. */
function organization({company}: Shell, description: string | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    legalName: company.legalName,
    url: site.url,
    logo: new URL('/brand/logo-mark.png', site.url).href,
    ...(description ? {description} : {}),
    telephone: company.phone.href.replace(/^tel:/, ''),
    email: company.email,
    taxID: company.cui,
    ...(company.address ? {address: company.address} : {}),
    ...(company.social.length ? {sameAs: company.social.map(({href}) => href)} : {}),
  };
}

export default async function HomePage({params}: PageProps<'/[lang]'>) {
  const lang = routeLang((await params).lang);
  const dictionary = getDictionary(lang);
  const [home, shell, {settings}] = await Promise.all([getHomePage(lang), getShell(lang, dictionary), getSiteContent(lang)]);
  const contact = {phoneHref: shell.company.phone.href, email: shell.company.email};
  const jsonLd = organization(shell, settings?.seo?.description ?? undefined);
  const structuredData = (
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
  );

  if (!home?.hero) {
    return <>{structuredData}<HomePlaceholder lang={lang} dictionary={dictionary} phoneHref={contact.phoneHref} /></>;
  }

  const {services, catalogues, works, audio, blog, about} = home;
  // Only read what a visible section needs.
  const [posts, downloads] = await Promise.all([
    blog && blog.enabled !== false ? getBlogPosts(lang) : [],
    catalogues?.enabled === true ? getCatalogDownloads() : [],
  ]);
  const chosenPosts = blog?.postIds?.length
    ? blog.postIds.flatMap((id) => posts.filter((post) => post._id === id && post.slug))
    : posts.filter((post) => post.slug).slice(0, 3);
  // The map pins: the editor's works when chosen, else the representative ones
  // and, for the countries abroad, their newest works.
  const chosenWorks = works?.projects?.filter((project) => project?.public).length
    ? works.projects.flatMap((project) => (project?.public ? [project] : []))
    : [...home.latestWorks, ...home.abroadWorks];

  const base = {lang, dictionary};

  return (
    <div className="v6-page mood-subtle">
      {structuredData}
      <HomeHero {...base} home={home} />
      {services && (
        <HomeServices {...base} section={services}
          catalogues={catalogues && <HomeCatalogues {...base} section={catalogues} downloads={downloads} />} />
      )}
      {works && <HomeMapStory {...base} section={works} works={chosenWorks} places={home.places} />}
      {about && <HomeAbout {...base} section={about} />}
      {about && <HomeDirector {...base} section={about} />}
      {audio && <HomeAudio {...base} section={audio} contact={contact} />}
      {blog && <HomeJournal {...base} section={blog} posts={chosenPosts} />}
    </div>
  );
}
