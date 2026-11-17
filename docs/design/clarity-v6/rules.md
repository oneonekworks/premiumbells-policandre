# Rules in force (v6.2)

These hold on every page. A board that seems to break one is a mistake on the
board; ask before building it that way.

## Content and wording

- **Romanian copy.** English later; `/en` keeps its placeholder.
- **Prices only in the Policandre model catalogue** (client, 2026-11-17). Each
  finish of a catalogue model shows its price ("[12.000] lei" on the boards is a
  placeholder) and the catalogue shows one line "Prețurile sunt actualizate din
  data de dd.mm.yyyy." **Everywhere else there are no prices: "La comandă".**
  That includes La comandă, Recondiționare, Clopote, Automatizări (kits without
  prices), Iconostase, Uși, the Project panel and the Lightbox. Currency, VAT and
  scope are open (open-questions.md q51–53).
- **CTA wording "Cereți o ofertă".** The per-card "Cereți o ofertă" link on the
  Policandre models is gone.
- **Real photos only.** Stand-ins on the boards are labelled; placeholders stay
  visible until real content exists: `[Parohie]`, `[localitate]`, `[an]`,
  `[n]`, `[fotografie]`, `[X] zile lucrătoare`, `[email din CMS]`.

## Layout and navigation

- **Reducing the noise.** No buttons or links in any hero: kicker, H1, teal
  italic line, lead, then the photo. A photo control (Mărește, Urmăriți filmul,
  Priviți de aproape) is the only exception.
- **Fewer pages, fewer clicks, no hub pages.** No `/servicii` page and no
  Clopote chooser; go straight to the page.
- **Floating layers instead of nested pages:** Lightbox, Project panel,
  mega menu, mobile menu. Each is URL-addressable in the build; Back and Esc
  close the top layer.
- **A work (project) opens only in the Project panel,** over the page it was
  clicked on, wherever it appears (Works wall, homepage map and showcase,
  service-page work cards, menus). There is no project page and no deeper
  link. A direct visit or shared link to a project URL renders Lucrările
  noastre (category filtered) with the panel open, server-rendered.
- **The offer inside layers is quiet:** at the end of the content, a question +
  a light (secondary) button or text link; no filled button, no sticky bar.
  Dark filled buttons only for the final step on pages (footer, phone bottom
  bar).
- **One split story hero for every service page:** breadcrumb (+ type switch
  on the bell pages) → grid 1fr | 1fr: H1 + teal italic + lead + Pe scurt ×3 |
  photo 4:3 + two framed inset photos (never over the subject).
- **Dark areas:** at most two inset teal-950 panels per page plus the footer.
  Works (both views), Blog, Article, 404, Policandre and Uși have only the
  footer.
- **The footer is one canonical block** (`reference/footer.html`), identical on
  every page, anchor `#oferta`. Build it once.
- **One filter bar on Works,** the same before and after it docks under the
  header; bell type (Cu jug · Fără balans) slides in after Clopote inside it.
- **Desktop and phone are designed together;** build both from the start.

## Quality bar

- WCAG 2.2 AA: text contrast ≥ 4.5:1 (values on the boards are checked; keep
  them), focus visible everywhere (3 px gold ring), targets ≥ 44 × 44.
- Real elements: `<button>`, `<a href>`, inputs with labels; layers are dialogs
  with focus trap and return focus.
- `prefers-reduced-motion`: no movement, colour/opacity only;
  `prefers-reduced-transparency` and no `backdrop-filter`: the solid fallbacks
  in `tokens.css`.
- No autoplay audio or video; YouTube loads only on click.
- Fonts on `next/font`, self-hosted, `latin-ext` (Cormorant Garamond 500–600 +
  italic 500, Inter 400/500/600). The Google Fonts links in the boards are for
  viewing only.
