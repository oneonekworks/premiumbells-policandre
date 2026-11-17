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

export const clopotarCopy = {
  hero: {title: 'Clopotar electronic', subline: 'pentru clopote fixe', lead: 'Clopotele fixe sună automat din limbă, cu melodii de la Athos, la ora dorită sau din telecomandă.'},
  flow: {
    kicker: 'De la buton la limba clopotului', title: 'Cum funcționează', optional: 'La alegere',
    /** Steps by the CMS component's anchor (sectionModels "Componente"); the CMS gives the photo. */
    steps: [
      {anchor: 'GM870I', name: '1. Controler', code: 'GM870I · Melodii Athos', text: 'Pornește melodiile la ora dorită sau la apăsarea unei taste.'},
      {anchor: 'QUADRO', name: '2. Panou electric', code: 'QUADRO', text: 'Module pentru controlul motoarelor, elemente de protecție, întrerupătorul principal.'},
      {anchor: 'M-8000', name: '3. Motor pe limba clopotului', code: 'M-8000', text: 'Cu frânghia reglată, clopotul sună natural, din limbă. Include placă zincată și scripete de aluminiu.'},
    ],
    options: [
      {anchor: 'KIITF4EVO', name: 'Telecomandă de buzunar', code: 'KIITF4EVO · 4 canale', text: 'Pornește trei melodii de pe apelarea rapidă. Recomandată în interiorul bisericii, la aproximativ 50 m.'},
      {anchor: 'GSM4000', name: 'Modul GSM', code: 'GSM4000', text: 'Porniți melodiile de pe smartphone, prin rețeaua GSM. Cartela SIM nu este furnizată.'},
    ],
  },
  facts: {
    kicker: 'GM870I', title: 'Controlerul, pe scurt', all: 'Toate caracteristicile', listFrom: 'GM870I',
    items: [
      {value: '7″', label: 'Ecran LCD color'}, {value: '1000', label: 'melodii de înregistrat'},
      {value: '24', label: 'ieșiri de releu, cu opțiunea RL085'}, {value: '10', label: 'taste de apelare rapidă'},
      {value: '10 ani', label: 'păstrează memoria la o pană de curent'}, {value: '2,3 kg', label: '334 × 60 × 180 mm'},
    ],
  },
  videos: {kicker: 'Filmate în clopotnițe', title: 'Vedeți cum sună', play: 'Redați filmul', placeholder: '[film din clopotniță]', slots: 6},
  photos: {kicker: 'Montaj', title: 'Din clopotnițe', zoom: 'Măriți', shown: 6},
};

export const automatizariCopy = {
  hero: {title: 'Automatizări', subline: 'pentru clopote cu balans', lead: 'Clopotele cu jug pornesc singure, din controler sau din telecomandă: un set complet, gata de montat în clopotniță.'},
  /** Until the CMS has the two inset photos (placeholders keep the captions). */
  insets: [{title: 'Motor liniar', line: 'pornește clopotul'}, {title: 'Controler', line: 'și 2 telecomenzi în set'}],
  kit: {kicker: 'În fiecare set', title: 'Ce primiți', items: ['Controler', 'Motor liniar', 'Modem', '2 telecomenzi', 'Ciocan extern']},
  sets: {kicker: 'Pentru 2 sau 3 clopote', title: 'Alegeți setul', bells: 'clopote', offer: 'Cereți o ofertă', offerFor: 'Cereți o ofertă pentru'},
  nudge: {slug: 'cu-jug', question: 'Nu aveți încă clopotele?', name: 'Clopote cu jug', why: 'Vedeți dimensiunile și seturile recomandate.'},
};

export const iconostaseCopy = {
  hero: {title: 'Iconostase', subline: 'din marmură și lemn aurit', lead: 'Fiecare iconostas se proiectează pentru altarul dumneavoastră: din marmură grecească sau din lemn sculptat și aurit.'},
  closer: 'Priviți de aproape',
  closerLabel: 'Priviți iconostasul de aproape',
  layerTitle: 'Iconostase',
  materials: {
    kicker: 'Din ce se lucrează', title: 'Alegeți materialul',
    lead: 'Deschideți o lucrare ca s-o vedeți întreagă, apoi măriți până la ornament.',
    leadShort: 'Atingeți o lucrare ca s-o vedeți întreagă, apoi măriți până la ornament.',
    photos: ['fotografie', 'fotografii', 'de fotografii'] as [string, string, string],
    /** Material services (variants of Iconostase) in board order; Bronz is hidden (2026-11-16). */
    items: [
      {slug: 'marmura', name: 'Marmură', tab: 'Marmură', line: 'Marmură grecească, cu porți din alamă, cupru sau aurite.'},
      {slug: 'lemn-aur', name: 'Lemn sculptat cu aur', tab: 'Lemn cu aur', line: 'Sculptat unic, cu foiță de aur: modelele Saransk și Pahomov.'},
      {slug: 'pristol-marmura', name: 'Pristol din marmură', tab: 'Pristol', line: 'Pristol și jertfelnic, sculptate manual.'},
    ],
  },
  steps: {
    kicker: 'De la proiect la sfințire', title: 'Cum lucrăm',
    items: [
      {title: 'Măsurăm altarul', text: 'Venim în biserică și luăm dimensiunile.'},
      {title: 'Proiectul', text: 'Desenul, apoi estimarea prețului.'},
      {title: 'Execuția', text: 'Sculptură manuală, turnare și aurire.'},
      {title: 'Montajul', text: '[Text de confirmat]'},
    ],
  },
  nudge: {slug: 'usi', question: 'Și intrarea bisericii?', name: 'Uși', why: 'Din cupru turnat, cu sfinți în relief.'},
};

export const usiCopy = {
  hero: {title: 'Uși', subline: 'din cupru turnat, cu sfinți în relief', lead: 'Lucrate doar după proiect, pe măsura bisericii, fiecare cu icoanele ei: uși din cupru turnat, cu sfinți și scene în relief.'},
  place: 'Drobeta-Turnu Severin',
  /** The one model the client keeps (v6.2): the CMS model whose title has this word. */
  modelMatch: /cupru/i,
  model: {
    kicker: 'Modelul nostru', title: 'Uși din cupru',
    lead: 'Turnate din cupru, cu sfinți și scene în relief; fiecare ușă se face după proiect, pe măsura bisericii.',
    leadShort: 'Turnate din cupru, cu sfinți și scene în relief, pe măsura bisericii.',
    photos: 'Fotografii', all: 'Vedeți toate', allLabel: 'Vedeți toate cele {n} fotografii', more: 'fotografii', zoom: 'Măriți',
    material: 'Cupru', price: 'La comandă',
    text: 'Prețul depinde de complexitatea lucrării, de înălțime și lățime. Se lucrează doar după proiect, cu icoane individuale.',
    quality: 'Calitate garantată',
    example: 'Montate la Catedrala din Drobeta-Turnu Severin.',
    question: 'Vă place acest model?', call: 'Sunați', offer: 'Cereți o ofertă',
    own: {kicker: 'Al dumneavoastră', title: 'Ușa după desenul dumneavoastră', line: 'Pornim de la un desen și îl ajustăm împreună.'},
  },
  nudge: {slug: 'iconostase', question: 'Și altarul?', name: 'Iconostase', why: 'Din marmură și lemn aurit.'},
};
