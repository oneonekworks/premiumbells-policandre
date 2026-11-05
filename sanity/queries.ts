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

// Phase 7: global content, the home page and the blog.
// Singletons are read by their fixed published ID, so drafts never match.
// Labels and short texts fall back to Romanian where the site shows them on
// an English page whose own document is published in English.
const fallback = localizedAlt;

// A link (`siteLink`): the site builds the address from `kind` and the
// target's slugs, and drops a link whose target is not public in $lang.
const linkFields = `_key, kind, page, url, "label": ${fallback('label')},
  "target": document->{
    _type, status, language, publishedLanguages,
    "slug": select(_type in ["service", "workCategory"] => ${serviceSlug}, slug.current),
    "parentSlug": select($lang == "en" => parent->slug.en.current, parent->slug.ro.current),
    "parentStatus": parent->status,
    "categorySlug": select($lang == "en" => category->slug.en.current, category->slug.ro.current)
  }`;
const seoFields = `seo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, noIndex, shareImage{${imageFields}}}`;

export const SITE_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    name, legalName, cui, registration, registryUrl, email, "phone": phone{display, e164},
    "address": ${localized('address')}, "tagline": ${fallback('tagline')},
    "social": social[]{_key, network, url},
    "seo": defaultSeo{"title": ${localized('metaTitle')}, "description": ${localized('metaDescription')}, shareImage{${imageFields}}}
  },
  "navigation": *[_id == "navigation" && ${published}][0]{
    "header": header[]{${linkFields}},
    showSubmenus,
    "footerGroups": footerGroups[]{_key, "heading": ${localized('heading')}, "links": links[]{${linkFields}}}
  }
}`);

const blogPostFields = `_id, title, "slug": slug.current, kind, publishedAt, excerpt, cover{${imageFields}}`;
const blogCardFields = `${blogPostFields}, "textLength": length(pt::text(body)), "author": author->{name, "role": ${fallback('role')}}`;
const publicPost = `_type == "blogPost" && ${notDraft} && language == $lang && defined(slug.current) && defined(publishedAt)`;

export const HOME_QUERY = defineQuery(`
  *[_id == "homePage" && _type == "homePage" && ${published}][0]{
    publishedLanguages,
    hero{
      "badge": badge{${linkFields}},
      "title": ${localized('title')}, "highlight": ${localized('highlight')},
      "lead": ${localized('lead')}, "tagline": ${localized('tagline')},
      image{${imageFields}},
      "primaryCta": primaryCta{${linkFields}}, "secondaryCta": secondaryCta{${linkFields}}
    },
    services{enabled, "eyebrow": ${localized('eyebrow')}, "heading": ${localized('heading')}, "intro": ${localized('intro')}, "serviceIds": services[]._ref},
    catalogues{enabled, "heading": ${localized('heading')}, "intro": ${localized('intro')}},
    testimonial{enabled, "testimonial": testimonial->{
      _id, "quote": ${fallback('quote')}, name, "role": ${fallback('role')}, "context": ${fallback('context')}, date,
      portrait{${imageFields}}
    }},
    audio{enabled, "eyebrow": ${localized('eyebrow')}, "recording": recording->{
      _id, "title": ${fallback('title')}, "context": ${fallback('context')}, "transcript": ${localized('transcript')},
      durationSeconds, "url": audio.asset->url, "mimeType": audio.asset->mimeType, artwork{${imageFields}}
    }},
    blog{enabled, "heading": ${localized('heading')}, "intro": ${localized('intro')}, "postIds": posts[]._ref},
    about{
      enabled, "heading": ${localized('heading')}, "body": ${localized('body')},
      poster{${imageFields}}, video{${videoFields}}, "cta": cta{${linkFields}}
    },
    ${seoFields}
  }
`);

// Only files someone checked page by page are offered for download.
export const CATALOG_DOWNLOADS_QUERY = defineQuery(`
  *[_type == "catalogDownload" && ${notDraft} && reviewed == true && defined(file.asset)] | order(displayOrder asc, _id asc){
    _id, "title": ${fallback('title')}, edition, language, cover{${imageFields}},
    "url": file.asset->url, "size": file.asset->size
  }
`);

// Every public post in $lang, newest first; the listing, the home teaser
// and "Alte articole" take what they need from it (there are few posts).
export const BLOG_POSTS_QUERY = defineQuery(`
  *[${publicPost}] | order(publishedAt desc, _id asc){${blogCardFields}}
`);

// Body blocks are projected field by field (no spreads); internal links
// carry what the site needs to build the address.
export const BLOG_POST_QUERY = defineQuery(`
  *[${publicPost} && slug.current == $slug][0]{
    ${blogPostFields},
    "textLength": length(pt::text(body)),
    "author": author->{name, "role": ${fallback('role')}, portrait{${imageFields}}},
    "source": source{text, url},
    "body": body[]{
      _key, _type,
      _type == "block" => {
        style, listItem, level,
        "children": children[]{_key, _type, text, marks},
        "markDefs": markDefs[]{_key, _type, href, "target": reference->{
          _type, status, language, publishedLanguages, "slug": select(_type == "service" => ${serviceSlug}, slug.current),
          "parentSlug": select($lang == "en" => parent->slug.en.current, parent->slug.ro.current),
          "categorySlug": select($lang == "en" => category->slug.en.current, category->slug.ro.current)
        }}
      },
      _type == "imageWithMetadata" => {${imageFields}},
      _type == "articleGallery" => {"images": images[]{_key, ${imageFields}}},
      _type == "video" => {provider, url, "file": file.asset->url, "title": ${localized('title')}, poster{${imageFields}}},
      _type == "articleAudio" => {title, "url": file.asset->url}
    },
    "translations": *[_type == "blogPost" && ${notDraft} && defined(slug.current)
      && (_id == ^.translationOf._ref || translationOf._ref == ^._id)]{language, "slug": slug.current},
    "relatedProjects": *[${publicProject} && _id in ^.relatedProjects[]._ref] | order(year desc, _id asc){
      _id, "title": ${localized('title')}, "slug": slug.current, year,
      "categorySlug": select($lang == "en" => category->slug.en.current, category->slug.ro.current),
      coverImage{${imageFields}}
    },
    "relatedServices": *[${publicService} && _id in ^.relatedServices[]._ref] | order(displayOrder asc, _id asc){
      _id, "title": ${localized('title')}, "slug": ${serviceSlug},
      "parentSlug": select($lang == "en" => parent->slug.en.current, parent->slug.ro.current),
      "summary": ${localized('summary')}, coverImage{${imageFields}}
    },
    ${seoFields}
  }
`);

// "Din blog" on a project or service page: posts in $lang that link to it.
export const POSTS_REFERENCING_QUERY = defineQuery(`
  *[${publicPost} && references($id)] | order(publishedAt desc, _id asc)[0...3]{${blogCardFields}}
`);
