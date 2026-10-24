import 'server-only';
import {notFound, permanentRedirect} from 'next/navigation';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {isLang, localizedHref, type Lang} from '@/lib/i18n/routing';
import {getCategory} from './portfolio';

export const worksPath = '/lucrarile-noastre';
export const categoryPath = (slug: string) => `${worksPath}/${slug}`;
export const projectPath = (categorySlug: string, projectSlug: string) => `${worksPath}/${categorySlug}/${projectSlug}`;

export function routeLang(value: string): Lang {
  if (!isLang(value)) notFound();
  return value;
}

/**
 * Category for a URL segment in the current language. A slug from another
 * language permanently redirects to this language's slug (`rest` keeps any
 * project segment); unknown or unpublished categories are 404s.
 */
export async function resolveCategory(langParam: string, slug: string, rest = '') {
  const lang = routeLang(langParam);
  const category = await getCategory(lang, slug);
  if (!category?.slug) notFound();
  if (category.slug !== slug) permanentRedirect(localizedHref(lang, `${categoryPath(category.slug)}${rest}`));
  return {lang, category, dictionary: getDictionary(lang)};
}

/**
 * Next 16.4 re-applies its interception rewrite on each internal pass after
 * proxy.ts rewrites to app/[lang], so the intercepted `[project]` param can
 * arrive as `(.)(.)(.)slug`. Slugs never contain parentheses, so strip them.
 */
export function stripInterceptionMarkers(segment: string): string {
  return segment.replace(/^(?:\(\.\))+/, '');
}
