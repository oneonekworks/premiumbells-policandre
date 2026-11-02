# Target Architecture

**Status:** Accepted foundation  
**Last updated:** 2026-11-02

Product scope and open approval gates are defined in [the rebuild brief](rebuild-brief.md).

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
- The public site is Romanian-first, with reviewed English content targeted for
  launch. Greek and other languages are future additions; shared media and
  technical facts must not require duplication per language.
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

- Next.js 16.4 App Router and React 19.
- Strict TypeScript for all new application, CMS integration, and migration
  code. Legacy JavaScript is read as input, not copied into the new app.
- Tailwind CSS 4 with compact named design tokens and bespoke layouts refining
  the old identity, not copying its template styling.
- Server Components by default. Client Components are limited to navigation,
  search/filtering, dialogs, lightboxes, carousels, audio, and video controls.
- No general-purpose client state library unless a demonstrated cross-route
  requirement appears.

Before implementing framework features, consult the versioned documentation in
`node_modules/next/dist/docs`, as required by `AGENTS.md`.

### Content management

- Sanity is the primary source of truth for editable content.
- Prefer Sanity Free, subject to the mobile publishing acceptance test. A public
  `production` dataset was initially proposed; the authorized prototype now
  targets the existing public-readable `1fzbw4s1/production` dataset.
- Use the standalone sibling `../studio-premiumbells` as the authoritative
  Studio. This repository's `studio/` is only a documentation pointer.
  The public application must not load Studio code.
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

#### Implemented (2026-10-31)

Every published read goes through `sanityFetch()` (`sanity/fetch.ts`), which
caches it with `next: {tags, revalidate: 3600}`; the hourly refresh is only a
backup for a missed webhook. Loaders in `sanity/portfolio.ts` are wrapped in
React `cache()` so a page and its metadata share one read. Tags
(`sanity/cache-tags.ts`; every read also carries `sanity`):

| Read | Tags |
| --- | --- |
| Works overview copy | `sanity:portfolioPage` |
| Category list with project counts | `sanity:workCategory`, `sanity:project-counts` |
| Category lookup by slug | `sanity:workCategory` |
| Category grid (all cards, filtered on the server) | `sanity:category-projects:<categoryId>` |
| Project page and slide-over | `sanity:project:<slug>` |

Projects are tagged by slug, not ID, so publishing a new project also clears a
cached 404 for its URL. `POST /api/revalidate` (`app/api/revalidate/route.ts`,
logic in `sanity/revalidate.ts`) verifies the `sanity-webhook-signature`
header against `SANITY_REVALIDATE_SECRET` (401 if wrong or missing, 500 if the
secret is unset, 400 for a body without `_type`), waits 3 s for Content Lake
consistency, and calls `revalidateTag(tag, {expire: 0})` so the first visit
after a publish renders fresh content. Mapping:

- `project`: old and new `project:<slug>` and `category-projects:<id>`; plus
  `project-counts` on create, delete, category move, slug added/removed, or
  language change. Missing slug or category → everything.
- `workCategory` → `sanity:workCategory`; `portfolioPage` →
  `sanity:portfolioPage`; any other type → `sanity` (everything).

The revalidation is local to one server process (Next's default file/memory
cache). Hosting with several instances needs a shared cache handler.

#### Category search and filters (2026-11-02)

The grid reads every card of a category once (`CATEGORY_PROJECTS_QUERY`,
capped at 500, same tag) and the page searches, filters and paginates that
list in `lib/portfolio-filters.ts`. Every search, filter and page URL is a
cache hit: no Sanity request per keystroke and no cache entry per query
string, which a GROQ filter would create for each distinct search. Folding
diacritics in our own code (NFD, combining marks removed) is also tested and
predictable, unlike GROQ `match`. One read is small (40 cards, tens of KB) and
stays fine up to a few hundred cards; past that, filter in GROQ instead.

- URL: `?cauta=iasi&an=2021&judet=botosani&pagina=2`, the same names under
  `/en`. A year or county the category does not have is ignored; changing the
  search or a filter returns to page 1; pagination links keep the filters.
  The canonical URL stays the unfiltered category.
- Search: every word must appear in the title, locality, county or country
  name, ignoring case, diacritics (ș/ş, ț/ţ, ă, â, î) and punctuation; the
  description is not searched (it mentions bells everywhere).
- Filters: year, and county with all Republic of Moldova works as one option
  (`moldova`; most have no raion). Options come from the category's own works,
  with counts.
- `ProjectFilters` (client) is a GET form that works without JavaScript. With
  it, typing waits 350 ms; starting a search, picking a filter, Enter and
  "Șterge filtrele" push a history entry, further typing replaces it. The field
  follows the URL on Back/Forward. A pending typing navigation is dropped if a
  project slide-over opened meanwhile. Cards keep the canonical project URL, so
  the slide-over opens over the filtered grid and closing returns to it.
- Each search renders the page on the server (one Netlify function request),
  hence the typing delay.

#### Publish webhook (create in sanity.io/manage once hosting exists)

Sanity needs a public URL, so the webhook goes live with hosting (handoff step
5). Settings: project `1fzbw4s1` → API → Webhooks → Create.

- Name: `Revalidare site`; URL: `https://<host>/api/revalidate`; dataset
  `production`; trigger on Create, Update, Delete; drafts and versions off.
- Filter: `_type in ["project", "workCategory", "portfolioPage"]` (widen it
  when new public types are added; unknown types clear everything).
- Projection:

  ```groq
  {_id, _type, "operation": delta::operation(),
   "before": before(){"slug": slug.current, "category": category._ref, "languages": publishedLanguages},
   "after": after(){"slug": slug.current, "category": category._ref, "languages": publishedLanguages}}
  ```

- HTTP method POST, API version `v2026-10-10`; Secret: the value of
  `SANITY_REVALIDATE_SECRET` from `.env.local` (also set it in the host's
  environment variables). Never paste it in chat.

Check it with `npm run revalidate:test -- --url https://<host> --type
workCategory` (signs a request with the local secret) and Sanity's webhook
attempt log.

#### Draft Mode preview (designed, not built)

Draft Mode will branch inside `sanityFetch()`: when `draftMode().isEnabled`,
use a server-only client with a viewer token, `perspective: 'drafts'` and
`cache: 'no-store'`, and keep the published path unchanged. It needs a
`/api/draft-mode/enable` route validating Sanity's preview URL secret
(`next-sanity` `defineEnableDraftMode`), a read token in the host's env, and
Presentation configured in the Studio.

### Hosting

- Preview hosting (2026-11-02): Netlify Free, which allows commercial use but
  pauses the site when the 300 monthly credits run out; review usage before
  launch and move to Personal (~USD 9) if needed. Netlify's Next.js adapter
  supports tag revalidation natively (its durable cache honours
  `revalidateTag`). The final production plan is still a Phase 8 decision.
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
studio/                 pointer to sibling ../studio-premiumbells
scripts/                inventory, import and verification utilities
docs/                   architecture and migration source of truth
public/                 small immutable local assets only
```

The large legacy `public/` tree must not be copied wholesale. Logos, icons, and
small brand assets may remain local; editorial photography belongs in Sanity.

## Route architecture

Proposed Romanian canonical routes (not a final redirect map; preserve valid
nested legacy service routes):

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

### Language routing (decided 2026-10-24)

Romanian stays unprefixed; English lives under `/en/` with translated section
names and localised category/service slugs. Project and catalogue slugs are
shared. Storage and readiness rules are in [the content model](content-model.md).

| Romanian | English |
| --- | --- |
| `/` | `/en` |
| `/servicii` | `/en/services` |
| `/servicii/policandre` | `/en/services/chandeliers` |
| `/lucrarile-noastre` | `/en/our-work` |
| `/lucrarile-noastre/clopote` | `/en/our-work/bells` |
| `/lucrarile-noastre/clopote/schitul-duca` | `/en/our-work/bells/schitul-duca` |
| `/blog/[ro-post]` | `/en/blog/[en-post]` |

Implementation, following the installed Next.js 16 internationalisation guide:

- Every public route lives under `app/[lang]/`. `app/[lang]/layout.tsx` is the
  root layout and sets `<html lang>` through `next/root-params`;
  `generateStaticParams` returns `ro` and `en`.
- Internal folder names are Romanian. `proxy.ts` rewrites unprefixed requests to
  `/ro/...`, permanently redirects explicit `/ro/...` requests to the unprefixed
  URL, and maps the fixed English section names (`services`, `our-work`) to the
  internal Romanian folders with a static table. It never fetches content.
- Category and service pages resolve `[category]`/`[service]` against
  `slug[$lang]` in GROQ. A wrong-language slug redirects to the correct one.
- A typed `href(lang, route, params)` helper builds every internal link, so
  translated segments are never hand-written in components.
- No automatic redirect by `Accept-Language`. A visible RO | EN switcher links
  to the equivalent page only when that translation is published.
- Fixed interface strings (buttons, pagination, aria labels) live in typed code
  dictionaries; navigation and marketing copy live in Sanity.
- Route interception compares the client's current URL with internal route
  patterns, so `proxy.ts` maps the `Next-Url` request header the same way as
  the pathname. Next 16.4 also re-applies the interception rewrite on each
  internal pass, so the intercepted `[project]` param can arrive as
  `(.)(.)(.)slug`; `stripInterceptionMarkers()` removes the markers. Re-check
  both on Next upgrades.

### Project modal routes (implemented 2026-10-24)

Project details use a parallel `@modal` slot and an intercepted project route:

```text
app/[lang]/lucrarile-noastre/[category]/layout.tsx
app/[lang]/lucrarile-noastre/[category]/page.tsx
app/[lang]/lucrarile-noastre/[category]/[project]/page.tsx
app/[lang]/lucrarile-noastre/[category]/@modal/default.tsx
app/[lang]/lucrarile-noastre/[category]/@modal/(.)[project]/page.tsx
app/[lang]/lucrarile-noastre/[category]/@modal/[...catchAll]/page.tsx
```

`/lucrarile-noastre` lists the categories with the editable page copy. The
category layout renders the sidebar (chips on phones) around both the grid and
the full project page. `ProjectDetails` is shared by the slide-over and the full
page; the gallery shows 24 thumbnails at a time and opens a fullscreen lightbox
(native `<dialog>`, arrows, swipe, thumbnails). A category slug from the other
language permanently redirects. Reads are cached by tag (see Data delivery and
caching).

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
- Emit self-canonicals and `alternates.languages` (hreflang) only for published
  language pairs, with Romanian as `x-default`.
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
- Whether and when to add Greek or another third language (needs demand data
  and a native reviewer); English URL slugs for each category and service.
- Alternative commercial provider if Vercel plan constraints are undesirable.
- Exact analytics and consent tooling. No legacy analytics data exists;
  recommended: a cookieless tool (no consent banner) unless Google Ads are
  planned, then GA4 with Consent Mode. Decide before cutover.

## Implemented prototype exception

See [mobile publishing prototype](mobile-publishing-prototype.md). Its temporary
noindex routes used uncached published reads to verify publish/refresh
behavior; since 2026-10-31 reads are tag-cached and refresh after a publish
depends on the publish webhook.
The caching, preview, modal, and production route architecture above remains the
target after actual-phone acceptance. Studio and frontend are sibling folders,
not an embedded Studio or a nested package.
