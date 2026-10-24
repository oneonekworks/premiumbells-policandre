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

## Next migration stages

- `migrate-content.ts` — create deterministic Sanity documents and references.
- `migrate-assets.ts` — upload and deduplicate media while preserving order.
- `verify-migration.ts` — reconcile source and target counts and required fields.

All later migration commands must support a dry run, category/project filters,
machine-readable reports, bounded concurrency, retries, checkpoints, and safe
resume. They must never modify or delete `rbells-tw` files or GCS source objects.

Tokens and credentials are supplied through ignored environment files. Generated
reports and checkpoints stay under the ignored `.migration/` directory.
