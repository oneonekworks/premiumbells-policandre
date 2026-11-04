# Sanity Content Model

**Status:** Proposed foundation  
**Last updated:** 2026-10-24

This model is intentionally content-oriented rather than a direct copy of the
legacy JavaScript objects. It should support the current design while allowing
editors to add content without developer intervention.

## Implemented prototype subset

As of 2026-10-24 the sibling `studio-premiumbells` implements the portfolio
slice with the translation storage below:

- Locale objects `localeString`, `localeText`, `localeBlockContent`,
  `localeSlug`, generated from `studio-premiumbells/i18n.ts`, plus the
  `localeRule` validator and the shared `publishedLanguages` field.
- Shared objects `imageWithMetadata` (localised `alt`/`caption`, `credit`),
  `seo`, `video`, `specification`, and `legacySource`.
- `project`, `workCategory`, and `portfolioPage` as specified below, with these
  deliberate differences: `project.gallery` stays a direct image array (native
  multi-upload); `project.archived` and `seo.canonicalUrl` are omitted
  (unpublishing covers archiving; canonical overrides are not needed yet);
  `location.country` is a code (`RO`, `MD`) rendered through the frontend
  dictionaries; `workCategory` has no `shortTitle`, `icon`, or `theme` yet.
- `@sanity/language-filter` on those three document types and on `service` and `catalogItem`, Romanian always shown.

The four prototype documents were converted by the Studio migration
`localize-prototype-fields` after a document export to
`.migration/backups/production-2026-10-24-before-locale.tar.gz`. Services and
the catalogue are implemented in the Studio (Phase 6, below); blog and global
singletons remain proposed.

## Translation storage (decided 2026-10-24)

Launch languages are Romanian (required) and English (optional per document).
Greek or another language is added later only when demand data and a native
reviewer exist; see [the rebuild brief](rebuild-brief.md).

### Field-level translation for structured content

`project`, `workCategory`, `service`, `catalogItem`, singletons
(`siteSettings`, `navigation`, `homePage`, `portfolioPage`), and shared objects
(`imageWithMetadata`, `seo`, `specification` labels, `callToAction` labels) stay
one document per item. Translatable fields use locale objects keyed by language:

```ts
title:   {ro: 'Schitul Duca', en: 'Duca Hermitage'}   // localeString
summary: {ro: '…', en: '…'}                           // localeText
body:    {ro: [...], en: [...]}                       // localeBlockContent
```

- A single `languages` list in the Studio (`i18n.ts`) generates the
  `localeString`, `localeText`, and `localeBlockContent` object types. Only
  `ro` is required. Adding a language is a schema change, not a data migration.
- Media, gallery order, dates, locations, dimensions, reference codes,
  relationships, and project slugs are shared, never duplicated per language.
- `@sanity/language-filter` lets editors hide English while editing on a phone.
- Plain locale objects were chosen over `sanity-plugin-internationalized-array`:
  the language set is small and known, GROQ stays readable (`title[$lang]`),
  TypeGen output stays simple, and mobile editing shows stacked inputs.

### Document-level translation for blog posts

Each `blogPost` language is its own document with a `language` field and an
optional `translationOf` reference to the Romanian original. Articles may differ
in structure or exist only in Romanian. No document-internationalization plugin
is used for the initial three posts.

### Publication readiness

Every translatable document has `publishedLanguages` (Studio label
**Publicat în**), a multi-select defaulting to `['ro']`.

- Selecting `en` makes the English title, summary, and SEO fields required by
  validation; the document cannot be published with them empty.
- English routes, sitemap entries, hreflang alternates, and language-switcher
  links exist only when `en` is selected. No empty locale pages are generated.
- On a ready English page, optional fields fall back as follows: captions
  without English text are hidden; image `alt` falls back to Romanian.
- The importer writes Romanian values only, with `publishedLanguages: ['ro']`.

### Localised slugs

| Document | Slug shape | Example |
| --- | --- | --- |
| `workCategory` | `{ro, en}` | `clopote` / `bells` |
| `service` | `{ro, en}` | `policandre` / `chandeliers` |
| `project` | shared | `schitul-duca` in both languages |
| `catalogItem` | shared | reference-based slug in both languages |
| `blogPost` | per document | each language document owns its slug |

`slug.en` is required only when `en` is in `publishedLanguages`. Slugs remain
stable after publication in every language.

## Modelling principles

- Romanian is primary and English is targeted for launch; Greek is deferred.
- Translate copy, navigation, SEO, alt text, and captions while sharing media,
  model codes, dimensions, and other language-independent facts, using the
  translation storage above. Tables below list logical fields; translatable
  string/text/rich-text fields use the matching locale object type.
- Track translation readiness and never publish empty locale equivalents.
- Slugs are stable identifiers and cannot silently change after publication.
- Reorderable content uses explicit ordered arrays.
- Relationships use references rather than repeated strings.
- Units and values are separated where filtering or comparison may be useful.
- Images always carry editorial metadata and asset references.
- Prices are not part of the public model.
- Rich text uses Portable Text, never stored HTML.
- Legacy identifiers and source paths are retained in a migration-only object
  until verification is complete.

## Shared object types

### `seo`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `metaTitle` | string | no | Falls back to document title |
| `metaDescription` | text | no | Recommended 120-160 characters |
| `shareImage` | imageWithMetadata | no | Falls back to cover image |
| `noIndex` | boolean | no | Defaults to false |
| `canonicalUrl` | url | no | Only for exceptional canonical overrides |

### `imageWithMetadata`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `asset` | Sanity image | yes | Hotspot and crop enabled |
| `alt` | localeString | no | Generated on the website when missing: editor text → caption → "Project, place – fotografia N din M" (decided 2026-10-25) |
| `caption` | string | no | Visible editorial caption |
| `credit` | string | no | Photographer/source |
| `legacySourceUrl` | url | migration only | Removed after verification if unnecessary |

### `galleryItem`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `image` | imageWithMetadata | yes | Ordered by array position |
| `title` | string | no | Optional lightbox title |
| `description` | text | no | Optional lightbox description |

### `video`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `provider` | enum | yes | `youtube`, `file`, future `stream` |
| `url` | url | yes | Normalised source URL |
| `title` | string | yes | Accessible label |
| `poster` | imageWithMetadata | conditional | Required for owned files |
| `caption` | text | no | Optional context |

### `specification`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `label` | string | yes | Example: `Greutate` |
| `value` | string or number | yes | Preserve display fidelity |
| `unit` | string | no | Example: `kg`, `m`, `cm` |
| `order` | number | no | Array order is primary |

### `callToAction`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `label` | string | yes | Human-readable action |
| `kind` | enum | yes | `internal`, `external`, `email`, `phone` |
| `destination` | string | yes | Validated by `kind` |

### `legacySource`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `collection` | string | no | Legacy export key |
| `legacyId` | string | no | `_nr`, `historyNr`, `id`, or `_id` |
| `legacySlug` | string | no | Original `page` or `href` |
| `sourceFile` | string | yes | Repository-relative source file |
| `sourceHash` | string | no | Enables idempotent imports |
| `migratedAt` | datetime | no | Import audit field |

## Document types

### Phase 7 types (accepted 2026-11-04, not built yet)

The fields of `siteSettings`, `navigation`, `homePage`, `catalogDownload`,
`testimonial`, `audioFeature`, `person`, `blogPost` and its plain-language
`articleBody` are specified in [the Phase 7 plan](phase7-plan.md), section 2.
They replace the suggestions below. Singletons use fixed IDs and cannot be
deleted; every new type runs the price check; `catalogDownload` publishes only
with "Verificat pagină cu pagină" on.

### `siteSettings` — singleton

Global content that should not be duplicated across pages:

- Company name and legal name.
- Logo variants.
- Phone and email.
- Address and company registration details.
- Social links.
- Default SEO.
- Footer columns.
- Primary calls to action.
- Analytics/verification identifiers where content-owned.
- Maintenance notice configuration.

Secrets and integration keys do not belong in this document.

### `navigation` — singleton

- Primary navigation items.
- Footer navigation groups.
- Internal references where possible.
- Explicit order.
- Visibility and optional badge/label.

### `homePage` — singleton

Suggested fields:

- Hero title, highlighted title, summary, badge, CTA, and media.
- Service introduction and ordered featured services.
- Catalogue downloads.
- Testimonial content and portrait.
- Audio feature title, artwork, and audio asset.
- Featured blog posts.
- About heading, rich text, CTA, poster, and video.
- Section visibility and ordering where design permits.

Avoid creating a completely free-form page builder in the first release. Named
sections preserve design quality and simplify migration.

### `workCategory`

| Field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `slug` | slug | yes, unique |
| `shortTitle` | string | no |
| `summary` | text | no |
| `coverImage` | imageWithMetadata | yes |
| `icon` | image or named icon | no |
| `theme` | structured colour token | no |
| `displayOrder` | number | yes |
| `enabled` | boolean | yes |
| `seo` | seo | no |
| `legacy` | legacySource | migration only |

Initial categories are `policandre`, `reconditionari-policandre`, `clopote`,
`automatizari`, and `usi`. Orologii and sonorizari require an editorial decision.

### `project`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Plain text, no HTML |
| `slug` | slug | yes, globally unique | Canonical project URL |
| `category` | reference | yes | References `workCategory` |
| `coverImage` | imageWithMetadata | yes | Grid and social fallback |
| `summary` | text | no | Grid/modal summary |
| `body` | Portable Text | no | Detailed narrative |
| `year` | number | no | Normalised year |
| `displayDate` | string | no | Exceptional legacy wording |
| `location` | object | no | Locality, county, country |
| `specifications` | specification[] | no | Technical facts |
| `gallery` | galleryItem[] | yes | Ordered |
| `videos` | video[] | no | Ordered |
| `featured` | boolean | yes | Defaults false |
| `displayOrder` | number | no | Overrides category order; otherwise featured, then year newest first (no year = newest), then creation date |
| `archived` | boolean | yes | Defaults false; draft/published use Sanity document state |
| `seo` | seo | no | |
| `legacy` | legacySource | migration only | |

Validation rules should require at least one cover/gallery image, ensure the
cover has alt text, and reject duplicate slugs. Empty legacy specification
values should not create rows.

### `service` (implemented and deployed 2026-11-03, Phase 6 step 3)

One document type for services and their variants ("Serviciu"); a variant is
a service with a `parent`. Studio file `schemaTypes/service.ts`, sections in
`schemaTypes/serviceSections.ts`.

| Field | Label | Type | Rules |
| --- | --- | --- | --- |
| `publishedLanguages` | Publicat în | shared field | |
| `title` | Denumire | localeString | required per published language, max 120 |
| `slug` | Adresă scurtă | localeSlug | required per published language; Sanity's default check keeps each slug unique among all services (stricter than per parent) |
| `parent` | Serviciu părinte (opțional) | reference → service | only top-level services are offered; validation rejects a parent that has a parent and a parent on a service that has variants (two levels) |
| `status` | Afișare | `active` / `hidden` (Activ / Ascuns) | hidden = 404 and unlinked, still editable |
| `cardLabel` | Text scurt pe card | localeString | optional, max 60 |
| `summary` | Descriere scurtă | localeText | required, max 300; card text and meta-description fallback |
| `coverImage` | Fotografie de copertă | imageWithMetadata | required |
| `displayOrder` | Ordine în listă | integer | required, default 100 |
| `body` | Text de prezentare | localeBlockContent | optional |
| `sections` | Secțiuni ale paginii | array of the section objects below | sortable |
| `relatedCategory` | Lucrări din categoria | reference → workCategory | optional |
| `seo`, `legacy` | SEO, Proveniență | existing objects | |

Sections (each has an optional localeString `heading`):

- `sectionGallery` Galerie foto: `images[]` (≥1, optimised multi-upload).
- `sectionSteps` Etape de lucru: `steps[]` {`title`, `text`, `images[]`}.
- `sectionModels` Modele / exemple: `models[]` {`title`, `description`,
  `cover`, `gallery[]`, `specifications[]`, `anchorId`}; each opens a dialog.
- `sectionBellSizes` Tabel dimensiuni clopote: `rows[]` {`weightKg`,
  `diameterCm`, `heightCm`, `note` (musical note)} plus a `note` text under
  the table; typed columns only.
- `sectionBellSets` Seturi de clopote: `sets[]` {`title`, `weightsKg[]`,
  `withElectronicRinger`, `description`, `audio` (MP3 file)}.
- `sectionVideos` Video: `videos[]` (the shared `video` object).
- `sectionCatalogue` Catalog: `families[]` (one or more catalogue families).
- `sectionCta` Contact: `text`, `label` (default "Cereți o ofertă"),
  `contact` (`phoneEmail` / `phone` / `email` / `link`) and `href` for links.

### `catalogItem` (implemented and deployed 2026-11-03)

"Produs din catalog", `schemaTypes/catalogItem.ts`. No page of its own; cards
render inside a service's catalogue section.

| Field | Label | Type | Rules |
| --- | --- | --- | --- |
| `publishedLanguages` | Publicat în | shared field | |
| `title` | Denumire | localeString | required, max 120 |
| `family` | Familie | `policandre` / `horos` / `componente` / `aplice` / `analoghii-chivoturi` / `sfesnice` | required; values appear in cache tags |
| `number` | Număr în familie | string | optional ("nr. 4") |
| `summary` | Descriere scurtă | localeText | optional |
| `levels`, `candles` | Nivele, Lumânări | integer | positive |
| `heightCm`, `diameterCm`, `widthCm`, `depthCm` | … (cm) | number | the site shows ≥100 cm in metres |
| `weightKg` | Greutate (kg) | number | |
| `madeToOrder` | Se execută la comandă | boolean | |
| `image` | Fotografie | imageWithMetadata | required |
| `gallery` | Alte fotografii | imageWithMetadata[] | max 50 |
| `variants` | Finisaje și coduri | {`finish`: varnished/gilded/silvered/patinated, `referenceCode` (no spaces)} | two fields only |
| `specifications` | Alte detalii tehnice | specification[] | ranges and prose |
| `displayOrder` | Ordine în familie | integer | required |
| `slug` | Adresă scurtă | slug | optional, reserved for future pages |
| `anchorIds` | Ancore de link vechi | string[] | read-only (`Policandru-N`) |
| `legacy` | Proveniență | legacySource | |

Both types run a document-level price check (`lib/priceValidation.ts`, rules
in `lib/priceText.ts`): any currency or amount is an error that blocks
publishing; pricing words ("preț", "negociabil", "la estimare", a bare "lei",
a number like 13.112) are a warning. Read-only `legacy` is skipped (the
importer checks it). A Studio test asserts no schema `name`/`title`/`value`
matches `preț|price|cost|tva`. Desk: "Servicii" (principale, variante, toate)
and "Catalog" (one list per family; new items get the family).

There is intentionally no public `price` field. Legacy price values must not be
copied into Portable Text, descriptions, captions, SEO, or image metadata. A
future private quotation system would be a separate model with separate access
controls, not an extension of this public document.

The same restriction applies to prices embedded in images and PDFs. Catalogue
downloads require a reviewed price-free derivative before publication. Original
catalogues are reference sources, not automatically approved public assets.

### `blogPost`

- Title and slug.
- Excerpt.
- Portable Text body.
- Cover image.
- Author reference.
- Category/type.
- Published date.
- Estimated reading time, preferably derived.
- Inline images, galleries, audio, and video.
- Related projects/services.
- SEO and legacy source.

Legacy `<strong>` and `<em>` fragments become Portable Text marks. Complete
article bodies currently hard-coded in page components require a structured
manual/content-assisted migration pass.

### Other supporting documents

- `person`: name, role, portrait, biography, and optional public links.
- `catalogDownload`: title, cover, PDF asset, edition/date, language, enabled,
  and display order.
- `testimonial`: quotation, attribution, portrait/context image, source/date,
  and enabled flag.
- `audioFeature`: title, context, audio file, artwork, duration, transcript, and
  enabled flag.

## Legacy field mapping

| Legacy field | Target | Rule |
| --- | --- | --- |
| `page` | `slug` | Normalise, deduplicate, preserve redirect alias |
| `_nr`, `historyNr`, `id`, `_id` | `legacy.legacyId` | Stringify; never expose as canonical identity |
| `title` | `title` | Strip/convert embedded HTML |
| `subtitle`, `briefInfo` | `summary` or `displayDate` | Editorial review where meanings overlap |
| `year` | `year`, `displayDate` | Parse a four-digit year; preserve exceptional display text |
| `country` | `location.country` | Normalise Romanian spelling |
| `cover`, `imageSrc`, `imageUrl` | `coverImage` | Resolve origin and upload/reference asset |
| `gallery` | `gallery[]` | Preserve active array order |
| `hasVideo`, `videoGallery`, `videos` | `videos[]` | Infer provider and normalise YouTube URLs |
| `information` | `specifications[]` | Drop blank values |
| `description*`, article paragraphs | `body` | Convert to Portable Text |
| `current` | `featured` | Confirm semantics per collection |
| `_isInMaintenance`, `isMaintenance` | `enabled`/`comingSoon` | Do not publish maintenance-only records by default |
| `price`, nested variant prices | omitted | Never publish or import into public fields |
| `refId` | `referenceCode` | Retain where useful to enquiries |

## Known conflicts requiring editorial resolution

- Two records use `clopote-sihastria-rascai`.
- Three records use `manastirea-faget`.
- Blog links disagree on the January 2023 report slug.
- Several door `href` values point to unrelated iconostasis pages.
- Orologii and sonorizari have incomplete portfolio records.
- Maintenance service cards have media but no implemented routes.

The importer must report these conflicts and stop before publishing affected
records. It must not invent public slugs silently.
