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

export const comandaCopy = {
  hero: {title: 'Policandre', subline: 'la comandă, după naosul dumneavoastră', lead: 'Executăm la comenzi individuale policandre adaptate naosului, zonei, tradiției și stilului, după diametrul și înălțimea dorite. Sunt turnate masiv din bronz.'},
  crumb: 'La comandă',
  zoom: 'Măriți proiectul 3D',
  steps: {
    kicker: 'De la naos la turnare',
    title: 'Mai întâi, proiectul',
    items: [
      {title: 'Măsurile naosului', text: 'Adaptăm policandrul naosului, zonei, tradiției și stilului, după diametrul și înălțimea dorite.'},
      {title: 'Proiect în 3D', text: 'Înainte de toate, executăm proiectul în 3D.'},
      {title: 'Consiliul parohial', text: 'Proiectul este adoptat de consiliul parohial; abia apoi începem execuția.'},
      {title: 'Turnare în bronz', text: 'Policandrul este turnat masiv din bronz.'},
    ],
  },
  plates: {kicker: 'Desene și randări', title: 'Din proiectele noastre', zoom: 'Măriți planșa', call: 'Proiectul dumneavoastră', offer: 'Cereți o ofertă', shown: 7},
  included: {
    kicker: 'Până la darea în exploatare',
    title: 'Ce este inclus',
    items: ['Sistemul de prindere în perete', 'Lanțurile, calculate după greutatea iluminatului', 'Becurile', 'Asamblarea', 'Darea în exploatare'],
    sentence: 'Avem deja multe lucrări de succes în România, cu policandre impunătoare tip horos, la comandă.',
    link: 'Vedeți lucrările cu policandre',
  },
};

export const reconditionareCopy = {
  hero: {title: 'Recondiționare', subline: 'a policandrelor vechi, piesă cu piesă', lead: 'Readucem la viață policandre și tot ce e turnat din bronz masiv, obiecte vechi de epocă.'},
  beforeAfter: {kicker: 'Înainte și după', title: 'Aceleași piese, încă o viață', before: 'Înainte', after: 'După', shown: 3,
    /** Chip placement of the gallery's composite squares, as on the board (until "Înainte și după" pairs exist in the CMS). */
    layouts: ['stacked', 'stacked', 'side'] as const},
  stages: {kicker: 'Catedrala Sfântul Alexandru din Alexandria · August 2022', title: 'Lucrarea, pe etape', all: 'Toate cele {n} fotografii', zoom: 'Măriți'},
};

const bellCommon = {
  question: 'Ce fel de clopot căutați?',
  guide: {
    kicker: 'Alegeți un rând sau un set',
    columns: ['Greutate', 'Diametru', 'Înălțime', 'Notă'] as [string, string, string, string],
    groups: ['Până la 100 kg', '100–1000 kg', '1–5 tone', 'Peste 5 tone'] as [string, string, string, string],
    groupNotePlaceholder: '[Potrivit pentru: de la client]',
    person: '1,75 m',
    bells: 'clopote',
    ringer: 'clopotar electronic',
    play: 'Ascultați',
    pause: 'Opriți',
    offer: 'Cereți o ofertă pentru',
    offerShort: 'Cereți o ofertă',
  },
  works: {kicker: 'Din lucrările noastre'},
  other: 'Celălalt fel de clopote',
  video: 'Urmăriți filmul',
  videoShort: 'Filmul',
};

export const bellTypes = {
  'cu-jug': {
    name: 'Cu jug', line: 'Clopotul se balansează', lineShort: 'Clopotul se balansează',
    other: {name: 'Clopote cu jug', line: 'Se balansează pe jug din stejar sau oțel, până la 16 tone.'},
  },
  'fara-balans': {
    name: 'Fără balans', line: 'Clopotul stă fix, se trage limba', lineShort: 'Stă fix, se trage limba',
    other: {name: 'Clopote fără balans', line: 'Fixe, doar limba se trage, ca la Athos.'},
  },
} as const;

export const cuJugCopy = {
  ...bellCommon,
  hero: {title: 'Clopote cu jug', subline: 'cu balans, din stejar sau oțel', lead: 'Clopote rusești cu jug din stejar sau oțel, până la 16 tone, cu icoane canonice și ornamente tradiționale.'},
  sizes: {title: 'Dimensiuni clopote cu jug', short: 'cu jug', sets: 'Seturi recomandate după note muzicale', initial: 10},
  included: {
    kicker: 'Clopote cu jug', title: 'Ce este inclus',
    items: ['Limba', 'Icoanele', 'Textul', 'Ornamentele', 'Jugul de stejar', 'Transportul până la biserică', 'TVA'],
    nudge: {slug: 'automatizari-clopote-cu-balans', question: 'Clopote cu jug, trase automat', name: 'Automatizări pentru clopote cu balans', why: 'Motor liniar, controler și telecomandă.', contain: true},
  },
  works: {...bellCommon.works, title: 'Clopote cu jug montate', all: 'Toate lucrările cu clopote cu jug'},
};

export const faraBalansCopy = {
  ...bellCommon,
  hero: {title: 'Clopote fără balans', subline: 'fixe, trase cu sfoara, ca la Athos', lead: 'Clopotele sunt fixe; doar limba se trage, asemenea tradiției ortodoxe de la Sfântul Munte sau de la Biserica Sfântului Mormânt.'},
  sizes: {title: 'Dimensiuni clopote fără balans', short: 'fără balans', sets: 'Seturi acordate după note muzicale', initial: 8},
  included: {
    kicker: 'Clopote fără balans', title: 'Ce este inclus',
    items: ['Limba', 'Icoanele', 'Textul', 'Ornamentele', 'Transportul până la biserică', 'TVA'],
    nudge: {slug: 'clopotar-electronic', question: 'Clopote fixe, trase automat', name: 'Clopotar electronic', why: 'Pentru clopote fixe, cu limba trasă ca de mână.', contain: false},
  },
  works: {...bellCommon.works, title: 'Clopote fără balans montate', all: 'Toate lucrările cu clopote fără balans'},
};
