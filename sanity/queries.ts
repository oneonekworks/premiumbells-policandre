import {defineQuery} from 'next-sanity';

export const PORTFOLIO_PAGE_QUERY = defineQuery(`
  *[_type == "portfolioPage" && _id == "portfolioPage"][0]{title, intro}
`);

export const PROJECTS_QUERY = defineQuery(`
  {
    "total": count(*[_type == "project" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && defined(slug.current)]),
    "items": *[_type == "project" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && defined(slug.current)]
      | order(_createdAt desc, _id asc)[$start...$end]{
        _id, title, "slug": slug.current, summary, location,
        "category": category->title,
        coverImage{asset, crop, hotspot, alt, caption}
      }
  }
`);

export const PROJECT_QUERY = defineQuery(`
  *[_type == "project" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && slug.current == $slug][0]{
    _id, title, summary, location, "category": category->title,
    coverImage{asset, crop, hotspot, alt, caption},
    "imageCount": count(gallery),
    "gallery": gallery[$start...$end]{_key, asset, crop, hotspot, alt, caption}
  }
`);
