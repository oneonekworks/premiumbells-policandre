# Session handoff

**Updated:** 2026-11-23 · V8.2 Works wall + fixed shelf done, then no “Toate” (Works opens on Policandre, CHANGES-v6.3 §6) (local commits `e5c0c8a`, `8cc24e0`); next: the user marks weak grid covers in `.migration/works-grid-covers.html` (see design-plan V8.2 “Open”). Earlier: 2026-11-20 · v6.3 pass started: see “v6.3 changes: kickoff prompt” below. Earlier: The design is locked as **v6 "Clarity" (v6.2 release
candidate)**. Implementation continues from `docs/design/clarity-v6/` with the
plan in `docs/design-plan.md`. Start a new Claude Code session with the
kickoff prompt below.

## v6.3 changes: kickoff prompt (2026-11-20)

Design pass v6.3 extends the implemented v6.2 pages. Changes are listed in
`docs/design/clarity-v6/CHANGES-v6.3.md`; the plan is phase **V8** in
`docs/design-plan.md`. First change: **Uși, five copper models with a
doors-at-scale switch** (approved 2026-11-20).

> We are continuing the v6 "Clarity" implementation of policandre.ro with the
> **v6.3** design changes, on branch `prototype/mobile-publishing`.
> Read, in this order: `CLAUDE.md` / `AGENTS.md` (Next 16: read
> `node_modules/next/dist/docs/` before writing code), `docs/handoff.md`,
> `docs/design/clarity-v6/README.md`, `rules.md`,
> `docs/design/clarity-v6/CHANGES-v6.3.md`, then phase **V8** in
> `docs/design-plan.md`.
>
> First do **V8.0 · Remove the price blocker** (CHANGES-v6.3 §2): price
> wording such as “Prețul depinde…” must no longer be blocked anywhere. Remove
> the blocking price checks (importer / seeds price block,
> `scripts/verify-no-prices.ts` as a gate, the no-price assertions in
> `tests/browser/*.spec.ts`), delete `scripts/lib/price-text.ts` and its test
> if nothing else needs it, and restore the board copy cut for the guard in
> `lib/service-copy.ts` (Uși price sentence, the TVA item, “estimarea
> prețului”). The Studio validation lives in `../studio-premiumbells/lib/priceText.ts`:
> show me the change there; **deploying the Studio needs my OK.** One local
> commit.
>
> Then implement **V8.1 · Uși: five copper models, doors at scale**. The exact
> design is `docs/design/clarity-v6/reference/boards/V6ServiceUsi.dc.html` and
> `V6ServiceUsiMobile.dc.html` (the `USI_MODELS` list in their script holds
> the five models; `/_blob/<id>` images are web copies, see `assets.md`
> § v6.3); specs in `components.md` (“Doors at scale · Uși”, “Model block ·
> Uși (v6.3)”), `pages.md` (Uși), copy in `copy/usi.md`. Today the page is
> `components/services/pages/usi.tsx` + `usiCopy` in `lib/service-copy.ts`
> and shows the one `sectionModels` model whose title matches /cupru/.
>
> Steps, stopping where marked:
> 1. Read `../studio-premiumbells` schema and the live Uși document
>    (read-only). Propose how the five models map onto the existing
>    `sectionModels.models[]` fields (height, door front, place, deep-link key,
>    default model), preferring no schema change. **Stop and show me.**
> 2. After my OK: raw dataset export, then add / update the five models with
>    originals from `/Users/amanoila/Dev/premiumbells/2026+ assets/UȘI CUPRU/`
>    (one subfolder per model). Show me the gallery picks per model before
>    writing (Drobeta has 164 photos, incl. fitting and visit). Move
>    “Montate la Catedrala din Drobeta-Turnu Severin” from 4400 to 4000; 4400
>    has no place. **Each write and publish needs my OK.**
> 3. Build the page: scale row as a small client component (buttons with
>    `aria-pressed`, one px-per-metre: 80 desktop / 44 phone, floor line, the
>    1,8 m person, phone scroll-snap with the chosen door centred), the Model
>    block bound to the choice (`aria-live="polite"`, Lightbox on that model's
>    full set), default 4,4 m, optional `?model=` with `replaceState` and
>    server render of the requested model. Hero Pe scurt: “Pe măsură · de la
>    2,9 la 5,2 m, după ușa bisericii”. Show the board's price sentence
>    (“Prețul depinde de complexitatea lucrării, de înălțime și lățime. Se
>    lucrează doar după proiect, cu icoane individuale.”).
> 4. Compare with the boards at 1440 and 390 on a production build; keyboard,
>    reduced motion, Lighthouse a11y. One local commit; update
>    `docs/design-plan.md` (V8.1 notes), `docs/migration-status.md` and this
>    file. **No git push without my OK.**
>
> Rules as before: no Sanity write, publish, Studio deploy or push without my
> explicit OK; secrets stay in `.env.local`; price figures only in the
> Policandre catalogue, but no automatic price blocker (price wording is
> allowed); desktop and phone together; minimal unit tests.

---

## Where we are (2026-11-17)

- **Code:** branch `prototype/mobile-publishing`; V1 committed locally (last `0912aed` plus the docs commit). Built
  on the Patina tokens + v5.10 homepage (design-plan phases A–C, 2026-11-08).
  Service pages, Works, blog and 404 still use the older v4-era layout.
- **Design:** v6.2 on the canvas https://claude.ai/artifact/43jzYBJXgk8j9jK9uRcZKF
  (page "v6 · Clarity"), exported to `docs/design/clarity-v6/` (rules, routes,
  tokens, components, pages, content model, copy, assets, board sources).
  `docs/design-handoff/` (v5.10) is history.
- **Big changes against the code:** prices shown in the Policandre catalogue
  (price check must allow them there only); no `/servicii` hub and no Clopote
  chooser (`/servicii/clopote` = cu jug); no project page (a work opens only in
  the Project panel; direct visit = Works + panel); Works has one filter bar
  with bell type, a light map view, no sidebar and no year/county filters;
  Iconostase is one page with a Lightbox that has material tabs and zoom (Bronz
  removed); Uși has one copper model; homepage hero shows Recondiționări and a
  map story; translucent teal Lightbox with zoom everywhere; compact footer.
- **Schema:** `docs/design-schema-proposal-v6.md` is reconciled with
  `../studio-premiumbells` (§2b) and approved on 2026-11-17; each
  Studio deploy, write and publish still needs its own OK.
- **V0 done 2026-11-17:** the per-page gap list is in `docs/design-plan.md`
  under V0, approved with its four decisions (craft chips on Works,
  map places abroad, service short names, the price check).
- **V1 done 2026-11-17** (local commits `638886c` → `0912aed`, not pushed):
  Clarity tokens and breakpoints, primitives, header + mega menu + mobile menu
  + bottom bar, footer v6.2, Lightbox v6.2 (zoom, strip, `?foto=`, tabs), story
  hero + quiet offer (shown on `/v6` with `DESIGN_PREVIEW=1`, wired in V4).
  Pages keep their old layouts until V3–V6. Notes in `docs/design-plan.md`
  under V1. **Next: V2** (schema and content; each Studio step needs the
  user's OK).
- **Photos:** almost all originals are in Sanity; `docs/design/clarity-v6/assets.md`
  lists every image on the boards with a description to find its original.
  The user uploads the missing ones.

## Kickoff prompt

> We are implementing the v6 "Clarity" redesign of policandre.ro in this repo.
> Read, in this order: `CLAUDE.md` / `AGENTS.md` (Next 16: read
> `node_modules/next/dist/docs/` before writing code), `docs/handoff.md`,
> `docs/design/clarity-v6/README.md`, `rules.md`, `routes.md`,
> `foundations.md`, then `docs/design-plan.md` (the v6 plan at the top) and
> `docs/design-schema-proposal-v6.md`. The board files in
> `docs/design/clarity-v6/reference/boards/` are the exact design (HTML + CSS +
> small scripts; `/_blob/<id>` images are stand-ins for Sanity originals, see
> `assets.md`); the copy is in `copy/`.
>
> Start with phase **V0** only: compare the package with the current code and
> write a gap list per page (exists / restyle / rebuild / remove) into
> `docs/design-plan.md` under V0; reconcile `docs/design-schema-proposal-v6.md`
> with `../studio-premiumbells/schemaTypes/` (read-only) and mark each row
> exists / rename / new / drop. Then stop and show me both for approval.
>
> Rules for every phase: no Sanity write, publish, Studio deploy or git push
> without my explicit OK, and export the dataset before any write; secrets stay
> in `.env.local` and are never printed; prices only in the Policandre
> catalogue; build desktop and phone together and compare with the boards at
> 1440 and 390 on a production build; keep unit tests minimal; one local commit
> per phase step; update `docs/design-plan.md`, `docs/migration-status.md` and
> this file as you go.

---

# Earlier handoff (2026-11-05, Patina / Phase 7)

**Updated:** 2026-11-05 · Start a new session with the kickoff prompt below; it
is cheaper than continuing a long conversation, and these docs carry the state.

## Where we are

- **Website** (`rbells_policandre`, branch `prototype/mobile-publishing`,
  remote `oneonekworks/premiumbells-policandre`, private): Next.js 16.4.3, Tailwind 4, bilingual shell (Romanian
  unprefixed, English under `/en` via `proxy.ts`), design tokens, header,
  mobile menu, footer. Portfolio: `/lucrarile-noastre` overview, category pages
  with sidebar and grid, project slide-over (intercepted route), full project
  pages, gallery with fullscreen lightbox, YouTube, rich text, specifications,
  canonical/hreflang/Open Graph metadata, generated alt text, URL-based search
  and year/county filters on category grids. Services (Phase 6),
  the homepage, blog and global content (Phase 7) come from Sanity; `/en`
  keeps a placeholder home page and has no blog until English content
  exists. The whole site is noindex.
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
- **Checks (2026-11-05):** website lint, typecheck, build, 43 unit tests, 34
  migration tests; browser 54 passed, 22 skipped (service and article-block
  tests need the test documents: `npm run services:test-docs` /
  `home:test-docs -- --write` after an export, `--delete` afterwards); Studio
  typecheck, lint, build, 19 unit tests.

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
   step 7 (done 2026-11-04: asset
   dry runs clean, no price images, bronze cover fixed, other flags kept; see the migration-status change
   log); step 8 done 2026-11-04 (17 service and 52 catalogue drafts, no
   price errors, counts match); step 9 published them 2026-11-04 and removed
   a Phase 5 price from the Făget and Drobeta project texts (see the change
   log); webhook updated by the user; step 10 (close-out) done 2026-11-04.
   Pushed and checked on the hosted preview 2026-11-04: price crawl passed,
   the legacy redirects work (proxy fix `0c3b6ea`). Phase 6 is done. Service browser tests need the test documents
   (`npm run services:test-docs -- --write` after an export, `--delete`
   afterwards); otherwise 16 of them skip. The user changes the
   webhook filter/projection and checks the Studio on the phone.
10. **Phase 7 — homepage, blog and global content** (plan accepted
    2026-11-04, [phase7-plan.md](phase7-plan.md); done 2026-11-05): homePage,
    3 posts, author, testimonial and audio published; header, footer and
    contact details from `siteSettings`/`navigation`; reviewed at four
    widths and checked on the hosted preview. Waiting on the user:
    price-free catalogue PDFs (section off until then), the about and
    Clopotar videos on YouTube (then add the links in the Studio), English
    copy. Studio validation is clean apart from three "split the
    specification" hints on older records.
11. **Next: Phase 8** — final SEO, accessibility and production readiness
    (migration plan); includes `robots.txt`, sitemaps and the noindex switch
    at cutover (the user's Lighthouse SEO 66 on the preview comes from these).
12. **Parked:** Studio tab/Publish styling — see [backlog](backlog.md).

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
