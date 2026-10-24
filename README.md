# Premium Bells / Policandre.ro

Modern replacement for the production `rbells-tw` website.

The target stack is Next.js 16 App Router, TypeScript, Tailwind CSS 4, and
Sanity CMS. The existing Google Cloud Storage bucket remains the source archive
during migration. The production Next.js 12 application must remain available
until the replacement passes the cutover checklist.

## Current state

A mobile portfolio publishing prototype now connects to Sanity project
`1fzbw4s1`, dataset `production`. The standalone Studio lives in the sibling
`../studio-premiumbells`; this app contains only its frontend integration.
Actual-phone acceptance and production UI/migration work remain pending.
See the [prototype runbook](docs/mobile-publishing-prototype.md).

## Start here

- [Agreed rebuild brief and decision gates](docs/rebuild-brief.md)
- [Architecture](docs/architecture.md)
- [Legacy source inventory](docs/source-inventory.md)
- [Content model](docs/content-model.md)
- [Migration plan](docs/migration-plan.md)
- [Migration status](docs/migration-status.md)
- [Design foundations and site shell](docs/design-foundations.md)
- [Migration scripts](scripts/README.md)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> (English at `/en`; publishing prototype at
`/prototip/portofoliu`).
Run `npm run dev` in `../studio-premiumbells` for the editor on port 3333.

Public Sanity identifiers default to the approved project/dataset.
See `.env.example` for overrides. Published reads need no private token.
Never commit `.env.local`, API tokens, or exported production datasets.

Generate the authoritative pre-Sanity media baseline with:

```bash
npm run inventory:legacy -- --check-remote
```
