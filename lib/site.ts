// Company facts from the legacy footer and header. These move to the Sanity
// `siteSettings` singleton during schema expansion.
export const site = {
  name: 'Premium Bells',
  // Canonical origin for metadata; override per environment.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.policandre.ro',
  legalName: 'S.C. Premium Bells SRL',
  cui: '36422758',
  registration: 'J40/10836/12.08.2016',
  phone: {display: '+40 722 790 776', href: 'tel:+40722790776'},
  email: 'clopote.dl@gmail.com',
  social: [
    {name: 'Facebook', href: 'https://www.facebook.com/policandreprium'},
    {name: 'Instagram', href: 'https://www.instagram.com/clopote_premium/'},
  ],
} as const;
