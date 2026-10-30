# Mobile portfolio publishing prototype

**Date:** 2026-10-10 · **Status:** implemented; accepted by the user on 2026-10-30 after phone use (see the record below).

The authorized target is the existing Sanity project `1fzbw4s1`, dataset
`production`, with schemas owned by the standalone sibling `studio-premiumbells`.
No legacy import, sample publication, Studio deployment, or production cutover
is part of this prototype. Existing uncommitted files were preserved; write
probes succeeded in both target folders before edits. `rbells-tw` was untouched.

## Run locally

Use Node.js 22.12+ (verified locally with Node.js 24).

```bash
# Terminal 1, from rbells_policandre
npm run dev

# Terminal 2, from studio-premiumbells
npm run dev
```

- Website: <http://localhost:3000/lucrarile-noastre> (the former
  `/prototip/portofoliu` routes were replaced by the Clopote slice on 2026-10-24)
- Editor: <http://localhost:3333>, or the hosted Studio
  <https://premiumbells.sanity.studio> (deployed 2026-10-24; use this on the phone)
- Project settings: <https://www.sanity.io/manage/project/1fzbw4s1>

The public IDs default to the values above. `.env.example` documents overrides;
copy it to `.env.local` only if overrides are needed. No token is needed for
published reads of this public dataset. Never put a private token in a
`NEXT_PUBLIC_*` variable. CLI preflight confirmed an administrator account,
the production dataset, and an existing CORS origin `http://localhost:3333`.
An anonymous published query returned zero documents before implementation.
Dataset visibility was not changed.

For a phone on the same trusted Wi-Fi, run both servers with `--host 0.0.0.0`
(Studio) / `--hostname 0.0.0.0` (Next.js), then replace `localhost` with the
computer's LAN IP. Add that exact Studio origin, for example
`http://192.168.1.10:3333`, with credentials in Sanity CORS settings. Do not add a
wildcard. The frontend uses server-side reads and does not itself require a
browser CORS entry. Hosting and remote phone access remain separate decisions.

## Editor walkthrough

All custom content labels are Romanian; built-in Studio controls use its
default language. Use the standard Studio uploader so upload progress and
failures remain visible. This workflow has not yet been accepted on a phone.

1. Fields are now `{ro, en}` locale objects (see the content model). Leave
   **Publicat în** on Română only until English text is reviewed; the language
   filter button hides English while editing on a phone.
   In **Categorii de lucrări**, create `Clopote`, generate its short address,
   and publish it. Categories and projects get Sanity-generated document IDs.
2. In **Textul paginii**, edit the portfolio title and introduction. Publish.
3. In **Lucrări și fotografii**, create a draft, enter its name, generate the
   short address, select the category, location, and description.
4. In **2. Fotografii**, tap **Adaugă fotografii (optimizate)** and choose
   10–20 actual phone photos at once. Rules, applied in the browser:
   - JPEG/WebP/PNG within 3200px and 1.5 MB: original pixels kept; JPEG/WebP
     lose only metadata (GPS, camera, XMP), losslessly.
   - Within 3200px but over 1.5 MB: re-compressed at the same size (JPEG 85%)
     only if that saves at least 20%; transparent PNGs are always kept.
   - Larger than 3200px: shrunk to 3200px (JPEG 85%, stepping down only if
     needed to stay below the original size; PNG stays PNG).
   - Orientation flag or HEIC: re-saved once as JPEG, upright.
   Kept photos keep their file name; re-saved ones become `.jpg`. Photos upload
   three at a time and are appended in the selected order. Photos already in
   the gallery, or picked twice in one selection, are skipped ("Omisă"): each
   upload stores a SHA-1 fingerprint of the picked file as the asset's
   `source.id`, and identical bytes resolving to an existing asset are never
   added twice. The same photo may still be used in different projects.
   The panel shows each file's result; failed files can be retried. Plain uploads of
   full-size originals are switched off Studio-wide. Photo descriptions (alt text)
   are optional: when one is missing the website generates it, e.g. „Schitul
   Duca, Brașov – fotografia 3 din 12”. Write real descriptions for important
   photos such as the cover; add optional captions; reorder with the standard
   controls. Keep the originals on the phone or computer as proof of authorship.
5. For **Fotografie de copertă**, use **Select** to reuse an uploaded image, or
   **Select → Încarcă fotografie (optimizată)** for a new single photo. Add its
   accessibility description and adjust crop/hotspot if needed.
6. Before publishing, refresh the website: the draft must remain absent.
   Publish, then refresh again: the project and changed page copy should appear.
7. Edit the published title without publishing: the old published title should
   remain on the website. Publish the change and refresh. Unpublish the project
   and confirm it disappears, including its direct detail URL.

Only upload public-safe, price-free content. Draft documents are excluded from
the frontend; uploaded assets are not private files and must not contain
confidential material. Check photo metadata and visible text before uploading.

## Acceptance record

Closed on 2026-10-30 by the user's acceptance. The user tested on their own
phone but did not record per-check details; "Accepted, not recorded" marks
those rows. Evidence gathered during the work is noted where it exists.

| Check | Evidence | Result |
| --- | --- | --- |
| Device and browser | Not recorded | Accepted, not recorded |
| Create/edit draft | Drobeta, Turnul Severin created and published from a phone (2026-10-24/25) | Accepted |
| Upload 10–20 photos | Drobeta gallery: 31 photos uploaded from a phone | Accepted |
| HEIC / HEIF | Not recorded | Accepted, not recorded |
| Interrupted upload | Not recorded | Accepted, not recorded |
| Duplicate photos | Not recorded on the phone; unit-tested in the Studio | Accepted, not recorded |
| Cover and order | Not recorded | Accepted, not recorded |
| Captions and alt text | Phone testing showed required alt text blocked publishing; made optional with generated descriptions (2026-10-25) | Accepted after fix |
| Page copy | Not recorded | Accepted, not recorded |
| Draft isolation | Drafts excluded from the website (query tests); three imported drafts stayed hidden until published (2026-10-30) | Accepted |
| Technical details | Drobeta row entered as one fact, then split by the editor after the Studio fix (2026-10-25) | Accepted after fix |
| 200-image editor | Not tested | Deferred to Phase 5 (Rohia, 201 photos) |
| 200-image website | 89-photo gallery measured 2026-10-30: 24 per page, lazy CDN-sized images, no originals; see the migration change log | Accepted for 89; 176/201 in Phase 5 |
| User acceptance | "Phone acceptance record is fine" — user, 2026-10-30 | **Accepted** |

Sanity's [asset documentation](https://www.sanity.io/docs/content-lake/assets)
lists HEIF among supported image types. This does not prove this phone/browser's
HEIC upload or orientation behavior. If a format fails, record the exact error,
retain originals, and test a JPEG export as a fallback. Never mark the original
format as accepted because the fallback worked.

## Implementation boundary

- Four schema types: `project`, `workCategory`, `portfolioPage`, and reusable
  `imageWithMetadata`. Page copy is a Studio singleton with duplicate creation
  and destructive actions removed from its normal UI.
- Romanian-only prototype fields. Translation storage and approved locale URLs
  remain pending; this does not establish the production language model.
- For the upload prototype, `project.gallery` is a direct image array, instead
  of the proposed `galleryItem.image` wrapper. This enables native multi-upload;
  decide the final production shape after phone acceptance and before imports.
- (Superseded 2026-10-24 by `/lucrarile-noastre/[category]/[project]`.)
  `/prototip/portofoliu` and `/prototip/portofoliu/[slug]` were temporary noindex
  routes. The root also remains noindex during prototype development. This is
  not access control and does not finalize any existing URL or redirect.
- Explicit `published` client perspective, no token, server-only client,
  `useCdn: false`, and `cache: 'no-store'`. Refresh reads current published
  content; there is no automatic open-tab live update. Draft/release IDs are
  additionally excluded in project queries. See Sanity's
  [perspective documentation](https://www.sanity.io/docs/content-lake/perspectives).
- Project lists fetch 12 cards; detail pages fetch 24 ordered image references.
  `next/image` uses the Sanity CDN builder, honoring crop/hotspot for covers,
  responsive widths, automatic format selection, and lazy loading. No public
  original-download links are rendered.
- Production caching, signed webhooks, authenticated draft preview, visual
  editing, modal routing, and a fullscreen lightbox remain later milestones.
- No MCP content tools are configured. Local Studio schema is authoritative.
  Schema deployment (`sanity schemas deploy`) is still required before future
  MCP content work; it was not needed for local Studio editing or frontend reads.

## Repeatable checks

```bash
# From studio-premiumbells
npm run typegen
npm run typecheck
npm run lint
npm run build

# From rbells_policandre
npm run lint
npm run typecheck
npm run test:unit
npm run test:migration
npm run test:browser
npm run build
```

TypeGen scans `../rbells_policandre/sanity/queries.ts` and writes generated types
to `../rbells_policandre/sanity/types.ts`. Keep both sibling directory names, or
update `sanity.cli.ts` when relocating. Regenerate after schema/query changes.
Browser tests use installed Google Chrome, start a local server when needed,
and read the live published dataset without writing content. Mobile emulation
does not replace the actual-phone acceptance test. No successful published
project click-through can be verified against the empty dataset until the
editor publishes an approved test project.

### Verification results and remaining release work

- TypeGen: three queries, 17 schema types generated successfully.
- Frontend and Studio: lint and TypeScript checks pass.
- Query tests: 5/5 pass; existing migration tests: 6/6 pass. The migration tests
  were run via `node --import tsx --test scripts/legacy-media.test.ts` because
  the sandbox blocks the `tsx` command's IPC socket.
- Chrome browser checks: desktop and mobile emulation, 4/4 pass against the
  live empty dataset. Covered client navigation, refresh, noindex, missing
  projects, no client exceptions, and horizontal overflow.
- Next.js Webpack production build passes, including TypeScript and static
  generation; prototype routes are dynamic.
- Studio production build passes. Its existing auto-update setting warns that
  no deployment `appId` is configured; configure this with the eventual hosted
  Studio, not during this local prototype.
- 2026-10-24: Next.js and `eslint-config-next` are pinned to 16.4.3, outside
  the advisory range (16.0.0–16.4.0), and non-breaking `npm audit fix` updates
  were applied. The frontend audit now reports 14 transitive findings
  (11 moderate, 3 high, 0 critical), all through `next-sanity` tooling; npm's
  only offered fix is a major downgrade to `next-sanity@11`, which was not
  applied. The default Turbopack build now passes, as do lint, typecheck,
  5/5 query tests, 6/6 migration tests, and 4/4 browser checks against the
  production build. The Studio audit was not rechecked. Recheck both before
  deployment; this prototype does not constitute production security acceptance.
