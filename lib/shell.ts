import 'server-only';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {languages, localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath, servicesPath} from '@/lib/services';
import {site} from '@/lib/site';
import {linkHref, submenuPage, type Contact} from '@/lib/site-links';
import {getBlogPosts} from '@/sanity/blog';
import {getCategories} from '@/sanity/portfolio';
import {getServices} from '@/sanity/services';
import {getSiteContent, type SiteLink} from '@/sanity/site';

// What the header, footer and mobile menu show, from the `siteSettings` and
// `navigation` singletons. Until they are published (or when the navigation
// is not published in this language) the constants in lib/site.ts and the
// dictionary labels keep the shell complete.

export type ShellLink = {label: string; href: string; children?: ShellLink[]};
export type SocialNetwork = 'facebook' | 'instagram' | 'youtube';

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
  /** Null: the footer shows one "Navigare" column with the header links. */
  footerGroups: {heading: string; links: ShellLink[]}[] | null;
  /** Internal paths a language does not have yet, for the language switcher. */
  missingPaths: Partial<Record<Lang, string[]>>;
};

const networks: SocialNetwork[] = ['facebook', 'instagram', 'youtube'];

function fallbackHeader(lang: Lang, dictionary: Dictionary): ShellLink[] {
  return [
    {label: dictionary.nav.services, href: localizedHref(lang, servicesPath)},
    {label: dictionary.nav.works, href: localizedHref(lang, '/lucrarile-noastre')},
    {label: dictionary.nav.blog, href: localizedHref(lang, '/blog')},
  ];
}

async function submenu(page: 'services' | 'works', lang: Lang): Promise<ShellLink[]> {
  if (page === 'services') {
    const services = await getServices(lang);
    return services.filter((service) => !service.parentId && service.title && service.slug)
      .map((service) => ({label: service.title!, href: localizedHref(lang, servicePath(null, service.slug!))}));
  }
  const categories = await getCategories(lang);
  return categories.filter((category) => category.title && category.slug)
    .map((category) => ({label: category.title!, href: localizedHref(lang, `/lucrarile-noastre/${category.slug}`)}));
}

function resolveLinks(links: SiteLink[] | null | undefined, lang: Lang, contact: Contact): (ShellLink & {source: SiteLink})[] {
  return (links ?? []).flatMap((link) => {
    const href = linkHref(link, lang, contact);
    return href && link.label ? [{label: link.label, href, source: link}] : [];
  });
}

export async function getShell(lang: Lang, dictionary: Dictionary): Promise<Shell> {
  const [{settings, navigation}, blogLanguages] = await Promise.all([
    getSiteContent(lang),
    Promise.all(languages.map(async (code) => [code, (await getBlogPosts(code)).length > 0] as const)),
  ]);
  // A language without posts has no blog page, so menus do not link to it.
  const missingPaths = Object.fromEntries(blogLanguages.filter(([, has]) => !has).map(([code]) => [code, ['/blog']]));
  const blogHref = localizedHref(lang, '/blog');
  const hasBlog = !missingPaths[lang];
  const withBlog = <T extends {href: string}>(links: T[]) => (hasBlog ? links : links.filter((link) => link.href !== blogHref));

  const phone = settings?.phone?.display && settings.phone.e164
    ? {display: settings.phone.display, href: `tel:${settings.phone.e164}`}
    : site.phone;
  const email = settings?.email ?? site.email;
  const contact = {phoneHref: phone.href, email};
  const social = settings?.social
    ? settings.social.flatMap((item) =>
      item.url && networks.includes(item.network as SocialNetwork) ? [{network: item.network as SocialNetwork, href: item.url}] : [])
    : site.social.map((item) => ({network: item.name.toLowerCase() as SocialNetwork, href: item.href}));

  const header = navigation?.header?.length
    ? await Promise.all(resolveLinks(navigation.header, lang, contact).map(async ({source, ...link}) => {
      const page = navigation.showSubmenus ? submenuPage(source) : null;
      return page ? {...link, children: await submenu(page, lang)} : link;
    }))
    : fallbackHeader(lang, dictionary);

  const groups = (navigation?.footerGroups ?? []).flatMap((group) => {
    const links = withBlog(resolveLinks(group.links, lang, contact).map(({label, href}) => ({label, href})));
    return group.heading && links.length ? [{heading: group.heading, links}] : [];
  });
  const footerGroups = groups.length ? groups : null;

  return {
    company: {
      name: settings?.name ?? site.name,
      legalName: settings?.legalName ?? site.legalName,
      cui: settings?.cui ?? site.cui,
      registration: settings ? settings.registration ?? null : site.registration,
      registryUrl: settings?.registryUrl ?? null,
      phone,
      email,
      address: settings?.address ?? null,
      tagline: settings?.tagline ?? dictionary.footer.tagline,
      social,
    },
    header: withBlog(header),
    footerGroups,
    missingPaths,
  };
}
