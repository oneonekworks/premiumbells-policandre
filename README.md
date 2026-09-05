# Premium Bells / Policandre.ro

Modern replacement for the production `rbells-tw` website.

The target stack is Next.js 16 App Router, TypeScript, Tailwind CSS 4, and
Sanity CMS. The existing Google Cloud Storage bucket remains the source archive
during migration. The production Next.js 12 application must remain available
until the replacement passes the cutover checklist.

## Current state

This repository is still the clean `create-next-app` baseline. Architecture and
migration planning are established; Sanity and production UI code have not yet
been installed.

## Start here

- [Architecture](docs/architecture.md)
- [Legacy source inventory](docs/source-inventory.md)
- [Content model](docs/content-model.md)
- [Migration plan](docs/migration-plan.md)
- [Migration status](docs/migration-status.md)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Environment variables will be documented when the Sanity project is created.
Never commit `.env.local`, API tokens, or exported production datasets.
