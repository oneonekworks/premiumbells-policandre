# Migration Status

**Overall status:** Local Sanity portfolio prototype implemented; phone acceptance pending
**Current phase:** Phase 1 — Mobile publishing prototype
**Last updated:** 2026-10-10

## Accepted decisions

- Frontend: Next.js 16.3 App Router, React 19, strict TypeScript.
- Styling: Tailwind CSS 4 with a compact bespoke design language refining the
  existing real photography, teal accents, and premium ecclesiastical identity.
- CMS: existing Sanity project `1fzbw4s1`, dataset `production`, authorized for
  the local prototype; actual-phone publishing acceptance remains pending.
- Editors: one administrator initially, optionally two; simple mobile editing.
- Languages: Romanian primary plus reviewed English at launch; Greek later.
- Markets: Romania/Moldova, with English for wider European visitors.
- Budget: approximately USD 20/month total; hosting choice remains unresolved.
- SEO: foundational from URL/content planning onward, without ranking guarantees.
- Images: Sanity originals plus Image CDN transformations.
- Legacy media: GCS retained as a read-only migration source/archive.
- UX: Preserve grids, slide-overs, fullscreen galleries, lazy loading, and low
  navigation depth.
- Project overlays: canonical routes plus App Router parallel/intercepted routes.
- Products: informational catalogue only; do not publish pricing.
- Migration: incremental vertical slice before bulk import.
- Initial slice: Clopote.

## Completed

- [x] Inspected both repository structures.
- [x] Confirmed the new app is Next.js 16.3.3, React 19.2.8, TypeScript, and
  Tailwind CSS 4.
- [x] Confirmed the new app is otherwise still a create-next-app baseline.
- [x] Read the repository-specific Next.js agent instruction.
- [x] Audited primary legacy routes and data sources.
- [x] Counted 64 portfolio projects, 1,860 gallery entries, and 36 portfolio
  videos.
- [x] Identified duplicate slugs and legacy link inconsistencies.
- [x] Recorded multiple media origins and the ineffective GCS query-parameter
  image loader.
- [x] Recorded public-price removal as a migration requirement.
- [x] Created architecture, inventory, content model, plan, and status documents.
- [x] Established placeholder ownership for `sanity/`, `studio/`, and `scripts/`.
- [x] Validated local documentation links and passed ESLint.
- [x] Passed the Next.js production build using its supported Webpack path.
- [x] Initialised the new Git repository on `main`.
- [x] Implemented and tested the deterministic legacy media inventory command.
- [x] Captured the pre-Sanity baseline: 2,534 unique assets, 2,299 remote assets,
  64 projects, 1,860 gallery entries, and 36 portfolio videos.
- [x] Validated remote references: 2,222 available and 77 returning HTTP 404 on
  2026-09-07 (46 Cloudinary, 28 GCS, and 3 retired Tailwind UI placeholders).
- [x] Recorded all 77 unavailable remote references in the explicit,
  version-controlled exclusion registry by user decision on 2026-09-20.
- [x] Added per-asset `include`/`exclude` migration dispositions while retaining
  the factual remote-check result. New unavailable URLs remain blocking unless
  they are explicitly added to the registry.
- [x] Regenerated the remote inventory on 2026-09-20: 77 remote assets remain
  unavailable, all 77 are explicitly excluded, and included unavailable remote
  assets are 0. The remaining 3 errors are the missing local cover and the two
  duplicate-slug conflicts.

## Next actions

1. Obtain baseline Search Console/Analytics exports and draft the page/URL plan
   using [the agreed brief](rebuild-brief.md). Review representative designs.
2. Run the [actual-phone prototype acceptance test](mobile-publishing-prototype.md)
   before expanding schemas or importing legacy content.
3. Resolve the one missing local cover (`/img/works-cover/4.jpg`) and approve
   canonical replacements for the duplicate slugs `clopote-sihastria-rascai`
   and `manastirea-faget` before their affected records are migrated.
4. Confirm/perform a recoverable GCS backup before bulk migration.
5. Connect `rbells_policandre` to its intended Git remote when authorized.
6. After mobile/design acceptance, build the `Clopote` vertical slice.

## Remaining prototype acceptance inputs

- The existing `1fzbw4s1/production` connection was authorized; administrator
  access and anonymous published reads were verified without changing visibility.
- Initial administrator account (one editor is sufficient); actual phone/browser
  for the acceptance test. Do not send passwords or tokens in chat.
- The intended Git remote, when repository publication is wanted.

These items do not block completing the rest of Phase 0.

## Risks and mitigations

| Risk | Current mitigation |
| --- | --- |
| GCS billing or access interruption | Keep production stable; create manifest and backup; migrate delivery to Sanity |
| Missing or malformed legacy URLs | Validate every asset and emit a blocking report |
| Duplicate slugs | Require approved canonical slugs; never resolve silently |
| Very large galleries | Prove lazy loading/performance with 89, 176, and 201-image cases |
| Raw HTML in legacy content | Convert to Portable Text and allow-listed marks |
| Legacy prices leak publicly | Omit price fields and add source/render verification checks |
| Duplicate imports | Deterministic IDs, checksums, dry-run, checkpoints, and idempotent mutations |
| Regression in modal UX | Intercepted routes plus Back/Forward/direct-load browser tests |
| Framework API drift | Use the installed Next.js 16 documentation before implementation |

## Repository observations

- The 2026-10-10 review found an existing modification to legacy
  `data/catalog.json`; it was not written by this migration task and remains
  untouched. The legacy repository is read-only for this work.
- `rbells_policandre` is a Git repository on branch `main`; no remote is set yet.
- Sanity frontend dependencies, typed queries, and temporary noindex prototype
  routes are now installed. Schema ownership is in `../studio-premiumbells`.
- The standalone Studio is not currently a Git repository; no repository was
  initialized and no commit was made in either workspace.
- The default Turbopack build was blocked in the execution environment while
  trying to bind a helper process to a port. `next build --webpack` completed,
  including compilation, TypeScript, static generation, and build traces.

## Change log

### 2026-10-10

- Connected the authorized sibling Studio and frontend to `1fzbw4s1/production`.
- Added minimal Romanian project/category/page-copy schemas, image metadata,
  singleton navigation, and TypeGen for three frontend queries.
- Added published-only prototype routes with paginated responsive galleries,
  query fixtures, browser checks, and a phone acceptance runbook.
- Verified lint/type checks and production builds in both apps; 5 Sanity query
  tests, 6 migration tests, and 4 desktop/mobile browser checks pass. Actual-phone
  and populated live publish/unpublish checks remain pending.
- Recorded dependency-audit findings, including the existing Next.js 16.3.3
  critical advisory, as unresolved release work in the prototype runbook.
- Preserved prior uncommitted changes and left `rbells-tw` untouched. No content
  imports, publications, deployment, or commits were performed.

- Reviewed the repository against the handoff; migration tests passed 6/6.
  This was not a fresh remote-availability audit or full application build.
- Consolidated the user's CMS, mobile publishing, budget, bespoke design,
  Romanian/English launch, future Greek, and search-market requirements.
- Registered catalogue links as reference sources; full PDFs remain unread
  because Drive access failed. Supplied screenshots were reviewed.
- Aligned architecture, model, plan, and inventory documentation; no application
  code, legacy files, accounts, or production systems changed. No commit made.

### 2026-09-20

- Classified exactly the 77 known unavailable remote assets as intentionally
  excluded from migration without changing their HTTP 404 availability facts.
- Added manifest disposition counts so included unavailable remote assets remain
  visible as blocking errors.

### 2026-09-07

- Added the legacy media manifest generator, remote availability validation,
  stable asset identity, local checksums, provenance, and focused tests.
- Recorded 77 remotely unavailable references and one missing local cover for
  resolution during migration triage.

### 2026-09-05

- Created the migration foundation and initial audit documentation.
- Selected the initial `Clopote` vertical slice and representative records.
