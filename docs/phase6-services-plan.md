# Phase 6 — services and catalogue: plan

**Status:** Accepted by the user on 2026-11-03 with the recommended defaults
(see "Decisions" below). Proposed and researched on 2026-11-03.

## Decisions (accepted 2026-11-03)

1. The maintenance services (souvenir bells, domes, analog/sfeșnice/chivot)
   are imported as drafts with status Ascuns; the user publishes the ones to
   launch after a review in Studio. No "în mentenanță" cards.
2. Automatizări clopote cu balans: the 5 kits from the price image are rebuilt
   as a price-free "Seturi" section with the covers and Automatizări works;
   `automatizari-set.jpg` is excluded (it shows prices). Short copy from the user.
3. `/servicii/iconostase/lemn` (a copy of the pristol page) redirects (308) to
   `/servicii/iconostase`.
4. No pricing words on the site (no "preț", "negociabil", "la estimare");
   the call to action is "Cereți o ofertă". "În preț sunt incluse…" becomes
   "Include: …" without TVA.
5. The large MP4s go to the company YouTube channel; the pages use YouTube
   embeds. Until they are uploaded, the video sections stay empty.
6. Catalogue data: merge the identical 009/010 (anchors `Policandru-9` and
   `-10` both land on it); import the other suspect values (011 gilded code,
   002 levels, 015 finish, 0010/017 numbers) as they are and list them for
   review in Studio; skip the component (its photo is missing).
7. Aplice go with the analog/sfeșnice/chivot catalogue (hidden until it
   launches), so `/servicii/policandre` matches the legacy page.
8. Door models get no links; each opens its own gallery dialog. Their
   descriptions are drafted price-free from the legacy wording for the user's
   review.
9. Clopotar products 010–014 are model cards on the service page.
10. The proposed English slugs are provisional until English is published.
11. The restoration case study links to the Recondiționări project
    "Catedrala Sfântul Alexandru, Alexandria".

## Research
Sources read: the project docs (handoff step 9, migration plan Phase 6, URL map,
content model, source inventory, architecture, `scripts/README.md`), the
legacy `data/servicePages.js`, `data/services.js` and `data/catalog.json`, all
`pages/servicii/**` files, `components/clopote-*-specs.js`,
`components/sliding-panel.jsx`, `components/shared/simpleProductList.jsx`,
`public/products.xml`, the media manifest, the Studio `schemaTypes/`, the app's
`sanity/` and routes, and the Next 16 docs (dynamic routes, redirects, proxy
execution order, `generateStaticParams`/`dynamicParams`).

## 1. What the legacy site actually has

### Services (12 cards in `servicePages.js`, plus pages that have no card)

| Path (all kept) | Content in the legacy files | Media (manifest) | Price content found |
| --- | --- | --- | --- |
| `/servicii/policandre` | Intro paragraph (Moscow/Iaroslavl/Greece) and a catalogue grid of 29 records from `catalog.json` | 29 PNG/JPG on GCS/local, all OK | Every record has `type.*.price` (not rendered, commented out) |
| `/servicii/policandre-la-comanda` | 2 paragraphs, 12-photo gallery | 12 GCS | Text: "În preț este inclusă…" |
| `/servicii/reconditionare-policandre` | Intro, 6-photo collage gallery, **4 stages** (text plus 10/10/9/10 photos), case study "Catedrala Sf. Alexandru, Alexandria, August 2022" | 45 GCS OK; `generalPhotos` (27) are all 404 and not rendered | none |
| `/servicii/clopote` | **new hub** (decided 2026-11-02); the legacy tab page has a shared intro ("…până la 16 tone… Athos…") | — | — |
| `/servicii/clopote/cu-jug` | 1 line of text, MP4 (83 MB) with poster, **size table of 29 rows** (Greutate, Diametru, Înălțime, Notă, **Preț = "negociabil"**), the line "În preț sunt incluse: limba, icoane…", 10 bell sets (weights only) | video + poster OK | Price column; "included in the price" text |
| `/servicii/clopote/fara-balans` | 1 paragraph, MP4 (108 MB) with poster, **size table of 33 rows**, 6 sets **with MP3 audio** | video, 6 MP3 local | Price column |
| `/servicii/clopotar-electronic` | 5 products (codes 010–014: GM870I, KIITF4EVO, M-8000, QUADRO, GSM4000) with description, bullet list and image; 8-photo gallery; 6 MP4 (5–53 MB, **no posters**) | OK | none |
| `/servicii/automatizari-clopote-cu-balans` | Heading "Prețuri" and **one image, `automatizari-set.jpg`**, which shows 5 kits with prices (5598–11460 € TVA inclus). There is no other content. | 3 covers OK | **The whole page is a price list** |
| `/servicii/iconostase` | Intro ("…Prețul se estimează după elaborarea unui proiect."), 4 variant cards; Tailwind UI template leftovers ("Workspace Collection") and placeholder alt texts | local covers | Card `price: '€ \| 9000-16000'` (not rendered) |
| `/servicii/iconostase/marmura` | Intro, ~10 example images with descriptions | 18 refs OK | Text; placeholder alts ("Detail of zipper pull…") |
| `/servicii/iconostase/lemn-aur` | ~23 examples (Saransk etc.) | 44 refs OK | none |
| `/servicii/iconostase/iconostas-bronz` | ~12 examples | 22 refs OK | none |
| `/servicii/iconostase/pristol-marmura` | Intro, ~10 altars/prothesis tables with dimensions and materials | 28 refs OK | **Each description and some alts** ("Pristolul costă 16.000€", "Jertfelnic, costa 9000€") |
| `/servicii/iconostase/lemn` | **A copy of the pristol page** (breadcrumb "Pristol marmura", same images and prices). The hub does not link to it. | 12 wood photos in `public/services/iconostase/lemn/` are unused | Same as pristol |
| `/servicii/usi` | 8 door models, each with a cover, a gallery (27/13/7/10/9/8/8/4), a description and a price. These open in a slide-over **that shows the price and the subline "Prețurile reflectă calitatea…"**. Their `href`s point to iconostasis pages (wrong). | GCS OK; the `catalog.json` `usi.cupru` (46 Cloudinary) are all 404 and excluded | Price plus description plus subline |
| `/servicii/clopote-suvenire` (maintenance, 404) | Card text "Cel mai bun cadou…", 26-photo gallery list | 26+2 OK | none |
| `/servicii/cupole` (maintenance, 404) | Card only; galleries inox-aurite 77, cupru 6, compozit 5, compozit-aurite 13 | 101+5 OK | none |
| `/servicii/analog-sfesnice-chivot` (maintenance, 404) | Card only. The catalogue has analog/chivot/pupitru 6, sfeșnice 8 and aplice 10, **none rendered anywhere** | GCS OK | sfeșnice `price` |

### Catalogue (`catalog.json` → `ru.iaroslavl`)

- `policandre`: 29 records (19 chandeliers of 1–7 levels plus 10 horos),
  rendered on `/servicii/policandre` in legacy order. The fields are `nr`,
  `levels`, `height`/`diameter` (m), `weight` (kg), `candles`, `image`, and
  `type.varnished|gilded.{refId, price}`.
- `componentePolicandre` 1 (its image is 404), `apliceList` 10 (cm, some weights
  in "4 Kg"), `analogChivotPristolList` 6 (`dimension` "0.95x0.95 m"),
  `sfesniceList` 8 (height inside `descripton`: "Inaltimea - 1.86m").
- Data problems for review: records 009 and 010 are identical (same refIds);
  011's gilded refId 113311 is the component's code (expected 110311);
  002's title says "2 nivele" but `levels` is 1; 015 has only a "varnished"
  refId ending in 11 (the gilded code pattern); 0010's title says "nr. 9" but
  `nr` is 1; 017 has no `nr`; refIds contain spaces ("110 212"); horos 0005
  and 0006 have prose in `weight`/`diameter` ("De la 1.4 pana la 4.2",
  "Greutatea unei secții 15"); sfeșnice `_id` 0006 and 006 are separate items.
- **`#Policandru-N` anchors.** `products.xml` lists `#Policandru-1…29`, with
  18 twice. That file is malformed XML (`<xml` instead of `<?xml`), so Google
  likely ignored it. The legacy page **never rendered those IDs**, so the
  links have always landed at the top of the page. N matches the 1-based
  position in the `policandre` array (29 records).

## 2. Studio schema (in `../studio-premiumbells`)

Everything follows the project pattern: `publishedLanguagesField` ("Publicat
în", default `['ro']`), `localeString`/`localeText`/`localeBlockContent`
with `localeRule`, `imageWithMetadata`, `seo` and `legacySource`, plus
`@sanity/language-filter` on the new types. Romanian labels come first. **No
field anywhere is named or labelled as a price.**

### `service` — "Serviciu" (one type for services and their variants)

I recommend one document type with an optional parent instead of a separate
`serviceVariant` type. A variant such as `clopote/cu-jug` is a full page with
the same fields, and one type keeps GROQ, TypeGen and the webhook simple.

| Field | Romanian label | Type | Notes |
| --- | --- | --- | --- |
| `publishedLanguages` | Publicat în | shared field | English requires the English title, slug and summary |
| `title` | Denumire | localeString | required in each published language, max 120 |
| `slug` | Adresă scurtă | localeSlug | `cu-jug` / `with-yoke`; kept stable after publishing |
| `parent` | Serviciu părinte (opțional) | reference → service | Only top-level services can be parents (two levels at most); a slug must be unique among siblings |
| `status` | Afișare | radio: Activ / Ascuns | Ascuns = not linked and 404, while the editor keeps working on it. No public "în mentenanță" card, because it was a dead end. |
| `cardLabel` | Text scurt pe card | localeString | the legacy `subtitle` ("1–7 nivele", "Cu balans") |
| `summary` | Descriere scurtă | localeText | card text plus meta-description fallback |
| `coverImage` | Fotografie de copertă | imageWithMetadata | required |
| `body` | Text de prezentare | localeBlockContent | intro paragraphs |
| `sections` | Secțiuni ale paginii | array of the section objects below | sortable |
| `relatedCategory` | Lucrări din categoria | reference → workCategory (optional) | "Vezi lucrările" link plus 3 latest works |
| `displayOrder` | Ordine în listă | number | the legacy card order is 10, 20, … |
| `seo`, `legacy` | SEO, Proveniență | existing objects | |

Section objects stay deliberately few. Each has a localeString `heading`:

- `sectionGallery` "Galerie foto": `imageWithMetadata[]` using
  `OptimizedGalleryInput` (collages, la-comandă, clopotar photos, maintenance
  galleries).
- `sectionSteps` "Etape de lucru": items {title, text, images[]}, for the 4
  restoration stages.
- `sectionModels` "Modele / exemple": items {title, description, cover,
  gallery[], specifications[], anchorId}. These hold the doors, iconostasis
  examples, altar tables and the 5 clopotar products. Each card opens a dialog
  with its gallery (the slide-over of the old door page).
- `sectionBellSizes` "Tabel dimensiuni clopote": rows {weightKg, diameterCm,
  heightCm, note}, typed numbers, no free columns, so a price column cannot
  come back.
- `sectionBellSets` "Seturi de clopote": items {title, weightsKg[],
  withElectronicRinger, audio (file, mp3)}.
- `sectionVideos` "Video": the existing `video` objects (YouTube, or an owned
  file with a required poster).
- `sectionCatalogue` "Catalog": a family filter (see `catalogItem.family`),
  which renders the published items of that family.
- `sectionCta` "Contact": a label plus a choice of phone/email/page. It
  defaults to the company phone and email, which move to `siteSettings` in
  Phase 7 and live in a constant until then.

### `catalogItem` — "Produs din catalog"

| Field | Romanian label | Type | Notes |
| --- | --- | --- | --- |
| `publishedLanguages` | Publicat în | shared field | |
| `title` | Denumire | localeString | e.g. "Policandru cu 3 nivele, nr. 1" (HTML spans removed) |
| `family` | Familie | list: Policandre, Policandre cu horos, Componente, Aplice, Analoghii și chivoturi, Sfeșnice | the labels come from the website dictionary; adding a family is a small schema change |
| `number` | Număr în familie | string | the legacy `nr` ("nr. 4") |
| `image` | Fotografie | imageWithMetadata | required |
| `gallery` | Alte fotografii (opțional) | imageWithMetadata[] | e.g. the `pol-115411-2…4` extras |
| `summary` | Descriere scurtă (opțional) | localeText | |
| `levels`, `candles` | Nivele, Lumânări | integer | |
| `heightCm`, `diameterCm`, `widthCm`, `depthCm` | Înălțime, Diametru, Lățime, Adâncime (cm) | number | stored in cm; the site shows ≥100 cm as metres ("3,1 m") |
| `weightKg` | Greutate (kg) | number | |
| `specifications` | Alte detalii tehnice | existing `specification[]` | ranges and prose ("4–12 secții, 15 kg/secție") |
| `variants` | Finisaje și coduri | array of {finish: Lăcuit / Aurit / Argintat / Patinat, referenceCode} | **two fields only, no price** |
| `madeToOrder` | Se execută la comandă | boolean | |
| `anchorIds` | Ancore de link vechi | string[], read-only | `Policandru-9` and `-10` both land on the merged duplicate |
| `displayOrder` | Ordine | number | legacy order |
| `legacy` | Proveniență | legacySource | |

Catalogue items get **no page of their own** in Phase 6. The legacy site had
none, and `/servicii/policandre/<item>` would clash with the variant route.
Each card has `id` = each anchor ID plus the slug, and opening a card sets the
URL hash, so `/servicii/policandre#Policandru-7` opens that chandelier's
dialog. A `slug` field is still kept so pages can be added later under a
different path.

Desk structure: add "Servicii" (ordered tree: parents, then their variants) and
"Catalog" (grouped by family) next to the portfolio items.

Studio tests: (a) no schema field is named or titled
`/pre[tț]|price|cost|tva/i`; (b) the price-text validator (section 4) runs on
`service` and `catalogItem`.

## 3. Routes and data (website)

Next 16 notes from the installed docs: `next.config.ts` `redirects()` run
before `proxy.ts`, so the 308s match public URLs. Static folders beat dynamic
ones, and the existing `[lang]/[...rest]` catch-all stays the fallback. With
`generateStaticParams` plus the default `dynamicParams = true`, unknown slugs
render on demand and return 404 through `notFound()`. No `cacheComponents`,
so the `fetch` tag pattern is unchanged.

```text
app/[lang]/servicii/page.tsx                      overview (replaces the placeholder)
app/[lang]/servicii/[service]/page.tsx            service; a parent also lists its variants
app/[lang]/servicii/[service]/[variant]/page.tsx  variant: clopote/cu-jug, iconostase/marmura…
```

- English: `/en/services/...` through the existing `englishSections` table.
  Service and variant slugs are `slug[$lang]`. A wrong-language slug redirects
  with a 308 (same as `resolveCategory`). A variant requested under the wrong
  parent or at top level is a 404. English pages exist only when `en` is in
  `publishedLanguages`; the importer sets `ro` only, so there is no English
  service page at launch.
- `sanity/services.ts` (loaders wrapped in `cache()`), `sanity/service-routes.ts`
  (`servicePath(parent?, slug)`, `resolveService`), queries in
  `sanity/queries.ts` with explicit projections (never `...`), and TypeGen.
- `/servicii` lists the active top-level services in `displayOrder`, followed
  by their variants as secondary links. The header keeps its single "Servicii"
  link; a service dropdown can come with the Phase 7 navigation singleton.
- Components: `ServiceSections` (server) maps each section type. Client code is
  limited to `CatalogueGrid`/`ModelGrid` (dialog plus hash) and the existing
  `Gallery`/`Lightbox`, `VideoEmbed` (plus `<video preload="none">` for owned
  files) and a native `<audio controls preload="none">` for bell sets.
- Metadata: title/description from `seo`, then `summary`;
  `languageAlternates` only for published languages; og image = cover.
- Redirects (308) in `next.config.ts` once their targets exist, with a unit
  test over the table: `/servicii/servicii/iconostase`, `/servicii/servicii/usi`,
  `/servicii/iconostase/lemn-bronz` → `/servicii/iconostase`. The blog and
  `/_lucrarile-noastre` rows wait for their own phases (the target of
  `/_lucrarile-noastre` exists, so it can go in now too).
- `bilingualPaths` in `lib/i18n/routing.ts` already includes `/servicii`.
  Service pages supply their own alternates, as categories do.

### Cache tags (`sanity/cache-tags.ts`)

| Read | Tags |
| --- | --- |
| Services overview, any service/variant page, nav | `sanity:service` (about 20 documents, so one tag is the smallest useful scope and also clears cached 404s for new slugs) |
| Catalogue section of a family | `sanity:catalog:<family>` |
| Related works on a service page | existing `sanity:category-projects:<categoryId>` |

Webhook mapping: `service` → `sanity:service`. `catalogItem` → old and new
`catalog:<family>`, or everything if the family is missing. Tests are added to
`tests/revalidate.test.ts`. The Sanity webhook needs two manual changes in
sanity.io/manage, which the user makes (I will give the exact text):
- Filter: `_type in ["project", "workCategory", "portfolioPage", "service",
  "catalogItem"]`.
- Projection: add `"family": family` to `before()`/`after()`.

Until then, a service publish shows on the preview only after the hourly
refresh. `npm run revalidate:test` gets `--type service|catalogItem`.

## 4. Import mapping (reusing the Phase 5 importer)

- Shared pieces: `migrate-assets.ts` (image rules, SHA-1 fingerprint, reuse,
  checkpoint in `.migration/checkpoints/assets.json`), `import-run.ts`
  (arguments, reports, write client), overrides, dry run by default, drafts
  only, published documents skipped, unchanged drafts not rewritten.
- New: `scripts/lib/legacy-services.ts` and `scripts/lib/legacy-catalog.ts`,
  selected with `--collection services|catalog`. `migrate-assets` learns file
  assets (MP3 now, MP4 if decided).
- Inputs: `servicePages.js`, `services.js` and `catalog.json` are data modules
  (VM evaluation as in the inventory). The arrays inside page and component
  files (bell tables, sets, iconostasis examples, clopotar products, stages)
  are extracted with the TypeScript parser (top-level `const` array literals
  only, no execution). The JSX prose (intros) goes into a reviewed seed,
  `scripts/config/legacy-services.json`, with one entry per path, so every
  word that reaches Sanity has been read by a person.
- IDs (no dots): `legacy-service-<path>` (`legacy-service-clopote-cu-jug`)
  and `legacy-catalog-<family>-<NN>` (`legacy-catalog-policandre-07`, NN =
  legacy position, which is also the `Policandru-N` anchor).
- Field rules:
  - Titles: HTML removed, spacing and diacritics fixed by override
    ("Aplica cu 2 lumanari" → "Aplică cu 2 lumânări"; the raw text goes in
    the report).
  - Numbers: "1.1" m → 110 cm, "4 Kg" → 4 kg, empty → absent, prose → an
    override or `specifications`.
  - refIds: spaces removed ("110 212" → "110212") and flagged.
  - `type.varnished` → Lăcuit, `type.gilded` → Aurit.
  - Galleries keep the active legacy order. Commented-out entries and
    manifest exclusions are skipped, and alt text comes from captions or the
    generated alt (template alts dropped).
  - Videos: per the decision in section 6.
  - Section mapping per path follows the table in section 1. `relatedCategory`:
    policandre and la-comandă → Policandre, reconditionare → Recondiționări,
    clopote and both variants → Clopote, automatizări and clopotar → Automatizări,
    uși → Uși.
- Blocks (as in Phase 5): a missing cover, unavailable photos, a price hit
  (section 5) without an override, a slug taken by another document, a parent
  that does not exist yet (parents are written first).
- Overrides (`scripts/config/legacy-overrides.json`, keys
  `services:<path>` and `catalog:<family>#<NN>`) take `title`, `text` per
  field (the rewritten, price-free description), `skip`, `merge` (catalogue
  009+010), `anchorIds`, `specifications` and `status`.
- Run: dataset export → offline dry run (no downloads) → I review the report
  with the user → assets dry run (downloads to the cache, sizes) →
  `migrate:assets --write` → `migrate:content --write` (drafts) → Studio
  validation → publish at the user's request after a fresh export.
- Expected volume: about 400 photos (services) plus 53 catalogue images, 6 MP3,
  and possibly 9 MP4.
- Reconciliation: implement the deferred `verify-migration.ts` for these two
  collections (source versus Sanity counts per section, gallery order,
  required fields).

## 5. Keeping prices out

1. **Schema:** no price field. A Studio test asserts it, and a document-level
   validator on `service`/`catalogItem` returns an **error** (which blocks
   publishing) for currency patterns: `€`, `EUR`, `euro`, `lei`, `RON`, `TVA`
   or `+ TVA`, a number next to a currency, and "costă/costa <number>". It
   returns a **warning** for the words `preț/pret/prețuri`, `negociabil` and
   `la estimare`. Shared detector: `lib/price-text.ts` in the Studio and a
   copy in `scripts/lib`, both tested on the same fixture list, because the app
   must not import Studio code.
2. **Importer:** the mapping never reads `price`, `subline` or the table
   `price` column. Property test: for every legacy record, `map(record)` is
   deep-equal to `map(withoutPriceKeys(record))`. Before any write, the
   detector walks every string of every planned document (titles,
   descriptions, alt, captions, filenames in `legacy`, specification values).
   A hit blocks the record. Fixtures: the door 4 description, pristol #1,
   "Jertfelnic, costa 9000€", "13.112", "În preț sunt incluse…".
3. **Images:** `automatizari-set.jpg` is added to
   `config/media-exclusions.json` with reason "conține prețuri". I review a
   contact sheet of every service and catalogue image (about 450) for printed
   prices before upload and list the findings to the user. Catalogue PDFs stay
   in Phase 7 with a reviewed price-free derivative.
4. **Queries:** a unit test fails if any query in `sanity/queries.ts` mentions
   `price|pret|cost` or spreads `...`.
5. **Dataset:** `scripts/verify-no-prices.ts` (read-only) runs the detector
   over all `service`, `catalogItem` and `sanity.fileAsset/imageAsset`
   (`originalFilename`) documents, drafts included, and over a dataset export
   tarball when one is given. It runs before publishing and at cutover.
6. **Rendered site:** a Playwright spec visits `/servicii`, every published
   service and variant (list from the overview links), each catalogue dialog
   and the `/en` equivalents when they exist. It asserts that the full HTML
   (including `<head>`, Open Graph, JSON-LD and the inline RSC payload) has no
   currency match and that no visible text contains "preț". It runs on desktop
   and mobile.

## 6. Open decisions (as proposed; resolved above)

1. **The three "in maintenance" services.** I recommend importing all three as
   **drafts with status Ascuns**, then publishing the ones you approve after a
   look in Studio:
   - Clopote suvenire: 26 photos plus card text; ready to launch as
     `/servicii/clopote-suvenire`.
   - Cupole: 101 photos in 4 groups (inox aurit, cupru, compozit, compozit
     aurit) but no text; launchable with a short description from you.
   - Analog / sfeșnice / chivot: no page copy, but 6 + 8 catalogue items (plus
     10 aplice) that were never shown; launchable as a catalogue page.
   - The alternatives are to hide them (no import) or remove them (no import,
     URLs stay 404 as today).
2. **Automatizări clopote cu balans:** the only legacy content is the price
   list image. Options: (a) rebuild the 5 kits as a price-free "Seturi"
   section (bell weights plus controller, linear motor, modem, 2 remotes,
   external hammer), with the covers and the Automatizări works, and short
   copy from you (**recommended**); (b) publish only a short text and the works.
3. **`/servicii/iconostase/lemn`** (live, a copy of the pristol page): keep the
   URL with real content (12 unused wood-iconostasis photos exist), or 308 it
   to `/servicii/iconostase` (**recommended** unless you want a wood page).
4. **Wording about pricing:** may pages say non-numeric things like "Prețul se
   stabilește după proiect" or "Ofertă la cerere"? I recommend no "preț" words
   at all and "Cereți o ofertă" as the call to action. The bell line becomes
   "Include: limba, icoane, text, ornamente, jug de stejar și transport până
   la biserică" (TVA dropped).
5. **Large MP4s** (108 MB and 83 MB for the bell pages; 6 clopotar videos of
   5–53 MB, no posters): upload them to the company YouTube channel
   (**recommended**, because portfolio videos are YouTube already and nothing
   counts against Sanity or Netlify), re-encode them smaller (about 10 MB, 720p)
   into Sanity files with posters, or leave them out for now. GCS links are not
   allowed for new content.
6. **Catalogue data fixes:** merge 009/010 (both anchors → one item)? Fix 011's
   gilded code (110311?), 002's levels, 015's finish, and the title numbers of
   0010/017. Skip the component (its photo is missing)?
7. **Aplice:** show them on `/servicii/policandre` (lighting) or on the
   analog/sfeșnice page (if it launches)?
8. **Door models:** the legacy links point to iconostasis pages. I propose no
   links, with each model opening its own gallery dialog. Rewrite their
   descriptions without prices: send me texts, or should I draft them from
   the legacy wording minus the prices for your review?
9. **Clopotar products 010–014:** model cards on the service page (proposed)
   or catalogue items (a "Clopotar" family)?
10. **English slugs** for later (no English pages until translated): services
    → chandeliers, custom-chandeliers, chandelier-restoration, bells (with-yoke,
    fixed-bells), electronic-bell-ringer, swinging-bell-automation,
    iconostases (marble, carved-gilded-wood, bronze, marble-altar), doors.
    Confirm or change these when English is published.
11. **Recondiționare case study:** link it to the imported Recondiționări
    project "Catedrala Sfântul Alexandru, Alexandria", if that is the same work.

## 7. Steps, tests and what "done" means

Each step ends with lint, typecheck, unit, migration and build checks, a commit
on the current branch, and no push without asking.

| # | Step | Tests | Done when |
| --- | --- | --- | --- |
| 1 | **Decisions** in section 6, then record them in `docs/` (content model, URL map, migration status) | — | The user has answered; docs updated |
| 2 | **Price detector** (`price-text`, Studio plus scripts copies) with shared fixtures | unit: currency patterns, warnings, no false hits on "160 kg", "1,6 m", "nr. 18" | Fixtures pass in both repos |
| 3 | **Studio schema**: `service`, section objects, `catalogItem`, desk structure, validators, language filter; `npx sanity deploy -y` after the user checks it on the phone | Studio typecheck/lint/build/unit (no price field, validator wired) | Deployed; a test service and item can be created, validated, published and unpublished on the phone; English stays optional |
| 4 | **Website data layer**: queries, TypeGen, loaders, cache tags, webhook mapping, revalidate script | unit: tags per type, payloads without a family, query guard (no price/spread), route helpers | Tests pass; webhook change text handed to the user |
| 5 | **Routes and components** with hand-made test documents (draft, then published, then deleted) | Playwright desktop+mobile: overview, hub, variant, 404 for wrong parent and hidden status, RO→EN redirect rules, catalogue dialog via `#Policandru-7`, Back closes dialog, keyboard, audio/video controls, no horizontal scroll; unit: redirect table | Pages render from Sanity; checks pass on a production build (port 3100) |
| 6 | **Importer**: services and catalogue mapping, parser extraction, seed, overrides, price block, `verify-migration` for the two collections | migration tests: mapping per section type, unit conversion, refId normalisation, anchors, the "price keys do not matter" property, blocks on price text, idempotency | Offline dry run clean apart from listed review items |
| 7 | **Media review**: contact sheets, price-image exclusions, asset dry run with sizes | — | The user has seen the findings and the report |
| 8 | **Write**: export (`production-<date>-before-phase6.tar.gz`), assets, then drafts | `verify-no-prices` over drafts; Studio validation | Drafts in Studio with no validation errors; counts reconcile |
| 9 | **Review and publish** at the user's request after a fresh export; webhook updated by the user | Playwright price crawl plus page checks against the local production build, then the hosted preview after an approved push | All active services and the catalogue are live on the preview, with no price in pages, metadata or data |
| 10 | **Close-out**: redirects added, URL map statuses, handoff, migration status, Phase 6 checklist | — | Phase 6 exit criteria met: editors can create and update services and catalogue items, and the public site has no price information |

Things the user does: answer section 6, change the webhook filter and
projection, check the Studio on the phone, approve publishing and any push.
The write token stays in `.env.local`.
