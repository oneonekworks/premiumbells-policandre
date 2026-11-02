import {defineQuery} from 'next-sanity';

// Every query takes $lang. A document appears only when $lang is in its
// publishedLanguages; image alt text falls back to Romanian, captions do not.
//
// Locale objects are read with explicit select() expressions rather than
// `field[$lang]`: both evaluate the same, but TypeGen types the latter as an
// array filter. Keep the branches in sync with lib/i18n/routing.ts languages.
// Interpolated strings are not literal types, so pass the generated *_RESULT
// type to client.fetch explicitly.
const localized = (field: string) => `select($lang == "en" => ${field}.en, ${field}.ro)`;
const localizedAlt = (field: string) => `select($lang == "en" => coalesce(${field}.en, ${field}.ro), ${field}.ro)`;
const published = `$lang in coalesce(publishedLanguages, ["ro"])`;
const notDraft = `!(_id in path("drafts.**")) && !(_id in path("versions.**"))`;
const publicProject = `_type == "project" && ${notDraft} && ${published} && defined(slug.current)`;
const publicCategory = `_type == "workCategory" && ${notDraft} && ${published} && enabled != false`;
const categorySlug = `select($lang == "en" => slug.en.current, slug.ro.current)`;
const imageFields = `asset, crop, hotspot, "alt": ${localizedAlt('alt')}, "caption": ${localized('caption')},
  "lqip": asset->metadata.lqip, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height`;

export const PORTFOLIO_PAGE_QUERY = defineQuery(`
  *[_type == "portfolioPage" && _id == "portfolioPage" && ${published}][0]{
    "title": ${localized('title')}, "intro": ${localized('intro')}
  }
`);

export const CATEGORIES_QUERY = defineQuery(`
  *[${publicCategory} && defined(${categorySlug})] | order(displayOrder asc, _id asc){
    _id, "title": ${localized('title')}, "slug": ${categorySlug},
    coverImage{${imageFields}},
    "projectCount": count(*[${publicProject} && references(^._id)])
  }
`);

// Matches a slug in any language so a wrong-language URL can redirect.
export const CATEGORY_QUERY = defineQuery(`
  *[${publicCategory} && defined(${categorySlug}) && $slug in [slug.ro.current, slug.en.current]][0]{
    _id, "title": ${localized('title')}, "summary": ${localized('summary')}, "slug": ${categorySlug},
    "slugs": {"ro": slug.ro.current, "en": select("en" in publishedLanguages => slug.en.current)},
    coverImage{${imageFields}},
    seo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, noIndex}
  }
`);

// Every card of a category in grid order, read once and cached; the page
// searches, filters and paginates this list (lib/portfolio-filters.ts). The
// slice is only a safety cap.
export const CATEGORY_PROJECTS_QUERY = defineQuery(`
  *[${publicProject} && category._ref == $categoryId]
    | order(coalesce(displayOrder, 1000000) asc, coalesce(featured, false) desc, coalesce(year, 9999) desc, _createdAt desc, _id asc)[0...500]{
      _id, "title": ${localized('title')}, "slug": slug.current, "summary": ${localized('summary')},
      location, year, "displayDate": ${localized('displayDate')},
      coverImage{${imageFields}}
    }
`);

export const PROJECT_QUERY = defineQuery(`
  *[${publicProject} && slug.current == $slug && category._ref == $categoryId][0]{
    _id, "title": ${localized('title')}, "summary": ${localized('summary')}, "body": ${localized('body')},
    location, year, "displayDate": ${localized('displayDate')}, publishedLanguages,
    coverImage{${imageFields}},
    "specifications": specifications[]{_key, "label": ${localized('label')}, value, unit},
    "videos": videos[]{_key, provider, url, "file": file.asset->url, "title": ${localized('title')}, poster{${imageFields}}},
    "gallery": gallery[]{_key, ${imageFields}},
    seo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, noIndex, shareImage{${imageFields}}}
  }
`);
