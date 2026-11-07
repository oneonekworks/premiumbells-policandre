# Motion spec (M01–M43)

One curve for everything: `cubic-bezier(.22,.61,.36,1)` (token `--ease-light`). No spring, no overshoot. Only transform, opacity, filter, box-shadow and background-color animate (exception: triptych flex-grow, on one element, never during scroll). Reveals play once. Durations are tokens in `tokens.css`.

> Homepage v5.10 note: M01, M04, M05 (arch hero photo, Ken Burns, parallax) and the crafts panels / counters rows are superseded by the triptych (M36–M42); M02–M03 still apply to the headline, claim, buttons. M43 = services cards. M34 = listening strip.


### Page load

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M01 | Hero arch photo | Page load | Fades in from the off-white ground: opacity 0 → 1, scale 1.02 → 1. No dark start. | 900ms | 0 | Shown at once |
| M02 | Hero headline | After the photo starts | Rises 12px and fades in | 700ms | 400ms | In place |
| M03 | Lead, buttons, stat card | After the headline | Rise 12px + fade, in that order | 600ms | +100ms each | In place |
| M04 | Ken Burns | Load, continuous | Arch photo scale 1 → 1.06 with 1% drift, alternating; pauses off screen | 24s linear | 900ms | Off |
| M05 | Hero parallax | Scroll | Arch photo moves 3% slower than the page; never under text | Scroll-linked | — | Off |

### Header and menus

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M06 | Header bar → pill | Scroll past 80px | Plain 88px bar on the ground becomes the floating white-glass pill (1120 max, 16px from top, 64px tall, e2) | 240ms | 0 | Instant swap |
| M07 | Header hide / show | Fast scroll down / any scroll up | Pill slides up out of view / back | 320ms | 0 | Always visible |
| M08 | Nav item | Hover, focus, active page | Teal tint background fades in behind the word; active text teal-900 | 180ms | 0 | Instant |
| M09 | Mega menu open | Click / Enter / ↓ | White glass panel (e3) drops 8px into place and fades in; pill stays glass while open | 240ms | rows 30ms apart | Instant |
| M10 | Mega menu close | Esc, click outside, second click | Panel fades out; focus returns to “Servicii” | 160ms | 0 | Instant |
| M11 | Menu row | Hover, focus | Teal tint fades in behind the row | 180ms | 0 | Instant |
| M12 | Mobile menu | Tap menu button | Full-screen white-glass sheet fades in; thumbnail rows follow | 240ms | rows 30ms apart | Instant |
| M13 | Mobile bottom bar | Hero leaves view | Glass pill fades and rises 12px; hides while menu or lightbox is open | 240ms | 0 | Instant |

### Filters and grids

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M14 | Chip | Hover / select | Hover: teal tint. Select: fills teal-900, text turns white | 180ms | 0 | Instant |
| M15 | Filtered grid | Chip selected | Cards that leave fade out; the remaining slide to new positions (FLIP); newly matching cards fade and rise 12px | out 160 · move 320 · in 320 | in: 30ms apart | Instant swap |
| M16 | Grid entry | Row first enters view (bento, card grids, wall) | Rise 16px, opacity 0 → 1, photo brightness .85 → 1 | 900ms | 60ms apart, max 6 per row, once | In place |
| M17 | Text reveal | With its photo / section | Rise 12px and fade | 700ms | +100ms after photo | In place |
| M18 | Crafts panels | Scroll | Sticky rounded panels stack; the next slides over the pinned one; its name rises 12px on arrival | Scroll · 700ms | — | Plain stacked sections |

### Hover, focus, press

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M19 | Card lift | Hover or keyboard focus | Card rises 4px, shadow e1 → e2, photo scales 1.03 inside its rounded frame; focus adds the gold ring | 240ms | 0 | Shadow change only |
| M20 | Card press | Pointer down | Settles to a 1px lift, e1 | 120ms | 0 | Shadow change only |
| M21 | Button | Hover / press | Hover: primary darkens to teal-950, secondary gets e2. Press: brightness .9 — no scale | 180 / 120ms | 0 | Same (colour only) |
| M22 | Text link | Hover, focus | Underline thickens 1px → 2px | 180ms | 0 | Instant |
| M23 | Gilded shimmer | Hover / focus on photos tagged gilded | Soft warm band sweeps once across (blur 26px, screen blend) | 1200ms | 0 · once per hover | Off |
| M24 | Wall caption | Hover / focus (always on, on touch) | White glass caption fades in; photo scales 1.03 | 240ms | 0 | Instant, no scale |
| M25 | Focus ring | Keyboard focus | 3px gold ring (#9a783e; #c9a467 on dark) with the hover state of the element | Instant | 0 | Same |

### Lightbox, zoom, transitions

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M26 | Lightbox open | Tile click / Enter | Page behind blurs 0 → 24px and darkens to 72% warm black; the photo grows from its tile to centre (FLIP) | 320ms | caption +120ms | 120ms cross-fade |
| M27 | Lightbox swipe / arrows | Drag, ← → | Photo follows the finger 1:1, then settles to the next | 1:1 · 240ms | 0 | Instant change |
| M28 | Lightbox close | Esc, ×, swipe down | Reverse: the photo returns into its tile, blur lifts | 280ms | 0 | 120ms cross-fade |
| M29 | Link copied | “Copiază linkul” | Small toast fades in, stays 2s, fades out | 240ms | 0 | Instant |
| M30 | Zoom | Wheel, pinch, + / − | Pinch and wheel are continuous; buttons step 25% (100–400%) | 240ms | 0 | Instant steps |
| M31 | Tile → project | Click a wall tile or work card | The photo expands into the project page lead image (View Transitions); the rest fades in | 480ms | rest +120ms | 120ms cross-fade |
| M32 | Hub → hero | Click a bento card or crafts panel | The card photo becomes the next page’s hero image | 480ms | rest +120ms | 120ms cross-fade |

### Content

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M33 | Counters | First seen | 60, 12, 3 count up from 0, once | 1200ms | 200ms | Final number |
| M34 | Bell player | Play | Waveform bars fill from pale teal to teal-700 as the sound passes. v5.4: if the listener scrolls the strip out of view while it plays, a small white-glass mini player (title, pause, progress) slides up at the bottom and stays until paused or ended | Real time · glow 400ms | 0 | Bars fill, no glow fade |
| M35 | Testimonial | Enters view | Quote fades in line by line; background holds still | 700ms | 120ms per line | In place |

### v5.1 · Triptych hero (homepage) — replaces M01, M04 and M05 on the homepage; M02–M03 still apply to the headline, claim and buttons

| ID | Element | Trigger | What moves | Duration | Delay / stagger | Reduced motion |
|---|---|---|---|---|---|---|
| M36 | Slice open / close | Hover or focus on a slice or its headline word; rotation step | The slice grows from 1 to 2 parts (half the panel) while the others shrink; on phones the band does the same, 2 : 1 : 1. Animates flex-grow, which is layout, so it runs on one element and never during scroll | 480ms | 0 | Changes at once |
| M37 | Slice photo | With M36 | Photo brightness 78% → 100%; a bottom gradient behind the text fades in — no veil over the photo. Closing slices dim back | 480ms · gradient 240ms | 0 | Changes at once |
| M38 | Slice text | With M36 | Name, one line and “Vedeți … →” fade in; the glass label fades out. On close the text fades out first | 240ms | in +120ms · out 0 | Shown at once |
| M39 | Word ↔ slice | Hover or focus on either | Teal-700 underline (3px, offset 12px) fades in under the matching headline word | 180ms | 0 | Instant |
| M40 | Auto-rotate | Page load | Rest (equal thirds) → Policandre → Clopote → Iconostase → Policandre…, each step running M36–M39. Pauses while the hero is off screen or the tab is hidden, and continues on return | 6s per slice | first step 1.2s | Off: rest state, no control |
| M41 | Rotation stop | First hover, focus or tap on a word or slice | Rotation stops for good; the slice under the pointer stays open; the pause control switches to Play. Hovering the pause pill itself does not count | — | — | — |
| M42 | Pause control | Click or Enter on the pill | Pause ⇄ Play. The active progress bar fills left to right over the interval; Play resumes from the open slice with a fresh bar | bar 6s linear | 0 | Hidden |
| M43 | Service card (v5.9) | Hover, focus | Card lifts 4px and scales to 1.01 (e1 → e2); photo scales 1.05 inside its frame; a glass hint chip fades up 6px over the bottom of the photo; the arrow circle fills teal-900 and nudges 2px right. Touch screens show the hint at all times | 240ms · photo 320ms | 0 | Shadow and colour only; hint always visible |

Build: one IntersectionObserver for every reveal; CSS transitions for hover, menus and header; FLIP for filter reflow and the lightbox; View Transitions API for M31–M32 with a plain fade where unsupported. Durations are tokens in tokens.css (--duration-*).
