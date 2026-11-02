# Migration Plan

**Status:** Active  
**Last updated:** 2026-10-10

See [the rebuild brief](rebuild-brief.md) for agreed scope and approval gates.
The phases below are workstreams: prototype only the minimal content model
first, and pull deterministic import tooling forward as needed for the Clopote
slice. Do not wait for bulk migration to validate the importer.

## Delivery principles

- The Next.js 12 production site remains the rollback target until final
  acceptance.
- Work proceeds in small, demonstrable vertical slices.
- The old repository and GCS bucket are read-only migration inputs.
- Content migration is automated and repeatable; manual work is reserved for
  editorial judgement.
- Useful existing behaviour is preserved within a bespoke refinement. Establish
  compact visual foundations before the first slice, not an exhaustive redesign.
- SEO and Romanian/English content architecture begin in Phase 0; Phase 8 is
  final verification, not the start of SEO work.
- Each phase ends with explicit verification and an updated status document.

## Phase 0 — Foundation and source audit

**Goal:** Establish a durable source of truth before implementation.

- [x] Record target architecture.
- [x] Record initial content model.
- [x] Inventory legacy routes, data collections, media origins, and counts.
- [x] Record pricing-removal requirement.
- [x] Create migration status tracking.
- [x] Initialise version control for `rbells_policandre`.
- [ ] Connect an approved remote when repository publication is requested.
- [x] Generate the authoritative media manifest and explicit exclusions.
- [x] Consolidate the product, design, language, CMS, and budget brief.
- [ ] Obtain Search Console exports and identify valuable legacy URLs (no
  Analytics history exists; confirmed 2026-11-02).
- [x] Decide translation storage and locale URL conventions (2026-10-24).
- [ ] Draft page architecture and old-to-new URL decisions.
- [ ] Approve compact design foundations and representative responsive layouts
  (shell implemented 2026-10-24; see [design foundations](design-foundations.md)).
- [ ] Export/back up the GCS bucket or confirm an existing recoverable backup.
- [ ] Capture baseline production screenshots and performance measurements.

**Exit criteria:** Source inventory and backups are reproducible; the new
repository is versioned; unresolved scope decisions are recorded.

## Phase 1 — Sanity project and Studio foundation

**Goal:** Create the content platform without changing production.

Explicit user authorization is required before account/project setup. Begin
with the small mobile publishing prototype in the brief; confirm usability
before expanding to the full schema set. Foundation planning can proceed while
backup, account, or analytics inputs remain pending.

- [ ] User creates/owns the Sanity organisation and project.
- [ ] Confirm project ID, dataset name, region/options, and editor accounts.
- [x] Configure public project variables for the tokenless published prototype.
- [ ] Configure private preview tokens when authenticated preview is implemented.
- [x] Connect the existing standalone sibling `../studio-premiumbells`.
- [ ] Add schemas and singleton handling from `content-model.md` (portfolio
  schemas with translation storage done 2026-10-24; services, catalogue, blog,
  and global singletons pending).
- [x] Add validation, previews, desk structure, and document ordering for the
  portfolio schemas.
- [ ] Configure CORS for local and preview origins.
- [x] Generate TypeScript types for the minimal prototype schemas/queries.
- [x] Deploy Studio to a Sanity-hosted URL (premiumbells.sanity.studio, 2026-10-24).

**Exit criteria:** An authorised editor can create, preview, validate, and
publish sample categories and projects without touching source code, and the
user accepts actual-phone photo upload, ordering, editing, and large-gallery use.

The minimal prototype is implemented locally; see
[its runbook and phone acceptance record](mobile-publishing-prototype.md).
Full schema expansion and actual-phone acceptance remain open.

## Phase 2 — Next.js/Sanity integration

**Goal:** Establish the production data boundary.

- [ ] Add typed Sanity clients for published and preview data.
- [ ] Add central query definitions and query result types.
- [ ] Add Sanity image URL builder/loader for `next/image`.
- [ ] Add Draft Mode enable/disable routes with secret validation.
- [ ] Add signed publish-webhook route and targeted revalidation.
- [ ] Add environment-variable validation and example documentation.
- [ ] Add basic error logging and missing-content behaviour.

**Exit criteria:** The Next app renders typed published content, previews drafts,
and updates a changed document without a full redeploy.

## Phase 3 — `Clopote` vertical slice

**Goal:** Prove the complete editorial and visitor experience before bulk import.

Representative records:

- `Schitul Duca` — simple project and small gallery.
- `Parohia Ziua Crucii, Iași` — gallery plus multiple YouTube videos.
- `Parohia Roșu Chiajna, Sfințire` — 89-image performance stress case.

Implementation:

- [x] Create site shell, header, work sidebar, and responsive mobile navigation.
- [x] Build `/lucrarile-noastre/clopote` as a Server Component route.
- [x] Build typed project cards and responsive image loading.
- [x] Build `/lucrarile-noastre/clopote/[project]` full page.
- [x] Add parallel/intercepted modal route for soft navigation.
- [x] Add accessible slide-over details and fullscreen lightbox.
- [x] Add URL-based search/filter behaviour (2026-11-02: search, year, county).
- [x] Add project metadata and social sharing image rules.
- [x] Verify keyboard, Back/Forward, refresh, direct URL, and mobile behaviour.
- [ ] Measure initial grid and large-gallery performance.

**Exit criteria:** All three projects are editable in Studio and work correctly
as cards, modal routes, direct pages, and fullscreen galleries.

## Phase 4 — Migration tooling

**Goal:** Convert the repository data and media without manual re-entry.

- [ ] `inventory-legacy`: normalise all active records into an intermediate
  manifest without writing to Sanity.
- [ ] `validate-media`: resolve local/GCS/Cloudinary URLs and record status,
  bytes, MIME type, dimensions, and checksum where available.
- [ ] `migrate-content`: create deterministic Sanity document IDs and references.
- [ ] `migrate-assets`: upload originals, deduplicate by checksum/source, and
  preserve gallery order.
- [ ] Add concurrency limits, retry with backoff, checkpoints, and resume.
- [ ] Add dry-run and category/project filters.
- [ ] Emit machine-readable and human-readable reports.
- [ ] Block affected records on slug collisions or missing required media.
- [ ] Add tests for mapping, URL normalisation, and idempotency.

**Exit criteria:** Re-running an import produces no duplicate documents or
assets, and source-versus-target counts reconcile for the test slice.

## Phase 5 — Portfolio migration

Recommended order:

1. Clopote remainder
2. Policandre
3. Reconditionari policandre
4. Automatizari
5. Usi
6. Orologii and sonorizari after scope decision

- [ ] Resolve duplicate slugs with approved canonical names and redirects.
- [ ] Import all active records and media.
- [ ] Review titles, descriptions, dates, alt text, and cover crops in Studio.
- [ ] Verify category counts and gallery ordering.
- [ ] Test Rohia (201 images) and Drobeta doors (176 images) as maximum galleries.

**Exit criteria:** All approved portfolio categories reconcile with the source
manifest and pass visual/performance review.

## Phase 6 — Services and catalogue

- [ ] Build service overview and dynamic service routes.
- [ ] Convert repeated service layouts to structured reusable sections.
- [ ] Import active services and their galleries.
- [ ] Decide whether maintenance services launch, remain hidden, or are removed.
- [ ] Import informational catalogue items and technical specifications.
- [ ] Verify that no legacy prices appear in documents, queries, rendered HTML,
  metadata, exports, or search indexes.
- [ ] Replace incorrect legacy service links.

**Exit criteria:** Editors can create and update services/catalogue entries, and
the public site contains no price information.

## Phase 7 — Homepage, blog, and global content

- [ ] Rebuild the homepage using named, typed sections.
- [ ] Import global company, navigation, footer, and contact information.
- [ ] Import only reviewed price-free catalogue PDF records.
- [ ] Migrate testimonial and audio content.
- [ ] Migrate blog metadata and hard-coded article bodies to Portable Text.
- [ ] Migrate about video with a valid poster and interactive controls.
- [ ] Add blog listing, article routes, and related-content links.

**Exit criteria:** All primary old-site sections are CMS-managed and visually
reviewed across supported breakpoints.

## Phase 8 — Final SEO, accessibility, and production-readiness verification

- [ ] Complete canonical and redirect table.
- [ ] Verify metadata, Open Graph, sitemap, robots, and structured data built
  throughout the preceding slices.
- [ ] Verify reviewed Romanian/English content, language navigation, canonicals,
  and hreflang; no empty translated pages or indexed staging environments.
- [ ] Approve hosting cost/commercial suitability against the total budget.
- [ ] Test focus management, dialog semantics, labels, contrast, and reduced
  motion.
- [ ] Verify image dimensions, `sizes`, lazy loading, alt text, and error states.
- [ ] Run cross-browser and responsive browser tests.
- [ ] Run production build, lint, type checks, tests, and content verification.
- [ ] Configure monitoring, analytics/consent decision, and quota/billing alerts.
- [ ] Write editor and recovery runbooks.

**Exit criteria:** No critical accessibility, content, media, routing, SEO, or
performance defect remains.

## Phase 9 — Staged deployment and cutover

- [ ] Deploy a production-like preview with the final environment configuration.
- [ ] Freeze legacy content briefly and run the final incremental import.
- [ ] Export Sanity dataset and archive final source manifest.
- [ ] Verify domain, TLS, redirects, metadata, analytics, and contact actions.
- [ ] Point production domain to the new deployment.
- [ ] Run immediate smoke checks and monitor errors/traffic.
- [ ] Retain the old deployment and rollback instructions through the agreed
  observation period.
- [ ] Move GCS from delivery dependency to archive-only policy after acceptance.

**Rollback:** Restore the previous Vercel deployment/domain assignment. No source
objects are deleted during cutover, so content recovery does not depend on the
new application.

## User decision gates

Implementation must pause for approval at these points:

1. Sanity project ownership and dataset configuration.
2. Canonical replacements for duplicate or invalid slugs.
3. Keep/remove decisions for maintenance, orologii, and sonorizari content.
4. Visual acceptance of the `Clopote` vertical slice.
5. Final URL/redirect table.
6. Production cutover.

## Definition of done

The migration is complete only when:

- Normal content updates require no code changes.
- Editors upload originals once and responsive images are automatic.
- All approved legacy content and media reconcile against reports.
- Old URLs resolve or redirect correctly.
- Modal navigation is shareable and browser-history aware.
- No prices are publicly exposed.
- The app passes build, type, lint, browser, accessibility, and content checks.
- Backup, billing, publishing, and rollback procedures are documented.

