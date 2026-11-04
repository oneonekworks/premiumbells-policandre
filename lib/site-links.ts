// Builds addresses for `siteLink` values from Sanity (menus, footer columns,
// buttons). Pure, so it is unit-tested in tests/site-links.test.ts.
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath, servicesPath} from '@/lib/services';

export const aboutAnchor = 'despre-noi';

const pagePaths: Record<string, string> = {
  home: '/',
  services: servicesPath,
  works: '/lucrarile-noastre',
  blog: '/blog',
};

export type LinkTarget = {
  _type: string;
  status?: string | null;
  language?: string | null;
  publishedLanguages?: string[] | null;
  slug?: string | null;
  parentSlug?: string | null;
  parentStatus?: string | null;
  categorySlug?: string | null;
} | null;

export type LinkValue = {
  kind?: string | null;
  page?: string | null;
  url?: string | null;
  target?: LinkTarget;
};

export type Contact = {phoneHref: string; email: string};

/** Internal (Romanian-segment) path of a linked document, or null when it is not public in `lang`. */
export function documentPath(target: LinkTarget, lang: Lang): string | null {
  if (!target?.slug) return null;
  if (target._type === 'blogPost') return target.language === lang ? `/blog/${target.slug}` : null;
  if (!(target.publishedLanguages ?? ['ro']).includes(lang)) return null;
  switch (target._type) {
    case 'service':
      if (target.status !== 'active' || (target.parentSlug && target.parentStatus !== 'active')) return null;
      return servicePath(target.parentSlug, target.slug);
    case 'workCategory':
      return `/lucrarile-noastre/${target.slug}`;
    case 'project':
      return target.categorySlug ? `/lucrarile-noastre/${target.categorySlug}/${target.slug}` : null;
    default:
      return null;
  }
}

/** Public address of a link in `lang`, or null when its target is missing or not public. */
export function linkHref(link: LinkValue | null | undefined, lang: Lang, contact: Contact): string | null {
  switch (link?.kind) {
    case 'page':
      if (link.page === 'about') return `${localizedHref(lang, '/')}#${aboutAnchor}`;
      return link.page && pagePaths[link.page] ? localizedHref(lang, pagePaths[link.page]) : null;
    case 'document': {
      const path = documentPath(link.target ?? null, lang);
      return path ? localizedHref(lang, path) : null;
    }
    case 'external':
      return link.url ?? null;
    case 'phone':
      return contact.phoneHref;
    case 'email':
      return `mailto:${contact.email}`;
    default:
      return null;
  }
}

/** Menu sections that open the automatic submenu. */
export const submenuPage = (link: LinkValue) =>
  link.kind === 'page' && (link.page === 'services' || link.page === 'works') ? link.page : null;
