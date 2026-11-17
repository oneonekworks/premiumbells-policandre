// Board copy of the v6 service pages (docs/design/clarity-v6/copy/*.md) that
// has no CMS field yet: hero H1 / italic line / lead, section kickers and
// titles, steps, lists. CMS content wins wherever a field or section exists
// (hero photo, Pe scurt, insets, works, catalogue, bell tables, galleries).
// Romanian only, as the boards; English service pages are not published.
// "[...]" marks a placeholder the client still has to confirm.

export type HeroCopy = {title: string; subline: string; lead: string};

export const policandreCopy = {
  hero: {title: 'Policandre', subline: '1–7 nivele, clasa premium', lead: 'Turnate masiv, clasa premium, la Moscova și Iaroslavl, în stil clasic „brad” și „horă”; din Grecia, în stil bizantin.'},
  zoom: 'Mărește detaliile',
  zoomShort: 'Mărește',
  models: {
    kicker: 'Lăcuite sau aurite, în 1–7 nivele',
    title: 'Modele și dimensiuni',
    lead: 'Spuneți-ne codul modelului și finisajul când comandați.',
    dateLine: 'Prețurile sunt actualizate din data de {date}.',
    filter: 'Filtrați după nivele',
    filters: [['all', 'Toate'], ['1', '1 nivel'], ['2', '2 nivele'], ['3', '3 nivele'], ['4', '4–7 nivele'], ['h', 'Horos']] as const,
    showAll: 'Arătați toate modelele',
    zoom: 'Măriți fotografia',
    photo: 'Fotografie',
    /** Until the client sends the price list (user, 2026-11-17): no figures, no date line. */
    price: 'La comandă',
  },
  nudges: [
    {slug: 'policandre-la-comanda', question: 'Nu ați găsit ce căutați?', name: 'Proiecte la comandă', why: 'Proiectate după naosul dumneavoastră.'},
    {slug: 'reconditionare-policandre', question: 'Aveți deja un policandru vechi?', name: 'Recondiționare', why: 'Îl readucem la viață.'},
  ],
  steps: {
    kicker: 'De la alegere la sfințire',
    title: 'Cum lucrăm',
    items: [
      {title: 'Alegem împreună', text: 'Modelul, nivelele și finisajul.'},
      {title: 'Măsurăm naosul', text: 'Dimensiunile decid proporțiile.'},
      {title: 'Turnare', text: 'La Moscova, Iaroslavl sau în Grecia.'},
      {title: 'Montaj și sfințire', text: '[Text de confirmat]'},
    ],
  },
  works: {kicker: 'Lucrări cu policandre', title: '{n} lucrări', all: 'Toate cele {n} lucrări'},
};
