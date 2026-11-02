# Legacy URL Map

**Status:** Draft for review (2026-11-02) · Search Console data pending
**Source:** live `https://www.policandre.ro` (checked 2026-11-02), its
sitemaps (`categories.xml`, `products.xml`, `blog-posts.xml`, listed in
`robots.txt`; `/sitemap.xml` is 404), and the `../rbells-tw` page files.

policandre.ro has no analytics history. Search Console (Domain property
verified 2026-11-02) is still processing; when its Pages and Performance
exports arrive in `.migration/`, use them to rank which rows to check first
and to find URLs not listed here (image URLs, old links from other sites).

## Principles

- **Keep every live path.** The rebuilt routes already reuse the Romanian
  legacy paths, so most URLs need no redirect at all.
- Redirect (308, permanent) only broken, duplicate or experimental URLs, each
  to the closest live page. Never redirect everything to the home page.
- The host stays `www.policandre.ro` (`NEXT_PUBLIC_SITE_URL`); the apex
  `policandre.ro` already redirects to `www` with 308 and must keep doing so at
  cutover (DNS/host setting, not app code).
- English URLs (`/en/...`) are new and need no redirects.
- Fragments (`#…`) never reach the server; they only work if the new page
  keeps the same element IDs.

## Pages

Live = HTTP status on 2026-11-02. Sitemap = listed in a legacy sitemap
("typo" = listed only under a wrong `/servicii/servicii/…` URL).

| Old URL | Live | Sitemap | New URL | Action | Status in rebuild |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | yes | `/` | keep | built (placeholder copy) |
| `/lucrarile-noastre` | 404 | — | `/lucrarile-noastre` | new page | built |
| `/lucrarile-noastre/clopote` | 200 | yes | same | keep | built, 40 works |
| `/lucrarile-noastre/policandre` | 200 | yes | same | keep | category exists, works not imported |
| `/lucrarile-noastre/automatizari` | 200 | yes | same | keep | Phase 5 import |
| `/lucrarile-noastre/reconditionari-policandre` | 200 | — | same | keep | Phase 5 import |
| `/lucrarile-noastre/usi` | 200 | — | same | keep | Phase 5 import |
| `/_lucrarile-noastre` | 200 | — | `/lucrarile-noastre` | 308 | unused template page |
| `/servicii` | 404 | — | `/servicii` | new page | built (placeholder) |
| `/servicii/policandre` | 200 | yes | same | keep | services not built |
| `/servicii/policandre-la-comanda` | 200 | yes | same | keep | services not built |
| `/servicii/reconditionare-policandre` | 200 | yes | same | keep | services not built |
| `/servicii/clopote` | 404 | — | `/servicii/clopote` | decide | parent of the two bell pages; new hub page or keep 404 |
| `/servicii/clopote/cu-jug` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/clopote/fara-balans` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/automatizari-clopote-cu-balans` | 200 | — | same | keep | services not built |
| `/servicii/clopotar-electronic` | 200 | — | same | keep | services not built |
| `/servicii/iconostase` | 200 | typo | same | keep | services not built |
| `/servicii/iconostase/marmura` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/iconostase/lemn` | 200 | — | same | keep | services not built (nested) |
| `/servicii/iconostase/lemn-aur` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/iconostase/iconostas-bronz` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/iconostase/pristol-marmura` | 200 | yes | same | keep | services not built (nested) |
| `/servicii/usi` | 200 | typo | same | keep | services not built |
| `/blog` | 200 | — | `/blog` | keep | built (placeholder) |
| `/blog/clopotele-manastirii-putna` | 200 | yes | same | keep | blog not built |
| `/blog/clopotar-electronic-pt-clopote-fixe` | 200 | — | same | keep | blog not built |
| `/blog/raport-18-ianuarie-2023` | 200 | — | same | keep | blog not built |

## Redirects (308)

| Old URL | Live | Why | Target |
| --- | --- | --- | --- |
| `/servicii/servicii/iconostase` | 404 | typo in `categories.xml` | `/servicii/iconostase` |
| `/servicii/servicii/usi` | 404 | typo in `categories.xml` | `/servicii/usi` |
| `/blog/raport-18-ianuarie-23` | 404 | wrong link in legacy blog data | `/blog/raport-18-ianuarie-2023` |
| `/servicii/iconostase/lemn-bronz` | 404 | linked from service records, page never existed | `/servicii/iconostase` (proposed) |
| `/blog2` | 200 | experimental duplicate of the blog | `/blog` |
| `/_lucrarile-noastre` | 200 | template page with placeholder menus | `/lucrarile-noastre` |

## Removed (404, no redirect)

- `/api/hello` (create-next-app boilerplate, live 200).
- `/servicii/clopote-suvenire`, `/servicii/cupole`,
  `/servicii/analog-sfesnice-chivot`: announced as "in maintenance", never
  built (404 today). They get pages only if those services launch; the
  analog/chivot/sfeșnice catalogue may cover the last one.

## Fragments and catalogue anchors

`products.xml` lists `/servicii/policandre#Policandru-1` … `#Policandru-29`
(`#Policandru-18` twice). When the catalogue is built, the policandre page
should keep `id="Policandru-N"` on each entry (or open that entry), so shared
links keep landing on the right chandelier. The catalogue's reference IDs
should come from the same numbers.

## Projects

The old site opened projects in a panel without changing the URL, so no
project URL was ever public or indexed (the per-project `Link` is commented
out in the legacy pages). New project URLs need no redirects, and legacy
`page` values are only import hints:

- `clopote-sihastria-rascai`: decided 2026-10-30, imported once as
  `sihastria-rascai` under Clopote; the Automatizări copy is skipped.
- `manastirea-faget` is copy-pasted on three different Policandre works.
  Proposed slugs when Policandre is imported: Raport poze, Parohia Dej III →
  `parohia-dej-iii`; Mănăstirea Lăpuș, Maramureș → `manastirea-lapus`;
  Mănăstirea Făget, Jud. Brașov → `manastirea-faget`.
- `/img/works-cover/4.jpg` (missing) is a placeholder cover on the three
  records without photos or pages: Orologiu 2 M (Sf. Ioan cel Nou, Chișinău),
  Orologiu Manta Cahul, Sonorizări Reșița. Proposed: do not import them until
  real photos exist (a project needs a cover and a gallery).

## Images and files

Legacy images live on GCS (`storage.googleapis.com/rbells/…`, kept as the
archive, so those URLs keep working) and under `www.policandre.ro/img/…` and
other local `public/` paths, which disappear at cutover. Their search value is
unknown; check Search Console (and Google Images) before cutover and redirect
only paths that bring visits, e.g. catalogue PDFs.

## Implementation (at cutover)

- Add the redirects above to `next.config.ts` `redirects()` (308), with a
  unit test over the table, once their targets exist (services and blog are
  not built yet). `proxy.ts` keeps handling only language prefixes.
- The services route must support the nested legacy paths
  (`/servicii/clopote/cu-jug`, `/servicii/iconostase/marmura`), e.g.
  `/servicii/[service]/[variant]`, rather than flattening them.
- Generate `sitemap.ts` and `robots.ts` from published content and submit the
  sitemap in Search Console; remove the noindex at launch.
- After DNS cutover, re-check every row (a script over this table) and watch
  Search Console → Pages for new 404s for a few weeks.
