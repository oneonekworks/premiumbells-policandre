# Phase 7 — homepage, blog and global content: plan

**Status:** Accepted by the user on 2026-11-04 with the recommended defaults
(see "Decisions" below). Proposed and researched on 2026-11-04.

## Decisions (accepted 2026-11-04)

1. Header: Servicii · Lucrările noastre · Blog with automatic dropdowns
   (active services; categories without counts) and the phone. Footer:
   Soluții (Policandre, Clopote, Iconostase, Uși), Companie (Despre noi →
   `/#despre-noi`, Blog), Legal from `siteSettings`. No "Prețuri" or
   "Parteneri".
2. The about video (93 MB) and the clopotar article video (32 MB) go to the
   company YouTube channel and play through a poster facade. Until uploaded,
   the about section shows the poster without a play button and the article
   has no video block.
3. The catalogue section launches hidden; each price-free PDF the user sends
   goes through the review in section 5 before it is published.
4. Homepage keeps the legacy section order, each section switchable on/off,
   no reordering, no new sections.
5. Hero: legacy wording with typos fixed; the claims ("12 turnătorii", "13
   clopote… 11 tone") are listed for the user to confirm in Studio before
   publishing. The "Nou — Iconostase" badge is dropped. Buttons "Vezi
   lucrările" → `/lucrarile-noastre` and "Cereți o ofertă" (phone).
6. Hero image: `policandre_1.jpg`.
7. "Premium Bells" in the testimonial role, alts and author line;
   "Russianbells" stays inside article bodies. Author role: "Director".
8. Putna article kept in full with `source` "Text: Ieromonah Gherasim Soca,
   Mănăstirea Putna"; Denis Latisev is the author (publisher).
9. Raport: "In preț a fost inclus și proiectul…" → "Lucrarea a inclus și
   proiectul…". Putna: "achita costul clopotelor" kept (a warning only).
10. Reading time computed from the text; dates as in `blog.json`; the
    clopotar P.S. left as written; alts rewritten from the photo subjects.
11. Audio: only "Dăngăt pascal"; `de-intampinare.mp3` is not imported.
12. No English homepage copy or posts in this phase; `/en` keeps its
    placeholder until translations exist.

## Research
Sources read: the project docs (migration plan Phase 7, content model, URL map,
source inventory, rebuild brief "Content references", architecture "Route
architecture", handoff, backlog, the Phase 6 plan), the legacy
`components/landing.jsx`, `components/layout.jsx`,
`components/shared/{headerNavigation,footer,catalogsSection,blogPosts}.jsx`,
`data/blog.json`, `pages/blog.js`, `pages/blog2.js`, the three
`pages/blog/*.js` articles, `public/audio` and `public/img`, the media
manifest entries for every homepage and blog asset, the Studio
`schemaTypes/`, and the app's `app/[lang]/page.tsx`, `blog/page.tsx`,
`components/site/*`, `lib/site.ts`, `lib/redirects.ts`, `lib/i18n/routing.ts`,
`sanity/cache-tags.ts` and `scripts/verify-no-prices.ts`.

## 1. What the legacy site actually has

### Homepage (`components/landing.jsx`, top to bottom)

| Section | Content | Media (manifest) | Problems found |
| --- | --- | --- | --- |
| Hero | Badge "Nou" + link "Vizitati pagina Iconostase"; H1 "Policandre, Clopote și Iconostase" / "produse în lumea ortodoxă, clasa Premium."; pill "Confecționate de către ortodocși pentru ortodocși!"; "S.C. Premium Bells SRL este compania care reprezintă 12 cele mai mari și mai cotate turnătorii…"; button "Lucrări policandre" | `policandre_ro/img/policandre_1.jpg` (GCS, 1.2 MB, OK). A second hero, `clopotepremium_eu-cover.jpeg`, was chosen by domain (`clopotepremium`) | Alt "Landing"; the "12 turnătorii" claim differs from the about text (Iaroslavl, Kamensk-Uralsky, Belltron): a dated claim to confirm (rebuild brief) |
| Services | Eyebrow "Descopera", H2 "Serviciile noastre", one intro paragraph (Moscova, Iaroslavl, Grecia), then a card grid of the non-maintenance `servicePages` | service covers (already in Sanity since Phase 6) | Grid duplicates `/servicii`; now comes from `service` documents |
| Catalogues | H2 "Descarcă cataloagele noastre"; 2 covers (Policandre 2022, Clopote 2022) linking to **Google Drive PDFs** | 2 webp covers on GCS (OK); the PDFs are Drive pages, not files | The originals contain prices (rebuild brief) and could not be read here; never republish them |
| Testimonial | Quote (≈70 words) on IPS Pimen's blessing and the 13 Putna bells (11 t, largest 5200 kg, 10 July 2016); "Denis Latisev, Director al firmei Premium Bells SRL"; photo `denis_play.webp` | local, OK | Image alt says "RussianBells S.R.L."; quote says "13 clopote", the Putna article says 11 |
| Audio | "Audio" / "Dăngăt pascal", round artwork, `react-h5-audio-player` | `assets/audio/pascal.mp3` (GCS, 8.9 MB, OK; same file in `public/audio`), `img/audio_bg.jpg` | `public/audio/de-intampinare.mp3` (2.7 MB) exists but is used nowhere |
| Blog teaser | "De pe blog" / "Articole, rapoarte si video postari"; 3 cards from `blog.json` (cover, date, type, reading time, excerpt, author) | covers (see blog) | Cards link with the wrong `href` for two posts (see blog) |
| About + video | "Despre noi", one paragraph (Iaroslavl, Kamensk-Uralsky, Belltron, 16 tone, Athos), button "Vizitați lucrările noastre" → `/lucrarile-noastre/policandre`; `<video controls preload="none">` with poster | `assets/video/Despre-noi-video-540p.mp4` (**93 MB**), poster `despre-noi-poster.webp` (53 KB) | Anchor `#about-us-section` is linked from the footer |

Meta (`components/layout.jsx`): title "Policandre, Clopote, Iconostase, produse
în lumea ortodoxă, clasa Premium.", description "Policandre și Clopote produse
în lumea ortodoxă, clasa Premium. Confecționate de către ortodocși pentru
ortodocși!", og image `policandre_ro/img/policandre_1.jpeg`.

### Global content

- **Header** (`headerNavigation.jsx`): Servicii (popover listing every service
  card with its subtitle), Lucrările noastre (popover of 5 categories with
  hand-counted "N lucrari"), Blog; phone `tel:+40722790776`. "Galerie video"
  is commented out.
- **Footer** (`footer.jsx`): logo, "Colaborează cu noi", Facebook and
  Instagram; columns Soluții (Clopote, Iconostase, Uși din cupru), **Prețuri
  ("Prețuri policandre")**, Companie (Despre noi → `/#about-us-section`, Presă
  → `/blog`, Parteneri → `/#about-us-section`), Legal (S.C. Premium Bells SRL
  → risco.ro company page, CUI 36422758, J40/10836/12.08.2016); "© year.
  Creat din ♥ pentru Clopote&Policandre."
- **Contact**: phone +40 722 790 776, email `clopote.dl@gmail.com` (product
  enquiry links). No postal address anywhere.
- The rebuild already shows these facts from `lib/site.ts` constants; the
  header and footer nav are code (`primaryNav`), and the placeholder home copy
  is in `lib/i18n/dictionaries.ts` (`home.*`).

### Blog (`data/blog.json` + `pages/blog/*.js`)

| Slug (kept) | Metadata | Body (hard-coded JSX) | Media | Problems found |
| --- | --- | --- | --- | --- |
| `clopotele-manastirii-putna` | "De la clopotul Buga al lui Ștefan cel Mare la noile clopote ale Mănăstirii Putna", Articol, 17 Feb 2023, "6 min" (page says 5) | lead, 11 paragraphs, 2 H2, list, blockquote (Ps 150,6), 7 figures, 1 YouTube (`bgnI968-kUs`); one video commented out | 7 GCS photos, all in the Clopote project "Mănăstirea Putna" already in Sanity (reused, no upload) | The text is signed "Ieromonah Gherasim Soca, Mănăstirea Putna", so it is the monastery's text; "achita costul clopotelor" is a pricing word (warning) |
| `raport-18-ianuarie-2023` | "Raport 18 Ianuarie 2023", Raport, 18 Feb 2023, "5 min"; cover `works-cover/usi/usi-drobeta-turnu-severin.jpg` | lead, 9 paragraphs, H2/H3, list, 15 figures with alts | 15 GCS photos from the Drobeta doors gallery (in Sanity since Phase 5) | **"In preț a fost inclus și proiectul ușilor…"** (same sentence fixed in the Drobeta project in Phase 5); typos ("soloicitati", "Pentru si Pavel" in alts); `blog.json` `href` is the wrong `…-23` |
| `clopotar-electronic-pt-clopote-fixe` | "Clopotar Electronic pentru Clopote Fixe - Mai Performant!", Articol, 18 Feb 2023, "5 min"; `headline`/`paragraph_1`/`paragraph_2` are HTML strings rendered with `dangerouslySetInnerHTML` | lead, 10 paragraphs, 2 H2, P.S. blockquote in capitals signed "DENIS LATISHEV mai 2023", owned MP4 | 3 GCS photos (new), MP4 **32 MB** with no poster, local cover | `blog.json` `href` points to the Raport post; date Feb 2023 but the P.S. says May 2023; images all use the title as alt |

- One author everywhere: Denis Latisev, "Manager", photo `denis_play.webp`
  (the testimonial calls him "Director").
- `/blog` (heading "Presă"/"De pe blog") and `/blog2` (an older card layout)
  list the same three posts. `blog-posts.xml` is the legacy sitemap.
- Company names are mixed in the texts: Premium Bells, Russianbells,
  RUSSIANBELLS, RussianBells S.R.L.

### Price content found

1. Footer column "Prețuri" with "Prețuri policandre" → dropped.
2. Raport: "In preț a fost inclus…" → override, e.g. "Lucrarea a inclus și
   proiectul ușilor pe exterior…" (same wording as the Phase 5 fix).
3. Putna: "și-au asumat datoria de a achita costul clopotelor" → a warning
   only; the sentence is about donors, not a price. I propose keeping it (see
   decision 9).
4. Catalogue PDFs: priced originals (brief); nothing is published until a
   reviewed price-free file exists.
5. No price in image filenames of the homepage or blog media (checked against
   the manifest list above).

## 2. Studio schema (in `../studio-premiumbells`)

Same pattern as Phase 6: Romanian labels, `publishedLanguages` on
field-translated documents, `localeString`/`localeText`/`localeBlockContent`
with `localeRule`, `imageWithMetadata`, `seo`, `legacySource`, the language
filter, and the document-level price check (`priceValidation`) on **every new
type**. No field is named or titled with a pricing word; the Studio test
covers the new types automatically.

### Singletons

Fixed IDs (`siteSettings`, `navigation`, `homePage`), listed at the top of the
desk ("Setări site", "Meniu și subsol", "Prima pagină"), removed from the
"new document" menu, with delete and duplicate disabled.

**`siteSettings` — "Setări site"**

| Field | Label | Type | Notes |
| --- | --- | --- | --- |
| `name`, `legalName` | Nume, Denumire juridică | string | Premium Bells / S.C. Premium Bells SRL |
| `cui`, `registration` | CUI, Nr. Registrul Comerțului | string | |
| `registryUrl` | Link verificare firmă | url | risco.ro page from the footer |
| `phone` | Telefon | {display, e164} | e164 validated (`+40722790776`) |
| `email` | E-mail | string, email rule | |
| `address` | Adresă (opțional) | localeText | empty: none in legacy |
| `social` | Rețele sociale | array {network: Facebook/Instagram/YouTube, url} | YouTube ready for the videos |
| `tagline` | Text scurt în subsol | localeText | today `footer.tagline` in the dictionary |
| `defaultSeo` | SEO implicit | `seo` | title, description, share image (legacy `policandre_1`) |

Logos stay in code (`components/site/logo.tsx`): they are design assets, not
editorial content. No secrets or analytics IDs here.

**`navigation` — "Meniu și subsol"**

- `header` "Meniu principal": ordered `navItem[]` {`label` localeString,
  `link`}. `link` is one object, `navLink`, with `kind`: page (a fixed list:
  Acasă, Servicii, Lucrările noastre, Blog), document (reference → service,
  workCategory or blogPost), or external URL. The site builds the URL per
  language, so editors never type paths.
- `showSubmenus` "Submeniuri automate": when on, Servicii and Lucrările
  noastre open a dropdown listing the active top-level services and the
  categories (from their documents, so nothing is edited twice).
- `footerGroups` "Coloane în subsol": ordered {`heading`, `links[]` navLink}.
  The importer writes Soluții and Companie; Legal comes from `siteSettings`.

**`homePage` — "Prima pagină"** (named sections in a fixed order; each has
`enabled` "Afișează secțiunea", default on)

| Section | Fields |
| --- | --- |
| `hero` | `badge` {label, link: navLink} (optional), `title`, `highlight` (second line), `lead`, `tagline`, `image` (imageWithMetadata, required), `primaryCta`, `secondaryCta` (`callToAction`) |
| `services` | `eyebrow`, `heading`, `intro` (localeBlockContent), `services[]` → service (optional; empty = all active top-level services in `displayOrder`) |
| `catalogues` | `heading`, `intro`; lists the published `catalogDownload`s in order |
| `testimonial` | reference → testimonial |
| `audio` | `eyebrow`, reference → audioFeature |
| `blog` | `heading`, `intro`, `posts[]` → blogPost (optional; empty = the 3 newest in the page language) |
| `about` | `heading`, `body` (localeBlockContent), `video` (shared `video`; a poster is required here even for YouTube), `cta` (`callToAction`); anchor `despre-noi` |
| `seo` | overrides `defaultSeo` |

A "Statistici" strip or other new sections are not added unless you ask
(decision 4).

### Documents

**`catalogDownload` — "Catalog descărcabil"**: `title` localeString, `cover`
imageWithMetadata (required), `file` (PDF only, required), `edition` (e.g.
"2026"), `language` (ro/en/ru…), `displayOrder`, and `reviewed` "Verificat
pagină cu pagină" (boolean, must be on to publish; the description says the
file must contain no prices). Price check on the text fields and on the file's
`originalFilename`.

**`testimonial` — "Mărturie"**: `quote` localeText (required), `name`, `role`
localeString, `portrait` imageWithMetadata, `context` localeString (e.g.
"Mănăstirea Putna, 2016"), `relatedProject` → project (optional), `date`.

**`audioFeature` — "Înregistrare audio"**: `title` localeString, `context`
localeText, `audio` (MP3, required), `artwork` imageWithMetadata, `durationSeconds`
(filled by the importer, editable), `transcript` localeText (optional),
`relatedProject` → project (optional).

**`person` — "Persoană"**: `name`, `role` localeString, `portrait`, `bio`
localeText. Used as blog author (and later anywhere a person appears).

**`blogPost` — "Articol"** (one document per language, as decided in the
content model)

| Field | Label | Type | Notes |
| --- | --- | --- | --- |
| `language` | Limba | ro / en, read-only after creation | the desk has "Articole RO" and "Articole EN" |
| `translationOf` | Traducere a articolului | reference → blogPost (language ro) | only on English posts; gives the hreflang pair |
| `title` | Titlu | string, max 140 | |
| `slug` | Adresă scurtă | slug | unique per language (custom `isUnique`) |
| `kind` | Tip | Articol / Raport / Video | the legacy `blogType` |
| `publishedAt` | Data publicării | date, required | newest first |
| `excerpt` | Rezumat | text, max 300 | card text and meta-description fallback |
| `cover` | Fotografie de copertă | imageWithMetadata, required | |
| `author` | Autor | reference → person | |
| `source` | Sursa textului (opțional) | string + url | e.g. "Ieromonah Gherasim Soca, Mănăstirea Putna" |
| `body` | Conținut | `articleBody` | see below |
| `relatedProjects`, `relatedServices` | Lucrări / Servicii legate | references, max 6 | |
| `seo`, `legacy` | | existing objects | |

`articleBody` is a plain (one-language) Portable Text array: styles normal,
H2, H3, quote; bullet and numbered lists; marks strong, em, link (external)
and `internalLink` (reference → project, service, blogPost); blocks
`imageWithMetadata` (figure with caption), `articleGallery` (images[], uses
the optimised multi-upload), `video` (shared object) and `audio` (MP3 with
title). Reading time is computed on the site from the word count, not stored.

Studio tests (kept minimal): singleton IDs and actions; `blogPost` slug unique
per language; no pricing words in schema names/titles (existing test).

## 3. Routes and data (website)

Next 16 notes to re-check in `node_modules/next/dist/docs/` before coding:
`generateStaticParams` + `dynamicParams` for `[post]`, `notFound()`,
metadata `alternates.languages`, and the existing proxy rules.

```text
app/[lang]/page.tsx                 homepage from homePage (replaces the placeholder)
app/[lang]/blog/page.tsx            listing: posts in the page language, newest first
app/[lang]/blog/[post]/page.tsx     article
```

- `/blog` is the same word in English, so `englishSections` needs no entry.
  `/en/blog` and every `/en/blog/<slug>` exist only when an English post is
  published; otherwise 404 and the switcher points to `/en`. No empty locale
  pages.
- Layout: header, footer and mobile menu read `siteSettings` and `navigation`
  (one cached query in the root layout). `lib/site.ts` keeps only `url` at the
  end of the phase; until the singletons are published its constants are the
  fallback, so nothing breaks in between.
- Homepage components (server unless noted): `HomeHero`, `HomeServices`
  (reuses the service card), `CatalogueDownloads` (cover, title, edition, PDF
  size, `download` link to the Sanity CDN file), `Testimonial`, `AudioFeature`
  (native `<audio controls preload="none">` with title and duration; no
  `react-h5-audio-player`), `BlogTeaser`, `AboutSection` with `VideoEmbed`.
- About video: a poster with a play button (facade). Clicking loads the
  YouTube iframe (privacy-enhanced host) or the owned `<video controls>`;
  keyboard operable, labelled, no autoplay, respects reduced motion.
- Article page: breadcrumb, title, kind, date, reading time, author, cover,
  `PortableText` renderers for every `articleBody` block (figures use
  `SanityImage` with captions; galleries reuse `Gallery`/`Lightbox`; video
  uses `VideoEmbed`), then "Lucrări legate" / "Servicii legate" cards and
  "Alte articole" (2 newest others).
- Related links back: project and service pages get a small "Din blog"
  section listing posts that reference them (reverse lookup in GROQ), so the
  links are kept in one place (the post).
- Metadata: home from `homePage.seo` then `defaultSeo`; posts from `seo`, then
  `excerpt`, og image = cover, `languageAlternates` only via `translationOf`.
  JSON-LD: `Organization` (from `siteSettings`) on the home page and
  `BlogPosting` on articles (Phase 8 verifies them).
- Redirects (308) added to `lib/redirects.ts` once the targets exist:
  `/blog/raport-18-ianuarie-23` → `/blog/raport-18-ianuarie-2023` and
  `/blog2` → `/blog`, plus rows in `tests/redirects.test.ts`. `proxy.ts`
  already reads the table.
- The placeholder `home.*` dictionary strings are removed; fixed interface
  strings (aria labels, "Descarcă PDF", "min de citit") stay in dictionaries.

### Cache tags (`sanity/cache-tags.ts`)

| Read | Tag |
| --- | --- |
| Header, footer, layout | `sanity:global` (siteSettings + navigation) |
| Homepage | `sanity:homePage`, plus the tags of what it shows (`sanity:service`, `sanity:blog`, `sanity:home-media`) |
| Catalogue downloads, testimonial, audio | `sanity:home-media` (a handful of documents) |
| Blog listing, articles, teaser, "Din blog" sections | `sanity:blog` (few posts; one tag also clears cached 404s for new slugs) |
| Person | `sanity:blog` (authors only appear on posts) |

Webhook mapping and tests in `tests/revalidate.test.ts`. The user updates the
webhook filter in sanity.io/manage (I will give the exact text): add
`"siteSettings", "navigation", "homePage", "catalogDownload", "testimonial",
"audioFeature", "person", "blogPost"`. The projection needs no change
(`slug.current` already covers posts). `npm run revalidate:test` gets the new
types.

## 4. Import mapping (reusing the Phase 5/6 importer)

- New collections for `migrate:content`: `global` (siteSettings, navigation,
  person, testimonial, audioFeature), `home` (homePage) and `blog`. Dry run by
  default, drafts only, published documents skipped, unchanged drafts not
  rewritten, the same reports and overrides.
- Inputs:
  - `blog.json` is JSON (read directly). Its HTML strings (`headline`,
    `paragraph_1/2`) go through a small HTML-to-Portable-Text converter
    (`strong`, `em`, `i`, `br` only; anything else blocks the record).
  - The article bodies: the TypeScript parser reads the JSX tree of each
    `pages/blog/*.js` (no execution) and converts `p`, `h2`, `h3`, `ul/li`,
    `blockquote`, `figure > img`, `iframe` (YouTube) and `video`, with
    `strong`/`em`/`i` marks. Decorative SVGs, the breadcrumb and commented
    code are ignored. `{post.x}` expressions resolve against `blog.json`.
    Every unknown element blocks the article and is named in the report.
  - The homepage, header and footer prose comes from a reviewed seed,
    `scripts/config/legacy-home.json`, as in Phase 6: every sentence that
    reaches Sanity is read by a person first, with typos and diacritics fixed
    there ("Descopera" → "Descoperă", "Vizitati" → "Vizitați").
- IDs: `siteSettings`, `navigation`, `homePage`; `legacy-person-denis-latisev`;
  `legacy-testimonial-putna`; `legacy-audio-dangat-pascal`;
  `legacy-blog-<legacy slug>`; catalogue downloads are created by hand once a
  reviewed PDF exists (no importer).
- Media: Putna and Drobeta article photos are already in Sanity; the asset
  checkpoint (SHA-1) reuses them without upload. New: hero image, testimonial
  portrait, audio artwork, about poster, 3 clopotar photos, 2 local covers,
  `pascal.mp3` (8.9 MB file asset) and the catalogue covers: about 12 images
  and 1 MP3. MP4s per decision 2. Image alts: from the JSX where they are real
  (typos fixed by override), otherwise empty so the site's generated alt
  applies.
- Field rules: dates from `datetime`; `kind` from `blogType`; slugs from the
  real page files (never from the wrong `href`); `excerpt` from
  `shortDescription` without the trailing "..."; `legacy` keeps the file,
  slug and `blog.json` id.
- Related content set by the importer: Putna post → project "Mănăstirea
  Putna" and service Clopote; Raport → project Drobeta and service Uși;
  Clopotar post → project "Parohia Roșu Chiajna" and service Clopotar
  electronic. Testimonial → project Putna.
- Blocks: a price hit without an override, an unknown JSX element, an image
  that resolves to nothing, a slug clash, a reference to a missing document.
- Reconciliation: `verify-migration.ts` gets `blog` (per article: paragraphs,
  headings, list items, figures, embeds — source versus Portable Text — and
  image order) and `global/home` (required singleton fields present).
- `verify-no-prices.ts`: add all eight new types to `CONTENT_TYPES` (drafts
  included). PDF files: extract the text layer (`pdfjs-dist`, read-only) and
  run the detector on it; a hit is an error. Image-only pages are not
  readable by the detector, which is why `reviewed` needs a person.

## 5. Keeping prices out

1. Schema: the existing price check on every new type; no pricing field names.
2. Importer: the detector walks every planned string (including Portable Text
   spans, alts, captions, `legacy` filenames); overrides for the Raport line
   and, if decided, the Putna sentence.
3. Catalogue PDFs: never the Drive originals. A PDF is published only when (a)
   you supply a price-free edition, (b) its text layer passes the detector,
   (c) I render every page to a contact sheet and we both look for printed
   prices, and (d) `reviewed` is on. The Drive links disappear from the site.
4. Dataset: `verify-no-prices` over the new types and PDF text before publish.
5. Rendered site: the Playwright price crawl adds `/`, `/blog`, each article,
   and the `/en` versions that exist, on desktop and mobile.
6. Footer: no "Prețuri" column; contact CTAs say "Cereți o ofertă".

## 6. Steps, tests and what "done" means

Each step ends with lint, typecheck, unit, migration and build checks, a commit
on `prototype/mobile-publishing`, and no push or Sanity write without asking.

| # | Step | Tests | Done when |
| --- | --- | --- | --- |
| 1 | **Decisions** in section 7, recorded in the content model, URL map and migration status | — | You have answered; docs updated |
| 2 | **Studio schema**: singletons, `navLink`, `catalogDownload`, `testimonial`, `audioFeature`, `person`, `blogPost`, `articleBody`, desk, price check wiring; `npx sanity deploy` after your OK and a phone check | Studio typecheck/lint/build; singleton and slug-per-language tests | Deployed; a test post can be created, validated, published and unpublished on the phone; singletons cannot be deleted |
| 3 | **Website data layer**: queries (explicit projections, query guard), TypeGen, loaders, cache tags, webhook mapping, revalidate script | unit: tags per new type | Tests pass; webhook filter text handed to you |
| 4 | **Global shell**: header/footer/mobile menu from the singletons with the constant fallback; submenus | Playwright: header, footer, mobile menu, submenu keyboard use | Shell renders from Sanity test data and from the fallback |
| 5 | **Homepage** sections and the about video facade, with hand-made test documents | Playwright desktop+mobile: every section, audio and video controls by keyboard, no horizontal scroll, disabled section hidden | Home renders from Sanity on a production build (port 3100) |
| 6 | **Blog** listing, article, related links, "Din blog" on projects/services, JSON-LD, the 2 redirects | Playwright: listing, article blocks, `/en/blog` 404 without English posts, both redirects; unit: redirect table | Pages render from test posts |
| 7 | **Importer**: seed, JSX/HTML → Portable Text, overrides, `verify-migration` and `verify-no-prices` extensions | migration tests: converter on the three articles (block counts), marks, the price block, idempotency | Offline dry run clean apart from listed review items; I show you the converted articles side by side with the legacy pages |
| 8 | **Media and files**: asset dry run with sizes; MP4s per decision 2; catalogue PDFs per decision 3 | — | You have seen the report and the contact sheets |
| 9 | **Write**: export (`production-<date>-before-phase7.tar.gz`), assets, drafts; test documents removed | `verify-no-prices` over drafts; Studio validation | Drafts in Studio with no validation errors; counts reconcile |
| 10 | **Visual review and publish** at your request after a fresh export; webhook updated by you | price crawl and page checks on the local production build at 390, 768, 1280 and 1440 px, then the hosted preview after an approved push | Home, blog and shell are live on the preview with no price anywhere |
| 11 | **Close-out**: URL map statuses, content model, handoff, migration status, Phase 7 checklist, `lib/site.ts` reduced to `url`, dictionary placeholders removed | — | Phase 7 exit criteria met |

Things you do: answer section 7, supply or approve the price-free catalogue
PDFs, upload the MP4s to YouTube if chosen, change the webhook filter, check
the Studio on the phone, approve each Sanity write, publish and push.

## 7. Open decisions (as proposed; resolved above)

1. **Header and footer.** Recommended: header Servicii · Lucrările noastre ·
   Blog with automatic dropdowns (active services; categories without the
   hand-counted "N lucrări"), phone kept; footer columns Soluții (Policandre,
   Clopote, Iconostase, Uși), Companie (Despre noi → `/#despre-noi`, Blog) and
   Legal from `siteSettings`. "Prețuri" and "Parteneri" (it pointed to the
   about section) are dropped.
2. **Videos (about 93 MB, clopotar article 32 MB).** Recommended: upload both
   to the company YouTube channel, as decided for the service videos in Phase
   6, and use the facade with the existing poster (a poster is made from the
   clopotar video for the article). Until they are uploaded, the about section
   shows the poster without a play button and the article has no video
   block. Alternative: re-encode to about 10 MB 720p and store in Sanity.
3. **Catalogue PDFs.** Recommended: launch with the section hidden (`enabled`
   off) until you send price-free editions; then each goes through the review
   in section 5. Alternative: drop the section until new catalogues exist. (If
   you can share the original PDFs as files, I can prepare a page-by-page list
   of where prices appear, to help whoever edits them.)
4. **Homepage order and extras.** Recommended: keep the legacy order (hero,
   services, catalogues, testimonial, audio, blog, about) with on/off per
   section and no reordering, in the current design system. No new sections.
5. **Hero copy and claims.** Recommended: keep the legacy wording with typos
   fixed, but confirm the numbers: "12 cele mai mari… turnătorii" (hero) versus
   the about text (Iaroslavl, Kamensk-Uralsky, Belltron), and "13 clopote noi…
   11 tone" (testimonial) versus 11 bells in the Putna article. Drop the "Nou —
   Iconostase" badge (iconostases are no longer new) or point it to a page you
   choose. Primary button "Vezi lucrările" → `/lucrarile-noastre`, secondary
   "Cereți o ofertă" (phone).
6. **Hero image.** Recommended: `policandre_1.jpg` (the policandre.ro hero),
   not the `clopotepremium` variant; you can swap it in Studio later.
7. **Company name in texts.** Recommended: "Premium Bells" in the testimonial
   role, alts and the author line; leave "Russianbells/RUSSIANBELLS" inside
   the article bodies as historical text. Author role: "Director" (as in the
   testimonial) rather than "Manager"?
8. **Putna article authorship.** The text is signed by Ieromonah Gherasim Soca
   of Putna Monastery. Recommended: keep it with that signature as `source`
   ("Text: Ieromonah Gherasim Soca, Mănăstirea Putna"), author Denis Latisev
   as publisher, if you are comfortable that the monastery agreed to its use;
   otherwise shorten it to a summary with a link.
9. **Price wording in articles.** Raport: "In preț a fost inclus și
   proiectul…" → "Lucrarea a inclus și proiectul…" (recommended). Putna:
   keep "și-au asumat datoria de a achita costul clopotelor" (it is about
   donors; a Studio warning, not an error), or reword to "și-au asumat
   ctitorirea clopotelor".
10. **Blog metadata fixes.** Recommended: reading time computed from the text
    (replaces "5/6 min"), dates kept as in `blog.json` (17 and 18 Feb 2023),
    the clopotar P.S. signature "mai 2023" left as written, alts rewritten
    from the photo subjects (fixing "Pentru"/"soloicitati").
11. **Audio.** Recommended: only "Dăngăt pascal" on the homepage; skip the
    unused `de-intampinare.mp3` (it can be added later as a second
    `audioFeature`, or as an article audio block).
12. **English.** Recommended: no English homepage copy or posts in this phase
    (the importer writes Romanian only); the singletons accept English text
    when you have translations, and `/en` keeps the current placeholder until
    then.

## 8. Exit criteria (from the migration plan)

Every primary old-site section (home, header/footer/contact, catalogue
downloads, testimonial, audio, blog, about video) is managed in the CMS and
has been visually reviewed at 390, 768, 1280 and 1440 px, with
`verify-no-prices` and the browser tests passing locally.
