# Migration Status

**Overall status:** Bilingual shell, portfolio slice, and hosted Studio with optimised phone uploads working locally; legacy importer built; all 39 Clopote works imported and published
**Current phase:** Preview hosted on Netlify with the publish webhook live; category search and filters built; next: SEO baseline — see [handoff](handoff.md)
**Last updated:** 2026-11-02

## Accepted decisions

- Frontend: Next.js 16.4 App Router, React 19, strict TypeScript.
- Styling: Tailwind CSS 4 with a compact bespoke design language refining the
  existing real photography, teal accents, and premium ecclesiastical identity.
- CMS: existing Sanity project `1fzbw4s1`, dataset `production`, authorized for
  the local prototype; phone publishing accepted by the user on 2026-10-30.
- Editors: one administrator initially, optionally two; simple mobile editing.
- Languages: Romanian primary plus reviewed English at launch; a third language
  (Greek or another) only after demand data and a native reviewer exist.
- Translation storage: one document with `{ro, en}` locale fields for structured
  content; separate documents per language for blog posts; explicit
  `publishedLanguages` readiness gate.
- Language URLs: Romanian unprefixed; English under `/en/` with translated
  section names and category/service slugs; shared project slugs.
- Markets: Romania/Moldova, with English for wider European visitors.
- Budget: approximately USD 20/month total; hosting choice remains unresolved.
- SEO: foundational from URL/content planning onward, without ranking guarantees.
- Images: Sanity originals plus Image CDN transformations.
- Legacy media: GCS retained as a read-only migration source/archive.
- UX: Preserve grids, slide-overs, fullscreen galleries, lazy loading, and low
  navigation depth.
- Project overlays: canonical routes plus App Router parallel/intercepted routes.
- Products: informational catalogue only; do not publish pricing.
- Migration: incremental vertical slice before bulk import.
- Initial slice: Clopote.

## Completed

- [x] Inspected both repository structures.
- [x] Confirmed the new app is Next.js 16.3.3, React 19.2.8, TypeScript, and
  Tailwind CSS 4.
- [x] Confirmed the new app is otherwise still a create-next-app baseline.
- [x] Read the repository-specific Next.js agent instruction.
- [x] Audited primary legacy routes and data sources.
- [x] Counted 64 portfolio projects, 1,860 gallery entries, and 36 portfolio
  videos.
- [x] Identified duplicate slugs and legacy link inconsistencies.
- [x] Recorded multiple media origins and the ineffective GCS query-parameter
  image loader.
- [x] Recorded public-price removal as a migration requirement.
- [x] Created architecture, inventory, content model, plan, and status documents.
- [x] Established placeholder ownership for `sanity/`, `studio/`, and `scripts/`.
- [x] Validated local documentation links and passed ESLint.
- [x] Passed the Next.js production build using its supported Webpack path.
- [x] Initialised the new Git repository on `main`.
- [x] Implemented and tested the deterministic legacy media inventory command.
- [x] Captured the pre-Sanity baseline: 2,534 unique assets, 2,299 remote assets,
  64 projects, 1,860 gallery entries, and 36 portfolio videos.
- [x] Validated remote references: 2,222 available and 77 returning HTTP 404 on
  2026-09-07 (46 Cloudinary, 28 GCS, and 3 retired Tailwind UI placeholders).
- [x] Recorded all 77 unavailable remote references in the explicit,
  version-controlled exclusion registry by user decision on 2026-09-20.
- [x] Added per-asset `include`/`exclude` migration dispositions while retaining
  the factual remote-check result. New unavailable URLs remain blocking unless
  they are explicitly added to the registry.
- [x] Regenerated the remote inventory on 2026-09-20: 77 remote assets remain
  unavailable, all 77 are explicitly excluded, and included unavailable remote
  assets are 0. The remaining 3 errors are the missing local cover and the two
  duplicate-slug conflicts.

## Next actions

Updated 2026-10-25. Detailed order, owners, and a kickoff prompt for new
sessions are in [the session handoff](handoff.md). In short:

1. Phone acceptance — closed 2026-10-30 (accepted by the user).
2. Small Studio fix for entering technical details one fact per row.
3. Importer for the three representative Clopote projects — done and
   published 2026-10-30; large-gallery performance measured.
4. Tag-based caching and a signed publish webhook — done 2026-10-31; the
   Sanity webhook is created with hosting.
5. Hosting decision, a separate preview project, and Git remotes — done
   2026-11-02 (Netlify Free preview, publish webhook live).
6. Search/filter in category grids — done 2026-11-02 (search, year, county).
7. Search Console baseline (no Analytics history exists; property verified
   2026-11-02, data processing); URL map accepted 2026-11-02
   ([url-map.md](url-map.md)); analytics tool for the rebuilt site.
8. Phase 5 import of Policandre, Uși, Automatizări and Recondiționări —
   imported and published 2026-11-02; large galleries measured; Phase 5
   closed 2026-11-03.
9. Phase 6 — services and catalogue: plan accepted 2026-11-03
   ([phase6-services-plan.md](phase6-services-plan.md)); steps 2 (price-text
   detector), 3 (Studio schema, committed, not deployed), 4 (website data
   layer) and 5 (routes and components; content tests wait for the test
   documents) done 2026-11-03.

## Remaining prototype acceptance inputs

- The existing `1fzbw4s1/production` connection was authorized; administrator
  access and anonymous published reads were verified without changing visibility.
- Initial administrator account (one editor is sufficient); actual phone/browser
  for the acceptance test. Do not send passwords or tokens in chat.
- The intended Git remote, when repository publication is wanted.

These items do not block completing the rest of Phase 0.

## Risks and mitigations

| Risk | Current mitigation |
| --- | --- |
| GCS billing or access interruption | Keep production stable; create manifest and backup; migrate delivery to Sanity |
| Missing or malformed legacy URLs | Validate every asset and emit a blocking report |
| Duplicate slugs | Require approved canonical slugs; never resolve silently |
| Very large galleries | Prove lazy loading/performance with 89, 176, and 201-image cases (all measured by 2026-11-02) |
| Raw HTML in legacy content | Convert to Portable Text and allow-listed marks |
| Legacy prices leak publicly | Omit price fields and add source/render verification checks |
| Duplicate imports | Deterministic IDs, checksums, dry-run, checkpoints, and idempotent mutations |
| Regression in modal UX | Intercepted routes plus Back/Forward/direct-load browser tests |
| Framework API drift | Use the installed Next.js 16 documentation before implementation |

## Repository observations

- The 2026-10-10 review found an existing modification to legacy
  `data/catalog.json`; it was not written by this migration task and remains
  untouched. The legacy repository is read-only for this work.
- `rbells_policandre` is a Git repository; the prototype is committed on branch
  `prototype/mobile-publishing`, pushed to the private
  `oneonekworks/premiumbells-policandre` (2026-11-02).
- Sanity frontend dependencies, typed queries, and temporary noindex prototype
  routes are now installed. Schema ownership is in `../studio-premiumbells`.
- `../studio-premiumbells` is a separate Git repository on `main` with an
  initial commit, pushed to the private `oneonekworks/studio-prembells`
  (2026-11-02).
- As of 2026-10-24 the default Turbopack production build passes; the earlier
  `--webpack` workaround is no longer required.

## Change log

### 2026-11-03

- Phase 6 step 5: `/servicii` overview (active top-level services in order,
  variants as links), `/servicii/[service]` and `/servicii/[service]/[variant]`
  (`components/services/`: hero, body, variant cards, the eight sections,
  related works from the category, a default "Cereți o ofertă" contact box
  when the page has none). Models and catalogue items open a slide-over
  dialog (`DialogGrid`) that writes the card id to the hash: `#Policandru-7`
  opens that item, Back and Escape close it, focus returns to the card. Bell
  table scrolls inside its box on phones; audio uses `<audio preload="none">`;
  videos reuse the click-to-load YouTube embed. Metadata from `seo`, then
  `summary`; hreflang only for published languages. 308 redirects in
  `next.config.ts` (`lib/redirects.ts`, unit test). New
  `npm run services:test-docs` (dry run by default) for five test documents.
  Checked on a production build (port 3100): lint, typecheck, build, 39 unit
  and 26 migration tests; browser 29 passed, 17 skipped — 6 new service tests
  pass on desktop and mobile (overview in both languages, 404s, redirects);
  the 16 content tests (overview tree, hub and variant, hidden/wrong-parent
  404, wrong-language 308, `#Policandru-7` dialog, keyboard and Back, model
  gallery and lightbox, YouTube, price crawl of HTML and visible text) skip
  until the test documents are written with the user's go-ahead.
- Phase 6 step 4: `SERVICES_QUERY`, `SERVICE_QUERY` (top-level or under a
  parent slug, either language) and `CATALOG_QUERY` with explicit projections;
  TypeGen; loaders in `sanity/services.ts`; `resolveService` in
  `sanity/service-routes.ts` (wrong-language slug → 308, wrong parent,
  hidden, unpublished or top-level variant → 404); pure helpers in
  `lib/services.ts`. Tags `sanity:service` and `sanity:catalog:<family>`;
  webhook mapping for `service` and `catalogItem` (no family → everything);
  `revalidate:test --type service|catalogItem --family`. 36 unit tests,
  including a guard that no query mentions price/preț/cost or spreads `...`.
  The live webhook still needs the user's filter and projection change
  (text in [architecture.md](architecture.md), "Publish webhook").
- Phase 6 step 3: Studio `service` (one type with an optional parent, two
  levels), eight section objects, `catalogItem` (six families, finish and
  reference code only), desk lists "Servicii" and "Catalog" (a list per family
  whose new items get the family), language filter on both types, and a
  document-level price check (errors block publishing, words warn). Studio
  typecheck, lint, build, `sanity schema validate` (0 errors, 0 warnings) and
  19 unit tests pass, including "no field named or titled as a price" and
  "validator wired on both types". Schema extracted and website types
  regenerated. Not deployed: waits for the user (`npx sanity deploy -y`, then
  the phone check). Details in [content-model.md](content-model.md).
- Phase 6 step 2: price-text detector in the Studio (`lib/priceText.ts`) and a
  copy for the importer (`scripts/lib/price-text.ts`). Errors (block
  publishing): `€`, euro/EUR, uppercase RON, TVA, an amount next to a currency,
  "costă <număr>". Warnings: preț/prețuri, negociabil, la estimare, a bare
  "lei", and a dotted thousands number without a unit ("13.112"). 33 shared
  fixtures in `studio-premiumbells/lib/priceText.fixtures.json` (door 1 and 4,
  pristol, bell line, no hits on "160 kg", "1,6 m", "nr. 18", "1.100 kg",
  reference codes, dates); `scripts/price-text.test.ts` runs them on both
  copies and checks the rule lists are identical. ESLint now ignores the
  git-ignored `test-results/` scratch folder.
- Phase 6 plan accepted by the user with the recommended defaults:
  [phase6-services-plan.md](phase6-services-plan.md) (legacy services and
  catalogue research, schema, routes, import mapping, price safeguards,
  11 decisions, 10 steps). Notable findings: the Automatizări service page is
  only a price-list image (excluded); `/servicii/iconostase/lemn` is a copy of
  the pristol page (now a 308); the legacy page never rendered the
  `#Policandru-N` IDs (N = position 1–29 in the catalogue list).
- Phase 5 closed by the user ("everything is fine as is"); the Studio review
  is accepted and `verify-migration.ts` is deferred. Phase 6 (services and
  catalogue) starts in a new session with a plan first.

### 2026-11-02

- Published the 21 Phase 5 works with the import token at the user's request,
  after a fresh export (`production-2026-11-02-before-phase5-publish.tar.gz`):
  60 published projects — Policandre 11, Recondiționări 7, Clopote 39 (Lucrare
  de test is no longer published), Uși 1, Automatizări 2; no drafts left.
  Checked on a local production build: overview lists the five categories in
  the new order with counts; every grid, the county lists, `?judet=maramures`
  (3), `?cauta=spania` (Lleida), `?an=2023` (Lăpuș, Dej III) and project pages
  work; the old `drobeta-turnul-severin` slug is 404 (never public). The local
  server kept the old category list until a signed revalidation (served stale
  once, then fresh), as the Netlify preview does on publish webhooks.
- Measured the two largest galleries the same way as the 89-photo one
  (headless Chrome, cache disabled; phone 390×844, DPR 3, ~1.6 Mbps, 4× CPU):

  | | Rohia desktop | Rohia phone | Uși desktop | Uși phone |
  | --- | ---: | ---: | ---: | ---: |
  | Photos | 201 | 201 | 176 | 176 |
  | LCP | 0.38 s | 0.80 s | 0.34 s | 0.80 s |
  | CLS | 0 | 0 | 0 | 0 |
  | Initial load | 91 req, 1.33 MB (images 852 KB) | 66 req, 1.04 MB (images 560 KB) | 97 req, 954 KB (images 479 KB) | 60 req, 594 KB (images 127 KB) |
  | After scrolling | 1.33 MB | 1.51 MB | 954 KB | 1.36 MB |
  | After "Arată mai multe fotografii" | 2.01 MB | 1.89 MB | 1.38 MB | 1.81 MB |
  | Largest image | 52 KB | 119 KB | 29 KB | 61 KB |
  | HTML transferred | 74 KB | 74 KB | 65 KB | 65 KB |

  No horizontal overflow. The 89-, 176- and 201-photo cases are now all
  measured, which closes the large-gallery risk.
- Phase 5 written on the user's go-ahead: 875 photos uploaded, 29 reused by
  fingerprint, 0 failed (≈399 MB prepared). Categories created (published,
  cover from their newest work): Recondiționări (`category-reconditionari`,
  slug `reconditionari-policandre`, order 20), Uși (`category-usi`, 40),
  Automatizări (`category-automatizari`, 50); Policandre moved to 10. 21
  drafts created (`legacy-policandre-*`, `legacy-usi-*`,
  `legacy-automatizari-*`, `legacy-reconditionari-policandre-*`); the
  hand-made Drobeta document was deleted by its replacement; a second run
  reported all 21 unchanged. Studio validation: no errors; one new warning,
  Uși "226,5" cm (decimal comma, same false positive as Călugăreni). Not
  published yet.
- Phase 5 import prepared (plan approved by the user; nothing written to
  Sanity content yet). Dataset exported to
  `.migration/backups/production-2026-11-02-before-phase5.tar.gz`. Importer:
  pages repeated within a collection are keyed by occurrence (`page#n`, ID
  suffix `-n`), so the three `manastirea-faget` works get
  `legacy-policandre-manastirea-faget-1`–`-3`; new `title` and `skip`
  overrides; content dry runs work before a category exists. Spain (`ES`)
  added to the Studio country list (deployed) and the website. Overrides for
  all 21 records (locations from titles, clean titles, Lăpuș split by fact,
  Uși dimensions, Sihăstria Rascăi skipped in Automatizări). The user decided
  the legacy "Policandru cu coroană regală, Catedrala Drobeta" replaces the
  hand-made "Drobeta, Turnul Severin" (nothing references it; 28 of its
  photos are reused by fingerprint). Dry runs: 21 drafts, no errors or
  conflicts; 904 photos, 876 to upload (≈400 MB prepared), 28 already in
  Sanity, 0 failed. Migration tests 23, unit tests 28.
- The user verified the Search Console Domain property for policandre.ro
  (data processing). Drafted [the legacy URL map](url-map.md) from the live
  site, its three sitemaps and the legacy page files: every live path is kept
  (the rebuild reuses them); 6 redirects (two sitemap typos, a wrong blog
  link, a never-built iconostasis page, `/blog2`, `/_lucrarile-noastre`);
  `/api/hello` and three never-built services stay 404; `#Policandru-N`
  anchors to be kept by the catalogue. Old projects never had URLs, so the
  duplicate `manastirea-faget` only needs three new slugs (proposed), and the
  missing `/img/works-cover/4.jpg` belongs to three photo-less Orologii and
  Sonorizări records (not imported). The user accepted all proposals
  (including `lemn-bronz` → `/servicii/iconostase` and a new
  `/servicii/clopote` hub). Redirects are implemented at cutover, when their
  targets exist.

- SEO baseline (step 7) revised: the user confirmed policandre.ro never had
  analytics configured, so there is no Analytics baseline. Plan: the user
  verifies a Search Console Domain property by DNS (historical search data
  expected after verification); the URL map is drafted from the legacy routes
  meanwhile; the rebuilt site gets analytics at cutover (cookieless tool
  recommended, GA4 with consent only if Google Ads are planned).

- Search and filters on the category grids (handoff step 6): a search field
  (title and place, ignoring diacritics: "iasi" finds Iași, "rosu" finds Roșu),
  a year filter and a county filter (Republic of Moldova as one option), all in
  the query string next to `?pagina=` (`cauta`, `an`, `judet`), so filtered
  views can be shared and Back/Forward works. The grid now reads every card of
  the category once (same cache tag) and the page filters it on the server;
  reasons in `docs/architecture.md` ("Category search and filters"). 24 cards
  per page kept (the brief's 12 was out of date). Labels in Romanian and
  English; Clopote is not published in English yet, so the English labels
  were not seen in a browser.
- Checked on a local production build (port 3100, scratch Playwright config
  in the ignored `test-results/` extending `playwright.config.ts` with
  `baseURL` `http://127.0.0.1:3100` and `npm run start -- --port 3100`):
  lint, typecheck, build, 27 unit tests (6 new: diacritic folding, search,
  options, filters, query parsing, URLs), 21 migration tests, 23 browser tests
  passed, 1 skipped (8 new: search, filters with no-results and clear,
  pagination with filters, slide-over from filtered results with
  Back/Forward; desktop and mobile). The first run showed that typing from an
  unfiltered grid replaced its history entry, so Back left the site; starting
  a search now pushes one entry.
- Data seen while planning, for the user: Zosin has no county (locality
  Botoșani), so it is missing from the county filter; "Lucrare de test" is
  still published in Clopote (no year).

- Pushed both repositories to private GitHub remotes after checking they were
  empty and scanning the history for secrets: website
  `oneonekworks/premiumbells-policandre` (`main`, `prototype/mobile-publishing`),
  Studio `oneonekworks/studio-prembells` (`main`).
- Hosted the preview on Netlify Free (`premiumbells-preview.netlify.app`). The
  first build failed: `next build` type-checked `scripts/`, which imports the
  Studio's image rules from the sibling repository. `scripts/` is now excluded
  from `tsconfig.json` and checked through `tsconfig.scripts.json`; a clean
  clone without the Studio builds.
- The team-login visitor protection also blocked `/api/revalidate`, so the
  project visibility is public (pages stay noindex). The secret first returned
  "not configured" until it had the Functions scope and the project was
  redeployed.
- Checked on the hosted site: pages, English routes, 308 from `/ro/…`, 404s,
  noindex and canonical metadata; 15 browser tests passed (1 skipped).
  `npm run revalidate:test` was accepted (200) and an unsigned request got 401;
  after a `workCategory` request Netlify re-rendered the overview from Next and
  then served it from its durable cache again. Responses start in ~0.5 s from
  here, including static files, so it is network latency, not rendering.
- The user created the Sanity webhook `Revalidare site`. End-to-end check:
  with Parohia Versești, Neamț cached at 12:34:45 UTC, the user published a
  summary edit at 12:35:54; at 12:36:46 the hosted project page and the
  Clopote grid both showed the new text, ahead of the hourly backup refresh.

### 2026-10-31

- Data delivery (Phase 2): replaced `cache: 'no-store'` with tag-cached reads
  through `sanityFetch()` (`sanity/fetch.ts`; per type, category grid and
  project slug, plus a catch-all `sanity` tag; hourly backup refresh, decided
  by the user). Added the signed webhook route `POST /api/revalidate`
  (`next-sanity/webhook` signature check, `revalidateTag(tag, {expire: 0})`)
  and `npm run revalidate:test`, which signs a test request with the local
  secret. `SANITY_REVALIDATE_SECRET` was generated into `.env.local` only.
  `/lucrarile-noastre` is now prerendered (ISR) instead of dynamic.
- Verified on a production build (port 3100, cache debug logs): a second visit
  read every query from cache; a signed `project` request cleared only that
  project and its category grid, and the next visit refetched only the project;
  a `workCategory` request refetched the category list and lookup and
  regenerated the prerendered overview while the grid stayed cached; unsigned
  requests got 401. Unit tests 21 (7 new for tags and signatures); browser
  tests 15 passed against the production build.
- Not live: the Sanity webhook needs a public URL, so it is created with
  hosting (settings in `docs/architecture.md`). Draft Mode is designed, not
  built.

- The user confirmed the guessed localities: Moi (Târgu Jiu), Coarnele Caprei
  (Iași), Crainiceni (Botoșani), Comănești, Suharău (Botoșani); noted in the
  overrides.
- "Localitate" is now optional in the Studio (country stays required, default
  RO); the website already omits a missing locality from the place line and
  generated alt text.

### 2026-10-30

- Imported the rest of `worksClopote` (36 works) as drafts after a full dry
  run and the user's approval of a written proposal (locations from titles and
  descriptions, slug decisions, one-fact-per-row weights). Dataset exported
  first to `.migration/backups/production-2026-10-30-before-clopote-bulk.tar.gz`.
  829 photos: 821 uploaded, 8 matched by fingerprint (407.6 MB → 366.5 MB
  prepared; 178 shrunk above 3200px); 0 failed. 791 gallery photos across the
  36 drafts (two byte-identical repeats dropped, Velea and Sat Doina). A second
  run reported all 36 unchanged.
- Decisions recorded in `scripts/config/legacy-overrides.json`:
  `clopote-sihastria-rascai` is the same work as the Automatizări record and is
  imported once, under Clopote, as `sihastria-rascai` (skip the Automatizări
  copy later; redirect both old URLs); `cascioarele-giugiu` →
  `cascioarele-giurgiu`; repeated legacy `_nr`/`historyNr` kept as provenance
  only (IDs come from the legacy page); no Clopote record is in maintenance;
  two or three bells → one "Greutate" row each, sets of four or more →
  "Număr de clopote" plus a "Greutate" range, `-` → no row. The Magazin Iași
  MP4 on GCS is skipped (YouTube only).
- Importer: legacy description HTML becomes plain-text summary lines; `-`
  specification values are dropped. Migration tests 21.
- Studio validation: errors only for the three drafts without a locality
  (Zosin, Sihăstria Rascai, Biserica din lemn); 7 empty-description warnings;
  Călugăreni's "67,6 kg" triggers the several-facts warning (decimal comma,
  a false positive).
- The user filled the three localities (Râșca; Chișinău; Botoșani) and
  published those three. "Descrierea lucrării" is now optional in the Studio
  (it blocked publishing works without a description); Studio deployed, which
  also shipped the pending "Ordine în categorie" help text. After a fresh
  export (`production-2026-10-30-before-clopote-publish.tar.gz`) and a clean
  validation run, the other 33 drafts were published with the import token at
  the user's request: 41 published projects, 40 in Clopote. Category and
  project pages checked on the dev server.

- Closed the phone acceptance record (Phase 1) on the user's acceptance.
  Per-check details were not recorded; rows with evidence from the work
  (Drobeta phone upload, optional alt text, technical details, the 89-photo
  measurement) are noted. The 200-image editor check moves to Phase 5.

- Decided to migrate all legacy media into Sanity (option C) rather than keep
  legacy photos on GCS: the 2,202 included GCS images total ~1.2 GB (median
  382 KB), far below Sanity Free's asset allowance, and the image CDN serves
  smaller responsive versions than GCS's single-size files. GCS stays the
  read-only archive; the user also keeps a local copy of the assets.
- Exported the dataset documents to
  `.migration/backups/production-2026-10-30-before-clopote-import.tar.gz`.
- Built the importer (`scripts/migrate-assets.ts`, `scripts/migrate-content.ts`,
  `scripts/lib/legacy-portfolio.ts`, `scripts/lib/optimize-image.ts`, overrides
  in `scripts/config/legacy-overrides.json`); see the scripts README. Added
  `sharp` and `@sanity/client` as dev dependencies. 13 new migration tests
  (19 total); typecheck and lint pass.
- Imported Schitul Duca (11 photos), Parohia Ziua Crucii, Iași (18 photos,
  2 videos, Greutate 310 kg) and Parohia Roșu Chiajna, Sfințire (89 photos,
  1 video, Greutate 460 kg and 620 kg split into two rows) as drafts
  `drafts.legacy-clopote-*`. 121 photo references → 118 unique assets
  (40.6 MB; legacy covers are identical to one gallery photo each); 101 photos
  were above 3200px and shrunk (44.1 MB → 39.1 MB prepared). The hand-made
  Schitul Duca document was deleted by user decision (its 3 photos remain as
  assets). A second run uploaded nothing and left all drafts unchanged. Studio
  validation: no errors; Schitul Duca and Roșu Chiajna warn that the
  description is empty (the legacy records had none).
- Published the three drafts with the import token at the user's request (the
  Studio publish had not reached the dataset).
- Measured the 89-photo project (`/lucrarile-noastre/clopote/rosu-chiajna-sfintire`)
  on a local production build with headless Chrome, cache disabled:

  | | Desktop 1440×900 | Phone 390×844 (DPR 3, ~1.6 Mbps, 4× CPU) |
  | --- | --- | --- |
  | LCP | 0.60 s (blur placeholder) | 0.88 s (YouTube poster) |
  | CLS | 0 | 0 |
  | Initial load | 88 requests, 789 KB (images 349 KB) | 67 requests, 916 KB (images 482 KB) |
  | After scrolling the page | 791 KB | 1.25 MB |
  | After "Arată mai multe fotografii" (48 shown) | 1.15 MB | 2.04 MB |
  | Largest image | 20 KB (384w thumbnails) | 53 KB (640w thumbnails) |
  | Lightbox photo | 1920w, 109 KB | 1200w, 53 KB |

  24 thumbnails per page, lazy loading, no original-size downloads, and
  64px lazy lightbox thumbnails. Times are against a local server, so they
  exclude real network latency for the HTML. The 89-photo page's HTML is
  ~244 KB uncompressed (~42 KB transferred), mostly per-photo blur
  placeholders. Phase 3's large-gallery exit criterion is met for 89 photos;
  the 176- and 201-photo galleries remain to be checked in Phase 5.
- Generated alt text no longer repeats a place the title already names
  (diacritic-insensitive word match in `lib/alt.ts`): "Parohia Ziua Crucii,
  Iași – fotografia 1 din 18", "Schitul Duca, Brașov – …". Unit tests 13.
- Category grids now order works by "Ordine în categorie" (lower first), then
  "Lucrare reprezentativă", then year, newest first (works without a year count
  as newest), then creation date (decided by the user). Fixed `featured desc`,
  which put works with an unset flag above featured ones; it now uses
  `coalesce(featured, false)`. Unit tests 14. The Studio help text for
  "Ordine în categorie" is updated and committed but not deployed yet.

### 2026-10-24

- Committed the prototype on `prototype/mobile-publishing` and initialised the
  Studio repository with its first commit.
- Upgraded Next.js and `eslint-config-next` from 16.3.3 to 16.4.3, clearing the
  critical Next.js advisories; applied non-breaking audit fixes only. Remaining
  frontend findings: 11 moderate and 3 high, all transitive via `next-sanity`.
- Lint, typecheck, Turbopack production build, 5 query tests, 6 migration tests,
  and 4 browser checks pass.
- Decided translation storage, readiness gating, and language URL conventions;
  recorded them in the content model, architecture, and brief. English stays
  the second language; a third language waits for demand data. Implementation
  follows during schema expansion.
- Implemented [design foundations and the site shell](design-foundations.md):
  tokens, Cormorant Garamond/Inter, header, mobile menu dialog, footer, and an
  RO | EN switcher. All routes moved under `app/[lang]` with `proxy.ts`
  (Romanian unprefixed, `/en` with translated sections, `/ro` and Romanian
  sections under `/en` redirected). Placeholder home, services, works, and blog
  pages; 404 inside the shell. `npm run dev` now uses Webpack because of a
  Turbopack dev reload loop on the prototype route. Lint, typecheck, build, and
  11 browser checks pass (1 mobile-only check skipped on desktop). Visual review
  by the user is pending.
- Shell approved by the user.
- Expanded the Studio portfolio schemas with locale objects, the
  `publishedLanguages` gate, SEO, video, specifications, legacy provenance,
  category ordering/visibility, and the language filter plugin. Frontend
  queries take `$lang`, read locale fields with `select()` (typed by TypeGen),
  hide unpublished languages, and fall back to Romanian only for alt text.
- Exported the dataset documents to `.migration/backups/`, then migrated the
  four prototype documents (2 projects, Clopote, page copy) to `{ro}` locale
  values and country codes with the idempotent `localize-prototype-fields`
  migration. Validation: 3 documents valid; Clopote warns until a category
  cover image is chosen.
- Studio typecheck, lint, and build pass. Frontend lint, typecheck, build,
  7 query tests, 6 migration tests, and 11 browser checks pass.
- Built the Clopote slice (works for every category): `/lucrarile-noastre`
  overview, category layout with sidebar, paginated project grid, intercepted
  slide-over and full project page sharing one details component, 24-at-a-time
  gallery, fullscreen lightbox, click-to-load YouTube, rich text,
  specifications, canonical/hreflang/Open Graph metadata, wrong-language slug
  redirects, and a section error boundary. Removed the `/prototip` routes.
- Worked around two Next 16.4 + proxy interception issues (mapped `Next-Url`
  header; stripped repeated `(.)` markers) and a nested-dialog event leak.
- Lint, typecheck, build, 11 unit tests, 6 migration tests, and 15 browser
  checks on the production build pass (1 mobile-only check skipped on desktop).
  Search/filter, the three representative imported projects, and large-gallery
  performance measurement remain open for Phase 3.
- Added in-browser photo optimisation to the Studio: a multi-photo gallery
  button and a single-image asset source shrink photos to 2560px (JPEG ~85%),
  strip metadata, and upload; plain full-size uploads are disabled. In Chrome,
  legacy 14.9 MB / 14.6 MB photos became 594 KB / 733 KB in ~0.3 s; PNG
  transparency is kept; undecodable formats pass through flagged. Studio
  typecheck, lint, and build pass. The Studio UI itself and phone/HEIC
  behaviour still need verification by a signed-in editor.
- Deployed the Studio to <https://premiumbells.sanity.studio> (app ID recorded
  in `sanity.cli.ts`, schema deployed, auto-updates on) and aligned local
  `sanity`/`@sanity/vision` with the hosted runtime (6.20.0). Signing in
  requires a member of project `1fzbw4s1`. Phone acceptance can now proceed.

### 2026-10-25

- Reworked technical details entry in the Studio (deployed; seed migration run for Policandre and Clopote): each row
  is one fact with clearer descriptions, a preview that reads "Greutate: 1000
  kg", and a soft warning when a value looks like several facts. New optional
  `workCategory.suggestedSpecifications` (label RO/EN + default unit) drives
  tap-to-fill chips above the rows (`components/SpecificationsInput.tsx`); a
  generic list shows until a category is chosen. Seed migration
  `seed-suggested-specifications` (Policandre, Clopote; `setIfMissing`) was
  dry-run only; dataset exported to
  `.migration/backups/production-2026-10-25-before-suggestions.tar.gz`. The
  Drobeta row was split by the editor. Studio unit tests 12.
- Project details layout: description and videos in a left column, the technical
  details card in a 20rem right column from a 48rem container width (container
  query, so the slide-over and full page both work); one column on phones in
  the order description, details, video. The summary now renders with the body
  instead of in the header.
- Refined the upload optimiser: photos within 2560px are kept, with metadata
  stripped losslessly (JPEG APP1/XMP/MPF/comments and trailing data; WebP
  EXIF/XMP chunks); orientation-flagged photos are re-saved once; shrunk JPEGs
  step quality down (0.85 → 0.65) rather than grow. Files are identified by
  content, not extension. Verified in Chrome: the user's two WebP photos
  (407 KB, 257 KB) are byte-identical after upload preparation; a small JPEG
  with injected EXIF/GPS comes back byte-identical to its metadata-free source;
  a real orientation-6 legacy photo is re-saved upright (1.1 MB → 600 KB); large
  photos shrink 14.2 MB → 580 KB. 5 Node unit tests cover the byte-level
  stripping. Studio redeployed. Of 166 legacy JPEGs, 101 carry EXIF, 1 has an
  orientation flag, and 1 is a PNG with a `.jpg` name.
- Raised the upload limit to 3200px (JPEG 85% ≈ 0.65–1 MB for typical photos,
  ~2 MB for dense gilded detail) and added a 1.5 MB cap: heavier photos within
  3200px are re-compressed at the same size only when that saves ≥20%
  (transparent PNGs excepted). Verified in Chrome: the user's WebP photos stay
  byte-identical; a 1280px/4.5 MB JPEG → 833 KB; 6000px marble photo → 844 KB;
  heavily compressed 399 KB source → 365 KB at 3200px; orientation-6 photo
  re-saved upright; opaque 14.9 MB photo-like PNG → 583 KB JPEG; transparent
  PNG kept. Studio redeployed.
- Made photo descriptions (alt text) optional after phone testing showed that
  requiring one per gallery photo blocked publishing. The website now uses the
  editor's text, then the caption, then a generated description from the
  project name and locality with the photo position (RO/EN). Decorative
  thumbnails (sidebar, lightbox strip) use empty alt. Studio redeployed; unit
  (12) and browser (15) tests pass.
- Added duplicate protection to gallery uploads: a SHA-1 fingerprint of each
  picked file is stored as the asset's `source.id`; photos already in the
  gallery or repeated within one selection are skipped before upload, and an
  upload resolving to an asset already in the gallery is not added again.
  Photos uploaded earlier have no fingerprint and are matched by identical
  bytes only. 3 new Studio unit tests (8 total); Studio redeployed. The upload
  UI still needs verification by a signed-in editor.

### 2026-10-10

- Connected the authorized sibling Studio and frontend to `1fzbw4s1/production`.
- Added minimal Romanian project/category/page-copy schemas, image metadata,
  singleton navigation, and TypeGen for three frontend queries.
- Added published-only prototype routes with paginated responsive galleries,
  query fixtures, browser checks, and a phone acceptance runbook.
- Verified lint/type checks and production builds in both apps; 5 Sanity query
  tests, 6 migration tests, and 4 desktop/mobile browser checks pass. Actual-phone
  and populated live publish/unpublish checks remain pending.
- Recorded dependency-audit findings, including the existing Next.js 16.3.3
  critical advisory, as unresolved release work in the prototype runbook.
- Preserved prior uncommitted changes and left `rbells-tw` untouched. No content
  imports, publications, deployment, or commits were performed.

- Reviewed the repository against the handoff; migration tests passed 6/6.
  This was not a fresh remote-availability audit or full application build.
- Consolidated the user's CMS, mobile publishing, budget, bespoke design,
  Romanian/English launch, future Greek, and search-market requirements.
- Registered catalogue links as reference sources; full PDFs remain unread
  because Drive access failed. Supplied screenshots were reviewed.
- Aligned architecture, model, plan, and inventory documentation; no application
  code, legacy files, accounts, or production systems changed. No commit made.

### 2026-09-20

- Classified exactly the 77 known unavailable remote assets as intentionally
  excluded from migration without changing their HTTP 404 availability facts.
- Added manifest disposition counts so included unavailable remote assets remain
  visible as blocking errors.

### 2026-09-07

- Added the legacy media manifest generator, remote availability validation,
  stable asset identity, local checksums, provenance, and focused tests.
- Recorded 77 remotely unavailable references and one missing local cover for
  resolution during migration triage.

### 2026-09-05

- Created the migration foundation and initial audit documentation.
- Selected the initial `Clopote` vertical slice and representative records.
