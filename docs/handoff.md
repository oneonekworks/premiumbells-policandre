# Session handoff

**Updated:** 2026-10-30 · Start a new session with the kickoff prompt below; it
is cheaper than continuing a long conversation, and these docs carry the state.

## Where we are

- **Website** (`rbells_policandre`, branch `prototype/mobile-publishing`, no
  remote yet): Next.js 16.4.3, Tailwind 4, bilingual shell (Romanian
  unprefixed, English under `/en` via `proxy.ts`), design tokens, header,
  mobile menu, footer. Portfolio: `/lucrarile-noastre` overview, category pages
  with sidebar and grid, project slide-over (intercepted route), full project
  pages, gallery with fullscreen lightbox, YouTube, rich text, specifications,
  canonical/hreflang/Open Graph metadata, generated alt text. Services, blog and
  home content are placeholders. Runs locally only; the whole site is noindex.
- **Studio** (`../studio-premiumbells`, branch `main`, no remote yet): Sanity
  6.20 deployed at <https://premiumbells.sanity.studio>. Romanian/English locale
  fields with a "Publicat în" gate, language filter, optimised multi-photo
  upload (≤3200px kept losslessly, larger shrunk, 1.5 MB cap, metadata
  stripped), duplicate photo skipping, optional alt text.
- **Content** (live dataset `1fzbw4s1/production`): categories Clopote and
  Policandre; published projects Lucrare de test, Drobeta, Turnul Severin
  (31 photos, uploaded from a phone), and the imported Schitul Duca
  (replaces the hand-made one), Parohia Ziua Crucii, Iași, and Parohia Roșu
  Chiajna, Sfințire (89 photos) — IDs `legacy-clopote-*`.
- **Importer** (2026-10-30): `npm run migrate:assets` / `migrate:content`,
  dry run by default; see `scripts/README.md`. All legacy media will move to
  Sanity (decided 2026-10-30); GCS stays the archive.
- **Checks:** website lint, typecheck, build, 12 unit tests, 19 migration tests,
  15 browser tests; Studio typecheck, lint, build, 8 unit tests.

## Gotchas for the next session

- Read the installed Next docs in `node_modules/next/dist/docs/` before
  framework work (`AGENTS.md`).
- `npm run dev` uses Webpack: Turbopack dev reload-loops on dynamic routes.
  Production builds use Turbopack and are fine.
- `proxy.ts` rewrites to `app/[lang]` and marks requests with a header because
  prerendered routes re-run the proxy; it also maps `Next-Url` for route
  interception. Intercepted `[project]` params can arrive as `(.)(.)slug`;
  `stripInterceptionMarkers()` handles it. Re-check on Next upgrades.
- GROQ reads locale fields with `select($lang == "en" => x.en, x.ro)` helpers
  so TypeGen infers strings; interpolated queries need explicit
  `client.fetch<*_RESULT>()`. Regenerate types with `npm run sanity:typegen`.
- Browser tests: run against a production build on another port (see the
  scratch config pattern used in the change log) so a running dev server is
  not reused.
- The dataset is live and public. Export it (`npx sanity dataset export
  production .migration/backups/<name>.tar.gz --no-assets`) before any
  migration; migrations dry-run by default. Never put tokens in chat or code.
- Studio changes need `npx sanity deploy -y` from `../studio-premiumbells`.
- Commit on the current branches; do not push or deploy the website without
  the user's go-ahead.
- Import IDs must not contain dots (dotted IDs are private). Imports write
  drafts and skip already-published projects; re-runs reuse
  `.migration/checkpoints/assets.json`. The write token lives only in
  `.env.local` as `SANITY_API_WRITE_TOKEN`; it can be revoked between batches.

## Recommended next steps (in order)

1. **Phone acceptance record** (user, ~30 min): fill in the table in
   [mobile-publishing-prototype.md](mobile-publishing-prototype.md) — device,
   HEIC, 10–20 photos, interrupted upload, duplicates, reorder, publish and
   unpublish. Closes Phase 1.
2. **Small Studio fix — technical details entry** (done 2026-10-25: deployed, seeded,
   Drobeta fixed): the
   Drobeta specification was entered as one row (Denumire "1000 kg", Valoare
   "III nivele, 238 lumini", Unitate "470 x 470cm"). Make one fact per row
   obvious: clearer descriptions and placeholders, a suggested list of labels
   (Greutate, Înălțime, Diametru, Nivele, Lumânări/Lumini), and a preview that
   reads "Greutate: 1000 kg". Fix the Drobeta row with the user.
3. **Importer for the Clopote slice** (done 2026-10-30: three projects
   imported and published; 89-photo gallery measured, see the change log).
   Before importing the rest of Clopote: decide category ordering (for
   example by year) and stop generated alt text repeating the locality.
   Original brief — Phase 4 pulled forward:
   `scripts/migrate-content.ts` and `scripts/migrate-assets.ts` with dry-run,
   deterministic IDs, checkpoints, reports, the same image rules as the Studio
   (shrink >3200px, strip metadata; e.g. `sharp`), fingerprints in
   `source.id`, `publishedLanguages: ['ro']`, `legacy` provenance, no prices.
   Start with Schitul Duca, Parohia Ziua Crucii (videos), and Parohia Roșu
   Chiajna (89 photos). Needs: a write token created by the user in
   sanity.io/manage and stored only in `.env.local`; confirmation of a GCS
   backup; a decision on the existing hand-made Schitul Duca document. Then
   measure large-gallery performance (Phase 3 exit).
4. **Data delivery** (Opus, Medium–High) — Phase 2: replace `no-store` reads
   with tag-based caching, a signed Sanity publish webhook for revalidation,
   and later Draft Mode preview. Needed before any hosting.
5. **Hosting and preview** (user decision + Opus, Medium): choose hosting
   within the ~USD 20/month budget; create a *separate* Vercel (or other)
   project — never the live policandre.ro project; connect Git remotes.
6. **Search/filter in category grids** (Sonnet or Opus, Medium): URL-based
   query, Romanian diacritic-insensitive.
7. **SEO baseline** (user): Search Console/Analytics exports to draft the
   old→new URL and redirect map; resolve duplicate slugs
   `clopote-sihastria-rascai`, `manastirea-faget` and the missing cover
   `/img/works-cover/4.jpg`.
8. **Parked:** Studio tab/Publish styling — see [backlog](backlog.md).

## Kickoff prompt

Paste into a new session (working directory `rbells_policandre`, with
`studio-premiumbells` added), replacing the last line with the chosen step:

> We're continuing the Premium Bells / policandre.ro rebuild. Two sibling repos:
> this Next.js 16 site (`rbells_policandre`, branch `prototype/mobile-publishing`)
> and the Sanity Studio `../studio-premiumbells` (deployed at
> premiumbells.sanity.studio). The legacy site `../rbells-tw` is read-only.
> Before doing anything, read `AGENTS.md`, `docs/handoff.md` (state, gotchas,
> next steps), `docs/rebuild-brief.md`, `docs/architecture.md`,
> `docs/content-model.md`, `docs/migration-status.md` (latest change log), and
> `../studio-premiumbells/README.md`. The production Sanity dataset is live:
> export it before any migration, dry-run first, never handle tokens in chat.
> Commit on the current branches when a step is done and verified; do not push
> or deploy the website without asking. Romanian is the primary language for
> editor labels and site copy.
>
> Today's task: **[step number and name from docs/handoff.md]**. Propose your
> plan and anything you need from me before changing code.
