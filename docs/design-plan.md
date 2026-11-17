# Redesign v6 "Clarity": implementation plan

**Status:** Written 2026-11-17, when the design was locked as v6.2 release
candidate. Supersedes the Patina / v5.10 plan, which is kept below as history
(phases A–C were built on it). Runs before Phase 8 of `docs/migration-plan.md`.

**Source of truth:** `docs/design/clarity-v6/` (start with its `README.md`).
Design canvas: https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF, page
"v6 · Clarity". Where this plan and the package differ, the package's board
files win for design, this plan wins for process.

## Rules that stay in force

- The rules in `docs/design/clarity-v6/rules.md`. **Changed:** prices are shown
  in the Policandre model catalogue only (one per finish, plus the "Prețurile
  sunt actualizate din data de …" line); everywhere else "La comandă". CTA
  wording "Cereți o ofertă".
- Every Sanity write, publish, Studio deploy and git push is a separate
  approved action; export the dataset before any write. Tokens stay in
  `.env.local` and are never printed.
- Next 16 differs from training data: read `node_modules/next/dist/docs/`
  before each phase. Browser checks run on a production build.
- Unit tests stay minimal; browser specs check shape, not copy. Design quality
  is the measure: compare every page at 1440 and 390 with its board (open the
  canvas for the rendered version with real photos).
- Fonts stay on `next/font` (self-hosted, `latin-ext`).
- Build desktop and phone together; reuse one component per pattern (story
  hero, break-out card, Lightbox, Project panel, footer, filter bar).

## What carries over from the Patina build (phases A–C, 2026-11-08)

Keep and restyle rather than rewrite: the header (pill, hide on scroll,
mega menu, mobile menu, bottom bar), the footer component (content changes),
`btn*` / `chip` / `card` utilities (values change), the triptych (third slice
and headline change), the video facade, the listening strip, the journal, the
Sanity reads, cache tags and revalidation, the portfolio routes and the
intercepted project route. Replace: the Patina tokens (ground `#f7f6f2`, paper,
stone, grain, arch, section rail, warm lightbox), the bento services, the works
wall section on the homepage, the category sidebar and year/county filters, the
full project page, the `/servicii` hub and the Clopote chooser, the Iconostase
material pages.

## Phases

Each phase ends with lint, typecheck, unit and browser tests on a production
build, a look at 1440 and 390 against the boards, and a local commit. Pushes
are the user's.

### V0 · Reconcile (read-only, no code)

Read the package, `docs/design-schema-proposal-v6.md`, `routes.md` and the
current code; write a gap list per page (exists / restyle / rebuild / remove)
into this file under V0, and finish the schema reconciliation against
`../studio-premiumbells`. Ask the user to approve the schema proposal.

**Done and approved by the user on 2026-11-17** (gap list, schema proposal §2b and the four decisions below, as proposed). Compared against the code at
`556b71c` and the Studio at `f293665`. Verdicts: **exists** (keep as is),
**restyle** (same structure, new look), **rebuild** (new structure or
behaviour, may reuse parts), **new** (nothing today), **remove**.

#### Shared pieces

| Piece | Today | v6 | Verdict |
| --- | --- | --- | --- |
| Tokens (`app/globals.css`) | Patina: ground `#f7f6f2`, aliases `paper`/`stone`/`line`/`gold-*`, container 90rem, grain, arch | `tokens.css` v6.2: white + band `#eef2f1`, ink `#111a19`, page 78rem / wide 83rem, metal gradients, moods, overlay, `.bo`, glass docked / on-dark | **rebuild** (replace; keep aliases until V7) |
| Breakpoints | Tailwind defaults (sm 40rem, xl 80rem) | sm 30 · md 48 · lg 64 · xl 75 · 2xl 90rem | **rebuild** (all `sm:`/`xl:` classes reflow; check every page) |
| Fonts (`app/[lang]/layout.tsx`) | Cormorant 400 + 600, italic 400 and 600 | Cormorant 500–600 + italic 500; Inter 400/500/600 | **restyle** |
| `btn*`, `chip`, `card`, `card-lift` | Patina values | v6 values; break-out card `.bo` replaces `card-lift` on most cards | **restyle** + **new** `.bo`, family bars, material words (`.mw-*`), dark panel, mood glows |
| Header (`header.tsx`, `header-frame.tsx`) | 88px bar → glass pill after 80px, hides on fast scroll | Pill from load; docked glass over photos | **restyle** |
| Mega menu (`nav-links.tsx`) | One list of 8 services + featured works card; 64×48 thumbs | Three craft columns (Policandre · Clopote · Iconostase și uși), 88×66 thumbs, "Toate lucrările" card | **restyle** (groups from `homePage.services.groups`, already in Sanity) |
| Mobile menu, bottom bar | Glass sheet with thumb rows; glass bar | `V6MobileMenu`; same bar, v6 styles | **restyle** |
| Footer (`footer.tsx`) | Big "Cereți o ofertă" block on top, link columns, legal line | Compact canonical block (`reference/footer.html`): brand + showroom card, Servicii, Companie, "Cereți o ofertă" column, credit line, legal bar | **rebuild** (needs showroom + response time in `siteSettings`) |
| Section rail (`section-rail.tsx`) | Dots on the right, homepage only | — | **remove** |
| Lightbox (`portfolio/lightbox.tsx`) | Dialog, arrows, warm dark | Teal translucent overlay, photo at its own shape, zoom 2.5× / 1–5×, drag, strip for > 8 photos, `?foto=` in the URL, optional material tabs | **rebuild** (one component for works, services, Iconostase) |
| Project panel (`project-modal.tsx`, `project-details.tsx`) | Slide-over via intercepted route + full project page | Floating two-column panel; "Lucrarea n din N", prev / next through the filtered list, film tile, quiet offer, "Pe hartă" line | **rebuild**; full project page **remove** (direct URL = Works + panel, server-rendered) |
| Story hero | — (service pages use a 2-column header) | Breadcrumb → H1 + teal italic + lead + Pe scurt ×3 \| photo 4:3 + two framed insets, optional photo control | **new** (one component, every service page) |
| Quiet offer block | `ContactSection` / `sectionCta` on service pages | Question + light button at the end of layers and pages | **rebuild** |
| Video facade, bell player | Exist (v5.10) | Same behaviour, v6 frames | **restyle** |
| Price checks (`verify-no-prices`, browser specs, Studio `priceTextValidation`) | Reject price text everywhere | Prices allowed in the Policandre catalogue only | **rebuild** the checks: skip the catalogue price numbers and the Policandre page's price line; keep them everywhere else |

#### Homepage `/` (`V6HomeDesktop` + `B`, `V6HomeMobileA` + `B`)

| Section | Today (v5.10) | v6 | Verdict |
| --- | --- | --- | --- |
| Hero | Nou pill, H1 one line, claim + 2 buttons + figures, triptych 460 tall | Kicker "Confecționate…", H1 in material words (gold / bronze / gold), teal italic subline, triptych 1408 × up to 640, no buttons, stats row 12 · 60 · 5 țări under the triptych with long labels | **restyle** (triptych kept); third slice Recondiționări (data); buttons, pill, figures-in-row **remove** |
| Serviciile noastre | Craft bands with fact columns, 12-col bento | Centred title + one sentence, 3 × 3 break-out cards, Cataloage with two covers | **rebuild** (cards); catalogue card **restyle** |
| Lucrări | Wall of 10 + Romania mini map tile, chips | Map story: title row, 1200 × 700 Europe map (`tools/map-europe.js`, build-time SVG), glass country island, 8 photo pins → Project panel; phone: map + pin rail + country chips | **rebuild** (needs countries BE / GR and places abroad) |
| Despre noi | Two columns, video + lead + 3-row list | Light band: video frame \| title, lead, facts in three columns | **restyle** |
| Director | Hairline figure, low-arch 3:2 photo | Dark panel, 4:5 portrait breaking out, quote, name, Putna fact line | **rebuild** (layout; data exists) |
| Ascultați | Wide white strip, progress line (no waveform) | Compact centred card 880, waveform, link to Clopote, mini player | **restyle** (waveform still needs the approved script) |
| Din jurnal | Posts without card, no byline | Title + subtitle, post cards with byline (avatar, name, role); phone swipe rail | **restyle** |
| Rail | Dots | — | **remove** |

#### Service pages (`/servicii/*`)

| Page | Today | v6 | Verdict |
| --- | --- | --- | --- |
| `/servicii` | Hub page | No page: 308 → `/#servicii`; breadcrumbs "Servicii" → `/#servicii` | **remove** + redirect |
| `/servicii/policandre` | Generic template; catalogue section with families in dialogs (`catalogue-section.tsx`, `dialog-grid.tsx`), `#Policandru-N` anchors | Story hero (Pe scurt 1–7 · 11 · 3, Mărește), level filter (1 · 2 · 3 · 4–7 · Horos), 28 model cards with **price per finish**, date line, two thumbnail links, Cum lucrăm ×4, 11 lucrări ×4 break-out | **rebuild** (catalogue, anchors kept); steps and related works **restyle** |
| `/servicii/policandre-la-comanda` | Generic template | Story hero (3D plate 5:7), Mai întâi proiectul ×4, dark panel of drawing plates ×7 + call tile, Ce este inclus ×5 | **rebuild** |
| `/servicii/reconditionare-policandre` | Generic template | Story hero, dark panel before / after ×3, stage rows ×4 (case study) | **rebuild** (new section types) |
| `/servicii/clopote` | Chooser hub listing the two types | Renders **Clopote cu jug**: type switch card, story hero + film control, size guide (sticky, interactive) + table + set rows with mini bells, dark "Ce este inclus", 3 works → Project panel (this type only), "Celălalt fel de clopote" | **rebuild** |
| `/servicii/clopote/cu-jug` | Nested page | 308 → `/servicii/clopote` | **remove** + redirect |
| `/servicii/clopote/fara-balans` | Nested page | Same template, graphite, audio per set | **rebuild** |
| `/servicii/clopotar-electronic` | Generic template | Story hero, process flow ×3 + La alegere ×2, fact grid ×6 + full list, dark video tiles ×6, photos ×6 | **rebuild** |
| `/servicii/automatizari-clopote-cu-balans` | Generic template | Story hero, kit tiles ×5, dark set rows ×5 (no prices), link to Clopote cu jug | **rebuild** |
| `/servicii/iconostase` + 4 material pages | Hub + nested pages | One page: story hero + "Priviți de aproape", 3 material cards → Lightbox with tabs, Cum lucrăm + link to Uși; `/marmura`, `/lemn-aur`, `/pristol-marmura` render the page with the Lightbox open | **rebuild**; nested page template **remove**; `/iconostas-bronz` 308 → `/servicii/iconostase` |
| `/servicii/usi` | Generic template with models | Story hero + place caption, one copper model inline (photo group → Lightbox, Calitate garantată, mounted example, custom-door card), link to Iconostase | **rebuild** |
| `[service]/[variant]` route | Renders variants | Only `clopote/fara-balans` and the Iconostase material layers remain | **rebuild** (route keeps those, 308s the rest) |

#### Works `/lucrarile-noastre`

| Piece | Today | v6 | Verdict |
| --- | --- | --- | --- |
| Overview page | Category cards | One page with the filter bar, Toate on | **rebuild** |
| `[category]` page | Sidebar (`category-nav`), filters: search, year, county, pagination | Same page with the craft chip on; one filter bar (crafts, bell type after Clopote, search icon, Galerie \| Hartă) that docks under the header; craft mood on the band; 4-column wall with captions, map tile first row, "Arată încă 24" | **rebuild**; sidebar, year and county filters **remove**; search and pagination kept |
| Hartă view | — | Homepage map component, dots + photo card, glass island (județe, countries) | **new** |
| `[category]/[project]` | Full project page + intercepted slide-over | Direct visit = Works filtered + panel open (SSR); intercepted = panel over the current page, from any page | **rebuild** (routes kept, page removed) |
| URL params | `cauta`, `an`, `judet`, `pagina` | `tip`, `vedere`, `cauta`, `judet` / `tara`, `pagina`; craft path segment | **rebuild** (`an` removed) |

#### Blog, article, 404, English

| Page | Today | v6 | Verdict |
| --- | --- | --- | --- |
| `/blog` | Featured first post + grid | Featured story preview (cover + 2 insets + film pill + Pe scurt + byline), post cards with byline, "Arată mai multe" | **restyle** (featured block falls back to cover \| text until the new post fields exist) |
| `/blog/[post]` | Article body, related posts, JSON-LD | v6 type, 680 column, pull quote in teal italic, images up to 1180, "Citiți și" ×2 | **restyle** |
| 404 | Text + links | Centred H1 + lead + Acasă / Lucrări, 3 craft break-out cards | **rebuild** |
| `/en` | Placeholder | Placeholder | **exists** |

#### Tests to rewrite as pages change

`home.spec.ts` (V3), `services.spec.ts` (V4, price check now allows the
Policandre catalogue), `portfolio.spec.ts` and `filters.spec.ts` (V5: no
project page, no year filter), `blog.spec.ts` (V6), `shell.spec.ts` (V1,
footer and menus).

#### Decisions (approved 2026-11-17)

1. **Craft chips on Works.** Today's categories are Policandre, Clopote,
   Recondiționări, Automatizări, Uși. Proposal: add a `craft` value to each
   category (Automatizări → Clopote, Uși → Iconostase și uși) and use craft
   slugs in the Works path (`/lucrarile-noastre/clopote` shows Clopote +
   Automatizări). Existing category URLs keep working as filters.
2. **Map places abroad.** Keep the county-centre lookup for Romania and
   Moldova; add a small place lookup for the works abroad (Lleida, Belgium,
   Athos) instead of a geopoint on every project.
3. **Service short names.** The 3 × 3 cards and the menus use short names
   ("Proiecte la comandă", "Recondiționare", "Uși"); the Sanity titles are
   longer. Proposal: an optional `shortName` on `service`.
4. **Price check.** Allow numbers in `catalogVariant.price` only; keep the
   text check everywhere; the browser price check skips the Policandre
   catalogue block.

### V1 · Tokens and shared pieces (no Sanity)

1. Replace the Patina tokens in `app/globals.css` with
   `docs/design/clarity-v6/tokens.css` (keep temporary aliases, as in phase A,
   and delete them in V7). Switch the breakpoints (sm 480 · md 768 · lg 1024 ·
   xl 1200 · 2xl 1440).
2. Primitives: buttons, chips, text link, break-out card (`.bo`), family bar,
   material word (`.mw-*`), glass light / docked / on-dark, mood classes, dark
   panel, focus ring.
3. Header v6 (pill from load, docked glass), mega menu v6.2 (three columns,
   thumbnails 88 × 66, featured "Toate lucrările" card), mobile menu, bottom
   bar.
4. Footer v6.2, canonical (`reference/footer.html` + `footer.css`): showroom
   card, "Cereți o ofertă" column, credit line, legal bar; one component on
   every page.
5. Lightbox v6.2: translucent teal overlay, whole photo at its own shape,
   zoom (click / tap 2.5×, wheel / pinch 1–5×, drag), thumbnail strip > 8
   photos, URL-addressable, focus trap. Optional material tabs (used by
   Iconostase). Logic reference: `V6IconostasViewer.dc.html`.
6. Story hero component (split; Pe scurt; two framed insets; photo control)
   and the quiet offer block.

**V1 done (2026-11-17), local commits `638886c` → `0912aed`.** Notes for the
next phases:

- Tokens: `app/globals.css` = `tokens.css` + Patina aliases (block marked "delete
  in V7"). Primitives as utilities: `btn` + `btn-primary` / `-secondary` /
  `-light` / `-quiet` / `-outline-light` / `-icon`, `btn-sm` 48, `btn-lg` 60;
  `chip`, `text-link`, `kicker`, `display`, `family-bar`; `.bo` (+ `bo-left`,
  `on-white`), glass, overlay, `.mw-*`, moods, `.dark-panel` from tokens.css.
- Header: fixed, so `main` has `pt-18 lg:pt-21`; v6 heroes that need the glow
  behind the pill pull up with a negative margin. Only the pill takes clicks.
  The pill's glass is a background layer, because an element with
  `backdrop-filter` stops the mega menu inside it from blurring the page.
  Menu data: `shell.serviceGroups` (from `homePage.services.groups`, metals by
  position, Clopote heading links to its parent page).
- Footer: one component, phones reorder with `display: contents` + `order`.
  `shell.showroom` holds the board's values until V2 adds the fields.
- Lightbox (`components/portfolio/lightbox.tsx`): `sets` (one, or several with
  tabs for Iconostase), `offer`, `title`; `usePhotoParam` writes `?foto=N`;
  only `addressable` galleries open from a link (the project gallery). Ratio
  from asset width / height and crop.
- `StoryHero` (`components/services/story-hero.tsx`) + `Breadcrumb`,
  `photoControlClass`; `QuietOffer` (`components/site/quiet-offer.tsx`).
  Not wired into pages yet (V4).
- `/v6` preview: build with `DESIGN_PREVIEW=1`.
- Browser-pane screenshots mis-draw anything behind `backdrop-filter`; inject
  `*{backdrop-filter:none!important}` to compare with the boards.
- Browser specs on a production build: a scratch config in `test-results/`
  needs `outputDir: './out'` (Playwright empties `test-results/` on start).
- `next build` may stop once with a Next.js security-upgrade notice; retry.
  The upgrade itself is the user's call.

### V2 · Schema and content (approved steps, Studio repo)

The approved parts of `docs/design-schema-proposal-v6.md`, in its order:
Studio change → deploy (approved) → export → seed drafts (dry run, approved)
→ publish (approved). Includes the price-check change and the bell-type
classification of the 39 bell works.

**Steps (2026-11-17):**

1. **Studio schema** — done locally, Studio commit `415ffb2` (not deployed):
   every §2b row of the schema proposal (25 new fields / section types, the
   renames, nothing removed); the Studio guard test allows exactly
   `catalogVariant.price` and `sectionCatalogue.pricesUpdatedAt`.
2. **Website reads** — done locally: regenerated types; footer reads
   `siteSettings.showroom`, `responseTime`, `partnersLink` (placeholders while
   empty); BE / GR countries; `verify-no-prices` skips `pricesUpdatedAt` (the
   price itself is a number, which the text check never reads).
3. **Studio deploy** — done 2026-11-17 (approved), https://premiumbells.sanity.studio/.
4. **Export** the dataset (done: `.migration/backups/production-2026-11-17-before-v6-seed-raw.tar.gz`,
   `--raw` so image references are kept; `--no-assets` drops them), then
   **seed scripts, dry run first** (`scripts/v6-seed.mts --step home|services|categories`), one approved
   write each, drafts, then an approved publish:
   - a. homePage: third slice Recondiționare policandre, `highlight`, figure
     labels (12 · 60 · 5 țări), services / works lead, journal subtitle
     (copy from `docs/design/clarity-v6/copy/homepage.md`);
   - b. services: `shortName` (Proiecte la comandă, Recondiționare, Uși,
     Marmură …), `heroFacts` and `heroInsets` from the boards' copy and
     `assets.md`; Iconostase Bronz → `status: hidden`;
   - c. `workCategory.craft` (Automatizări → clopote, Uși → iconostase-usi)
     and `offerLine`;
   - d. project countries BE / GR for the works abroad (nothing to change: the
     CMS has no work in Belgium or Greece yet; the hero shows 5 țări manually);
   - e. `bellTypes` on the 39 bell works: proposal in
     `docs/v6-bell-types-proposal.md`, for the user to review before any write;
   - f. waits on the client: catalogue prices + date, showroom (no. 110,
     photo), response time, `partnersLink`.

   a–c **published** 2026-11-17 (approved): 19 drafts (homePage, 13 services,
   5 categories) in one transaction, after a fresh raw export
   (`.migration/backups/production-2026-11-17-before-v6-publish.tar.gz`). The
   current v5 pages read them without errors (every header, footer and home
   link returns 200); `npm run dev` shows them after a hard refresh, a host
   after the publish webhook or within the hourly revalidate.

   **User decisions, 2026-11-17** (for V3 onward):
   - Go ahead with V3 → V7 in order; pushing `prototype/mobile-publishing`
     and Studio `main` is approved (pushed 2026-11-17 at `9a4942f` / `444a116`).
   - e. bell types: not now; the user corrects them later in the Studio. Build
     the filters so works without `bellTypes` still show under Clopote.
   - f. catalogue prices: show a temporary "La comandă" in place of every
     price until the client sends them (no figures, no date line). Showroom:
     Strada Agricultori **110**, Buftea (code fallback updated); a temporary
     photo exists, its upload to `siteSettings.showroom` waits on an explicit
     write OK. Response time and `partnersLink`: placeholders.
   - Missing photos (map pins, inset for Automatizări, the La comandă drawing
     …): neutral placeholders, the user uploads the real ones later.
   - Placeholders are fine wherever content is still missing.

### V3 · Homepage v6

From the v5.10 build to the v6 boards (`V6HomeDesktop` + `B`, phone `A` + `B`):
hero (third slice Recondiționări, linked headline, stats 12 · 60 · 5 țări),
Serviciile noastre (3 × 3 cards, `id="servicii"`), the map story (title row,
1200 × 700 Europe map from `tools/map-europe.js`, country island, 8 photo pins
→ Project panel), Despre noi (light) + Director panel (dark), Ascultați
(compact), Din jurnal (byline cards), footer.

**V3 done (2026-11-17), commit `96549a5`.** Checked at 1440, 1024 and 390
against the boards (headless Chrome, `test-results/shots.mjs <url> <prefix>
<width>`, backdrop-filter off); production build: typecheck, lint, 43 unit
tests, 26 browser specs (home + shell) pass. Notes for the next phases:

- Page root: `<div className="v6-page mood-subtle">`. `v6-page` drops the
  footer's legacy top margin (`[main:has(.v6-page)+&]:mt-0`), so the last
  section carries the space above the footer (as on the boards). Use it on
  every rebuilt page; V7 deletes the legacy margin.
- Section moods for the homepage are in `globals.css` (`m-svc`, `m-about`,
  `m-listen`, `m-blog`, `m-director`); `.quote-mark` is the gilded “ on dark.
- Containers: `page` = 1248 / 24 gutters, `wide` = 1360 / 16 (in
  `home-sections.tsx`); the triptych sits in 1440 / 16.
- Europe map: `components/map/europe-map.tsx` (static drawing in `public/maps`
  + SVG layer for labels, leaders, dots; children positioned in %) and
  `lib/europe-map.ts` (same projection as `tools/map-europe.js`, county centres,
  places abroad). Reuse both for the Works Hartă view (V5). Pins: the editor's
  `homePage.works.projects`, else the representative works + the newest work
  per country abroad; countries without works get `[Parohie]` placeholder pins.
- Country rows link to `/lucrarile-noastre?tara=ro|md|es|be|gr` and "Deschideți
  harta" to `?vedere=harta`: V5 must read `tara` and `vedere`.
- `BylineCard` (`components/blog/byline-card.tsx`) is the post card with byline
  for Blog and "Citiți și" (V6). `BellPlayer` is now the whole listening card.
- `VideoFacade` has `look="feature"` (the Despre noi frame); the article keeps
  the plain look until V6.
- Pins, project tiles and menus still link to the full project page; the
  panel arrives in V5.
- Content gaps seen on the homepage: the triptych slices have no own photos
  (they fall back to the small service covers); the headline reads
  "recondiționare" (the service's short name; the board says "recondiționări");
  no works in Belgium or on Athos (placeholder pins, `[n]` counts); no works
  marked `featured`, so Romania's four pins are the newest works; the
  recording has no place/context (`[locul și clopotele, din CMS]`) and no
  waveform (the board's generic strike shape stands in); no foundry video
  (poster only, no play button); the director's fact line is dictionary copy
  (`home6.directorFacts`); the Despre noi lead and points are the longer CMS
  texts; Automatizări's cover is the product sheet; catalogues stay hidden
  (no reviewed PDFs).

### V4 · Service pages

One story-hero template for all. Policandre (catalogue with prices per finish,
date line, `#Policandru-N`), La comandă, Recondiționare (before / after media
panel, stages), Clopote cu jug at `/servicii/clopote` + Fără balans (type
switch, size guide with yoke hanger, set rows with mini bells, works →
Project panel, "Celălalt fel de clopote"), Clopotar electronic, Automatizări,
Iconostase (three materials → Lightbox with tabs; material URLs open the
layer), Uși (one copper model, photo group → Lightbox, custom-door card).
Remove `/servicii` and the chooser; redirects per `routes.md`.

### V5 · Works, Project panel, map view

One filter bar (categories, bell type sliding in after Clopote, search icon,
Galerie | Hartă) that docks under the header; craft moods on the band; wall of
project tiles with captions; map view = the homepage map component (dots,
photo card on hover / tap, glass island with județe and countries). Project
panel as the only project view: intercepted route over any page, direct visit
renders Works + panel server-side; prev / next through the filtered list;
quiet offer; map line; film tile. Remove the full project page, the sidebar
and the year / county filters.

### V6 · Blog, Article, 404

Featured story preview (cover + two inset photos + film pill + Pe scurt +
byline), post cards with byline, article in the v6 type, 404.

### V7 · Motion, accessibility, clean-up

Reveals, layer transitions, filter cross-fades, reduced motion and reduced
transparency audit, keyboard and screen-reader pass of every layer, delete the
token aliases, redirects check (`url-map.md`), Lighthouse on the preview.

## Content still needed from the user

See `docs/design/clarity-v6/open-questions.md`; the main ones: Policandre
price list, currency, VAT and the "actualizate" date; showroom number 108 vs
110; response time; contact email; registered office; Director vs Manager;
door metal; countries and counts; originals for the stand-in photos listed in
`assets.md` (most are in Sanity; the user uploads the rest).

---

# History: Redesign "Patina" (v4 + v5.10 homepage)

The plan below was written 2026-11-07 and drove phases A–C. It is superseded by
the v6 plan above; keep it for the record of what was built and why.

**Status:** Written 2026-11-07. Schema proposal approved 2026-11-08 with
its defaults; phase A done 2026-11-08; phase B next. Runs before Phase 8 of
`docs/migration-plan.md`. The schema changes need the user's OK first
(`docs/design-schema-proposal.md`).

**Source of truth:** `docs/design-handoff/` (Claude Design export, v5.10),
with the corrections in "Fixes to the handoff" below. Where this file and the
handoff differ, this file wins. Design canvas:
https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF (v4 boards for everything
the handoff does not redraw: header pill, mega menu, mobile menu, wall,
lightbox, Elevation).

## Rules that stay in force

- No prices anywhere: no amounts, no "preț"/"negociabil", no price links;
  catalogues only as price-free, reviewed PDFs. CTA wording "Cereți o ofertă".
- Every Sanity write, publish, Studio deploy and git push is a separate
  approved action; export the dataset before any write. Tokens stay in
  `.env.local` and are never printed.
- Next 16 differs from training data: read `node_modules/next/dist/docs/`
  before each phase. Browser checks run on a production build.
- Unit tests stay minimal; the browser specs check shape, not copy. Design
  quality is the measure.
- Fonts stay on `next/font` (self-hosted, `latin-ext`); the Google Fonts
  `<link>` in the reference HTML is for viewing only.

## The one card rule: v4 Elevation

Every clickable card (service cards, journal posts, catalogue rows, wall tiles,
menu cards, project cards, category cards) uses the same depth system:

| State | Surface | Motion |
| --- | --- | --- |
| Rest | white, radius 20, `shadow-e1`, image inset 8px radius 16 | — |
| Hover | `shadow-e2`, `translateY(-4px)`, photo `scale(1.03)` inside its frame | 240ms `--ease-light` |
| Keyboard focus | hover state + 3px gold ring `--color-focus`, offset 3px | instant |
| Press | `translateY(-1px)`, `shadow-e1` | 120ms |
| Reduced motion | shadow change only | — |

Build it once (a `Card` primitive plus a `.card-lift` recipe) and reuse it.
Journal posts have no white surface, so they keep the lift and photo zoom
without the card background.

## Fixes to the handoff

1. **Card hover.** The handoff's service card (`scale 1.01`, photo 1.05,
   320ms) contradicts its own motion row M19 and the v4 Elevation board. Use
   the Elevation values above; `--duration-photo-zoom` is not used.
2. **Map coordinates.** Projects store town, county and country, not
   coordinates. The map tile places dots at county centres from a small
   lookup table in code (RO counties, MD raioane, ES provinces as needed). No
   schema field, no geocoding of 60 projects.
3. **Excerpt length.** `blogPost.excerpt` allows 300 characters; the design
   wants ≤ 170. Cards clamp to 3 lines with `.text-clamp-3`; the validation
   stays as it is so existing posts stay valid.
4. **Tokens are site-wide.** About 20 files use `paper`, `stone`, `line`,
   `eyebrow`, `gold-*`, `container-site` and `btn-*`. Phase A keeps the old
   names as temporary aliases of the new tokens; each later phase removes the
   aliases its pages used, and the last phase deletes them.
5. **One place for the three crafts.** The services bento and the mega menu
   both group services as Policandre / Clopote / Iconostase și uși. The groups
   live once, on `homePage.services.groups`; the mega menu reads them and
   falls back to the current automatic list when they are empty.
6. **Waveform.** Generated by a script from the MP3 and written to
   `audioFeature.waveform` — a Sanity write, so export first and ask.
7. **"Harta".** There is no map page. The map tile and the footer link go to
   `/lucrarile-noastre` until a map page exists (backlog, not this plan).
8. **Price check.** `priceTextValidation` already checks the whole document
   (homePage, service, catalogue, testimonial, audio), so the new fields are
   covered without extra work (handoff §4).
9. **Service images and hints.** No `menuImage` or `hint` fields: cards use
   the existing `coverImage` and `cardLabel`.
10. **Reduced motion.** Keep the current global rule (0.01ms) and add the
    120ms cross-fade explicitly where the spec asks for it (page and lightbox
    transitions), instead of the handoff's blanket 1ms rule.

## Decisions this redesign overrides (Phase 7 plan)

Confirmed by the user in the design sessions; listed here so the Phase 7
plan is not read as current.

- **Decision 4** (legacy order, no new sections): new order hero → services
  (+ catalogues) → works → about → audio → journal (+ testimonial) → footer
  offer; new works section; the figures strip 60 · 3 · 12 under the hero
  buttons.
- **Decision 5** (badge dropped): the "Nou" pill is back as an optional field;
  it launches empty unless the user fills it.
- **Decision 1** (no "Parteneri"): the footer gets "Colaborează cu noi →",
  pending open question 3 (link target).
- The testimonial section is no longer Denis Latisev's statement: his quote
  moves into Despre noi; the journal's testimonial slot is for a client
  (abbot or priest) and stays hidden until one exists.

## Phases

Each phase ends with a production build, the browser specs, a look at 1440
and 390 against the reference, and a local commit. Pushes are the user's.

### A · Tokens and shared pieces (no Sanity)

1. Merge `docs/design-handoff/tokens/tokens.css` into `app/globals.css`:
   the `@theme` block, the recipes (`glass-light`, `glass-dark`,
   `lightbox-backdrop`, `grain`, `vignette`, `arch`, `arch-low`,
   `photo-gradient`, `shimmer`, `text-clamp-*`), fallbacks for no
   `backdrop-filter` and reduced transparency. Fonts point at the `next/font`
   variables. Old names become aliases (fix 4).
2. Cormorant loads weight 400 plus italic 400 (today 500/600); Inter 400/500/600.
3. Copy `grain-256.png` to `public/img/`.
4. Primitives: `Button` (primary teal-900 → hover teal-950, secondary white
   e1 → e2, 52px pill, light variants), `Card` (Elevation), `Chip`,
   `GlassPill`, focus ring, section heading (`--text-section`), container
   (`--container-page`, gutters 56/32/20).
5. Header: 88px bar → floating white-glass pill after 80px (M06), hide on fast
   scroll down (M07), nav tint (M08); mega menu as v4 (3 groups + featured
   card, M09–M11); mobile menu sheet (M12); glass bottom bar on phones (M13).
6. Footer: teal-950 panel with the offer on top, grain, bell ornament, legal
   line with registration number, social icons, no price links.

**Done 2026-11-08** (`eb2c621`). Notes:
- Buttons, chips, cards and the section title are utilities in
  `app/globals.css` (`btn*`, `chip`, `card`, `card-lift`, `card-photo`,
  `section-title`), like the existing ones, not React components.
- The new breakpoints (sm 30rem, xl 75rem, 2xl 90rem) are not applied yet:
  they would reflow every old page. Use `min-[75rem]:` where a new component
  needs 1200px; switch the breakpoints in phase G.
- `max-w-header` resolves to `--spacing-header` (88px), not the 1120px
  container; write `max-w-(--container-header)`.
- Until `homePage.services.groups` exists, the mega menu lists the active
  top-level services in display order; its featured card uses the category
  with the most works.
- `container-site` is now the 1440 container with 20/32/56 gutters, so every
  page is a little wider than before.
- Checked on a production build: lint, typecheck, 43 unit tests, 54 browser
  tests passed (22 skipped: need test documents), desktop 1440 and phone 375.

### B · Schema and content (approved steps, Studio repo)

1. User approves `docs/design-schema-proposal.md`.
2. Studio change, typecheck, local Studio check; user approves the deploy.

   **Done 2026-11-08:** approved; Studio commit `f293665` (studio repo, not
   pushed, not deployed). Typecheck, lint, 20 Studio tests, `sanity build`
   and `sanity schema validate` pass; app types regenerated, app typecheck
   passes. The local Studio needs the user's Sanity sign-in, so instead the
   last export (2026-11-05) was validated against the new schema offline:
   on `homePage` only the two expected errors (`hero.slices` required,
   `services.groups` needs three), which the seed fixes. Until the seed is
   published, editors cannot publish the home page with the new Studio.
   Found on the way (existing, not new): a translated field that is
   completely missing is never flagged, because `localeRule` only runs when
   the object exists — required headings and titles can be published empty.
   Backlog.
   **Deployed 2026-11-08** to https://premiumbells.sanity.studio (approved by
   the user); the deployed schema was listed afterwards.
3. Export the dataset; user approves the seed (`content/homepage.ro.json`
   → homePage draft); review the draft; user approves the publish.

   **Draft written 2026-11-08** (approved): export
   `.migration/backups/production-2026-11-08-before-v510-home-seed.tar.gz`,
   then `scripts/home-v510-seed.mts --write` created `drafts.homePage`
   (published `homePage` unchanged, last updated 2026-11-05). It sets the
   slices (Policandre, Clopote, Iconostase, no own photos yet), figures
   (projects · countries · 12 turnătorii), the three craft groups and facts,
   catalogues heading "Cataloage", works section, about lead + points +
   statement → `legacy-testimonial-putna` + caption "În turnătorie" (about
   button removed), audio link → Clopote, journal heading "Din jurnal",
   client testimonial off, hero title and badge empty. Retired fields keep
   their values. Price check clean; validation: no errors, 3 warnings
   (slice photos empty — they fall back to the service photos).
   **Do not publish before phase C ships:** the current site would lose the
   Denis testimonial section and show "Din jurnal" with the old layout.
   **Published 2026-11-08** (approved) after a fresh export
   (`production-2026-11-08-before-v510-home-publish.tar.gz`); draft removed.
   Price check over the dataset: 0 errors. A normal production build with
   the published content passes all browser specs (58, 22 skipped). Until
   the phase C commits are pushed, the hosted preview runs the old home page
   code on the new content (no Denis section, heading "Din jurnal").
   Hero secondary button stays "Cereți o ofertă" → phone; the design points
   it to the footer offer (`#oferta`) — decide in phase C.
4. Export; waveform script for "Dăngăt pascal"; user approves the write.
5. After the homepage is live: export; unset the retired fields; approved.

### C · Homepage, sections 1 → 7

Build in order, checking each against `reference/homepage-desktop.html` and
`homepage-mobile.html` before the next:

1. Hero: "Nou" pill, one-line H1 whose words link to the services, claim,
   buttons, figures, triptych (M36–M42; pause control; stops on first
   interaction; pauses off screen and in a hidden tab; reduced motion = rest
   state). LCP = the open slice image (preload, `fetchpriority="high"`).
2. Services: craft bands with heading columns and Elevation cards; catalogue
   card (hidden until a reviewed price-free PDF exists).
3. Works: chips with counts, wall with tile sizes from image shape, video
   tile, map tile, button.
4. Despre noi: lead with bold names, the three points, video facade
   (YouTube only after a click), director strip under the low arch.
5. Listening strip with the precomputed waveform and the mini player (M34).
6. Journal: 3 posts (type · date · reading time), optional testimonial.
7. Footer offer (from phase A). Section rail ≥ 1200px.

Then the QA list at the end of `docs/design-handoff/spec/homepage.md`.

**Built 2026-11-08, not yet live.** The page reads the new fields only, so
it needs the seeded `homePage` draft published: with today's published
document the home page shows just the title, Despre noi, audio and journal
(checked on a production build, no errors). **Publish the draft and push
together.** Local review of drafts: `SANITY_PREVIEW_DRAFTS=1 npm run build`
and the `web-prod-drafts` preview (port 3200; reads with the token in
`.env.local`, refuses to run on Netlify or CI). Checked there at 1440 and
390: lint, typecheck, 43 unit tests, 58 browser tests passed (22 skipped,
need test documents); the home spec now checks the new shape (section
order by anchor, linked headline, triptych stop/restart and reduced
motion, bell player from the keyboard).
Notes:
- Service cover photos are small (250–560px wide); the triptych needs the
  originals (≥ 2000px) in each slice's own photo field.
- No waveform yet (script and write pending approval): the player shows a
  progress line instead.
- The wall uses a fixed 6 × 3 layout (10 tiles + map) at ≥ 1200px;
  smaller screens flow the same sizes densely. No shimmer yet (phase G).
- Chips on the home page link to the category pages (no in-place filter).
- "Harta" has no page; the map tile links to all works.
- Denis's quote is cut at the last clause break before 200 characters
  until `shortQuote` is approved and filled.
- Hero "Cereți o ofertă" still calls the phone (CMS link); the spec allows
  `#oferta` too, if you want it to scroll to the footer offer instead.

### D · Service pages and `/servicii`

Hub as the craft bands; service page hero, sections, variants and related
works in the new system; remove the aliases these pages used.

### E · Works: wall, filters, lightbox, project page

Wall with FLIP filtering (M15), lightbox with blur backdrop and zoom
(M26–M30), project page; tile → project transition (M31) with View
Transitions where Next 16 supports it.

### F · Blog index and article

Journal cards, article typography (`--text-article`, 680px measure).

### G · Motion pass and clean-up

Reveals (M16–M17), shimmer on gilded photos (M23), page transitions (M31–M32),
reduced-motion audit; delete the remaining token aliases; Lighthouse on the
preview.

## Content still needed from the user

- Director photo at full resolution (3:2: bell, both hands on the ropes, face).
- Foundry video on YouTube (ID, place, duration) and its poster.
- The two price-free catalogue PDFs.
- Contact email and company address for the footer (fields exist, values
  to confirm).
- Bell recording details (place, which bells) for the listening strip.
- Denis Latisev's approval of the shortened quote.
- "Colaborează cu noi": link target (Parteneri page or email).
- Moldova and Spain projects, so "3 țări" is true on the map.
- The technical drawing for "Proiecte la comandă" (until then its cover photo).
- English copy (later; `/en` keeps its placeholder).
