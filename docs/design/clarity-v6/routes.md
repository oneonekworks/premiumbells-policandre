# Routes, layers and URL parameters (v6.2)

Compared with the app routes as of commit `556b71c` (`app/[lang]/…`). Romanian
paths unprefixed, English under `/en` as today. Status codes: 308 for permanent
redirects (as in `docs/url-map.md`).

## Pages

| Path | v6 | Today | Change |
|---|---|---|---|
| `/` | Homepage v6 | v5.10 homepage | Rebuild sections (see `pages.md`); `#servicii` is the services section id |
| `/servicii` | **no page** | hub page | 308 → `/#servicii`; every "Servicii" breadcrumb links to `/#servicii` |
| `/servicii/policandre` | Policandre + model catalogue with prices | built | Story hero, catalogue cards with prices, `#Policandru-N` anchors kept |
| `/servicii/policandre-la-comanda` | La comandă | built | Story hero (3D plate + insets) |
| `/servicii/reconditionare-policandre` | Recondiționare | built | Story hero, before/after panel, stages |
| `/servicii/clopote` | **Clopote cu jug** (default type) | chooser hub | Renders the cu-jug page; type switch links to `/servicii/clopote/fara-balans` |
| `/servicii/clopote/cu-jug` | — | nested page | 308 → `/servicii/clopote` |
| `/servicii/clopote/fara-balans` | Clopote fără balans | nested page | Same template as cu jug |
| `/servicii/clopotar-electronic` | Clopotar electronic | built | Story hero |
| `/servicii/automatizari-clopote-cu-balans` | Automatizări | built | Story hero; kits without prices |
| `/servicii/iconostase` | Iconostase | hub + 4 material pages | One page; materials open the Lightbox with material tabs |
| `/servicii/iconostase/marmura` · `/lemn-aur` · `/pristol-marmura` | Iconostase page **with the Lightbox open** on that material | nested pages | Keep the URLs (indexed) as layer addresses: render the page + open layer server-side |
| `/servicii/iconostase/iconostas-bronz` | — (Bronz removed 2026-11-16) | nested page | 308 → `/servicii/iconostase` |
| `/servicii/usi` | Uși, five copper models (v6.3: doors at scale + model block; optional `?model=<heightMm>`) | built (v6.3 change pending) | Old model links (if any `/servicii/usi/[model]`) 308 → `/servicii/usi` |
| `/lucrarile-noastre` | Works, filter Toate | overview page | One page with the filter bar; Galerie / Hartă |
| `/lucrarile-noastre/[category]` | Works pre-filtered | category page with sidebar | Same page, category chip on; sidebar and year/county filters removed |
| `/lucrarile-noastre/[category]/[project]` | Works (that category) **with the Project panel open**, server-rendered | full project page + intercepted slide-over | No full project page any more: the direct route renders the Works page with the panel open; the intercepted route opens the panel over the current page |
| `/blog`, `/blog/[post]` | Blog, Article | built | Restyle (featured story preview, byline cards) |
| any other | 404 v6 | built | Restyle |

## Layers (URL-addressable, Back / Esc close the top one)

| Layer | Opened from | Address |
|---|---|---|
| Project panel | any work card / tile / map pin / menu | the project URL (intercepted route over the current page; direct visit = Works + panel) |
| Lightbox | photos in pages and in the Project panel | a `foto` search param or hash on the current URL (e.g. `?foto=4`), so Back closes it |
| Lightbox · Iconostase | Iconostase hero control, material cards | `/servicii/iconostase/<material>` (see above) + `?foto=` |
| Mega menu, mobile menu | header | no URL |

The Project panel opened from a service page browses **that service's works
only** (counter "Lucrarea 1 din N · Clopote cu jug"), its category link shows
as plain text, and closing returns to the same scroll position.

## URL parameters on Works

| Parameter | Values | Meaning |
|---|---|---|
| path segment | `policandre` · `clopote` · `iconostase-si-usi`? · `reconditionari-policandre` | Category filter (craft chips). The exact slugs follow the existing `workCategory` documents; "Iconostase și uși" groups Uși (+ iconostase works when they exist), and Automatizări is listed under Clopote. Confirm with the user before changing slugs |
| `tip` | `cu-jug` · `fara-balans` | Bell type, only with Clopote (bell pages link here with it set) |
| `vedere` | `harta` | Map view instead of the wall |
| `cauta` | text | Search (the field opens from the search icon) |
| `judet` / `tara` | slug | Chosen in the map island: filters and switches back to Galerie |
| `pagina` | n | "Arată încă 24" pagination, as today |

Removed: `an` (year) and the county select on category pages (the map does the
place filter).
