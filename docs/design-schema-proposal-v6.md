# Schema proposal for design v6 "Clarity"

**Status:** Reconciled with the Studio and approved by the user on 2026-11-17 (§2b). Nothing applied yet; each Studio deploy, write and publish still needs its own OK. Draft written 2026-11-17 from the design handoff
(`docs/design/clarity-v6/content-model.md`, canvas board H4). **Before asking
for approval, check every row against the Studio schema in
`../studio-premiumbells/schemaTypes/`** (not read when this draft was written)
and against `docs/content-model.md`: mark each row *exists*, *rename*, *new*
or *drop*, and keep the conventions of `docs/design-schema-proposal.md` (English
field names, Romanian labels, retired fields hidden before they are unset,
every write approved and preceded by an export).

The v5.10 proposal (`docs/design-schema-proposal.md`) is approved and deployed;
this draft only covers what v6 adds or changes.

## 1 · Price rule (code, not schema)

v6 shows prices in the Policandre model catalogue only (client, 2026-11-17).
`priceTextValidation` and `scripts/verify-no-prices.ts` currently reject price
text across whole documents. Proposal:

- Keep the price check everywhere it runs today.
- Allow two numeric fields on catalogue items (`lacuitPrice`, `auritPrice`, see
  §2) and the catalogue date; they are numbers, not text, so the text check
  stays as it is. Make `verify-no-prices` skip exactly those fields.
- Update the rule text in `rebuild-brief.md`, `design-plan.md` and the price
  check's messages.

## 2 · Fields by document type

Numbers in brackets are rows of `docs/design/clarity-v6/content-model.md`.

### `catalogItem` (Policandre models) [33, 34]

- `lacuitPrice`, `auritPrice` — number, lei (currency and VAT to confirm: open
  questions q51–q52). Empty → that finish shows "La comandă".
- Catalogue setting `pricesUpdatedAt` — date, shown as "Prețurile sunt
  actualizate din data de dd.mm.yyyy". Put it where the catalogue's own
  settings live (on the Policandre `service`, or `siteSettings`).
- Level group (1 · 2 · 3 · 4–7 · Horos) and the two finish codes: check they
  exist (they drive today's catalogue).
- Prices come from the client's list, not from the legacy `catalog.json`
  unless the client confirms those figures.

### `service`

- `heroInsets` [56]: 2 × {image 3:2, alt, caption title ≤ 24, line ≤ 32}.
- `heroFacts` [57]: 3 × {figure ≤ 8, line ≤ 50} ("Pe scurt").
- `heroPlace` [52]: optional glass caption on the hero photo.
- `processSteps` [39], `includedItems` [40], `relatedService` [48] (thumbnail
  links "Și intrarea bisericii?"): check what Phase 6 already has.
- Recondiționare: `beforeAfter` [42], `stages` + case study [43].
- Clopotar: `systemParts` [44], `facts` + `fullFeatures` [45]; Automatizări:
  kit + sets without prices [47]; `serviceVideos` [46].
- Clopote (both types): `bellSize` table [35], `bellSet` rows with optional
  audio [36], `sizeGroupNote` [37], `typeMetal` [38].
- Iconostase: three material entries (Marmură default, Lemn cu aur, Pristol)
  with title, one line and photos [49, 50]; **no pins, no description, no
  specs, no price**. Bronz is removed: unpublish or hide its entry.
- Uși: one model (Uși din cupru) with photos (28 on the old site),
  "Calitate garantată", mounted example, custom-door card [51]. No price.

### `project`

- `bellType` [60] — multi-select cu jug / fără balans, for Clopote projects;
  a project with both kinds takes both. Drives `?tip=` on Works and the works
  on each bell page. Needs a one-off classification of the 39 bell works
  (script proposal + the user's review).
- `projectVideo` [58] — reuse the existing video field if it fits (film tile
  in the Project panel, plays in the Lightbox).
- Place and county exist; `country` (RO, MD, ES, BE, GR · Muntele Athos) is
  new [59]. Map dots: keep the county-centre lookup from `design-plan.md`
  fix 2 unless exact coordinates are wanted (then an optional geopoint).
- `featured` for the homepage map pins and showcase (8, at least one per
  country) — check whether `homePage.works` already covers it.
- Captions: category word · place · key spec · year; `keySpec` [8] if not
  present.

### `homePage`

- Hero: third triptych slice becomes Recondiționări; headline words follow the
  slices ("Policandre, clopote și recondiționări"). Figures: 12 · 60 · 5 țări.
- Services intro sentence and 3 × 3 cards [27].
- Works: the map story (title row, map, country island with counts, 8 photo
  pins from featured projects).
- Despre noi (light, video in a frame, facts) and the **Director panel**
  (`directorStatement` [20]: short quote ≤ 200, fact line, name, role, photo).
- Journal intro [27]; client testimonial stays hidden.
- Drop or hide: the "Nou" pill [18], `aboutPhoto` on the homepage [13].

### `blogPost`

- `author` (name, role, avatar 1:1) for the byline [24]; until filled, the
  site shows Denis Latisev / "Director, Premium Bells" (confirm Director vs
  Manager).
- Featured story preview: `highlights` 3 × {figure, line} [53],
  `insetPhotos` 2 [54], `featuredVideo` {youtubeId, title, duration} [55].

### `siteSettings`

- Footer: showroom (photo, address "Strada Agricultori 108, 070000 Buftea" —
  108 vs 110 to confirm, maps links), "Cereți o ofertă" column (phone, email,
  response time "[X] zile lucrătoare"), credit line, legal line (CUI, Reg.
  Com., registered office to confirm), Facebook, Instagram, "Colaborează cu
  noi" target, the tagline.

### `workCategory`

- Crafts on Works: Policandre · Clopote · Iconostase și uși · Recondiționări
  (Automatizări under Clopote). Check how the existing five categories map;
  propose a `craft` grouping instead of renaming slugs.

## 2b · Reconciliation with the Studio (V0, 2026-11-17)

Checked read-only against `../studio-premiumbells/schemaTypes/` at `f293665`.
**exists** = the field or an equivalent is there (no schema change);
**rename** = the design's field maps onto an existing one under another name
or shape (small schema change or none); **new** = a field to add; **drop** =
not built (derived in code, or not used in v6). Nothing here is applied yet.

### `catalogItem` and the catalogue section

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| `lacuitPrice`, `auritPrice` [33] | `variants[]` = {`finish` (varnished · gilded · silvered · patinated), `referenceCode`} | **rename** | Add `price` (number, lei, optional) to each `catalogVariant`, not two fixed fields: it follows the finishes that exist. Empty → "La comandă" |
| `pricesUpdatedAt` [33] | — | **new** | Date on the `sectionCatalogue` block of the Policandre page (where the families are chosen) |
| Model name, nr, height, diameter, candles, weight, image [33] | `title`, `number`, `levels`, `candles`, `weightKg`, `image`, `specifications[]` (height, diameter) | **exists** | — |
| `modelGroup` 1 · 2 · 3 · 4–7 · Horos [34] | `levels` + `family` (`policandre` · `horos`) | **drop** | Group computed in code from `levels` and `family` |
| Finish codes | `variants[].referenceCode` | **exists** | — |
| `#Policandru-N` anchors | `anchorIds[]`, `number` | **exists** | — |

### `service` and its sections

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| `menuImage` [1] | `coverImage` | **drop** | Cards and menus use `coverImage` (as today) |
| `hint` [2] | `cardLabel` | **exists** | — |
| `shortName` [3] | — | **new** | Optional `shortName` localeString ≤ 24 for cards, menus, tabs ("Recondiționare", "Uși", "Marmură") |
| `craft` [4] | `homePage.services.groups` (3 craft groups) | **exists** | Material word and bar colour derived in code from the group |
| `typeMetal` [38] | — | **drop** | Derived in code (Clopote pages bronze / graphite) |
| `heroInsets` [56] | — | **new** | Array of 2 {`image` (imageWithMetadata, hotspot = focus point), `title` ≤ 24, `line` ≤ 32} |
| `heroFacts` [57] | — | **new** | Array of 3 {`figure` ≤ 8, `line` ≤ 50} ("Pe scurt") |
| `heroPlace` [52] | — | **new** | Optional localeString ≤ 40 |
| `processSteps` [39] | `sectionSteps` | **exists** | — |
| `includedItems` [40] | — | **new** | Section `sectionIncluded` {items ≤ 8, optional sentence, optional link} |
| `drawingPlates` [41] | `sectionGallery` | **rename** | Add `presentation` (photos · plates) to `sectionGallery`: plates are contained on the dark panel |
| `beforeAfter` [42] | — | **new** | Section `sectionBeforeAfter` {pairs: image, label, layout stacked · side} |
| `stages` + `caseStudy` [43] | `sectionSteps` (text only) | **new** | Section `sectionStages` {church, place, date; stages: title, text, images[]} |
| `systemParts` [44] | — | **new** | Section `sectionSystem` {parts: name, code, text, image, optional} |
| `facts` + `fullFeatures` [45] | — | **new** | Section `sectionFacts` {facts ×6: value, label; fullList[]} |
| `serviceVideos` [46] | `sectionVideos` (video: provider, url, file, title, poster) | **exists** | Add `duration` to the `video` object (also used by the about video and film tiles) |
| `automationKit` [47] | — | **new** | Section `sectionKit` {items: name, image} |
| `automationSets` [47] | `sectionBellSets` (weights, electronic ringer, audio) | **exists** | Rendered without prices |
| `bellSize` [35] | `sectionBellSizes` (weight, diameter, height, note) | **exists** | — |
| `sizeGroupNote` [37] | — | **new** | Optional `groupNotes` (4 × ≤ 60) on `sectionBellSizes` |
| `bellSet` audio + waveform [36] | `sectionBellSets.audio` (file) | **rename** | Waveform: add `waveform` (100 numbers) next to each set's audio, written by the same script as `audioFeature.waveform` |
| `relatedService` [48] | `relatedCategory` (works only) | **new** | Section `sectionRelated` {service ref, question, why} for the thumbnail links |
| `iconostasType` [49] | Child services of Iconostase: `marmura`, `lemn-aur`, `pristol-marmura`, `iconostas-bronz` (title, `cardLabel`, `coverImage`, `sections` with galleries) | **rename** | Reuse the child services as the three materials (tab = `shortName`, line = `cardLabel`, photos = their gallery). Bronz: set `status` hidden (data change, approved separately) |
| `zoomImage` [50] | Image asset dimensions | **exists** | Zoom allowed from the asset's width |
| `doorModel` [51] | `sectionModels` + `sectionGallery` on Uși | **exists** | One model; photos from the gallery (28 on the old site); "Calitate garantată" in code |
| Pins, descriptions, specs on Iconostase | — | **drop** | Removed in v6.2 |

### `project` and `workCategory`

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| `bellType` [60] | — | **new** | Multi-select `bellTypes` (cu-jug · fara-balans), shown for Clopote projects; one-off classification of the 39 bell works (script proposal + your review) |
| `projectVideo` [58] | `videos[]` | **exists** | Film tile uses the first video |
| `place` + `county` [59] | `location.locality`, `location.county` | **exists** | — |
| `country` [59] | `location.country`: RO · MD · ES | **rename** | Add BE (Belgia) and GR (Grecia · Muntele Athos); label "Moldova" instead of "Republica Moldova" |
| `coords` [59] | — | **drop** | County-centre lookup in code (RO, MD) + a small place lookup abroad (decision 2 in the plan) |
| `featured` (map pins, showcase) | `featured` | **exists** | 8 pins = featured works with a photo, ≥ 1 per country |
| `keySpec` [8] | `specifications[0]` | **drop** | Caption uses the first specification row |
| `specCards` [31] | `specifications[]` (label, value, unit) | **exists** | One spec card per project; several pieces later if needed |
| `subline` [30] | — | **new** | Optional localeString ≤ 48 (teal italic line in the panel) |
| `pair`, `wallSize`, `gilded` [5–7] | — | **drop** | Panel uses the cover + first gallery photos; wall layout is fixed |
| Craft chips | 5 `workCategory` docs (Policandre, Clopote, Recondiționări, Automatizări, Uși) | **new** | `craft` on `workCategory` (policandre · clopote · iconostase-usi · reconditionari); slugs unchanged (decision 1 in the plan) |
| `offerLine` [32] | — | **new** | Optional localeString ≤ 120 on `workCategory` |

### `homePage`

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| `heroSlices` [10] | `hero.slices` | **exists** | Data: third slice → Recondiționare policandre |
| `figures` [12] | `hero.figures` (label ≤ 20) | **rename** | Label limit 20 → 60; values 12 (manual) · projects · countries |
| `heroClaim.kicker` [26] | `hero.tagline` | **exists** | Shown as the kicker above the H1 |
| `heroClaim.subline` [26] | `hero.highlight` (retired, hidden) | **rename** | Un-retire `highlight` as the teal italic line |
| `announcement` [18] | `hero.badge` | **drop** | Hide the field (not shown in v6) |
| `servicesIntro` [27] | `services.intro` (retired, block content) | **new** | `services.lead` localeString ≤ 160 |
| 3 × 3 cards | `services.groups` (3 groups, 9 services) | **exists** | Cards read the groups in order |
| `homeWall` [11] | `works.projects` (9–12) | **rename** | Allow 0–12 (8 pins); empty = featured |
| Works line ("60 de lucrări, din România…") | — | **new** | `works.lead` localeString ≤ 160 |
| `aboutFacts` [28] | `about.points` | **exists** | — |
| `aboutVideo` [22] | `about.video`, `poster`, `videoCaption` | **exists** | `duration` via the `video` object |
| `directorStatement` [20] | `about.statement` → `testimonial` (`quote`, `shortQuote`, `context`, `portrait`) | **exists** | Portrait cropped 4:5 by hotspot |
| `aboutPhoto` [13], `origins` [21] | — | **drop** | No Despre noi page in v6 |
| `journalIntro` [27] | `blog.intro` (retired, hidden) | **rename** | Un-retire as the subtitle |
| `testimonial` [23] | `testimonial` section (off) | **exists** | — |
| `mood` [29] | — | **drop** | Code constant (subtle) |
| `catalogues` [19] | `catalogDownload` documents + `catalogues` section | **exists** | — |

### `blogPost`, `person`

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| `author` [24] | `author` → `person` (name, role, portrait) | **exists** | Byline avatar = person portrait |
| `postType`, `readingTime`, `excerpt` [24] | `kind`, computed, `excerpt` | **exists** | — |
| `highlights` [53] | — | **new** | Array of 3 {figure ≤ 8, line ≤ 70} |
| `insetPhotos` [54] | — | **new** | Array of 2 {image, title ≤ 24, line ≤ 32} |
| `featuredVideo` [55] | — | **new** | `video` object (with the new `duration`) |

### `siteSettings`

| Design row | Studio today | Verdict | Proposal |
| --- | --- | --- | --- |
| CUI, Reg. Com., social, partners link [25] | `cui`, `registration`, `social`, `partnersLink` | **exists** | — |
| Registered office | `address` | **exists** | Keep as the registered office (legal line) |
| Showroom | — | **new** | `showroom` {photo, label, address, Google Maps URL, Waze URL} |
| Response time ("[X] zile lucrătoare") | — | **new** | `responseTime` localeString ≤ 40 |
| Footer tagline | `tagline` | **exists** | — |
| Credit line ("Realizat cu ♥ de 11k.io") | — | **drop** | Code constant |

### Summary

- **Schema changes:** 25 new fields or section types, 9 renames (mostly a
  widened limit, an un-retired field or an extra option), no removals.
- **Data changes (each approved, export first):** third hero slice, Bronz
  hidden, categories' `craft`, countries BE / GR, bell-type classification,
  catalogue prices and date (from the client's list).
- **Code only:** price checks, material words and colours, model groups,
  map places, the credit line, the mood.

## 3 · Order of work

1. Reconcile this draft with the Studio schema (read-only), then ask for
   approval, row by row where useful.
2. Studio change + typecheck + local check; user approves the deploy.
3. Export; seed scripts (dry run first); user approves each write and publish.
4. Price check change (§1) lands with the catalogue in the same phase.
