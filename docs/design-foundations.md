# Design foundations and site shell

**Date:** 2026-10-24 · **Status:** implemented locally; visual review pending.

A compact design language refining the legacy identity (real photography, teal
accents, premium ecclesiastical character) without copying its template
styling. Tokens live in `app/globals.css`; shell components in
`components/site/`.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#fbfaf6` | Page background |
| `stone` | `#f2efe7` | Alternate sections, hover fills, image placeholders |
| `line` | `#e3ddd0` | Hairlines and borders |
| `ink` / `ink-soft` | `#16201f` / `#4a5654` | Body text / secondary text |
| `teal-900` | `#0e3a36` | Headings, wordmark |
| `teal-700` | `#0f6b63` | Primary buttons, links, active navigation |
| `teal-500` | `#14a394` | Icons on dark backgrounds only |
| `teal-950` | `#0b2523` | Footer background |
| `gold-500` / `gold-200` | `#b38b4d` / `#e6d5b5` | Ornament, focus ring / footer headings |

Text colours meet WCAG AA on their intended backgrounds. Gold is never used for
body text on paper. Focus is a 3px gold outline everywhere.

## Type

- **Display:** Cormorant Garamond 500/600 for headings and the wordmark,
  never below ~24px.
- **Text and interface:** Inter (variable).
- Both are self-hosted through `next/font` with `latin-ext` for Romanian `ș ț ă
  î â`. Cyrillic is available if a future language needs it.

## Components and utilities

- `container-site`: max width 76rem with 1.25rem/2rem side gutters.
- `eyebrow`: small uppercase teal label above headings.
- `btn` + `btn-primary` / `btn-secondary`: 44px minimum touch height.
- Cards: white surface, `line` border, short gold rule, soft hover shadow.
- Reduced motion collapses all transitions and animations.

## Shell

- **Header:** sticky, translucent paper with a hairline. Logo monogram plus
  wordmark; Servicii, Lucrările noastre, Blog with a teal underline for the
  active section; phone (number from `lg`, icon from `md`) and RO | EN.
- **Mobile (below `md`):** phone and menu buttons. The menu is a native modal
  `<dialog>` sliding in from the right (focus containment, Escape, inert page,
  closes after navigation) with large display-font links, phone, email, and
  language switcher.
- **Footer:** dark teal with a gold top rule; brand and social links,
  navigation, contact, and company identifiers (legal name, CUI, Reg. Com.).
- **404:** unmatched paths render inside the shell with a 404 status through
  `app/[lang]/[...rest]` and `app/[lang]/not-found.tsx`.

Service, works, and blog pages are temporary placeholders so navigation can be
reviewed. The home page content is placeholder copy to show the type scale,
buttons, and cards; it moves to the Sanity `homePage` singleton.

## Open items

- A vector logo. The legacy monogram is a 72×49 PNG and is slightly soft on
  high-density screens.
- A postal address, if it should appear in the footer.
- Services and works flyout menus (the legacy mega menus) once services and
  categories exist in Sanity.
- Contact details and company identifiers currently live in `lib/site.ts` and
  move to `siteSettings`; navigation labels move to `navigation`.
- Review the home copy claims before publication.

## Development note

`npm run dev` uses Webpack. Under Turbopack dev (Next 16.4.3), the dynamic
`/prototip/portofoliu` route enters a reload loop in the browser; Turbopack
production builds and Webpack dev are unaffected. Re-test on Next upgrades.
