import {permanentRedirect} from 'next/navigation';
import {localizedHref} from '@/lib/i18n/routing';
import {servicesAnchor} from '@/lib/services';
import {routeLang} from '@/sanity/portfolio-routes';

// v6: no services hub (routes.md). /servicii is a permanent redirect to the
// homepage services section; every "Servicii" link points there.
export default async function ServicesRedirect({params}: PageProps<'/[lang]/servicii'>) {
  const lang = routeLang((await params).lang);
  permanentRedirect(`${localizedHref(lang, '/')}#${servicesAnchor}`);
}
