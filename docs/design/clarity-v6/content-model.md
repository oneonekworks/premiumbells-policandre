# Content model (design view)

Exported from the canvas handoff board H4. These are the **design's** field names in generic camelCase, written before the repo schema was known in detail; they are an input, not the schema. The repo already has most of the content (`service`, `catalogItem`, `project`, `workCategory`, `homePage`, `blogPost`, `siteSettings`, see `docs/content-model.md`). The reconciliation (which field exists, which is new, which is renamed) is `docs/design-schema-proposal-v6.md`, which needs the user's approval before any Studio change.

Rows 1–32 are v4/v5 era; rows 33–60 are v6.1/v6.2 additions. Notable v6 decisions: prices per finish on the Policandre catalogue (33), bell type on projects (60), story hero insets and facts (56–57), project video (58), project place/county (59), single door model (51), Iconostase types without pins (49), post author / highlights / insets (24, 53–55).
Handoff · 4 of 6

## Content & CMS

The final list of additions to Sanity. Everything not listed runs on content that exists today. Field names are proposals in camelCase; labels in the Studio stay Romanian.

## New Sanity fields

| # | Field | Type | Document | What it drives | Status |
|---|---|---|---|---|---|
| 1 | `menuImage` | image, hotspot, 4:3 | service, workCategory | Mega menu, mobile menu, bento cards, category cards (finished piece, never a drawing) | required |
| 2 | `hint` | string, 2–3 words | service | Line under the name in menus and bento (existing “card label”, reused) | required |
| 3 | `shortName` | string, ≤ 18 chars | service | Phone bento and menus (“La comandă”, “Fără balans”) | optional |
| 4 | `craft` + `craftFacts` | enum Policandre · Clopote · Iconostase și uși; facts: rich string[] ≤ 3 on the craft | service, craft | Groups the services in menus and picks the material word colour (Policandre gold, Clopote bronze, Iconostase și uși red-gold). v6: the homepage no longer shows craft facts; `hint` is the always-visible line under the service name | required |
| 5 | `pair` | object {closeUp: image, wide: image, caption: string} | service, project | Close-up / wide pair | optional |
| 6 | `wallSize` | enum: auto · mare · lată · înaltă · mică | project.gallery[] image | Mosaic tile size; auto decides from shape and resolution | optional |
| 7 | `gilded` | boolean | project.gallery[] image | Candlelight shimmer on hover; default true in Policandre, Iconostase, Uși categories | optional |
| 8 | `keySpec` | string, ≤ 40 chars | project | Card meta and wall captions (“8 clopote fixe”, “Policandru 3 nivele”) | required |
| 9 | `location` + `country` | geopoint + enum RO · MD · ES | project | Map of installations, place lists, county filter | required |
| 10 | `heroSlices` | array of 3 {service: ref, image: image + hotspot, line: string ≤ 48} | homepage | Triptych hero (v5): photo, one line and link per slice; name and URL come from the service. Replaces `heroPortrait` | required |
| 11 | `homeWall` | array of gallery image refs, 9–12 | homepage | v6.2: Homepage showcase, hand-picked (~8, crafts mixed, best photos), not “latest”; each entry is a work and opens its Project panel; empty = the first 8 works with `featured` on, crafts alternating. The same `featured` flag puts a work first in the Works “Toate” order | optional |
| 12 | `figures` | array {value: number, label: string}, max 3 | homepage | v6: stats row under the triptych, number + label ≤ 60 chars (12 turnătorii… · 60 lucrări… · 5 țări…, v6.2); 60 and 3 can be computed from projects | required |
| 13 | `aboutPhoto` | image, portrait | homepage | Not used on the v6 homepage (Despre noi shows the video); keep for the Despre noi page | optional |
| 14 | `setAudio` + `waveform` | file (mp3 + ogg) + number[100] | bellSet (service Clopote) | Bell player per set; waveform generated on upload, never in the browser | optional |
| 15 | `videoPoster` | image 16:9 | video block | Video tiles and posters; YouTube loads only on play | required with video |
| 16 | `zoomable` | boolean (computed ≥ 4000px) | image (lead) | Shows “Mărește detaliile” | automatic |
| 17 | `alt` fallback | computed string | every image | “Piece, place, year” from the project when an editor leaves alt empty | automatic |
| 18 | `announcement` | object {text: string ≤ 40, link: url or ref} | homepage | v6: not shown on the homepage (pill removed to shorten the hero); keep for a later banner or drop | optional |
| 19 | `catalogues` | array of 2 {title, cover: image 5:7, file: PDF} | siteSettings | Cataloage card; price-free PDFs only; file size shown automatically | optional |
| 20 | `directorStatement` | object {quote: text, shortQuote: string ≤ 200, factLine: string, name, role, portrait: image} | homepage | Homepage: a shortened quote (≤ 200 chars, approved by him) + one fact line, beside a 4:5 portrait (v6); the full quote on the Despre noi page | required |
| 21 | `origins` | array ≤ 6 {place, country, what: string ≤ 36} | siteSettings | Despre noi page only; on the homepage the origins live in the lead sentence | optional |
| 22 | `aboutVideo` | object {youtubeId, poster: image 16:9, place, duration} | homepage | Foundry video facade; YouTube loads only on play | optional |
| 23 | `testimonial` | object {quote, name, role, place, portrait} | homepage | Client testimonial (abbot or priest); section 6 hides it when empty | optional |
| 24 | `postType` + `readingTime` | enum Articol · Raport + computed minutes | post | Meta row: type · date · “N min de citit”; plus `excerpt` (string ≤ 170 so it fits three lines, falls back to the first paragraph cut at a word) and `author` ref (name, role, avatar) | required · automatic |
| 25 | `company` | object {cui, regCom, address, facebook, instagram, partnersLink} | siteSettings | Footer legal line, social icons, “Colaborează cu noi” | required |
| 26 | `heroClaim` | object {kicker: string ≤ 60, subline: string ≤ 48} | homepage | v6: the small line above the headline (“Confecționate de către ortodocși pentru ortodocși”) and the teal italic line under it (“produse în lumea ortodoxă, clasa Premium”) | required |
| 27 | `servicesIntro` · `journalIntro` | string ≤ 160 · string ≤ 70 | homepage | v6: the one sentence under “Serviciile noastre” and the subtitle under “Din jurnal” | required |
| 28 | `aboutFacts` | array of 3 {key: string ≤ 10, text: string ≤ 44} | homepage | v6: the three facts in the Despre noi panel (16 tone · Athos · Balans) | required |
| 29 | `mood` | enum Off · Subtle · Warm | siteSettings | v6: strength of the section glows site-wide (default Subtle) | optional |
| 30 | `subline` | string ≤ 48 | project | v6: the teal italic line after the category word (“de 3 și 2 nivele, cu elemente aurite”). The category word and its metal come from `craft` (field 4) | required |
| 31 | `specCards` | array ≤ 3 {title, rows[] {label, value}} | project | v6: spec cards in Despre lucrare (“Policandru 3 nivele”: Înălțime, Diametru, Greutate, Lumini, Finisaj); an empty row is omitted. Replaces specs written in the body text | required |
| 32 | `offerLine` | string ≤ 120 | workCategory | v6: the sentence in the project offer (“Doriți un policandru asemănător? Spuneți-ne dimensiunile naosului…”), one per category | required |
| 33 | `chandelierModel` | document {name, nr, group, height, diameter, candles, weightKg, lacuitCode, auritCode, **lacuitPrice, auritPrice**, image} + catalogue setting `pricesUpdatedAt` (date) | new document, category of service | v6.1: Policandre model cards, level filter. **v6.2 (client): prices are shown**, one per finish (number; currency and VAT to confirm, H5 q51–52); a finish without a price shows “La comandă”. `pricesUpdatedAt` feeds “Prețurile sunt actualizate din data de dd.mm.yyyy” (date format dd.mm.yyyy). Take the figures from the client, not from the old catalog.json, unless the client confirms those | required |
| 34 | `modelGroup` | enum 1 · 2 · 3 · 4–7 · Horos | chandelierModel | v6.1: Filter on the Policandre page | required |
| 35 | `bellSize` | array {weightKg, diameter, height, note} | bellType (cu jug, fără balans) | v6.1: Dimension table and size guide; group computed from weight | required |
| 36 | `bellSet` | document {bells: weights[], audio?, waveform?, withElectronicRinger} | bellType | v6.1: Set rows, mini bells, guide; extends fields 14 | required |
| 37 | `sizeGroupNote` | 4 strings ≤ 60 (“Potrivit pentru …”) | bellType | v6.1: Group headings in the table; hidden when empty | optional |
| 38 | `typeMetal` | enum bronze · graphite | bellType, service | v6.1: Title, bars, type picker, bell gradient | required |
| 39 | `processSteps` | array ≤ 4 {title, text} | service | v6.1: Cum lucrăm, Mai întâi proiectul | required |
| 40 | `includedItems` | string[] ≤ 8 | service, bellType | v6.1: Ce este inclus | optional |
| 41 | `drawingPlates` | image[] with alt | service (La comandă) | v6.1: Dark panel; contained, never cropped | optional |
| 42 | `beforeAfter` | array {image, layout: stacked · side} | service (Recondiționare) | v6.1: Before / after pairs and chips | optional |
| 43 | `stages + caseStudy` | array {title, text, images[]} + {church, place, date} | service (Recondiționare) | v6.1: Stage rows; first 4 photos visible, rest in the lightbox | optional |
| 44 | `systemParts` | array {name, code, text, image, optional} | service (Clopotar) | v6.1: Process flow; optional parts go under “La alegere” | optional |
| 45 | `facts + fullFeatures` | array 6 {value, label} + string[] | service (Clopotar) | v6.1: Fact grid and expandable list | optional |
| 46 | `serviceVideos` | array {file or youtubeId, poster, duration} | service | v6.1: Video tiles; load on click | optional |
| 47 | `automationKit + automationSets` | array {name, image} + array {bells: weights[]} | service (Automatizări) | v6.1: Kit tiles and set rows. Prices are not stored | optional |
| 48 | `relatedService` | ref + {question, why} | service, bellType | v6.1: Thumbnail links between service pages | optional |
| 49 | `iconostasType` | document {tab, title, line, photos[] {image, alt, width, height}} | service (Iconostase) | v6.1: Material cards, viewer tabs and side panel; pins are relative 0–1 on the first photo. No price field (“La comandă”). v6.2: three entries, Marmură (default, first) · Lemn cu aur · Pristol; no Bronz. v6.2: shown in the Lightbox with material tabs; pins, description, specs and price removed | required |
| 50 | `zoomImage` | image ≥ 3000 px wide (long side) + alt | iconostasType | v6.1: First photo of each material, zoomable to 6×; others ≥ 1400 | required |
| 51 | `doorModel` | document[] {name, heightMm, doorFront (cut-out front photo for the scale row), description, place?, featured, photos[] {image, alt}} | service (Uși) | v6.3: a list of copper models ordered by height (2900, 3000, 4000, 4400, 5200 mm); `featured` picks the model shown first (4400). Material is always Cupru; no price field (“La comandă” + “Calitate garantată”). photos[] is the full set (Fotografii · N, first three shown + “+(N − 3)”); `place` shown only when set (4000: Catedrala din Drobeta-Turnu Severin). (v6.2: one model; v6.1: door cards + panel.) | required |
| 52 | `heroPlace` | string ≤ 40 | service | v6.1: Glass caption on a hero photo (Uși: Drobeta-Turnu Severin) | optional |
| 53 | `highlights` | array of 3 {figure ≤ 8, line ≤ 70} | post | v6.2: “Pe scurt” rows in the featured post on the blog index (e.g. 1484 · Buga, clopotul lui Ștefan cel Mare…) | optional |
| 54 | `insetPhotos` | array of 2 {image 3:2, alt, caption title ≤ 24, caption line ≤ 32} | post | v6.2: Two framed photos over the featured cover. Without them (or without highlights) the featured block falls back to cover \| text | optional |
| 55 | `featuredVideo` | object {youtubeId, title, duration} | post | v6.2: Film pill on the featured cover; loads YouTube only on click. Putna: bgnI968-kUs, duration to fill | optional |
| 56 | `heroInsets` | array of 2 {image 3:2, alt, caption title ≤ 24, caption line ≤ 32, focus point} | service | v6.2: Story hero: two framed photos over the hero photo, chosen from the page’s own story; never over the subject. Missing → the hero shows the main photo alone | optional |
| 57 | `heroFacts` | array of 3 {figure ≤ 8, line ≤ 50} | service | v6.2: “Pe scurt” rows by the hero lead (Policandre uses its stats row instead) | optional |
| 58 | `projectVideo` | object {youtubeId or file, poster 1:1-safe, duration} | project | v6.2: Film tile in the Project panel photo grid (before “+N”); plays in the Lightbox; tile hidden when empty | optional |
| 59 | `place` + `county` + `coords` | string · enum (județ) · {lat, lng} | project | v6.2: “Pe hartă · [place], [county]” line in the Project panel → Lucrări · Hartă focused on that county; the same coords drive the map pins (v6.2: homepage Europe map: dot per work; works with `featured` and a photo become photo pins, max 8, at least one per country; pin card placement is set by hand in the design and should be computed in build to avoid overlaps) · `country` enum (România, Moldova, Spania, Belgia, Grecia · Muntele Athos; shown as “Moldova”, not “Republica Moldova”) groups the country list | required |
| 60 | `bellType` | multi-enum: cuJug · faraBalans | project (Clopote) | v6.2: drives the Works bell-type chips (Cu jug · Fără balans, `?tip=cu-jug \| fara-balans`) and the works shown on each bell page; a project with both kinds of bells takes both values and appears under both | required for Clopote |

## Image slots

| Slot | Ratio | Minimum (long edge) | Notes |
|---|---|---|---|
| Triptych slice (v5) | source 3:4 – 1:1 | 2000 (2800 ideal) | Shown slanted at 10°, from 25% (closed) to 50% (open) of the panel width, and as a 1:1–3:1 band on phones; the piece must sit in the central 40%; hotspot required |
| Page lead photo | ≈ 2.15:1 (1328×620) | 2400; zoom needs 4000 (iconostases 6000) | Whole piece in frame, tripod, even light |
| Bento L / M / S | ≈ 1.3:1 / 0.6:1 / 1.45:1 | 1400 / 1200 / 800 | From `menuImage` (hotspot does the crops) |
| Menu thumbnail | 4:3 | 800 | Shown at 64×48 — piece must fill 60% of the frame |
| Work card | 4:5 index · 4:3 related | 1000 | Weak photos are toned down, never upscaled past 1.5× |
| Wall tile | any (auto L / W / T / S) | L 1600 · T/W 1200 · S 800 | Below minimum the tile steps down a size |
| Pair: wide / close-up | 4:3 / 3:4 | 2000 / 1600 | Same piece, two distances |
| Lightbox | original | 2400 | Requested at viewport width × DPR from the Sanity CDN |
| Testimonial portrait · about photo | 3:4 · 2:3 (arch) | 800 · 1400 | Face/subject in the lower two thirds (arch crops the top corners) |
| v6 · Triptych panel | 1408 × up to 640 (≈ 2.2 : 1) | 2400 (2800 ideal) | Same sources as v5; the open slice is now about 700 px wide, so 2000 px sources are the floor |
| v6 · Service card · post cover | 4:3 · 4:3 | 1200 · 1400 | From `menuImage` / post cover; hotspot does the crop |
| v6 · Director portrait | 4:5 | 1600 | Replaces the 3:2 arch crop below; face and both hands on the ropes in frame |
| v6 · Project lead / close-up | ≈ 1.4:1 / 0.8:1 | 2000 (zoom needs 4000) / 1400 | Shown at 895 × 634 and 497 × 634; from `pair`, or the first gallery images; hotspot required |
| Director (Despre noi, v5) | 3:2 landscape | 1600 | Shown under a low arch (elliptical top, 16% of the height); keep the bell, both hands on the ropes and the face in frame — the top corners are cropped |
| v6.2 · Author avatar | 1:1 | 240 | Post → author; round 36 (32 phone) in the card byline. Until supplied, the boards crop the director photo |
| Bell player photo · post cover | ≈ 5:7 · 16:10 | 1200 · 1600 |  |
| Model catalogue · video poster | free on white · 16:9 | 1000 · 1600 | White backgrounds only in the catalogue |
| v6.1 · Chandelier model | 4:5, contained | 1000 | Cut-out on white; dark or arched backgrounds stay as supplied |
| v6.1 · Drawing plate | 5:7 or square, contained | 1600 | Never cropped |
| v6.1 · Before / after | 1:1 | 1000 | One image, both states |
| v6.1 · Stage photo | 3:2 | 1200 | 4 shown per stage |
| v6.1 · Product plate · kit tile | 4:3 · 1:1, contained | 800 | On white |
| v6.1 · Video poster | 16:7 | 1400 | Crop from the film, without player controls |
| v6.1 · Iconostas close-up | any, contained | 3000–3600 | Every photo in the set; the Lightbox zooms to 5× (v6.2) |
| v6.1 · Material card · door card | 2:3 | 1100 | Portrait, object centred |
| v6.1 · Detail crop | 4:3 | 1000 | Crop of the close-up photo at the pin |

## Placeholders that need real content

| Item | Where it appears | Owner |
|---|---|---|
| Client testimonial (abbot or priest): quote + portrait | Homepage section 6 — hidden until it exists | Client |
| Two price-free catalogue PDFs | Cataloage card | Client |
| Foundry video on YouTube (ID, place, duration) and the director’s portrait in full resolution | Despre noi | Client (mockups use screenshot crops) |
| Contact email | Offer blocks, footer, bottom bar, model card emails | Client |
| Address (CUI 36422758 and Reg. Com. J40/10836/12.08.2016 are known) | Footer | Client |
| Blog titles and dates (articles 2–3); date of “Clopotele Mănăstirii Putna” | Homepage, blog index | Editor |
| Bell recording: place and bells | Bell player subtitle | Client |
| Projects abroad: Moldova, Spain, Belgium, Mount Athos (names, photos, coordinates, count per country) | Homepage map pins + country list, Hartă view, counter (“5 țări”) | Editor |
| Coordinates for all 60 projects | Map | Editor (geocode from place names) |
| Service hints and short names written during design | Menus, bento | Editor to approve |
| “Cum lucrăm” steps text | Service pages | Client |
| Three triptych photos and the about photo in full resolution | Homepage | Client (originals; mockups use screenshot crops) |
| Logo as SVG (monogram + wordmark) | Header, footer | Client (mockups use a traced PNG) |
| 20 chandelier model photos (originals in the rbells bucket) | Policandre model cards | Developer / client |
| Original photos for Recondiționare stages and pairs (mockups use screenshot crops) | Recondiționare | Developer (rbells bucket) |
| Original installation photos, film posters and kit photos (mockups use screenshot crops) | Clopotar, Automatizări | Developer (rbells bucket) |
| “Potrivit pentru” text per size group | Dimension tables | Client |
| Rewrite of the controller feature list | Clopotar electronic | Client |
| Clean renders or Romanian labels for the drawing plates | La comandă | Client |
| Original iconostas photos (marmură gallery uses 7 screenshot crops) | Iconostas viewer | Developer (rbells bucket) |
| Full door galleries (mockup shows 1–3 local photos per model; services.js lists 4–27) | Uși panel | Developer (rbells bucket) |
| ~~Pin positions and detail texts per material~~ (v6.2: pins removed) | — | — |
| English copy | Whole site | Client / translator |

