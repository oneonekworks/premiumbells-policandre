# Premium Bells · design v6 "Clarity" · implementation handoff

**Status:** v6.2, release candidate, design locked on 2026-11-17. This folder is
the design source of truth for the rest of the build. It replaces
`docs/design-handoff/` (v5.10 homepage, Patina tokens), which stays only as
history.

**Design canvas:** https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF, page
**"v6 · Clarity"**. The canvas holds the same boards as `reference/boards/`;
open it to see them rendered with the real photos and to click through the
interactive ones (filters, size guide, type switch, Lightbox zoom). Its version
history carries every earlier state (publish labels "v6.x …").

## Versions: read this first

The canvas page **"v6 · Clarity" is the only current design; build from its
boards only.** "v6.1" and "v6.2" are correction rounds applied in place to
those same boards, not separate pages or versions: there is no v6.1 / v6.2 page
and none should be expected. Where a note says "v6.1" or "v6.2", it marks when
that part changed; the board as it stands is the truth. Pages v1–v5 and
"v4 · Handoff" on the canvas are history.

**When two sources disagree, the order is:** board file in `reference/boards/`
→ `rules.md` / `routes.md` → `components.md` → `pages.md` → anything else.
`components.md`, `pages.md` and `content-model.md` were exported from the
canvas handoff boards (H2, H2b, H3, H4) and keep some v4/v5 rows marked as
superseded; a row that contradicts a board is stale.

## What is in here

| Path | What it is | Use it for |
|---|---|---|
| `rules.md` | The rules in force (prices, CTA, noise, layers, a11y) | Read before any page |
| `routes.md` | Routes, redirects, layers and URL parameters in v6, against today's app routes | Routing changes, `url-map.md`, SEO |
| `foundations.md` | Design language in one page + the v6.2 additions | Orientation before tokens |
| `tokens.css` / `tokens.json` | Tailwind v4 `@theme` tokens + recipes, v6.2 | Replace the Patina tokens in `app/globals.css` |
| `components.md` | Every component with states, sizes, tokens (H2 + H2b) | Building each component |
| `pages.md` | Section order per page and layer (H3) | Building each page |
| `content-model.md` | Fields and image slots the design needs (H4, generic names) | Input to `docs/design-schema-proposal-v6.md` |
| `open-questions.md` | Superseded decisions + open client questions (H5) | What not to build, what to ask |
| `copy/*.md` | The Romanian copy per page, from the boards | Seed content and fallbacks |
| `assets.md` | Every image on the boards: asset id, description, boards | Find the Sanity original for each picture |
| `reference/boards/*.dc.html` | The 43 v6 board sources (desktop + phone + token sheet) | Exact markup, CSS values, interaction logic |
| `reference/footer.html` / `footer.css` | The canonical footer block | The footer, verbatim |
| `tools/map-europe.js` | The script that draws the Europe map paths (Natural Earth 1:50m, d3-geo) | Build-time map SVG |

### Reading a board file

Each `reference/boards/<Name>.dc.html` is one artboard: plain HTML + a
`<helmet><style>` block + a small `class Component extends DCLogic` script.
`{{hole}}` values come from `renderVals()`; `<sc-for>` / `<sc-if>` are loops and
conditions. `/_blob/<id>` is a canvas image (see `assets.md`); in the app use
the Sanity original. Board widths: desktop 1440, phone 390. Boards whose name
ends in `B` are the second half of a long page (the canvas caps a board at
8000 px).

| Page / layer | Desktop | Phone |
|---|---|---|
| Homepage | `V6HomeDesktop` + `V6HomeDesktopB` | `V6HomeMobileA` + `V6HomeMobileB` |
| Policandre (catalogue with prices) | `V6ServicePolicandre` + `B` | `V6ServicePolicandreMobile` + `MobileB` |
| Policandre la comandă | `V6ServiceComanda` | `V6ServiceComandaMobile` |
| Recondiționare policandre | `V6ServiceReconditionare` | `…Mobile` |
| Clopote cu jug (= /servicii/clopote) | `V6ClopoteCuJug` | `…Mobile` |
| Clopote fără balans | `V6ClopoteFaraBalans` | `…Mobile` |
| Clopotar electronic | `V6ClopotarElectronic` | `…Mobile` |
| Automatizări clopote cu balans | `V6AutomatizariBalans` | `…Mobile` |
| Iconostase | `V6ServiceIconostase` | `…Mobile` |
| Lightbox · Iconostase (layer, material tabs + zoom) | `V6IconostasViewer` | `…Mobile` |
| Uși (five copper models, v6.3) | `V6ServiceUsi` | `…Mobile` |
| Lucrările noastre (Galerie / Hartă) | `V6Works` | `V6WorksMobile` |
| Works, filter bar docked while scrolling | `V6WorksSticky` | `V6WorksStickyMobile` |
| Project panel (layer; the only way a work is shown) | `V6ProjectPanel` | `…Mobile` |
| Lightbox (layer, zoom + thumbnail strip) | `V6Lightbox` | `…Mobile` |
| Blog | `V6Blog` | `…Mobile` |
| Article | `V6Article` | `…Mobile` |
| 404 | `V6NotFound` | `…Mobile` |
| Menus | `V6MegaMenu` | `V6MobileMenu` |
| Visual token sheet | `V6Tokens` | — |

## How the build continues

The plan, with phases and gates, is `docs/design-plan.md` (rewritten for v6).
The schema changes are proposed in `docs/design-schema-proposal-v6.md` and need
the user's OK before any Studio change. Routes and redirects are in
`docs/url-map.md` (v6 section) and `routes.md`. The session state and the
kickoff prompt for Claude Code are in `docs/handoff.md`.

## Not in this package

- Rendered PNGs of the boards: open the canvas instead (real photos, clickable).
- The client prototype (https://claude.ai/artifact/7rsAVzXidcVTb33ZPyDKuo) is
  older than v6.2 and is not a reference for the build.
- English copy: Romanian only; `/en` keeps its placeholder.
