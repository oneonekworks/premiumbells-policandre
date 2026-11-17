import 'server-only';
import {cache} from 'react';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {languages, localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath, servicesPath} from '@/lib/services';
import {linkHref, submenuPage, type Contact} from '@/lib/site-links';
import {getBlogPosts} from '@/sanity/blog';
import {getHomePage} from '@/sanity/home';
import {getCategories} from '@/sanity/portfolio';
import {getServices} from '@/sanity/services';
import type {SanityImageValue} from '@/sanity/image';
import {getSiteContent, type SiteLink} from '@/sanity/site';

// What the header, footer and mobile menu show, from the `siteSettings` and
// `navigation` singletons. The settings are required (the Studio cannot
// delete or unpublish them); when the navigation is not published in a
// language, the dictionary labels keep the header complete.

export type ShellLink = {
  label: string;
  href: string;
  children?: ShellLink[];
  /** The header item that opens the services mega menu (v6: a button, no page). */
  menu?: 'services';
  /** Submenu rows: one short line and a thumbnail. */
  hint?: string | null;
  image?: SanityImageValue | null;
};
export type SocialNetwork = 'facebook' | 'instagram' | 'youtube';
export type Metal = 'gold' | 'bronze' | 'gilt';

/** One craft column of the mega menu and one section of the mobile menu. */
export type ServiceGroup = {
  title: string;
  /** The column heading links here when the craft has its own page (Clopote). */
  href: string | null;
  metal: Metal;
  items: ShellLink[];
};

export type Shell = {
  company: {
    name: string;
    legalName: string;
    cui: string;
    registration: string | null;
    registryUrl: string | null;
    phone: {display: string; href: string};
    email: string;
    address: string | null;
    tagline: string;
    social: {network: SocialNetwork; href: string}[];
  };
  header: ShellLink[];
  /** Craft columns from homePage.services.groups (Policandre · Clopote · Iconostase și uși). */
  serviceGroups: ServiceGroup[];
  /** The featured card in the menus: all works, their number and a photo. */
  works: {href: string; count: number; image: SanityImageValue | null};
  /** Null: the footer shows one "Navigare" column with the header links. */
  footerGroups: {heading: string; links: ShellLink[]}[] | null;
  /** Internal paths a language does not have yet, for the language switcher. */
  missingPaths: Partial<Record<Lang, string[]>>;
};

const networks: SocialNetwork[] = ['facebook', 'instagram', 'youtube'];

function fallbackHeader(lang: Lang, dictionary: Dictionary): ShellLink[] {
  return [
    {label: dictionary.nav.services, href: localizedHref(lang, servicesPath), menu: 'services'},
    {label: dictionary.nav.works, href: localizedHref(lang, '/lucrarile-noastre')},
    {label: dictionary.nav.blog, href: localizedHref(lang, '/blog')},
  ];
}

/** Every top-level service, for a language without homepage groups yet. */
async function topServices(lang: Lang): Promise<ShellLink[]> {
  const services = await getServices(lang);
  return services.filter((service) => !service.parentId && service.title && service.slug)
    .map((service) => ({
      label: service.title!, href: localizedHref(lang, servicePath(null, service.slug!)),
      hint: service.cardLabel, image: service.coverImage,
    }));
}

// The craft families in menu order; a group's metal follows its position.
const metals: Metal[] = ['gold', 'bronze', 'gilt'];

async function serviceGroups(lang: Lang, dictionary: Dictionary): Promise<ServiceGroup[]> {
  const home = await getHomePage(lang);
  const groups = (home?.services?.groups ?? []).flatMap((group, index) => {
    const services = (group.services ?? []).filter((service) => service?.public && service.title && service.slug);
    if (!group.title || !services.length) return [];
    // Clopote: its rows are the variants of one page, so the heading links to it.
    const parent = services[0].parentSlug;
    return [{
      title: group.title,
      href: parent && services.every((service) => !service.parentSlug || service.parentSlug === parent)
        ? localizedHref(lang, servicePath(null, parent)) : null,
      metal: metals[index % metals.length],
      items: services.map((service) => ({
        label: service.title!, href: localizedHref(lang, servicePath(service.parentSlug, service.slug!)),
        hint: service.cardLabel, image: service.coverImage,
      })),
    }];
  });
  if (groups.length) return groups;
  // No groups in this language yet: one column with every top-level service.
  const items = await topServices(lang);
  return items.length ? [{title: dictionary.nav.services, href: null, metal: 'gold', items}] : [];
}

function resolveLinks(links: SiteLink[] | null | undefined, lang: Lang, contact: Contact): (ShellLink & {source: SiteLink})[] {
  return (links ?? []).flatMap((link) => {
    const href = linkHref(link, lang, contact);
    return href && link.label ? [{label: link.label, href, source: link}] : [];
  });
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`siteSettings.${field} is empty; fill it in and publish the site settings in the Studio.`);
  }
  return value;
}

/** Cached per request: the layout and the service contact boxes share it. */
export const getShell = cache(async (lang: Lang, dictionary: Dictionary): Promise<Shell> => {
  const [{settings, navigation}, categories, blogLanguages, groups] = await Promise.all([
    getSiteContent(lang),
    getCategories(lang),
    Promise.all(languages.map(async (code) => [code, (await getBlogPosts(code)).length > 0] as const)),
    serviceGroups(lang, dictionary),
  ]);
  // A language without posts has no blog page, so menus do not link to it.
  const missingPaths = Object.fromEntries(blogLanguages.filter(([, has]) => !has).map(([code]) => [code, ['/blog']]));
  const blogHref = localizedHref(lang, '/blog');
  const hasBlog = !missingPaths[lang];
  const withBlog = <T extends {href: string}>(links: T[]) => (hasBlog ? links : links.filter((link) => link.href !== blogHref));

  if (!settings) throw new Error('The siteSettings document is not published; the header and footer need it.');
  const phone = {
    display: required(settings.phone?.display, 'phone.display'),
    href: `tel:${required(settings.phone?.e164, 'phone.e164')}`,
  };
  const email = required(settings.email, 'email');
  const contact = {phoneHref: phone.href, email};
  const social = (settings.social ?? []).flatMap((item) =>
    item.url && networks.includes(item.network as SocialNetwork) ? [{network: item.network as SocialNetwork, href: item.url}] : []);

  // v6: only "Servicii" opens a menu (the craft columns); the other sections are plain links.
  const header: ShellLink[] = (navigation?.header?.length
    ? resolveLinks(navigation.header, lang, contact).map(({source, ...link}) => (submenuPage(source) === 'services' ? {...link, menu: 'services' as const} : link))
    : fallbackHeader(lang, dictionary))
    .map((link) => (link.menu && !groups.length ? {...link, menu: undefined} : link));

  const footerLinks = (navigation?.footerGroups ?? []).flatMap((group) => {
    const links = withBlog(resolveLinks(group.links, lang, contact).map(({label, href}) => ({label, href})));
    return group.heading && links.length ? [{heading: group.heading, links}] : [];
  });
  const footerGroups = footerLinks.length ? footerLinks : null;

  return {
    company: {
      name: required(settings.name, 'name'),
      legalName: required(settings.legalName, 'legalName'),
      cui: required(settings.cui, 'cui'),
      registration: settings.registration ?? null,
      registryUrl: settings.registryUrl ?? null,
      phone,
      email,
      address: settings.address ?? null,
      tagline: settings.tagline ?? dictionary.footer.tagline,
      social,
    },
    header: withBlog(header),
    serviceGroups: groups,
    works: {
      href: localizedHref(lang, '/lucrarile-noastre'),
      count: categories.reduce((sum, category) => sum + category.projectCount, 0),
      image: [...categories].sort((a, b) => b.projectCount - a.projectCount)[0]?.coverImage ?? null,
    },
    footerGroups,
    missingPaths,
  };
});
