# Homepage v5.10 — build spec

Reference renders: `reference/homepage-desktop.html` (1440) and `reference/homepage-mobile.html` (390). Open them in a browser next to this file. Values below win over the reference markup if they ever differ.

## Global

- **Page:** background `--color-ground` (#f7f6f2). Content container 1440 max, 56px side gutter (20 on phones, 32 tablet) → 1328 content width.
- **Fonts:** Cormorant Garamond 400 (+ italic) for big titles, serif headlines, keys and quotes; Inter 400/500/600 for everything else. Load with `display=swap`, preload the Cormorant 400 latin-ext subset (Romanian ș ț ă î â).
- **Section rhythm (desktop):** hero → services 64px (so "Serviciile noastre" peeks above a 1440×900 fold), then 140–160px between sections, listening strip 120px. Phones: 72–80px.
- **Dark areas:** teal-950 only in the footer (1 of max 3). Everything else is light: white cards (`--shadow-e1`, radius 20–24) on the ground.
- **Header:** 88px bar (logo + "Premium Bells" Cormorant 26, nav Servicii ▾ · Lucrările noastre ▾ · Blog, RO / EN, phone pill teal-900 "+40 722 790 776"). After 80px of scroll it becomes the floating white-glass pill (v4 spec, unchanged). Phones: 64px bar, logo + round menu button; glass bottom bar ("Cereți o ofertă" + "Sunați") appears once the hero has scrolled away.
- **Section rail (desktop ≥ 1200):** fixed, right 20px, vertically centred, 7 dots (28px targets). Hidden over the hero; fades in from section 2. Active dot teal-700 scaled 1.25. Labels appear only on hover/focus (white pill, e1).
- **No prices anywhere. CTA wording is always "Cereți o ofertă".**

## 1 · Hero (stacked) — `#s1`

Desktop, top to bottom, padding 12px 56px 0:

1. **"Nou" pill** (optional, CMS `announcement`; hidden when empty): 44px white pill, e1; inner tint badge "NOU" (11px, 600, uppercase, .08em) + text "Pagina Iconostase →". Hover: pill bg tint.
2. **Headline H1**, one line, `--text-hero-line` (88px), `white-space: nowrap` ≥ 1024: "Policandre, clopote și iconostase". The three words are links (`.w`) to their service pages and are paired with the triptych slices (see components › Triptych). 18px above.
3. **Row** (22px below), space-between: left the claim *"Confecționate de către ortodocși pentru ortodocși"* (Cormorant italic 28); right the actions: primary button "Vezi lucrările" (teal-900, 52px pill) + secondary "Cereți o ofertă" (white, e1) + figures **60** lucrări · **3** țări · **12** turnătorii (Cormorant 34 numbers, 13px ink-soft labels) separated from the buttons by a 1px hairline (28px padding).
4. **Triptych panel** 24px below: full content width × 460px, radius 28, e2.

Phones: pill · H1 42px on two lines ("Policandre, clopote / și iconostase") · triptych as 3 stacked bands 600px tall (radius 24, 12px side margin) · claim (22px italic) · two stacked full-width buttons · figures under a hairline.

## 2 · Serviciile noastre — `#s2`

H2 "Serviciile noastre" (`--text-section`). Below (40px), the **services bento**: 12 columns, rows 264px, gap 16.

| Band | Heading column (2 cols) | Cards (cols) |
|---|---|---|
| Policandre | **Moscova și Iaroslavl**: turnate masiv, clasa premium · Stil clasic **„brad"** și **„horă"** · **Grecia**: stil bizantin, des solicitat în România | Policandre (4) · Proiecte la comandă (3) · Recondiționare (3) |
| Clopote | Cu jug sau **fără balans** · Până la **16 tone** | Clopote cu jug (3) · Clopote fără balans (3) · Clopotar electronic (2) · Automatizări (2) |
| Iconostase și uși | **Marmură**, **lemn cu aur**, **bronz** | Iconostase (5) · Uși (5) |

Heading column: 2px ink rule on top, 16px padding-top, craft name Cormorant 36, facts 14px ink-soft with bold in ink 600 directly below (no fill, no card). Cards: see components › Service card. Hints (hover chip): Turnate masiv, clasa premium · Policandre la comandă · Policandre și clopote · Până la 16 tone · Trase de sfoară · Pentru clopote fixe · Pentru clopote cu balans · Marmură, lemn cu aur, bronz · Cupru, bronz, stejar.

Then (40px) the **Cataloage card**, centred, `width: min(100%, 760px)`: see components.

Phones: per craft a heading (rule + name 32 + facts 13) then a 2-col card grid (gap 10); the first card of each band spans 2 (196px), others 176px; Automatizări spans 2. Then the catalogue card full width.

## 3 · Lucrările noastre — `#s3` (Works wall, unchanged from v4)

Title left, filter chips right (Toate 60 · Policandre 11 · Clopote 39 · Recondiționări 7 · Automatizări 2 · Uși 1; active chip teal-900 with count #b9d0cb). Wall: 6 columns, square row unit `clamp(150px,16vw,228px)`, gap 8, 8px side padding, tiles radius 12; sizes: large 2×2, tall 1×2, wide 2×1, small. One video tile (glass play button). Hover/focus: photo 1.03 + glass caption (project · place · keySpec · year) + candlelight shimmer on gilded photos. The **map tile** sits inside the wall (cols 5–6, row 3): Romania outline with teal-700 dots, "60 lucrări în 3 țări", "Deschideți harta →". Centred button "Toate cele 60 de lucrări". Phones: chips scroll horizontally; wall becomes a 1 + 2-column masonry with the map tile full width.

## 4 · Despre noi — `#s4`

Desktop: 2 equal columns, gap 72, vertically centred.
- **Left:** H2 "Despre noi"; lead (Inter 20/1.5, ink) = the current site's sentence up to "astfel promovând:" with **Iaroslavl**, **Kamensk-Uralsky**, **Belltron** in 600; then a 3-row list (1px hairlines top/bottom of each row, 14px vertical padding, grid 112px | 1fr): Cormorant 28 key + 15px ink-soft text — `16 tone` / `Athos` / `Balans` (copy in `content/homepage.ro.json`). No link.
- **Right:** foundry video facade, 16:9, radius 20, e1: poster image, 76px glass play button centred, glass caption bottom-left "În turnătorie · [locul] · [durata]". YouTube iframe loads only on click (`youtube-nocookie`, autoplay after click).
- **Director strip** (80px below, 48px padding-top, 1px hairline on top, no card): grid 456px | 1fr, gap 56. Photo 3:2 (456×304) under a low arch (`.arch-low`), showing the bell, both hands on the ropes and the face. Quote Cormorant 30/1.22 (his first sentence only — needs his approval), then the fact line (15px ink-soft), then "**Denis Latisev** · Director, S.C. Premium Bells SRL".

Phones: stacked — title, lead 17px, list (key column 84px, keys 24px), video, then the director strip with the photo full width (low arch 175/54px radii), quote 25px.

## 5 · Ascultați — `#s5` (listening strip)

White card radius 24, e1, padding 20/32/20/20, grid `104px 300px 1fr auto`, gap 32, ≈180px tall:
arch thumbnail 104×136 · "Dăngăt pascal" (Cormorant 44) + "Ascultați · [locul și clopotele]" (13px) · player: 64px teal-900 play button, waveform (2px bars, gap 2, height 56, pale teal rgba(15,107,99,.26); played part teal-700), time "0:00 / [durata]" · link "Seturi de clopote după note →". Waveform comes precomputed from the CMS (100 values), never computed in the browser. When playing and the strip scrolls out of view, a small white-glass mini player (title, pause, progress) slides up at the bottom until paused/ended (M34). Phones: two rows (thumb + title, then player) + link.

## 6 · Din jurnal — `#s6`

Header row: H2 "Din jurnal" + link "Toate articolele". Latest 3 posts, 3 equal columns, gap 40, **no card background**. Each post is one link:
photo 3:2 radius 16 → meta line 13px ink-soft "**Articol** · 17 feb. 2023 · 6 min de citit" (type in teal-700 600) → title Cormorant 30/1.1, clamped to 3 lines with the 3-line height reserved → excerpt 15/1.6 clamped to 3 lines (CMS excerpt ≤ 170 chars) → "Citiți articolul →" (teal-700 600, pinned to the bottom with `margin-top:auto` so all three align). No byline on cards. Phones: stacked, full-width 3:2 photos, title 26.

Client testimonial slot: hidden until `testimonial` exists in the CMS; then it sits above the posts and the H2 becomes "Mărturie și jurnal".

## 7 · Footer with offer — `#s7`

teal-950 panel, margin 160px 16px 16px, radius 28, padding 72/56/40, grain overlay (`.grain`). Top row: H2 "Cereți o ofertă" (Cormorant clamp 64–120) + "Spuneți-ne despre biserica dumneavoastră. Vă răspundem cu un proiect și o ofertă." (18px on-dark-soft) | right: white pill "Sunați: +40 722 790 776" (60px) + link "sau scrieți-ne: [email]". 1px rule (on-dark 14%). Columns 2fr 1fr 1fr 1fr: logo + bell ornament (gold #b8955a) + "Colaborează cu noi →" + Facebook/Instagram (44px round, on-dark 8% bg) · Servicii links · Lucrări/Harta/Blog · phone + RO / EN. Legal line: "S.C. Premium Bells SRL · CUI 36422758 · Reg. Com. J40/10836/12.08.2016 · [adresa] · © 2026". No price links. Phones: same content stacked, margin 0 12px 120px (room for the bottom bar).

## Accessibility & QA checklist

- Contrast: all text pairs in `tokens.css` comments pass AA; white text on photos only over `.photo-gradient` or glass.
- Every interactive element ≥ 44×44 (rail dots are 28px visual inside a 44px hit area on touch).
- Focus: 3px gold ring (`--color-focus`, on dark `--color-focus-on-dark`), offset 3px; triptych slices: inset −6px.
- Triptych: words and slices are real links; rotation pausable (WCAG 2.2.2), stops on first interaction, off with `prefers-reduced-motion`; hidden-tab pause.
- Reduced motion: no rotation, no zooms, no lifts; colour/shadow changes only; hints shown always.
- Reduced transparency / no backdrop-filter: glass falls back to 96% white.
- Images: every photo has Romanian alt text (fallback "Piece, place, year" from the project); decorative covers are `aria-hidden`.
- Video and audio never autoplay; YouTube loads on click.
- Lighthouse targets: LCP = triptych open-slice image (preload, `fetchpriority="high"`, AVIF/WebP from the Sanity CDN at viewport width × DPR); everything below the fold lazy.
- `lang="ro"`; headings in order (H1 hero, H2 per section, H3 band/catalogue headings).
