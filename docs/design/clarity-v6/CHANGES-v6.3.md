# CHANGES v6.3

Design pass v6.3 extends the implemented v6 “Clarity” design. Each entry: what changed, why, which boards, what the code must do, schema impact. The boards on the canvas (page “v6 · Clarity”) are the truth for intent; copies are in `reference/boards/`.

## 1 · Uși: five copper models, doors at scale (2026-11-20)

**Why.** The user wants the Uși page to show the other copper door models, not only the 4400 mm one. There are five, from 2,9 to 5,2 m. Chosen layout: the doors drawn at scale act as the model switch, and the existing model block follows the choice. One section, no panel, no cards (the v6.2 “fewer clicks, no nested pages” rules still hold).

**Boards.** `V6ServiceUsi`, `V6ServiceUsiMobile` (now interactive; heights 3156 / 4101). Handoff: H3 (Uși template), H4 (field 51), H5 (superseded row, q49). Docs: `pages.md`, `components.md` (Doors at scale · Uși, Model block · Uși (v6.3)), `content-model.md` (51), `copy/usi.md`, `assets.md`, `routes.md`, `open-questions.md` (49).

**What changed on the page.**
- Hero: Pe scurt “Pe măsură” now reads “de la 2,9 la 5,2 m, după ușa bisericii”. Hero photo, insets and caption unchanged (the hero photo shows the 4,0 m Drobeta doors).
- Section 03 is now “Modelele noastre · Uși din cupru” with a new lead.
- New **Doors at scale** row under the title, then the **Model block** bound to the chosen door (see `components.md`).
- Models: 2,9 m Sfânta Mahramă · 3,0 m Maica Domnului a Semnului · 4,0 m Drobeta-Turnu Severin (place line) · 4,4 m Sfinți și praznice (featured, default; reference from another church, no place) · 5,2 m Schimbarea la Față. Copy in `copy/usi.md`.
- The custom-door card stays, once, at the end of the info column.

**What the code must do.**
1. Fetch all `doorModel` documents for the Uși service, sorted by `heightMm`; the `featured` one is selected first (fallback: the first).
2. Render the scale row: one `<button type="button" aria-pressed>` per model; door photo height = `heightMm / 1000 × pxPerMetre` (desktop 80, phone 44), width from the image aspect; one floor line; the 1,8 m person as a decorative inline SVG (`aria-hidden`). Phone: horizontal scroll with snap, chosen door scrolled to the centre on load.
3. Choosing a model swaps the Model block client-side (no navigation, no scroll jump); `aria-live="polite"` on the block. Optional: reflect it as `?model=<heightMm>` with `history.replaceState`, and read it on load (server-render the chosen one for shared links).
4. Model block: `Fotografii · N`, the first three photos + “+(N − 3)” tile (when N ≤ 3, the last tile shows N and “fotografii, toate”); every tile opens the existing Lightbox on **that model’s** full set, at that photo. Info: “Cupru · {height} înălțime”, “Modelul {n} din {N}”, name, “La comandă”, description, price sentence, Calitate garantată, `place` only when set, quiet offer, custom card.
5. No prices anywhere on this page.
6. Old `/servicii/usi/[model]` links keep redirecting to `/servicii/usi` (optionally to `?model=` when the old slug maps to one).

**Schema impact.** The code already reads `sectionModels.models[]` (title, description, anchorId, cover, gallery, specifications[]); prefer mapping onto those (height and place as specifications, cover = door front, anchorId = deep-link key) over a new type; the shape below is the logical model. `doorModel` (field 51) becomes a list: `{ name, heightMm (number, required), doorFront (image, cut-out front for the scale row, required), description (string ≤ 160), place (string, optional), featured (boolean), photos[] {image, alt} }`. Drop `material`, `materialDot`, `price`, `specs[]` from the v6.2 shape (material is always Cupru). Migrate the existing model to heightMm 4400, featured true, and move its “Montate la Catedrala din Drobeta-Turnu Severin” line to the new 4000 mm model. Photos: from “2026+ assets/UȘI CUPRU” (subfolders per model); assets listed in `assets.md` are web copies for the boards.

**Open.** q49: the metal wording in the 2023 blog report (“din bronz”) vs “cupru”.

## 2 · No automatic price blocker (2026-11-21)

**Why.** The user: prices may be presented in new ways compared with the legacy site, so price wording must not be blocked. Sentences such as “Prețul depinde de complexitatea lucrării, de înălțime și lățime.” (Uși board) are allowed on the site.

**Rule now.** Prices are an editorial decision, not a code check. Price figures are still planned only for the Policandre catalogue (one per finish + “Prețurile sunt actualizate din data de …”) and other pages say “La comandă”, but price wording (preț, TVA, lei, estimare, negociabil …) may appear anywhere, and any future price presentation will come as a design change.

**What the code must do.**
1. Remove every blocking price check: the price rules in `scripts/lib/price-text.ts` as a gate (importer “price block” in `scripts/lib/legacy-documents.ts`, `scripts/lib/legacy-home.ts`, the seeds), `scripts/verify-no-prices.ts` as a required step, and the “no prices” assertions in `tests/browser/home.spec.ts`, `services.spec.ts`, `blog.spec.ts`. Keep the detector only if something still uses it as an information-only report; otherwise delete it and its test.
2. Studio (`../studio-premiumbells/lib/priceText.ts` and wherever it validates documents): remove the price validation so editors are not blocked or warned (separate repo; Studio deploy needs the user's OK).
3. Restore the board copy that was cut for the guard: Uși model text “Prețul depinde de complexitatea lucrării, de înălțime și lățime. Se lucrează doar după proiect, cu icoane individuale.”, the “TVA” item (lib/service-copy.ts ~l.114) and “Desenul, apoi estimarea prețului.” (~l.190), each as on its board.
4. Update docs that describe the guard (`docs/design-plan.md`, `docs/migration-status.md`, AGENTS/CLAUDE notes if any).

**Schema impact.** None (Studio validation only).

## 3 · Works index: compact header, regular card grid (2026-11-23) — superseded by §4

> Replaced the same day by §4 (edge-to-edge wall). Kept for the reasoning; do not build the captioned cards.

**Why.** Testing the build on a MacBook Pro 16", the user found (1) the top ~40% of the page held only the big two-line title “Lucrările noastre” and an almost empty area, so the works started below the fold, and (2) the mosaic wall looked random: four tile shapes cropped photos unevenly and the glass captions with real, long titles covered up to 70% of the small tiles. Works is an index people scan and compare; a calm, regular grid serves that better than a mosaic (the mosaic idea stays for hand-picked sets such as the homepage).

**Boards.** `V6Works`, `V6WorksMobile` (heights 2462 / 3508), `V6WorksSticky`, `V6WorksStickyMobile`. Handoff: H2b (new row “Project card · v6.3”, old “Project tile · v6.2” struck for Works), H3 (Works template). Docs: `pages.md`, `components.md`, `assets.md`.

**What changed.**
- **Index header:** breadcrumb, then H1 “Lucrările noastre” at section size (64 px; phone 44) on **one line**, lead on the same row to the right (phone: under it, 16 px). Hero padding 120 top / 36 bottom (phone 96 / 28); the band starts with the filter bar after 36 (phone 24). The service-page H1 size (clamp 72–132) is no longer used here. Result: the filter bar and the whole first row of cards (captions included) end at ≈ 820 px, above the fold at 1440 × 900 and 1728 × 1000.
- **One container:** header, filter bar, grid and the Hartă view all sit in the 1200 content container (the wall used to run 1408 wide, wider than the bar above it).
- **Project card · v6.3** replaces the mosaic tiles: 4 columns, gaps 40 (rows) / 24 (columns); every photo **4:5**, r16, shadow e1, no text on the photo; under it: craft bar 22 × 3, parish in Cormorant 600 24 clamped to 2 lines, one meta line “craft · place · year” (Inter 14, single line with ellipsis). Spec details (kg, levels, “sub cupola pictată”) leave the card; they are in the Project panel. Hover / focus: photo −6 px + e3, image 1.03, bar to 44; focus ring on the photo. Phone: 2 columns, gaps 28 / 12, r14, name 19, meta up to 2 lines.
- **Map card:** same size as a work card, column 4 of row 1 under every filter: the mini Europe map full width inside the 4:5 box, “60 de lucrări · 5 țări” top-left, “România · Moldova · Spania · Belgia · Muntele Athos” bottom-left; caption “Pe hartă” + link-styled “Deschideți harta →”; the whole card switches to Hartă. Phone keeps the full-width banner after the first four cards.
- **No wide first work** (decided): a 2-column card would need a landscape crop of mostly portrait subjects and push one work out of the first row.
- **Sticky bar:** docked buttons padding 12 and gap 8, so the bar fits 1200 with the bell-type chips and the count.
- Example content on the board: a new card “Catedrala din Drobeta-Turnu Severin” (Uși · Mehedinți), mounted-doors photo; desktop shows 11 works + the map card (“11 din 60 de lucrări”).

**What the code must do.**
1. Works header: replace the story-hero-sized H1 with the index header above (breadcrumb + `h1` at the section-title size + lead in a flex row, `align-items: flex-end`, stacking under 900 px).
2. Put the filter bar, grid and map view in the same max-width 1200 container as the header.
3. Replace the mosaic wall (`grid-auto-rows`, span classes, overlay captions) with a `ProjectCard` grid: `grid-template-columns: repeat(4, minmax(0,1fr))` (2 under 768; 3 between 768 and 1024 is fine), `gap: 40px 24px`; card = `<a aria-haspopup="dialog">` to the intercepted Project panel route, `next/image` with `fill` in an `aspect-ratio: 4/5` box, `sizes` ≈ `(min-width: 1024px) 282px, 50vw`, `object-fit: cover` with the CMS hotspot as object-position; caption below as on the board (`-webkit-line-clamp: 2` for the name; meta `text-overflow: ellipsis`, 2-line clamp on phones).
4. Meta line from the CMS: craft label · place (locality, county or country) · year; no key spec on the card.
5. Map card as one grid item at index 3 (after three works) on desktop and as a full-width item after four works on phones; it switches the view (`?vedere=harta`).
6. Page size: 23 works + the map card (6 full rows of 4), then “Arată încă 24”; the counter counts works only.
7. Keep: filter bar behaviour, craft moods, bell-type chips, sticky dock, Hartă view, Project panel, ordering of “Toate”.

**Schema impact.** None. (A hotspot on the project cover improves the 4:5 crops; Sanity image fields already support it; check the Works query passes it through.)

## 4 · Works index: edge-to-edge wall, no text (2026-11-23, replaces §3)

**Why.** Seen on the canvas, the §3 card grid was organised but “too traditional”: wide gaps, round cards and captions under every photo made the works look small and secondary. Reference from the user: a portfolio wall (skywardvisual.me/exteriors) where the photos are the whole interface and information appears only when the visitor asks for it. Our Project panel already shows everything on click, so the wall can drop all text.

**Boards.** `V6Works`, `V6WorksMobile` (heights 2168 / 2913), `V6WorksSticky`, `V6WorksStickyMobile`. Handoff: H2b (row “Works wall · v6.3b”, “Project card · v6.3” struck), H3. Docs: `pages.md`, `components.md`.

**What changed.**
- **No visible hero.** No breadcrumb, no visible title, no lead. A visually hidden `<h1>Lucrările noastre</h1>` stays for screen readers and SEO; the lead sentence (“Parohii, mănăstiri și catedrale: 60 de lucrări…”) becomes the page's meta description. The header pill already shows “Lucrările noastre” as current. The band starts right under the header: padding-top 112 (phone 88), then the filter bar.
- **Wall edge to edge.** The grid breaks out of the 1200 container: 16 px from the viewport edges (phone 8). Header pill and filter bar stay at 1200 and float above it.
- **Tiles:** 4 columns (phone 2), every photo 4:5, gap 6 (phone 4), radius 6 (phone 4), flat (no shadow, no lift, no card).
- **No text on the wall.** Desktop hover / focus-visible: the photo zooms 1.04 (700 ms) and an overlay fades in (300 ms, slight rise): gradient teal-night 0 → 55% → 86% at the bottom, craft bar 22 × 3, parish Cormorant 600 26, “craft · place · year” Inter 14 (#d3e2de, one line, ellipsis). `@media (hover: none)`: no overlay; a tap opens the Project panel. Reduced motion: no zoom, no rise.
- **Accessibility:** each tile link has `aria-label="{parish}, {craft} · {place} · {year}"` and `aria-haspopup="dialog"`; the `<img>` keeps a descriptive alt; focus ring on the photo.
- **Map card:** the one tile with text, always visible, same size as a photo: hatched sea over the whole tile (as on the map), “Pe hartă” Cormorant 40 (phone 26) + “60 de lucrări · 5 țări” top-left, the Europe map, “Deschideți harta →” bottom-left. Desktop: column 4 of row 1; phone: right tile of row 2.
- Counter + “Arată încă 24” stay under the wall. Filter bar, craft moods, bell-type chips, sticky dock, Hartă view and Project panel unchanged.

**What the code must do.**
1. Works page: remove the hero block; render `<h1 className="sr-only">`; set the meta description from the lead; no breadcrumb on this page (keep BreadcrumbList JSON-LD if it exists).
2. Grid: full-bleed container (`padding-inline: 16px`, 8 on phones), `grid-template-columns: repeat(4, minmax(0,1fr))` (2 under 768, 3 between 768 and 1024), `gap: 6px` (4 on phones). Tile: `<a>` to the intercepted Project panel route, `aspect-ratio: 4/5`, `border-radius: 6px`, `overflow: hidden`, `next/image` `fill` + `sizes="(min-width:1024px) 25vw, 50vw"`, `object-fit: cover`, object-position from the image hotspot.
3. Overlay as above, CSS only (`opacity` + `transform` on `:hover` / `:focus-visible`), hidden under `(hover: none)`.
4. Map card at index 3 (desktop) / 3 in a 2-column flow (phone shows it right of row 2), as a `<button>` or link to `?vedere=harta`.
5. Page size 23 works + map card; “Arată încă 24”.
6. **Grid cover (content):** each project needs one cover chosen for the wall: the best wide view of the work in its church; detail and workshop shots read poorly without a title. Use the existing main image if suitable; otherwise add an optional `gridCover` image (with hotspot) on `project`, falling back to the main image.

**Schema impact.** Optional `project.gridCover` (image, hotspot on) — to be added to `docs/design-schema-proposal-v6.md` when approved.

## 5 · Works: fixed top shelf while scrolling (2026-11-23)

**Why.** With the edge-to-edge wall (§4), bright photos passing under the floating glass header and filter bar made the bars hard to read and the top busy, and once scrolled the photos covered the band, so the craft mood (gold, graphite, red-gold, patina) disappeared. The user chose a fixed shelf: a calm frame with the works moving beneath it. This concludes the Works page for v6.3.

**Boards.** `V6WorksSticky`, `V6WorksStickyMobile` (scrolled state, Clopote · Cu jug). Handoff: H2b row “Fixed top shelf · v6.3c”. Docs: `components.md`.

**What changed.**
- Desktop: the header pill and the filter bar sit on a **fixed shelf**: band colour + the current craft mood glow, 176 px tall, with a 24 px fade below it. The wall scrolls under the shelf and fades out at its bottom edge (no hard cut).
- The bars **do not change** when scrolling: same position (bar top 112 px), same look as at the top of the page. No docked pill, no stronger glass, no extra shadow, no count in the bar. The header no longer gets the scrolled “lift”.
- Phone: scrolling down hides the header (it comes back on scroll up, as today); the chip row + search and map icons stay on a fixed 68 px strip (band + mood) with a 20 px fade.
- Changing a filter scrolls the wall back to its top (unchanged rule).

**What the code must do.**
1. Works page only: replace the docked-pill behaviour of the filter bar with a fixed shelf: `position: fixed; inset: 0 0 auto 0; height: 200px; z-index` above the wall and below the header; `background` = band + the mood layer for the active category (reuse the mood component); `mask-image: linear-gradient(#000 176px, transparent 200px)` (with `-webkit-` prefix). Phone: height 88, mask from 68 to 88.
2. The filter bar becomes `position: sticky; top: 112px` (phone: `top: 12px` once the header has hidden), keeping its page styles; remove the docked styles and the count chip from it.
3. Show the shelf only once the page has scrolled past the bar's natural position (before that, the band behind the bar is the page itself, so nothing changes visually). Keep the header's hide-on-scroll on phones; on desktop the header stays.
4. Reduced transparency needs nothing extra (the shelf is opaque); reduced motion: no fade animation needed, the mask is static.
5. Focus ring: show the gold ring on `:focus-visible` only (the user saw a double ring on a clicked chip).

**Schema impact.** None.

## 6 · Works: no “Toate”, Policandre first (2026-11-23)

**Why.** The client: “Toate” mixes every craft on one wall, so it is unclear what to look at. Each craft is its own view with its own mood glow; Works opens on Policandre.

**What changed.**
- The “Toate” chip is gone (desktop bar, phone chip row, phone strip). The chips are Policandre · Clopote (+ bell type) · Iconostase și uși · Recondiționări.
- `/lucrarile-noastre` redirects (307, temporary because the target follows the content) to `/lucrarile-noastre/policandre`; with a place or a search (homepage map links such as `?tara=md`), to the first craft in chip order that has works for it. A language with no categories yet keeps the plain page.
- The Project panel's “Pe hartă” link opens the work's own category on the map. The empty state's reset clears search, place and bell type, not the craft.
- The counter, the map card (“N lucrări · N țări”) and the Hartă view count the current craft only. The mood glows are unchanged.

**Open copy.** The mega menu card “Toate lucrările · 60 de lucrări” and the homepage “Toate lucrările” link now land on Policandre; their wording may need a change (client's call).

**Schema impact.** None.

