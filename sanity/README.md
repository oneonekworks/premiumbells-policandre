# Sanity frontend integration

- `env.ts`: public identifiers and validation (`1fzbw4s1` / `production`).
- `client.ts`: server-only, tokenless, published-only reads.
- `queries.ts`: bounded project lists and galleries plus editable page copy.
- `types.ts`: generated from the standalone sibling Studio; do not edit by hand.
- `pagination.ts`: bounded page input and page sizes.

Run `npm run sanity:typegen` from this app after changing schemas or queries.
The image component in `components/sanity-image.tsx` uses Sanity CDN transforms.
The prototype explicitly disables fetch caching; refresh after publication.
Production caching, draft preview, and webhook handling are later milestones.

See [the prototype runbook](../docs/mobile-publishing-prototype.md).
