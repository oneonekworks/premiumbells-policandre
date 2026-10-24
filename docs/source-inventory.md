# Legacy Source Inventory

**Source:** `../rbells-tw`  
**Inventory date:** 2026-09-05  
**Purpose:** Establish measurable migration scope. Counts are repository counts,
not proof that every remote object exists.

## Repository summary

| Item | Observed value |
| --- | ---: |
| Framework | Next.js 12.3.7 Pages Router |
| React | 18.2 |
| Tailwind | 3.0.7 |
| Application/data lines inspected | ~15,000 |
| Local files under `public/` | 207 |
| Local `public/` size | ~179 MB |
| Portfolio projects | 64 |
| Portfolio gallery entries | 1,860 |
| Portfolio video entries | 36 |
| Literal `storage.googleapis.com` URL occurrences | 297 |
| Literal Cloudinary URL occurrences | 46 |
| Literal YouTube URL occurrences | 46 |
| `dangerouslySetInnerHTML` occurrences | 15 |
| Legacy `price` field occurrences | 162 |

An earlier broad path scan estimated approximately 2,230 distinct GCS object
paths. The implemented media manifest supersedes that estimate: the 2026-09-20
snapshot records 2,242 GCS-origin assets and 2,534 unique assets overall. See
[migration status](migration-status.md) for exclusions and unresolved errors.
This reference inventory is not a complete GCS bucket listing.

## Content sources

| File | Responsibility | Migration target |
| --- | --- | --- |
| `data/portfolio.js` | Work categories, projects, covers, galleries and videos | `workCategory`, `project` |
| `data/servicePages.js` | Service landing cards and availability flags | `service` |
| `data/services.js` | Door/service variants and large galleries | `service`, `catalogItem` |
| `data/catalog.json` | Product records, reference IDs, dimensions and prices | `catalogItem`; prices excluded |
| `data/blog.json` | Blog index metadata | `blogPost`, `person` |
| `pages/blog/*.js` | Long-form article bodies and inline media | Portable Text in `blogPost` |
| `components/landing.jsx` | Homepage copy, media and section configuration | `homePage`, `siteSettings` |
| service page files | Service-specific copy and inline gallery data | `service` and structured sections |

## Portfolio counts

| Legacy collection | Projects | Gallery entries | Videos | Target category slug |
| --- | ---: | ---: | ---: | --- |
| `worksClopote` | 39 | 911 | 24 | `clopote` |
| `worksPolicandre` | 11 | 458 | 7 | `policandre` |
| `worksUsi` | 1 | 176 | 2 | `usi` |
| `worksAutomatizari` | 3 | 65 | 3 | `automatizari` |
| `worksOrologii` | 2 | 0 | 0 | decision required |
| `worksSonorizari` | 1 | 0 | 0 | decision required |
| `worksReconditionariPolicandre` | 7 | 250 | 0 | `reconditionari-policandre` |
| **Total** | **64** | **1,860** | **36** | |

Largest galleries include:

- `Manastirea Sf. Ana, Rohia`: 201 images and 2 videos.
- `UȘI MASIVE DIN CUPRU - Drobeta Turnu-Severin`: 176 images and 2 videos.
- `Parohia Roșu Chiajna, Sfințire`: 89 images and 1 video.
- `Catedrala Turnu Magurele Teleorman`: 78 images.
- `Șoimărești Neamț`: 75 images and 1 video.

These projects are important performance and migration stress cases.

## Catalogue counts

| Legacy collection | Records |
| --- | ---: |
| Policandre | 29 |
| Policandru components | 1 |
| Aplice | 10 |
| Analog/chivot/pristol | 6 |
| Sfeșnice | 8 |
| Cloudinary door images | 46 |

The catalogue contains extensive price data. The rebuilt public experience is
an informational catalogue and must not publish prices. Reference IDs and
technical specifications may be retained.

## Current public routes

### Primary

```text
/
/blog
/blog/clopotar-electronic-pt-clopote-fixe
/blog/clopotele-manastirii-putna
/blog/raport-18-ianuarie-2023
/lucrarile-noastre/automatizari
/lucrarile-noastre/clopote
/lucrarile-noastre/policandre
/lucrarile-noastre/reconditionari-policandre
/lucrarile-noastre/usi
/servicii/automatizari-clopote-cu-balans
/servicii/clopotar-electronic
/servicii/clopote/cu-jug
/servicii/clopote/fara-balans
/servicii/iconostase
/servicii/iconostase/iconostas-bronz
/servicii/iconostase/lemn
/servicii/iconostase/lemn-aur
/servicii/iconostase/marmura
/servicii/iconostase/pristol-marmura
/servicii/policandre
/servicii/policandre-la-comanda
/servicii/reconditionare-policandre
/servicii/usi
```

### Legacy, unlinked, or incomplete

- `/blog2` appears to be an alternate/experimental blog page.
- `/_lucrarile-noastre` appears to be a legacy shared page implementation.
- `/api/hello` is create-next-app boilerplate and has no migration value.
- Service cards declare `/servicii/clopote-suvenire`, `/servicii/cupole`, and
  `/servicii/analog-sfesnice-chivot`, but mark them as maintenance and no
  corresponding page files exist.
- Some service records link to `/servicii/iconostase/lemn-bronz`, but that page
  file does not exist.
- Blog data contains `/blog/raport-18-ianuarie-23`, while the implemented route
  is `/blog/raport-18-ianuarie-2023`.

All of these require an explicit keep, redirect, consolidate, or remove decision
before cutover.

## Data quality findings

- Duplicate project `page` values:
  - `clopote-sihastria-rascai` occurs twice.
  - `manastirea-faget` occurs three times.
- `worksOrologii` and `worksSonorizari` records have no `page` or gallery data.
- Several fields mix display strings and structured data, for example years
  such as `Dec 2022`, dimensions with embedded units, and HTML inside titles or
  subtitles.
- Relative paths use inconsistent case, spaces, parentheses, diacritics, and
  URL encoding.
- Commented-out gallery entries are editorial history, not active content; the
  importer must not treat them as published assets.
- Descriptions and prices contain spelling, diacritic, and formatting
  inconsistencies that should be reviewed in Studio rather than silently fixed
  by the importer.

## Media findings

Media currently comes from several origins:

- Google Cloud Storage bucket `rbells` for most galleries, video, audio, and
  service media.
- Local `public/` for covers, logos, catalogues, audio, and page imagery.
- Cloudinary for one door gallery.
- YouTube embeds for portfolio video.
- A small number of Google Drive, Unsplash, and `policandre.ro` absolute URLs.

The old custom Next image loader appends `?w=...&q=...` to GCS URLs. GCS does not
interpret those parameters as an image resize instruction, so this does not
provide reliable origin transformation. The rebuilt application must use a real
image transformation pipeline.

The largest local files include 11-14 MB iconostasis images and an 8.6 MB audio
file. Copying the entire old `public/` directory into the new repository is not
acceptable.

## UI behaviours to preserve

- Desktop work-category sidebar and responsive mobile navigation.
- Search/filtering within work categories.
- Responsive project grids.
- Slide-over project details rather than mandatory extra page navigation.
- Browser-shareable project state in the rebuilt version.
- Fullscreen, keyboard-operable lightbox with thumbnails.
- Lazy loading for large galleries.
- Embedded YouTube and owned media playback.
- Service/product detail slide-overs.
- Homepage hero, service grid, catalogue downloads, testimonial, audio, blog,
  and about/video sections.

## Inventory still required

- Exact GCS object list, byte size, MIME type, checksum, and HTTP status.
- Mapping between local covers and their best available originals.
- Current production analytics and high-traffic routes.
- Complete canonical/redirect decision table.
- Verification of audio, PDF, video, and social assets.
- Confirmation of which maintenance services should be launched or removed.
