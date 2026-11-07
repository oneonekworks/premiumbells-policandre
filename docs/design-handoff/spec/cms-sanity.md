# CMS (Sanity) — fields, image slots, missing content

Field names are proposals in camelCase; Studio labels stay Romanian. Everything not listed already exists in the current Sanity schema.

## New Sanity fields

| # | Field | Type | Document | What it drives | Status |
|---|---|---|---|---|---|
| 1 | `menuImage` | image, hotspot, 4:3 | service, workCategory | Mega menu, mobile menu, bento cards, category cards (finished piece, never a drawing) | required |
| 2 | `hint` | string, 2–3 words | service | Line under the name in menus and bento (existing “card label”, reused) | required |
| 3 | `shortName` | string, ≤ 18 chars | service | Phone bento and menus (“La comandă”, “Fără balans”) | optional |
| 4 | `craft` + `craftFacts` | enum Policandre · Clopote · Iconostase și uși; facts: rich string[] ≤ 3 on the craft | service, craft | Groups the 9 services into the three bands of the services bento; facts fill the tint tile that opens each band (bold allowed). The service’s `hint` appears under its name on hover | required |
| 5 | `pair` | object {closeUp: image, wide: image, caption: string} | service, project | Close-up / wide pair | optional |
| 6 | `wallSize` | enum: auto · mare · lată · înaltă · mică | project.gallery[] image | Mosaic tile size; auto decides from shape and resolution | optional |
| 7 | `gilded` | boolean | project.gallery[] image | Candlelight shimmer on hover; default true in Policandre, Iconostase, Uși categories | optional |
| 8 | `keySpec` | string, ≤ 40 chars | project | Card meta and wall captions (“8 clopote fixe”, “Policandru 3 nivele”) | required |
| 9 | `location` + `country` | geopoint + enum RO · MD · ES | project | Map of installations, place lists, county filter | required |
| 10 | `heroSlices` | array of 3 {service: ref, image: image + hotspot, line: string ≤ 48} | homepage | Triptych hero (v5): photo, one line and link per slice; name and URL come from the service. Replaces `heroPortrait` | required |
| 11 | `homeWall` | array of gallery image refs, 9–12 | homepage | Homepage wall; empty = latest featured works | optional |
| 12 | `figures` | array {value: number, label: string}, max 3 | homepage | Figures under the hero buttons (60 lucrări · 3 țări · 12 turnătorii); values can be computed from projects | optional |
| 13 | `aboutPhoto` | image, portrait | homepage | Arch photo in “Despre noi” | required |
| 14 | `setAudio` + `waveform` | file (mp3 + ogg) + number[100] | bellSet (service Clopote) | Bell player per set; waveform generated on upload, never in the browser | optional |
| 15 | `videoPoster` | image 16:9 | video block | Video tiles and posters; YouTube loads only on play | required with video |
| 16 | `zoomable` | boolean (computed ≥ 4000px) | image (lead) | Shows “Mărește detaliile” | automatic |
| 17 | `alt` fallback | computed string | every image | “Piece, place, year” from the project when an editor leaves alt empty | automatic |
| 18 | `announcement` | object {text: string ≤ 40, link: url or ref} | homepage | “Nou” pill above the hero headline; hidden when empty | optional |
| 19 | `catalogues` | array of 2 {title, cover: image 5:7, file: PDF} | siteSettings | Cataloage card; price-free PDFs only; file size shown automatically | optional |
| 20 | `directorStatement` | object {quote: text, shortQuote: string ≤ 200, factLine: string, name, role, portrait: image} | homepage | Homepage: a shortened quote (≤ 200 chars, approved by him) + one fact line; the full quote on the Despre noi page | required |
| 21 | `origins` | array ≤ 6 {place, country, what: string ≤ 36} | siteSettings | Despre noi page only; on the homepage the origins live in the lead sentence | optional |
| 22 | `aboutVideo` | object {youtubeId, poster: image 16:9, place, duration} | homepage | Foundry video facade; YouTube loads only on play | optional |
| 23 | `testimonial` | object {quote, name, role, place, portrait} | homepage | Client testimonial (abbot or priest); section 6 hides it when empty | optional |
| 24 | `postType` + `readingTime` | enum Articol · Raport + computed minutes | post | Meta row: type · date · “N min de citit”; plus `excerpt` (string ≤ 170 so it fits three lines, falls back to the first paragraph cut at a word) and `author` ref (name, role, avatar) | required · automatic |
| 25 | `company` | object {cui, regCom, address, facebook, instagram, partnersLink} | siteSettings | Footer legal line, social icons, “Colaborează cu noi” | required |

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
| Director (Despre noi) | 3:2 landscape | 1600 | Shown under a low arch (elliptical top, 16% of the height); keep the bell, both hands on the ropes and the face in frame — the top corners are cropped |
| Bell player photo · post cover | ≈ 5:7 · 16:10 | 1200 · 1600 |  |
| Model catalogue · video poster | free on white · 16:9 | 1000 · 1600 | White backgrounds only in the catalogue |

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
| Projects in Moldova and Spain (names, coordinates) | Map, counters (“3 țări”) | Editor |
| Coordinates for all 60 projects | Map | Editor (geocode from place names) |
| Service hints and short names written during design | Menus, bento | Editor to approve |
| “Cum lucrăm” steps text | Service pages | Client |
| Three triptych photos and the about photo in full resolution | Homepage | Client (originals; mockups use screenshot crops) |
| Logo as SVG (monogram + wordmark) | Header, footer | Client (mockups use a traced PNG) |
| English copy | Whole site | Client / translator |

## v5.10 corrections to the table above

- Field 10 `heroSlices` (3 × {service ref, image + hotspot, line ≤ 48}) drives the triptych; `heroPortrait` is no longer used.
- Field 12 `figures` (60 · 3 · 12) shows as plain text under the hero buttons, not as glass chips or counters.
- Field 13 `aboutPhoto` is replaced by `directorStatement.portrait` (3:2 landscape under a low arch).
- Field 14 bell audio now feeds the light listening strip (section 5), not a dark immersive section.
- Services: each service needs `craft` (Policandre · Clopote · Iconostase și uși), `hint` (2–4 words, shown on hover) and `menuImage`; each craft has `craftFacts` (≤ 3 rich lines).
- Posts: `excerpt` ≤ 170 chars (3 lines at 1440), `postType` (Articol · Raport), `readingTime` computed.
- Crafts-panel image slot and bento sizes are obsolete.
