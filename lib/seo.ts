import type {Metadata} from 'next';
import {defaultLang, localizedHref, type Lang} from './i18n/routing';

/**
 * Canonical and hreflang alternates for one page. `paths` holds the internal
 * (Romanian-segment) path for each language the page is published in.
 */
export function languageAlternates(
  lang: Lang,
  paths: Partial<Record<Lang, string | null | undefined>>,
): Metadata['alternates'] {
  const languages: Record<string, string> = Object.fromEntries(
    (Object.entries(paths) as [Lang, string | null | undefined][])
      .filter((entry): entry is [Lang, string] => Boolean(entry[1]))
      .map(([code, path]) => [code, localizedHref(code, path)]),
  );
  if (paths[defaultLang]) languages['x-default'] = localizedHref(defaultLang, paths[defaultLang]);
  return {canonical: localizedHref(lang, paths[lang] ?? '/'), languages};
}

export function truncate(text: string | null | undefined, length = 160): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= length ? clean : `${clean.slice(0, length - 1).replace(/\s+\S*$/, '')}…`;
}
