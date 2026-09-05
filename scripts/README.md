# Migration scripts

Planned TypeScript utilities:

- `inventory-legacy.ts` — parse active legacy records into an intermediate
  manifest.
- `validate-media.ts` — inspect local and remote assets and record availability,
  type, size, dimensions, and checksum.
- `migrate-content.ts` — create deterministic Sanity documents and references.
- `migrate-assets.ts` — upload and deduplicate media while preserving order.
- `verify-migration.ts` — reconcile source and target counts and required fields.

All migration commands must support a dry run, category/project filters,
machine-readable reports, bounded concurrency, retries, checkpoints, and safe
resume. They must never modify or delete `rbells-tw` files or GCS source objects.

Tokens and credentials are supplied through ignored environment files. Generated
reports and checkpoints should go under an ignored `.migration/` directory.

