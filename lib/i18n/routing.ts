// Pure routing tables shared by proxy.ts, links, and the language switcher.
// Internal route folders are Romanian; English URLs translate fixed sections.
// See docs/architecture.md#language-routing-decided-2026-10-24.

export const languages = ['ro', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'ro';

export function isLang(value: string): value is Lang {
  return (languages as readonly string[]).includes(value);
}

// Romanian section segment -> English segment. Unlisted segments are shared.
const englishSections: Record<string, string> = {
  'servicii': 'services',
  'lucrarile-noastre': 'our-work',
};
const romanianSections = Object.fromEntries(
  Object.entries(englishSections).map(([ro, en]) => [en, ro]),
);

function splitFirst(path: string): [string, string] {
  const [, first = '', ...rest] = path.split('/');
  return [first, rest.length ? `/${rest.join('/')}` : ''];
}

/** Public URL for an internal (Romanian-segment) path such as `/lucrarile-noastre/clopote`. */
export function localizedHref(lang: Lang, internalPath: string): string {
  if (lang === 'ro') return internalPath || '/';
  const [first, rest] = splitFirst(internalPath);
  const section = englishSections[first] ?? first;
  return section ? `/en/${section}${rest}` : '/en';
}

/**
 * Internal path for an English public path without its `/en` prefix.
 * Returns `{redirect}` when a Romanian section name was used under `/en`.
 */
export function resolveEnglishPath(path: string): {internal: string} | {redirect: string} {
  const [first, rest] = splitFirst(path);
  if (englishSections[first]) return {redirect: `/en/${englishSections[first]}${rest}`};
  const section = romanianSections[first] ?? first;
  return {internal: section ? `/${section}${rest}` : '/'};
}

// Pages known to exist in every language. Content pages will supply their own
// alternates once translations are published; until then switch to home.
const bilingualPaths = new Set(['/', '/servicii', '/lucrarile-noastre', '/blog']);

/** Equivalent public URL in `target`, or that language's home page. */
export function alternateHref(pathname: string, target: Lang): string {
  const {internal} = parsePublicPath(pathname);
  return localizedHref(target, bilingualPaths.has(internal) ? internal : '/');
}

/** Split a public pathname into its language and internal path. */
export function parsePublicPath(pathname: string): {lang: Lang; internal: string} {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const resolved = resolveEnglishPath(pathname.slice(3) || '/');
    return {lang: 'en', internal: 'internal' in resolved ? resolved.internal : pathname.slice(3)};
  }
  return {lang: 'ro', internal: pathname || '/'};
}
