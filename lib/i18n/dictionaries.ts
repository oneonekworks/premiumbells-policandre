import type {Lang} from './routing';

// Fixed interface strings only. Navigation labels and marketing copy move to
// Sanity (navigation, siteSettings, homePage) during schema expansion.
const ro = {
  skipToContent: 'Sari la conținut',
  nav: {
    label: 'Navigare principală',
    home: 'Acasă',
    services: 'Servicii',
    works: 'Lucrările noastre',
    blog: 'Blog',
  },
  menu: {open: 'Deschide meniul', close: 'Închide meniul', title: 'Meniu'},
  contact: {call: 'Sunați-ne', email: 'Scrieți-ne', heading: 'Contact'},
  language: {label: 'Limba', ro: 'Română', en: 'English'},
  countries: {RO: 'România', MD: 'Republica Moldova'},
  portfolio: {
    categories: 'Categorii de lucrări',
    projects: ['lucrare', 'lucrări', 'de lucrări'],
    photos: ['fotografie', 'fotografii', 'de fotografii'],
    photoOf: 'fotografia {index} din {total}',
    empty: 'Nu există încă lucrări publicate în această categorie.',
    emptyPortfolio: 'Nu există încă lucrări publicate.',
    open: 'Vezi lucrarea',
    close: 'Închide',
    backTo: 'Înapoi la',
    gallery: 'Fotografii',
    videos: 'Video',
    specifications: 'Detalii tehnice',
    showMore: 'Arată mai multe fotografii',
    playVideo: 'Redă videoclipul',
    lightbox: {
      label: 'Galerie foto',
      open: 'Mărește fotografia',
      previous: 'Fotografia anterioară',
      next: 'Fotografia următoare',
      close: 'Închide galeria',
      thumbnails: 'Miniaturi',
      of: 'din',
    },
  },
  pagination: {label: 'Paginare', previous: 'Înapoi', next: 'Înainte', page: 'Pagina', of: 'din'},
  footer: {
    tagline: 'Policandre, clopote și iconostase pentru biserici ortodoxe, alese și montate cu grijă.',
    navigation: 'Navigare',
    company: 'Companie',
    social: 'Urmăriți-ne',
    registration: 'Reg. Com.',
    rights: 'Toate drepturile rezervate.',
  },
  home: {
    eyebrow: 'Premium Bells',
    title: 'Policandre, clopote și iconostase pentru biserici ortodoxe',
    lead: 'Lucrăm cu turnătorii și ateliere din Rusia și Grecia și montăm lucrările în biserici din România și Republica Moldova.',
    primary: 'Vezi lucrările',
    secondary: 'Sunați-ne',
    servicesHeading: 'Ce realizăm',
    services: [
      {title: 'Policandre', text: 'Policandre turnate, de la un nivel la șapte, aurite sau lăcuite.'},
      {title: 'Clopote', text: 'Clopote cu jug sau fără balans, turnate la comandă.'},
      {title: 'Recondiționări', text: 'Restaurarea policandrelor și clopotelor existente.'},
      {title: 'Automatizări', text: 'Acționare automată și clopotar electronic pentru clopote fixe.'},
    ],
  },
  comingSoon: {
    title: 'Pagină în pregătire',
    text: 'Această secțiune este reconstruită și va fi publicată în curând.',
  },
  notFound: {
    title: 'Pagina nu a fost găsită.',
    text: 'Adresa poate fi greșită sau pagina a fost mutată.',
    back: 'Înapoi la prima pagină',
  },
};

export type Dictionary = typeof ro;

const en: Dictionary = {
  skipToContent: 'Skip to content',
  nav: {
    label: 'Main navigation',
    home: 'Home',
    services: 'Services',
    works: 'Our work',
    blog: 'Blog',
  },
  menu: {open: 'Open menu', close: 'Close menu', title: 'Menu'},
  contact: {call: 'Call us', email: 'Email us', heading: 'Contact'},
  language: {label: 'Language', ro: 'Română', en: 'English'},
  countries: {RO: 'Romania', MD: 'Moldova'},
  portfolio: {
    categories: 'Work categories',
    projects: ['project', 'projects', 'projects'],
    photos: ['photo', 'photos', 'photos'],
    photoOf: 'photo {index} of {total}',
    empty: 'No projects have been published in this category yet.',
    emptyPortfolio: 'No projects have been published yet.',
    open: 'View project',
    close: 'Close',
    backTo: 'Back to',
    gallery: 'Photos',
    videos: 'Video',
    specifications: 'Technical details',
    showMore: 'Show more photos',
    playVideo: 'Play video',
    lightbox: {
      label: 'Photo gallery',
      open: 'Enlarge photo',
      previous: 'Previous photo',
      next: 'Next photo',
      close: 'Close gallery',
      thumbnails: 'Thumbnails',
      of: 'of',
    },
  },
  pagination: {label: 'Pagination', previous: 'Previous', next: 'Next', page: 'Page', of: 'of'},
  footer: {
    tagline: 'Chandeliers, bells and iconostases for Orthodox churches, carefully chosen and installed.',
    navigation: 'Navigation',
    company: 'Company',
    social: 'Follow us',
    registration: 'Trade Reg.',
    rights: 'All rights reserved.',
  },
  home: {
    eyebrow: 'Premium Bells',
    title: 'Chandeliers, bells and iconostases for Orthodox churches',
    lead: 'We work with foundries and workshops in Russia and Greece and install their work in churches across Romania and Moldova.',
    primary: 'See our work',
    secondary: 'Call us',
    servicesHeading: 'What we make',
    services: [
      {title: 'Chandeliers', text: 'Cast church chandeliers from one to seven tiers, gilded or lacquered.'},
      {title: 'Bells', text: 'Swinging bells with yoke or fixed bells, cast to order.'},
      {title: 'Restoration', text: 'Restoring existing chandeliers and bells.'},
      {title: 'Automation', text: 'Automatic ringing and electronic chimes for fixed bells.'},
    ],
  },
  comingSoon: {
    title: 'Page in preparation',
    text: 'This section is being rebuilt and will be published soon.',
  },
  notFound: {
    title: 'Page not found.',
    text: 'The address may be wrong or the page may have moved.',
    back: 'Back to the home page',
  },
};

const dictionaries: Record<Lang, Dictionary> = {ro, en};

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}
