import {defineQuery} from 'next-sanity';

// Every query takes $lang. A document appears only when $lang is in its
// publishedLanguages; image alt text falls back to Romanian, captions do not.
//
// Locale objects are read with explicit select() expressions rather than
// `field[$lang]`: both evaluate the same, but TypeGen types the latter as an
// array filter. Keep the branches in sync with lib/i18n/routing.ts languages.
const localized = (field: string) => `select($lang == "en" => ${field}.en, ${field}.ro)`;
const localizedAlt = (field: string) => `select($lang == "en" => coalesce(${field}.en, ${field}.ro), ${field}.ro)`;
const published = `$lang in coalesce(publishedLanguages, ["ro"])`;
const publicProject = `_type == "project" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && ${published}`;
const imageFields = `asset, crop, hotspot, "alt": ${localizedAlt('alt')}, "caption": ${localized('caption')}`;

export const PORTFOLIO_PAGE_QUERY = defineQuery(`
  *[_type == "portfolioPage" && _id == "portfolioPage" && ${published}][0]{
    "title": ${localized('title')}, "intro": ${localized('intro')}
  }
`);

export const PROJECTS_QUERY = defineQuery(`
  {
    "total": count(*[${publicProject} && defined(slug.current)]),
    "items": *[${publicProject} && defined(slug.current)]
      | order(_createdAt desc, _id asc)[$start...$end]{
        _id, "title": ${localized('title')}, "slug": slug.current, "summary": ${localized('summary')},
        location, year, "category": ${localized('category->title')},
        coverImage{${imageFields}}
      }
  }
`);

export const PROJECT_QUERY = defineQuery(`
  *[${publicProject} && slug.current == $slug][0]{
    _id, "title": ${localized('title')}, "summary": ${localized('summary')}, location, year,
    "displayDate": ${localized('displayDate')}, "category": ${localized('category->title')},
    coverImage{${imageFields}},
    "imageCount": count(gallery),
    "gallery": gallery[$start...$end]{_key, ${imageFields}}
  }
`);
