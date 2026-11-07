# Schema proposal for the v5.10 homepage

**Status:** Proposed 2026-11-07, waiting for the user's OK. Nothing is
changed in the Studio or the dataset yet. Part of phase B in
`docs/design-plan.md`.

Changes are in `studio-premiumbells/schemaTypes/`. Field names are English
(as now), Studio labels Romanian. Retired fields are hidden, not deleted, so
the published homepage keeps working until the new one ships; they are
unset in a later approved step.

## 1 · `homePage` (singleton)

### Groups (Studio tabs), in the new order

1. Deschidere · 2. Servicii și cataloage · 3. Lucrări · 4. Despre noi ·
5. Ascultați · 6. Jurnal și mărturie · 7. SEO

### `hero`

| Field | Change | Notes |
| --- | --- | --- |
| `badge` (siteLink) | keep | the "Nou" pill; empty = hidden |
| `tagline` | keep | the italic claim |
| `primaryCta`, `secondaryCta` | keep | |
| `slices` | **add**: array of exactly 3 {`service` → service (top-level, active), `image` imageWithMetadata optional, `line` localeString ≤ 48} | headline words, slice names and links come from the services; the image falls back to the service `coverImage`; hotspot required on images |
| `figures` | **add**: array ≤ 3 {`label` localeString ≤ 20, `source` enum `projects` · `countries` · `manual`, `value` number (manual only)} | "lucrări" and "țări" are counted from published projects so they never go stale; "turnătorii" is manual (12) |
| `title` | becomes optional | an override of the generated headline; empty = "Policandre, clopote și iconostase" from the slices |
| `highlight`, `lead` | hide (retire) | not in the design |
| `image` | no longer required; label "Imagine pentru distribuire" | share image only |

### `services`

| Field | Change | Notes |
| --- | --- | --- |
| `enabled`, `heading` | keep | |
| `groups` | **add**: array of exactly 3 {`title` localeString ≤ 40, `facts` localeBlockContent limited to bold, ≤ 3 lines, `services` → service (active, top-level or variant), 1–4} | drives the bento and the mega menu (plan, fix 5); card widths follow the count in code (4·3·3, 3·3·2·2, 5·5) |
| `eyebrow`, `intro`, `services` | hide (retire) | |

Cards use each service's `title`, `coverImage` and `cardLabel` (the hover
hint). Hints to set from the handoff: Turnate masiv, clasa premium ·
Policandre la comandă · Policandre și clopote · Până la 16 tone · Trase de
sfoară · Pentru clopote fixe · Pentru clopote cu balans · Marmură, lemn cu
aur, bronz · Cupru, bronz, stejar. These are edits to `service` documents,
part of the seed step.

### `catalogues`

Keep `enabled` (stays off until a reviewed price-free PDF exists) and
`heading`. Hide `intro`. Rendered as the card inside the services section;
the file size comes from the asset.

### `works` (new section)

| Field | Notes |
| --- | --- |
| `enabled` | default on |
| `heading` | "Lucrările noastre" |
| `projects` | array of project references, 9–12; empty = featured projects, newest first |

Tiles use each project's cover; the size (large, tall, wide, small) is chosen
from the image shape and resolution. Chips and counts come from
`workCategory`; the map tile from project locations (county centres, plan
fix 2). No per-image fields (`wallSize`, `gilded`) for now; the shimmer runs
on the Policandre, Iconostase and Uși categories.

### `about`

| Field | Change | Notes |
| --- | --- | --- |
| `enabled`, `heading`, `video`, `poster` | keep | `poster` is now the video poster (16:9) |
| `videoCaption` | **add**: localeString ≤ 60 | "În turnătorie · [locul] · [durata]" |
| `lead` | **add**: localeBlockContent, bold only | the sentence up to "astfel promovând:" |
| `points` | **add**: array ≤ 3 {`key` localeString ≤ 16, `text` localeString ≤ 160} | 16 tone · Athos · Balans |
| `statement` | **add**: → testimonial | Denis Latisev's statement (the existing published testimonial document) |
| `body` | hide (retire) | replaced by `lead` + `points` |
| `cta` | keep, left empty | no link in the design |

### `audio`

Keep `enabled` and `recording`. Hide `eyebrow`. **Add** `link` (siteLink,
optional): "Seturi de clopote după note →".

### `blog`

Keep `enabled`, `heading`, `posts`. Hide `intro`. Cards show
`kind` · `publishedAt` · reading time and the excerpt clamped to 3 lines.

### `testimonial` (section)

Moves to the "Jurnal și mărturie" tab and renders above the posts (heading
"Mărturie și jurnal"). It is for a client (abbot or priest): the seed sets
`enabled` off, because the current testimonial (Denis Latisev) moves to
`about.statement`.

## 2 · Other types

| Type | Change | Notes |
| --- | --- | --- |
| `testimonial` | **add** `shortQuote` localeString ≤ 200, optional | used on the homepage when set; `quote` keeps the full text; `context` is the fact line |
| `audioFeature` | **add** `waveform` array of numbers (100 values, 0–1), read-only | written by a script from the MP3, never in the browser |
| `siteSettings` | **add** `partnersLink` siteLink, optional | "Colaborează cu noi →"; empty = hidden |
| `service` | none | `cardLabel` and `coverImage` are reused |
| `project`, `blogPost`, `catalogDownload` | none | |

All of these types already run `priceTextValidation` over the whole document,
so the new text fields are price-checked.

## 3 · Seed (after the Studio deploy, each step approved, export first)

- homePage draft: slices (Policandre, Clopote, Iconostase with the three
  lines), figures (projects · countries · manual 12), the three groups with
  their facts and services, about lead, points, statement → the Denis
  testimonial, video caption once known, audio link, testimonial section off,
  badge empty.
- Service `cardLabel` values above, where they differ from today's.
- Denis testimonial `shortQuote` from the handoff, **only after his approval**;
  until then the homepage shows the first sentence of `quote`.
- Review the draft in the Studio, then publish on approval.

## Needs your confirmation

1. The figures strip (60 · 3 · 12) — overrides Phase 7 decision 4; "lucrări"
   and "țări" counted automatically, "turnătorii" typed in. Note: "3 țări"
   counts only published projects, so it shows 1 or 2 until the Moldova and
   Spain projects are in.
2. The "Nou" pill launches empty (iconostases are no longer new), or with
   "Pagina Iconostase →" as in the design?
3. The works wall picks projects (covers), not individual gallery photos —
   simpler for editors; per-photo choice can come later.
