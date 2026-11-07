# Premium Bells — homepage v5.10 implementation handoff

Everything Claude Code (or a developer) needs to build the redesigned homepage of policandre.ro. Design source: Claude Design canvas https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF (page "v5.10 · Homepage Triptych").

## What's in here

| Path | What it is | Use it for |
|---|---|---|
| `tokens/tokens.css` | Tailwind v4 `@theme` tokens + component recipes (glass, grain, arch, low arch, photo gradient, clamps) | Drop into the global stylesheet; use the token names in classes |
| `tokens/tokens.json` | Same values as JSON | Sanity Studio theming, scripts, other tools |
| `spec/repo-integration.md` | **Read first.** How v5.10 maps onto this repo: token renames in `app/globals.css`, `homePage` section order and field changes, what already exists in Sanity | Avoid duplicating the Phase 7 schema |
| `spec/homepage.md` | Section-by-section build spec: layout, sizes, responsive behaviour, a11y/QA checklist | The main brief |
| `spec/components.md` | New/changed components with structure, states and behaviour (Triptych, Service card, Catalogue card, Video facade, Director strip, Listening strip, Journal post, …) | Building each component |
| `spec/motion.md` | Full motion table M01–M43 with reduced-motion column | Transitions and interactions |
| `spec/cms-sanity.md` | Generic field list, image slots and missing content (superseded by `repo-integration.md` where they differ) | Image slot sizes, content to collect |
| `content/homepage.ro.json` | All homepage copy (Romanian), hints, alt texts, image keys | Seed data / fallback content |
| `reference/homepage-desktop.html` | Static render of the desktop design at 1440, with a working triptych script | Visual reference; open in a browser |
| `reference/homepage-mobile.html` | Static render at 390 | Visual reference |
| `reference/assets/` | The 29 images used in the mock-ups | Placeholders only (crops and screen grabs) — real images come from Sanity |

## Suggested order of work

1. Merge `tokens.css` into `app/globals.css` with the renames in `spec/repo-integration.md` §1; fonts stay on `next/font` (Cormorant 400 + italic, Inter, latin-ext).
2. Apply the `homePage` / `audioFeature` / `testimonial` changes in `spec/repo-integration.md` §2–4 and seed from `content/homepage.ro.json`.
3. Build the sections in order 1 → 7 following `spec/homepage.md`, comparing with the reference pages at 1440 and 390.
4. Add the interactions from `spec/components.md` and `spec/motion.md` (triptych rotation, service card hover, video facade, mini player).
5. Run the QA checklist at the end of `spec/homepage.md` (contrast, 44px targets, focus, reduced motion, Lighthouse).

## Non-negotiables

- No prices anywhere (no price pages or links, catalogues are the price-free versions).
- CTA wording "Cereți o ofertă".
- Real photography only; teal-950 only in the footer on the homepage; gold only for the focus ring and the footer bell ornament.
- WCAG AA, ≥ 44px targets, `prefers-reduced-motion` honoured, no autoplay audio/video.

## Open questions (decide or fill before launch)

1. Original images: director photo (full res), foundry video (YouTube ID, place, duration) + poster, catalogue covers + price-free PDFs and their sizes, blog covers, the technical drawing for "Proiecte la comandă".
2. Denis Latisev to approve the shortened quote (full text is in the JSON as `quoteFull`).
3. "Colaborează cu noi" — link to the existing Parteneri page (assumed) or an email?
4. Contact email and company address for the footer.
5. Moldova and Spain projects with coordinates (map tile and "3 țări").
6. Bell recording: place and which bells (listening strip subtitle).
7. English copy (EN switch) — Romanian only in this handoff.

## Prompt to start Claude Code

> Implement the redesigned homepage from `docs/design-handoff/` (read `README.md`, then `spec/repo-integration.md`, `spec/homepage.md`, `spec/components.md`, `spec/motion.md`). Before changing the schema, propose the `homePage` changes from `repo-integration.md` §2 and wait for my OK; keep the price check and the existing Phase 7 conventions. Use `tokens/tokens.css` as the design tokens, `content/homepage.ro.json` for copy, and open `reference/homepage-desktop.html` and `reference/homepage-mobile.html` as the visual target. Keep the existing stack and Sanity data; add the CMS fields listed. Build section by section and check each against the reference at 1440 and 390 before moving on.
