# Sanity frontend integration

This directory will contain code used by the Next.js application to consume
Sanity content, including:

- Environment validation.
- Public and preview clients.
- Typed GROQ queries.
- Generated schema/query types.
- Image URL builder and `next/image` loader.
- Preview and revalidation helpers.

It must not contain secrets or Studio-only bundles. Implementation begins after
the Sanity project ID and dataset are available.

