# Migration Status

**Overall status:** Foundation in progress  
**Current phase:** Phase 0 — Foundation and source audit  
**Last updated:** 2026-09-05

## Accepted decisions

- Frontend: Next.js 16.3 App Router, React 19, strict TypeScript.
- Styling: Tailwind CSS 4 while preserving the current visual language.
- CMS: Sanity, starting on the Free plan.
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

## Next actions

1. Review and approve the foundation documents.
2. Initialise Git or connect `rbells_policandre` to its intended repository.
3. Generate an authoritative legacy media manifest.
4. Confirm/perform a recoverable GCS backup.
5. Create the Sanity project and provide its project ID and dataset name through
   local environment configuration.
6. Scaffold schemas and the `Clopote` vertical slice.

## User input required before Phase 1

- Sanity project ownership/account creation.
- Confirmation that the initial dataset should be named `production` and public.
- Confirmation of who needs editing access initially.
- Whether a Git remote already exists for `rbells_policandre`.

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

- `rbells-tw` is a Git repository on branch `main` and was clean at this audit.
- `rbells_policandre` was not detected as a Git repository at this audit.
- No Sanity packages or configuration have been installed yet.
- No production application code has been replaced in the new repository.
- The default Turbopack build was blocked in the execution environment while
  trying to bind a helper process to a port. `next build --webpack` completed,
  including compilation, TypeScript, static generation, and build traces.

## Change log

### 2026-09-05

- Created the migration foundation and initial audit documentation.
- Selected the initial `Clopote` vertical slice and representative records.
