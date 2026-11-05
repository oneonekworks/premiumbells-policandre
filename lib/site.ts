// Canonical origin for metadata and JSON-LD; override per environment.
// Company facts, contact details and menus come from the Sanity
// `siteSettings` and `navigation` singletons (see lib/shell.ts).
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.policandre.ro',
} as const;
