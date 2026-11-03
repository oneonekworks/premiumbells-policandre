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
const specificationFields = `_key, "label": ${localized('label')}, value, unit`;
const videoFields = `_key, provider, url, "file": file.asset->url, "title": ${localized('title')}, poster{${imageFields}}`;

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
    "specifications": specifications[]{${specificationFields}},
    "videos": videos[]{${videoFields}},
    "gallery": gallery[]{_key, ${imageFields}},
    seo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, noIndex, shareImage{${imageFields}}}
  }
`);

// Services (Phase 6). Hidden services and variants of a hidden or unpublished
// parent are not public. Slugs are per language; English needs "en" in
// publishedLanguages like every other document.
const serviceSlug = `select($lang == "en" => slug.en.current, slug.ro.current)`;
const publicService = `_type == "service" && ${notDraft} && ${published} && status == "active" && defined(${serviceSlug})
  && (!defined(parent) || (parent->status == "active" && $lang in coalesce(parent->publishedLanguages, ["ro"])))`;
const serviceSlugs = `{"ro": slug.ro.current, "en": select("en" in publishedLanguages => slug.en.current)}`;

// Every public service and variant for the overview; the page builds the tree.
export const SERVICES_QUERY = defineQuery(`
  *[${publicService}] | order(displayOrder asc, _id asc){
    _id, "title": ${localized('title')}, "slug": ${serviceSlug}, "parentId": parent._ref,
    "cardLabel": ${localized('cardLabel')}, "summary": ${localized('summary')},
    coverImage{${imageFields}}
  }
`);

// A top-level service ($parentSlug null) or a variant under $parentSlug.
// Either slug may be in any language so a wrong-language URL can redirect.
export const SERVICE_QUERY = defineQuery(`
  *[${publicService} && $slug in [slug.ro.current, slug.en.current]
    && select(defined($parentSlug) => $parentSlug in [parent->slug.ro.current, parent->slug.en.current], !defined(parent))][0]{
    _id, "title": ${localized('title')}, "slug": ${serviceSlug}, "slugs": ${serviceSlugs}, publishedLanguages,
    "cardLabel": ${localized('cardLabel')}, "summary": ${localized('summary')}, "body": ${localized('body')},
    coverImage{${imageFields}},
    "parent": parent->{_id, "title": ${localized('title')}, "slug": ${serviceSlug}, "slugs": ${serviceSlugs}},
    "variants": *[${publicService} && parent._ref == ^._id] | order(displayOrder asc, _id asc){
      _id, "title": ${localized('title')}, "slug": ${serviceSlug}, "slugs": ${serviceSlugs},
      "cardLabel": ${localized('cardLabel')}, "summary": ${localized('summary')}, coverImage{${imageFields}}
    },
    "relatedCategory": *[${publicCategory} && _id == ^.relatedCategory._ref][0]{_id, "title": ${localized('title')}, "slug": ${categorySlug}},
    "sections": sections[]{
      _key, _type, "heading": ${localized('heading')},
      _type == "sectionGallery" => {"images": images[]{_key, ${imageFields}}},
      _type == "sectionSteps" => {"steps": steps[]{
        _key, "title": ${localized('title')}, "text": ${localized('text')}, "images": images[]{_key, ${imageFields}}
      }},
      _type == "sectionModels" => {"models": models[]{
        _key, "title": ${localized('title')}, "description": ${localized('description')}, anchorId,
        cover{${imageFields}}, "gallery": gallery[]{_key, ${imageFields}},
        "specifications": specifications[]{${specificationFields}}
      }},
      _type == "sectionBellSizes" => {
        "rows": rows[]{_key, weightKg, diameterCm, heightCm, note}, "footnote": ${localized('note')}
      },
      _type == "sectionBellSets" => {"sets": sets[]{
        _key, "title": ${localized('title')}, weightsKg, withElectronicRinger,
        "description": ${localized('description')}, "audio": audio.asset->url
      }},
      _type == "sectionVideos" => {"videos": videos[]{${videoFields}}},
      _type == "sectionCatalogue" => {families},
      _type == "sectionCta" => {"text": ${localized('text')}, "label": ${localized('label')}, contact, href}
    },
    seo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, noIndex, shareImage{${imageFields}}}
  }
`);

export const CATALOG_QUERY = defineQuery(`
  *[_type == "catalogItem" && ${notDraft} && ${published} && family in $families && defined(image.asset)]
    | order(displayOrder asc, _id asc){
      _id, family, "title": ${localized('title')}, "number": number, "summary": ${localized('summary')},
      levels, candles, heightCm, diameterCm, widthCm, depthCm, weightKg, madeToOrder, anchorIds, "slug": slug.current,
      image{${imageFields}}, "gallery": gallery[]{_key, ${imageFields}},
      "variants": variants[]{_key, finish, referenceCode},
      "specifications": specifications[]{${specificationFields}}
    }
`);
