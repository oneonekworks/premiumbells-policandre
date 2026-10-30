# Migration scripts

## Legacy media inventory

`inventory-legacy.ts` is the authoritative, read-only inventory entry point. It
evaluates the legacy data modules in an isolated VM, parses source literals and
stylesheets, inventories every file under `rbells-tw/public`, and produces stable
asset IDs from canonical references. Equivalent relative and absolute GCS URLs
are deduplicated.

Migration decisions are separate from availability facts. The version-controlled
`config/media-exclusions.json` registry contains only assets that have been
explicitly approved for omission. Every manifest asset receives a
`migrationDisposition` of `include` or `exclude`; a failed remote check remains
recorded under `remote` in either case. An unavailable included asset is an
error, while an unavailable explicitly excluded asset is a warning. A new HTTP
404 is never excluded automatically.

Run the local inventory:

```bash
npm run inventory:legacy
```

Add read-only availability checks for all remote assets:

```bash
npm run inventory:legacy -- --check-remote
```

Useful options:

```text
--legacy-root <path>  Override the default sibling ../rbells-tw repository
--output <path>       Override the ignored .migration output directory
--check-remote        Check referenced remote assets with HEAD/partial GET
--concurrency <n>     Bound remote concurrency from 1 to 32
--timeout-ms <n>      Set the timeout for each remote attempt
--strict              Return a failing exit code if issues contain errors
```

The command writes:

- `.migration/legacy-media-manifest.json` — complete machine-readable records,
  provenance, migration dispositions, checksums for local files, usage
  locations, and validation status.
- `.migration/legacy-media-summary.md` — counts, conflicts, issues, and the
  largest local files for review.

The manifest is authoritative for references present in the legacy repository
and files found under its `public/` directory at the recorded Git commit. A GCS
bucket inventory export will still be needed to discover orphaned objects that
are no longer referenced anywhere in source.

The exclusion registry currently records the 77 remote references that returned
HTTP 404 during the audited check and were intentionally excluded on
2026-09-20: 46 Cloudinary assets, 28 GCS assets, and 3 obsolete Tailwind UI
placeholders. Edit this registry only after an explicit migration decision.

Run the focused tests with:

```bash
npm run test:migration
```

## Legacy portfolio import (implemented 2026-10-30)

Two commands import legacy portfolio records into Sanity. Both are dry runs
unless `--write` is passed, select one collection (`--collection`, default
`worksClopote`) and optionally records by legacy page or `_nr`
(`--project a,b`), and write JSON and Markdown reports to
`.migration/reports/`. They need the media manifest from
`npm run inventory:legacy` and, for Sanity access, `SANITY_API_WRITE_TOKEN`
in `.env.local` (Editor role; never printed). Export the dataset first.

```bash
npm run migrate:assets -- --project 2022-schitul_duca
npm run migrate:assets -- --project 2022-schitul_duca --write
npm run migrate:content -- --project 2022-schitul_duca --write
```

- `migrate-assets.ts` reads each cover and gallery photo (legacy `public/` or
  an HTTP GET from GCS, cached in `.migration/cache/`), applies the Studio's
  photo rules (`lib/optimize-image.ts`: shrink above 3200px, strip metadata
  losslessly, 1.5 MB cap), and uploads it with the SHA-1 of the original as
  `source.id` (`source.name` `premiumbells-legacy-import`), the fingerprint
  the Studio's duplicate check uses. A photo already in Sanity with that
  fingerprint is reused. Progress is saved after each photo in
  `.migration/checkpoints/assets.json`, so a stopped run resumes.
- `migrate-content.ts` maps records with `lib/legacy-portfolio.ts` and writes
  them as drafts with deterministic IDs (`legacy-<category>-<legacy page>`),
  oldest first. It blocks a record on a missing cover, an empty gallery,
  unavailable photos, maintenance flags, or a slug used by another document;
  skips a project that is already published; and does not rewrite an
  unchanged draft. Romanian only, `publishedLanguages: ['ro']`, no prices.
- `config/legacy-overrides.json` holds reviewed per-record decisions keyed by
  `<collection>:<page>`: location, slug, split specifications, and existing
  documents the import `replaces` (deleted when it is written).

Mapping rules: slug from the legacy page without the year prefix
(`2022-schitul_duca` → `schitul-duca`); description lines → plain-text
`summary` (legacy HTML tags dropped, `<br>` and headings become new lines);
blank or `-` `information` values dropped, `310kg` → value `310`, unit `kg`, values
holding several facts flagged for an override; YouTube embeds → watch URLs;
`subtitle`, `briefInfo`, and `current` are listed for review, not imported.

## Next migration stages

- `verify-migration.ts` — reconcile source and target counts and required fields
  across a whole collection (the slice was checked with ad hoc queries).

All later migration commands must support a dry run, category/project filters,
machine-readable reports, bounded concurrency, retries, checkpoints, and safe
resume. They must never modify or delete `rbells-tw` files or GCS source objects.

Tokens and credentials are supplied through ignored environment files. Generated
reports and checkpoints stay under the ignored `.migration/` directory.
