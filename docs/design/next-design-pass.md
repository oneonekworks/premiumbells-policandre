# Next design pass (v6.3): kickoff prompt for a new Cowork session

Written 2026-11-20. Paste the prompt below into a new Cowork session (Claude,
with the Design canvas tools), with the repo folder
`/Users/amanoila/Dev/next/rbells_policandre` connected. It carries the
context of the design sessions of 2026-11-13 → 2026-11-17 and the
implementation state of 2026-11-20.

---

Continue the Premium Bells (policandre.ro) design work: a new design pass,
**v6.3**, to extend and enhance pages of the implemented v6 "Clarity" design.
Romanian copy; I edit by hand too.

SOURCES (read before anything else)
1. Design canvas https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF, page
   "v6 · Clarity". Read `project/handoff/SESSION-NOTES.md` ("NEXT SESSION,
   START HERE" and the end of the v6.2 log) and `project/canvas.json`.
2. Repo `/Users/amanoila/Dev/next/rbells_policandre` (connected folder),
   branch `prototype/mobile-publishing`: `docs/handoff.md`,
   `docs/design-plan.md` (v6 plan; phases V0–V7 are done, read their notes),
   `docs/design/clarity-v6/README.md`, `rules.md`, `routes.md`,
   `docs/migration-status.md` (top + latest change log).
3. The implemented site: branch deploy
   https://prototype-mobile-publishing--premiumbells-preview.netlify.app
   (premiumbells-preview.netlify.app still runs an older commit until `main`
   moves). The code is now the truth for what exists; the boards are the
   truth for intent.
Confirm what you read, summarise the state in a few lines, then wait for the
page or feature I name.

STATE (2026-11-20)
- v6.2 was locked on 2026-11-17 and exported to `docs/design/clarity-v6/`.
  Claude Code implemented V0–V7 (homepage, all service pages, Works with one
  filter bar + bell type + map view, Project panel over any page, Lightbox with
  zoom and Iconostase tabs, blog, article, 404, motion/a11y pass, Lighthouse).
- Content written with approval: hero slice photos, bell types on 27 works
  (12 still unmarked), showroom.
- Known open items: the homepage Cataloage section is switched off (Netlify
  credits; the Sanity webhook still targets the old preview address and the
  branch deploy has no `SANITY_REVALIDATE_SECRET`); mobile LCP ≈ 4 s (mostly
  TTFB); the client questions in `docs/design/clarity-v6/open-questions.md`
  (price list, currency, VAT and date; showroom 108 vs 110; response time;
  email; registered office; Director vs Manager; door metal; countries).

HOW TO WORK (same as the v6.2 rounds)
- Do only what I ask; offer suggestions briefly; ask before structural changes.
- Before changing a page, look at it as implemented (screenshot of the branch
  deploy at 1440 and 390 with Playwright) and compare with its board; report
  differences that matter before designing on top.
- Edit the boards in place, desktop and phone together, as v6.3 (no new canvas
  page unless I ask). Re-read a board from the artifact right before changing it.
  Publish with "v6.3 …" labels.
- Fit board heights with `project/handoff/tools/shim.js` + `measure.js`; keep
  ≥ 120 px gaps per canvas column. Check visually with the real photos
  (download assets one at a time with Artifact read, path = 32-hex id; swap
  `/_blob/<id>` → `file://`; screenshot with Playwright).
- After each change: SESSION-NOTES (a v6.3 log + "last publish"), the affected
  handoff boards (H2 / H2b components, H3 pages, H4 content, H5 superseded +
  questions), and mirror it into the repo: update the board file in
  `docs/design/clarity-v6/reference/boards/`, the relevant package docs
  (`components.md`, `pages.md`, `copy/`, `assets.md`, `routes.md`), and add an
  entry to `docs/design/clarity-v6/CHANGES-v6.3.md` (what changed, why, which
  boards, what the code must do, schema impact). Do not change app code,
  Sanity or git; the implementation stays with Claude Code.
- At the end of the pass (or when I ask), write a Claude Code prompt for the
  v6.3 changes into `docs/handoff.md` and a phase "V8 · v6.3 changes" into
  `docs/design-plan.md`.

RULES IN FORCE
- Romanian copy. Prices only in the Policandre model catalogue (one per finish
  + "Prețurile sunt actualizate din data de …"); everywhere else "La comandă".
  No automatic price blocker (v6.3): price wording such as "Prețul depinde…"
  is allowed on any page.
  CTA "Cereți o ofertă".
- No buttons or links in heroes (a photo control is the only exception).
- Fewer pages, fewer clicks; no hub pages; floating layers instead of nested
  pages; a work opens only in the Project panel; the offer inside layers is
  quiet.
- One split story hero for all service pages; one canonical footer; one filter
  bar on Works.
- Real photos only (most originals are in Sanity); placeholders stay visible.
- WCAG AA, 44 px targets, reduced motion, keyboard.
- Client prototype (https://claude.ai/artifact/7rsAVzXidcVTb33ZPyDKuo): do not
  rebuild unless I ask.
