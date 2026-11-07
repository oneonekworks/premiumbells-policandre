# Components introduced or changed in v5.x

Earlier components (header pill, mega menu, mobile menu, wall tile, lightbox, map, chips, buttons, offer block) keep their v4 spec — see the Claude Design canvas, page "v4 · Handoff", board "Handoff 2 · Component inventory". Motion IDs refer to `motion.md`.

## Triptych (hero) — M36–M42

**Structure:** panel (relative, overflow hidden, radius 28) → `.tri` flex row (gap 6px, inset −64px left/right so slanted outer edges are hidden, `container-type: inline-size`) → 3 slice links `.sl.s0|s1|s2`.

**Slice:** `<a>` to the service page; `transform: skewX(-10deg)`; `flex: 1 1 0`; open = `flex-grow: 2` (ratio 2:1:1). Inside:
- `.im` (absolute, left/right −40%, `skewX(10deg)`) with the photo, `object-fit: cover`, closed `filter: brightness(.78)`, open none.
- `.vl` = `.photo-gradient`, opacity 0 → 1 when open.
- `.lb` glass label (white glass pill, 14px 600) at **mid-height** (`top:50%`), centred; on s0 aligned right 28px, on s2 aligned left 28px; hidden when open; `@container (max-width:640px){display:none}` → labels are shown whole or hidden, never cut.
- `.tx` (counter-skewed) bottom 44px: name Cormorant 56, one line 15px, glass pill "Vedeți clopotele →". Offsets: left 96 (s0: 176), right 110 (s2: 96). Opacity 0 → 1, 240ms, delay 120ms.

**Pause pill:** white glass, top-right 24px: three 18×3 progress bars (active teal-700, fills over 6s) + 32px round button (Pause ⇄ Play, aria-label "Opriți / Porniți derularea automată").

**Behaviour:**
- Load: Clopote (or rest = equal thirds) → after 1.2s Policandre → every 6s next slice, looping.
- Hover/focus on a slice **or** its headline word opens that slice and underlines the word (3px teal-700, offset 12px). The first such interaction stops rotation for good (pause pill shows Play). Hovering the pill itself doesn't count.
- Play resumes rotation from the open slice. Pointer leaving keeps the last slice open (no collapse).
- Pause while off-screen (IntersectionObserver) or `document.hidden`.
- `prefers-reduced-motion`: no rotation, no pill, changes are instant.
- Phones: 3 stacked bands (`skewY(-8deg)`, open band 2:1:1, labels left 20px at mid-height); tap goes straight to the service.
- Reference implementation: the small script at the end of `reference/homepage-desktop.html`.

## Service card (services bento) — M43

`<a class="sv">` white card, radius 20, padding 8, e1, flex column, fills its grid cell.
- `.ph` photo (flex 1, radius 14, overflow hidden, relative). Hint chip `.ht` inside: white glass pill bottom-left 10px, 12px 600 ink, single line with ellipsis; opacity 0 + translateY(6px) at rest.
- `.lb2` label row, **fixed height 64px** (58 phones), grid `1fr auto`, align start: name 16px 600 clamped to 2 lines (`.text-clamp-2`); arrow button `.go` 36px round tint/teal-900 icon, margin-top −6px so it centres on the first line.
- Hover/focus-visible: card translateY(−4px) scale(1.01), e2; photo scale 1.05 (320ms); hint chip fades up; arrow fills teal-900 with white icon and nudges 2px right. Active: −1px, e1, 120ms.
- `@media (hover:none)`: hint always visible. Reduced motion: shadow/colour only.
- Proiecte la comandă: technical drawing on white → photo frame gets white bg + 1px hairline outline.

## Craft heading column

`.gt`: 2px solid ink top border, padding 16px 4px 0, gap 14; H3 Cormorant 36; facts `<ul>` 14/1.5 ink-soft, bold spans ink 600. Spans 2 grid columns. Not a link.

## Catalogue card

Centred, `width: min(100%, 760px)`, white, radius 24, e1, padding 16, grid `220px 1fr`, gap 28.
- Left: sunk panel 196px tall, radius 16, two covers (104×148) overlapping, rotated −4° / +3°, radius 6, e3; `aria-hidden`.
- Right: H3 "Cataloage" (Cormorant 40), then one row per catalogue `.ct`: ground bg, radius 14, grid `1fr 44px`; left link (opens the PDF in a new tab): title 15px 600 + "Citiți online →" 12px teal-700 600; right a 44px round teal-900 download link (`download`, aria-label "Descărcați {titlu} (PDF, {mărime})"). Row hover: tint.
- PDFs are the price-free versions only.

## Despre noi list ("astfel promovând")

`<ul class="prom">` rows: grid `112px 1fr` (84px phones), gap 20, baseline-aligned, 14px vertical padding, 1px hairlines; key Cormorant 28 ink; text 15/1.55 ink-soft.

## Video facade

`<a class="vid">` aspect 16:9, radius 20, e1; poster `object-fit: cover`, hover scale 1.03; 76px glass play button (60 on phones); glass caption bottom-left (title 14 600 + place · duration 13). Click replaces it with the YouTube iframe (nocookie, autoplay=1, title attribute set).

## Director strip

`<figure>` with 1px top hairline, padding-top 48, grid `456px 1fr`, gap 56: image in `.arch-low` 456×304; `<blockquote>` Cormorant 30/1.22; fact line 15 ink-soft; `<figcaption>` name 600 + "· Director, S.C. Premium Bells SRL" ink-soft.

## Listening strip — M34

See homepage spec §5. Play button 64px teal-900 (hover teal-950); waveform bars pale teal, played teal-700; mini player = white glass pill fixed bottom-centre (desktop) / above the bottom bar (phones): title, pause, thin progress.

## Journal post (editorial)

`<a class="post post3">` flex column, no background. Photo 3:2 radius 16 (hover 1.03); meta line (type teal-700 600 · date · reading time); title Cormorant 30/1.1 `.text-clamp-3` with `min-height: 3.3em`; excerpt `.text-clamp-3` 15/1.6 ink-soft; "Citiți articolul →" teal-700 pinned with `margin-top:auto`. Hover: title gets 1px teal-700 underline (offset 6), arrow moves 4px. Focus ring offset 8, radius 16.

## Figures (hero)

`.figs.in`: flex gap 24, 28px left padding + 1px hairline left; number Cormorant 34 ink, label 13 ink-soft underneath. Values from CMS `figures` (can be computed from projects). Not links.
