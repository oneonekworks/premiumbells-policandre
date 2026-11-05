import type {Metadata} from 'next';
import {HomeAbout, HomeAudio, HomeBlog, HomeCatalogues, HomeHero, HomeServices, HomeTestimonial} from '@/components/home/home-sections';
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
import {getServices} from '@/sanity/services';
import {getSiteContent} from '@/sanity/site';

// Title, description and share image: the home page's own SEO fields, then
// the site defaults, then the hero.
export async function generateMetadata({params}: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = routeLang((await params).lang);
  const [home, {settings}] = await Promise.all([getHomePage(lang), getSiteContent(lang)]);
  const title = home?.seo?.title ?? settings?.seo?.title ?? home?.hero?.title;
  const description = home?.seo?.description ?? settings?.seo?.description ?? home?.hero?.lead ?? undefined;
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
      siteName: settings?.name ?? site.name,
      title: title ?? undefined,
      description,
      images: image && share ? [{url: image, width: 1200, height: 630, alt: photoAlt(share, title ?? site.name)}] : undefined,
    },
    ...(home?.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

/** schema.org Organization from the site settings (lib/site.ts until they are published). */
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

  const {services, catalogues, testimonial, audio, blog, about} = home;
  // Only read what a visible section needs.
  const [allServices, posts, downloads] = await Promise.all([
    services && services.enabled !== false ? getServices(lang) : [],
    blog && blog.enabled !== false ? getBlogPosts(lang) : [],
    catalogues?.enabled === true ? getCatalogDownloads() : [],
  ]);
  const topServices = allServices.filter((service) => !service.parentId && service.slug && service.title);
  const chosenServices = services?.serviceIds?.length
    ? services.serviceIds.flatMap((id) => topServices.filter((service) => service._id === id))
    : topServices;
  const chosenPosts = blog?.postIds?.length
    ? blog.postIds.flatMap((id) => posts.filter((post) => post._id === id && post.slug))
    : posts.filter((post) => post.slug).slice(0, 3);

  const base = {lang, dictionary};
  return (
    <>
      {structuredData}
      <HomeHero hero={home.hero} lang={lang} contact={contact} />
      {services && <HomeServices {...base} section={services} services={chosenServices} />}
      {catalogues && <HomeCatalogues {...base} section={catalogues} downloads={downloads} />}
      {testimonial && <HomeTestimonial section={testimonial} dictionary={dictionary} />}
      {audio && <HomeAudio section={audio} dictionary={dictionary} />}
      {blog && <HomeBlog {...base} section={blog} posts={chosenPosts} />}
      {about && <HomeAbout {...base} section={about} contact={contact} />}
    </>
  );
}
