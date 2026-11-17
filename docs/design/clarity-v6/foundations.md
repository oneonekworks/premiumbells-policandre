# Foundations (v6 Clarity, v6.2)

All values are in `tokens.css` / `tokens.json`; the visual sheet is the
`V6Tokens` board. This page is the short version.

## Grounds and colour

- White ground and band `#eef2f1` alternate section by section; neighbours never
  share a ground. No hairlines between sections.
- Ink `#111a19`, ink-soft `#4a5553`; teal-700 `#0f6b63` links and italic
  sublines; teal-900 `#0e3a36` primary buttons and active chips; teal-950
  `#0b2523` for the inset dark panels and the footer.
- Gold is UI-only for the focus ring (`#9a783e`, `#c9a467` on dark) and the one
  bell ornament. The photos carry the gold.
- **Materials:** the three craft families have metal gradients used on big
  display words (≥ 40 px) and on 28 × 3 family bars: gold (Policandre, La
  comandă, Recondiționare), bronze (Clopote, Clopotar, Automatizări), gilt
  (Iconostase, Uși). Graphite `#33363b` is the Clopote active chip and the
  bell-type chip outline; the offer to switch the Clopote bars from bronze to
  graphite is still open.

## Type

Cormorant Garamond 500–600 for display, section titles and card names; Inter for
everything else, minimum 14 px (legal line 13). Scale: hero 88/52, page 132/72,
section 64/40, statement 46/32, card 28, lead 19/17, body 17, meta 15, kicker 15/13.

## Depth and glass

Shadows e1–e3 tinted teal-ink. White glass for the header pill, menus, wall
captions, the bottom bar and the Works map island; **docked** glass (white 86% +
stronger shadow) when the header and the Works filter bar dock over photos.
Break-out card: photo sits on top of a frosted tray (tray starts 64 px down);
hover lifts the photo −12 px.

## Overlays (v6.2)

Lightbox, Lightbox · Iconostase and the Project panel scrim use **translucent
teal night**: teal-900 at 60% + blur 12 + saturate 1.4, with darker gradients
behind the top bar and the caption so text stays ≥ 4.5:1 over any page.
Controls are on-dark glass (white 6%, border 12%). The photo is shown whole at
its own shape, rounded, lifted with its own shadow. The warm black lightbox of
v2–v6.1 is gone.

**Zoom is the Lightbox's one feature, everywhere:** magnifier cursor at 1×
(phone: "Atingeți pentru a mări" chip), click / tap zooms 2.5× at that point,
again for the whole photo; wheel and pinch 1–5×; drag pans when zoomed; the hint
"Trageți pentru a vă mișca · clic pentru a micșora" only while zoomed; at 1×
arrows, swipe and the thumbnail strip (sets > 8 photos) change the photo. The
working logic is in `reference/boards/V6IconostasViewer.dc.html`.

## Mood

Soft radial glows in section backgrounds only (subtle by default). On the Works
wall the band takes the selected craft's mood (gold, graphite + gold, red-gold,
patina), cross-faded in 500 ms; photos and cards are never tinted.

## Motion

One curve, `cubic-bezier(.22,.61,.36,1)`; durations in `tokens.css`. Layers
slide or fade in 280–320 ms; filter changes cross-fade; the bell-type chips
slide in (width + fade, ~200 ms). Reduced motion: no movement.
