# Sanity frontend integration

- `env.ts`: public identifiers and validation (`1fzbw4s1` / `production`).
- `client.ts`: server-only, tokenless, published-only reads.
- `queries.ts`: bounded project lists and galleries plus editable page copy.
  Every query takes `$lang`, filters by `publishedLanguages`, and reads locale
  objects through `select()` helpers so TypeGen infers plain strings. Because
  the query strings are interpolated, pass the generated `*_RESULT` type to
  `client.fetch<...>()` explicitly.
- `types.ts`: generated from the standalone sibling Studio; do not edit by hand.
- `pagination.ts`: bounded page input and page sizes.

Run `npm run sanity:typegen` from this app after changing schemas or queries.
The image component in `components/sanity-image.tsx` uses Sanity CDN transforms.
- `fetch.ts`: `sanityFetch()`, the only caller of the client; tags every read
  and refreshes hourly as a backup. Draft Mode will branch here.
- `cache-tags.ts`: tag names and the webhook document → tags mapping.
- `revalidate.ts`: signed webhook handling for `app/api/revalidate`.

Published reads are cached by tag and cleared by the signed Sanity publish
webhook; see "Data delivery and caching" in `docs/architecture.md`. On
`npm run dev`, hard-refresh to bypass the cache. Draft preview is a later
milestone.

See [the prototype runbook](../docs/mobile-publishing-prototype.md).
