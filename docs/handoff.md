# Session handoff

**Updated:** 2026-11-04 · Start a new session with the kickoff prompt below; it
is cheaper than continuing a long conversation, and these docs carry the state.

## Where we are

- **Website** (`rbells_policandre`, branch `prototype/mobile-publishing`,
  remote `oneonekworks/premiumbells-policandre`, private): Next.js 16.4.3, Tailwind 4, bilingual shell (Romanian
  unprefixed, English under `/en` via `proxy.ts`), design tokens, header,
  mobile menu, footer. Portfolio: `/lucrarile-noastre` overview, category pages
  with sidebar and grid, project slide-over (intercepted route), full project
  pages, gallery with fullscreen lightbox, YouTube, rich text, specifications,
  canonical/hreflang/Open Graph metadata, generated alt text, URL-based search
  and year/county filters on category grids. Services, blog and
  home content are placeholders. The whole site is noindex.
- **Hosting** (2026-11-02): Netlify Free, project `premiumbells-preview`,
  <https://premiumbells-preview.netlify.app>, public visibility (the team-login
  wall also blocks the webhook), deploys on push to `prototype/mobile-publishing`;
  branch deploys and deploy previews off to save the 300 monthly credits.
  Env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
  `NEXT_PUBLIC_SITE_URL=https://www.policandre.ro`, `NODE_VERSION=22`,
  `SANITY_REVALIDATE_SECRET` (Production context, Functions scope). No custom
  domain; policandre.ro stays on the old site until cutover.
- **Studio** (`../studio-premiumbells`, branch `main`, remote
  `oneonekworks/studio-prembells`, private): Sanity
  6.20 deployed at <https://premiumbells.sanity.studio>. Romanian/English locale
  fields with a "Publicat în" gate, language filter, optimised multi-photo
  upload (≤3200px kept losslessly, larger shrunk, 1.5 MB cap, metadata
  stripped), duplicate photo skipping, optional alt text.
- **Content** (live dataset `1fzbw4s1/production`): categories Policandre,
  Recondiționări, Clopote, Uși, Automatizări (2026-11-02); 60 published
  projects: Policandre 11, Recondiționări 7, Clopote 39, Uși 1, Automatizări
  2 (Phase 5 published 2026-11-02; the hand-made Drobeta document was
  replaced by `legacy-policandre-drobeta-turnu-severin`). Earlier: the imported Schitul Duca
  (replaces the hand-made one), Parohia Ziua Crucii, Iași, and Parohia Roșu
  Chiajna, Sfințire (89 photos) — IDs `legacy-clopote-*`. All 39 legacy
  Clopote works are imported and published (2026-10-30; 40 Clopote projects
  with Lucrare de test).
- **Importer** (2026-10-30): `npm run migrate:assets` / `migrate:content`,
  dry run by default; see `scripts/README.md`. All legacy media will move to
  Sanity (decided 2026-10-30); GCS stays the archive.
- **Data delivery** (2026-10-31): published reads are tag-cached (hourly backup
  refresh) and `POST /api/revalidate` revalidates tags from a signed Sanity
  webhook. Live since 2026-11-02: the Sanity webhook `Revalidare site` posts
  to the Netlify preview and a publish shows there within seconds. Settings are in `docs/architecture.md`; the secret is
  `SANITY_REVALIDATE_SECRET` in `.env.local`.
- **Tests:** keep unit tests to the essentials (user, 2026-11-03); design
  matters more.
- **Checks:** website lint, typecheck, build, 39 unit tests, 30 migration tests,
  browser 45 passed and 1 skipped with the Phase 6 test documents written (without them, 16 service tests skip); Studio typecheck, lint, build, 19 unit tests.

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
- Reads are cached now: on `npm run dev` use a hard refresh to see a publish;
  a production build needs the webhook or `npm run revalidate:test`. The data
  cache (`.next/cache/fetch-cache`) survives rebuilds, so a local build can
  keep an empty result cached before content existed; revalidate the tag or
  delete that folder before building.
- Browser tests: run against a production build on another port (see the
  scratch config pattern used in the change log) so a running dev server is
  not reused. Playwright must resolve `@playwright/test` from the repo, so put
  the scratch config in the ignored `test-results/`, not outside the repo.
- Grid search/filters live in `lib/portfolio-filters.ts` over one cached list
  of all cards; if a category grows past a few hundred works, move the filter
  into GROQ.
- The dataset is live and public. Export it (`npx sanity dataset export
  production .migration/backups/<name>.tar.gz --no-assets`) before any
  migration; migrations dry-run by default. Never put tokens in chat or code.
- Studio changes need `npx sanity deploy -y` from `../studio-premiumbells`.
- Commit on the current branches; do not push without the user's go-ahead:
  a push to `prototype/mobile-publishing` deploys to Netlify and uses credits.
- The website build type-checks only the app; `scripts/` (which imports from
  the sibling Studio) is checked by `tsconfig.scripts.json` in
  `npm run typecheck`. Do not import the Studio from app code.
- Netlify applies env var changes only to new deploys, and server secrets need
  the Functions scope.
- Import IDs must not contain dots (dotted IDs are private). Imports write
  drafts and skip already-published projects; re-runs reuse
  `.migration/checkpoints/assets.json`. The write token lives only in
  `.env.local` as `SANITY_API_WRITE_TOKEN`; it can be revoked between batches.

## Recommended next steps (in order)

1. **Phone acceptance record** (closed 2026-10-30): accepted by the user; see
   [mobile-publishing-prototype.md](mobile-publishing-prototype.md). The
   200-image editor check moves to Phase 5 (Rohia, 201 photos).
2. **Small Studio fix — technical details entry** (done 2026-10-25: deployed, seeded,
   Drobeta fixed): the
   Drobeta specification was entered as one row (Denumire "1000 kg", Valoare
   "III nivele, 238 lumini", Unitate "470 x 470cm"). Make one fact per row
   obvious: clearer descriptions and placeholders, a suggested list of labels
   (Greutate, Înălțime, Diametru, Nivele, Lumânări/Lumini), and a preview that
   reads "Greutate: 1000 kg". Fix the Drobeta row with the user.
3. **Importer for the Clopote slice** (done 2026-10-30: three projects
   imported and published; 89-photo gallery measured, see the change log).
   Category ordering decided (order number, featured, year newest first).
   Rest of Clopote imported and published 2026-10-30 (see the change log).
   Guessed localities confirmed by the user on 2026-10-31. Skip `worksAutomatizari:clopote-sihastria-rascai`
   when Automatizări is imported (same work, imported under Clopote).
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
4. **Data delivery** (done 2026-10-31 except going live): tag-cached reads and
   a signed revalidation route, verified locally against a production build
   with `npm run revalidate:test`. Draft Mode preview is designed (see
   architecture) but not built.
5. **Hosting and preview** (done 2026-11-02): Netlify Free preview, Git
   remotes, 15 browser tests pass against the hosted site, and the Sanity
   webhook revalidates it on publish. Before launch: review Netlify credit use
   (Personal, ~USD 9, avoids the free-plan pause) and point the webhook at the
   production URL.
6. **Search/filter in category grids** (done 2026-11-02, not pushed yet):
   `?cauta=&an=&judet=` next to `?pagina=`, diacritic-insensitive search over
   title and place, year and county filters, one cached read per category
   filtered on the server (see architecture). Data for the user: Zosin has no
   county; "Lucrare de test" is still published in Clopote.
7. **SEO baseline** (revised 2026-11-02): policandre.ro has no analytics
   history (the legacy gtag code exists but was never configured), so there is
   no Analytics export. Instead:
   - **Done 2026-11-02:** the user verified the Search Console Domain
     property (data still processing); the URL map is drafted in
     [url-map.md](url-map.md) (keep every live path; 6 redirects; duplicate
     slug and missing cover resolved; all proposals accepted by the user). Open:
     the Search Console exports once the data is processed.
   - **User:** verify a Search Console **Domain** property for `policandre.ro`
     with a DNS TXT record. Search data is collected regardless of sign-up,
     so a new property should show past data (expected up to ~16 months, not
     yet confirmed for this domain) after a day or two. Export Performance →
     Pages and Indexing → Pages into `.migration/` (git-ignored), not chat.
   - **Agent:** draft the old→new URL and redirect map from the legacy routes
     (`docs/source-inventory.md`) without waiting; Search Console data, when
     available, ranks which URLs to verify first.
   - Analytics for the rebuilt site is a launch decision (architecture,
     deferred decisions): recommended a cookieless tool (e.g. Cloudflare Web
     Analytics or Umami; no cookie banner, fits the budget) unless Google Ads
     are planned, in which case GA4 with a consent banner and Consent Mode.
     Check current prices first; install at the policandre.ro cutover.
8. **Phase 5 import of the other categories** (done and published
   2026-11-02; Phase 5 closed by the user 2026-11-03; plan approved by the
   user): Policandre 11, Uși 1, Automatizări 2 (Sihăstria
   Rascăi skipped), Recondiționări 7; Orologii and Sonorizări not imported
   (no photos). Done: dataset export
   (`production-2026-11-02-before-phase5.tar.gz`), importer keys repeated
   pages by occurrence, `title`/`skip` overrides, Spain (`ES`) in the Studio
   (deployed) and website, overrides for all 21 records, full dry runs.
   The hand-made "Drobeta, Turnul Severin" is replaced by the legacy record
   (user decision 2026-11-02). Written: 875 photos uploaded (29 reused, 0
   failed); categories Recondiționări, Uși, Automatizări created with menu
   order Policandre 10, Recondiționări 20, Clopote 30, Uși 40, Automatizări
   50; 21 drafts; Studio validation clean apart from the decimal-comma
   warning on Uși. Published at the user's request after a fresh export;
   grids and filters checked; Rohia and Uși measured (LCP ≤ 0.8 s on a
   throttled phone, CLS 0; see the change log). Open for the user: Dej III and Făget
   have identical technical details (Dej III's legacy brief says two
   chandeliers of 4 and 2 levels).
9. **Phase 6 — services and catalogue** (plan accepted 2026-11-03;
   steps 2–6 done 2026-11-03: price detector, Studio schema (deployed),
   data layer, routes and components, importer with clean dry runs): follow the steps and decisions in
   [phase6-services-plan.md](phase6-services-plan.md). Waiting on the user:
   the phone check of a test service and item, the
   webhook filter/projection change (architecture, "Publish webhook"); the
   user's review of the seed texts in `scripts/config/legacy-services.json`;
   the user's answers on the photos flagged in step 7 (done 2026-11-04: asset
   dry runs clean, no price images, flags in the migration-status change
   log); then step 8 (export, `migrate:assets --write`, drafts) with the
   user's go-ahead. Service browser tests need the test documents
   (`npm run services:test-docs -- --write` after an export, `--delete`
   afterwards); otherwise 16 of them skip. The user changes the
   webhook filter/projection and checks the Studio on the phone.
10. **Parked:** Studio tab/Publish styling — see [backlog](backlog.md).

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
