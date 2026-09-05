# Target Architecture

**Status:** Accepted foundation  
**Last updated:** 2026-09-05

## Objective

Rebuild `policandre.ro` on Next.js 16 without losing the current site's visual
identity or low-click gallery experience. Editors must be able to create and
update projects, services, catalogue entries, articles, and page copy without
editing source files. Original images should be uploaded once and delivered in
responsive, web-appropriate formats automatically.

## Constraints

- `rbells-tw` is the production reference and remains available until cutover.
- Existing public URLs should be preserved wherever practical.
- Existing GCS objects remain the migration source and recovery archive.
- The public site is Romanian-first. Internationalisation is not part of the
  first release, but the model must not prevent adding it later.
- Products are informational catalogue entries. Public pricing is explicitly
  out of scope for the rebuilt site.
- The design should preserve grids, slide-over details, fullscreen galleries,
  lazy loading, and minimal navigation depth.

## System context

```text
Editors
   |
   v
Sanity Studio ------------------------------+
   |                                        |
   +--> Content Lake                        +--> image originals
   |                                        +--> Image CDN transforms
   +--> publish webhook                     |
                |                           |
                v                           v
        Next.js 16 App Router <------- Sanity APIs/CDN
                |
                +--> cached HTML/RSC responses
                +--> responsive images
                +--> project modal routes
                |
                v
             Visitors

GCS bucket `rbells` --> migration source + retained archive
```

## Technology decisions

### Web application

- Next.js 16.3 App Router and React 19.
- Strict TypeScript for all new application, CMS integration, and migration
  code. Legacy JavaScript is read as input, not copied into the new app.
- Tailwind CSS 4 with a small set of named design tokens derived from the old
  site.
- Server Components by default. Client Components are limited to navigation,
  search/filtering, dialogs, lightboxes, carousels, audio, and video controls.
- No general-purpose client state library unless a demonstrated cross-route
  requirement appears.

Before implementing framework features, consult the versioned documentation in
`node_modules/next/dist/docs`, as required by `AGENTS.md`.

### Content management

- Sanity is the primary source of truth for editable content.
- Start on the Sanity Free plan with one public `production` dataset.
- Use a separately deployed Sanity Studio from this repository's `studio/`
  directory. The public application should not depend on loading Studio code.
- Keep frontend Sanity integration, generated types, query helpers, image URL
  helpers, and webhook verification under `sanity/`.
- Preview unpublished content through authenticated Draft Mode.
- A signed Sanity webhook triggers targeted cache revalidation after publish.

### Media

- New images are uploaded to Sanity as originals.
- Sanity's Image CDN performs resize, crop, quality, and output-format work.
- `next/image` remains the rendering primitive for layout stability, responsive
  source selection, and lazy loading. Its loader should produce Sanity CDN URLs
  so images are not transformed twice by two providers.
- Focal point, crop, alternative text, caption, and credit are editorial data.
- GCS URLs are allowed only during the migration bridge. Newly authored content
  must not introduce new GCS dependencies.
- Existing YouTube embeds remain supported. Direct MP4 files need a poster and
  web-ready encoding. A dedicated streaming provider is deferred until actual
  video volume or playback requirements justify it.
- Audio remains a first-class media type. Large audio/video binaries are not
  assumed to use the image pipeline.

### Data delivery and caching

- Server Components query Sanity; visitors do not fetch core page content from
  the browser after hydration.
- Published content is cached and revalidated by content-specific tags or paths.
- The publish webhook must be authenticated and map changed document types to
  the smallest valid cache scope.
- Draft Mode bypasses public cached content for authorised preview sessions.
- Queries used by a page and its metadata should be shared or memoised to avoid
  duplicate reads.

### Hosting

- Vercel is the preferred deployment platform because it provides the simplest
  operational path for this Next.js application.
- Hosting remains replaceable: Sanity access must not use Vercel-only data APIs.
- The Vercel Hobby plan is technically compatible but is currently limited by
  Vercel to non-commercial use. Hosting-plan compliance is an operational
  decision and does not alter the application architecture.

## Application boundaries

Proposed top-level organisation:

```text
app/                    routes, layouts, loading and error boundaries
components/             reusable presentation and interaction components
sanity/                 frontend client, queries, types and image helpers
studio/                 separately deployable Sanity Studio
scripts/                inventory, import and verification utilities
docs/                   architecture and migration source of truth
public/                 small immutable local assets only
```

The large legacy `public/` tree must not be copied wholesale. Logos, icons, and
small brand assets may remain local; editorial photography belongs in Sanity.

## Route architecture

Target canonical routes:

```text
/
/servicii
/servicii/[service]
/lucrarile-noastre
/lucrarile-noastre/[category]
/lucrarile-noastre/[category]/[project]
/blog
/blog/[post]
```

The initial project-details implementation should use a parallel `@modal` slot
and an intercepted project route:

```text
app/(site)/lucrarile-noastre/[category]/layout.tsx
app/(site)/lucrarile-noastre/[category]/page.tsx
app/(site)/lucrarile-noastre/[category]/[project]/page.tsx
app/(site)/lucrarile-noastre/[category]/@modal/default.tsx
app/(site)/lucrarile-noastre/[category]/@modal/(.)[project]/page.tsx
app/(site)/lucrarile-noastre/[category]/@modal/[...catchAll]/page.tsx
```

Expected behaviour:

- A client-side click from a category grid opens a slide-over/modal while
  retaining the grid context.
- The browser URL becomes the canonical project URL.
- Back closes the modal and Forward reopens it.
- A hard navigation or refresh renders a complete project page.
- The same project content component is reused by both presentations.
- Every parallel slot has an explicit default fallback.

The fullscreen media lightbox is an interaction nested inside project details;
it should not duplicate the project route or data query.

## Rendering and component policy

| Concern | Default |
| --- | --- |
| Page content | Server Component |
| Sanity query | Server-only helper |
| Category filtering | URL state plus small Client Component |
| Slide-over/lightbox | Accessible Client Component |
| Metadata | `metadata` or `generateMetadata` |
| Images | `next/image` backed by Sanity Image CDN |
| Rich text | Portable Text renderer with an allow-listed component map |
| Errors | Route-level `error.tsx` and logged diagnostics |
| Loading | Route-level `loading.tsx` or focused Suspense boundaries |

Raw CMS HTML must not be rendered with `dangerouslySetInnerHTML`. The legacy
HTML fragments are migrated into structured Portable Text or explicitly
allow-listed inline marks.

## SEO and URL compatibility

- Preserve current category, service, and article URLs where they are valid.
- Give every project a canonical, shareable route even though the old UI opened
  projects only as overlays.
- Generate title, description, canonical URL, Open Graph image, and social
  metadata from typed content.
- Generate `sitemap.ts` and `robots.ts` from published content.
- Use permanent redirects for corrected or consolidated legacy URLs.
- Record old-to-new mappings before changing production DNS.

## Security and operations

- Never commit Sanity tokens, GCP credentials, exports, or `.env.local`.
- Public rendering uses read-only access. Mutating tokens are limited to import
  scripts and server-side administrative operations.
- Webhook requests require signature validation.
- Configure Sanity, GCP, and hosting billing/quota alerts.
- Export Sanity content and retain a GCS manifest before launch.
- Migration tooling must be idempotent, resumable, dry-run capable, and must
  never modify or delete the source GCS objects.

## Testing strategy

- Type checking and linting are required for every implementation phase.
- Unit tests cover legacy-to-Sanity mapping and URL normalisation.
- Integration tests cover queries, published/draft filtering, and webhook
  revalidation.
- Browser tests cover modal routing, refresh, Back/Forward, search, gallery
  keyboard navigation, responsive layouts, and critical links.
- A content verification report compares legacy record/media counts with the
  imported result.

## Deferred decisions

- Final lightbox package versus a small accessible custom implementation.
- Dedicated streaming provider for owned videos.
- Future locales and translation workflow.
- Alternative commercial provider if Vercel plan constraints are undesirable.
- Exact analytics and consent tooling.
