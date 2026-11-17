import type {Metadata} from 'next';
import {IconostasePage} from '@/components/services/pages/iconostase';
import {ServicePage, serviceMetadata} from '@/components/services/service-page';
import {getService} from '@/sanity/services';
import {resolveService} from '@/sanity/service-routes';

type Props = PageProps<'/[lang]/servicii/[service]/[variant]'>;

// A variant only exists under its own parent (/servicii/clopote/fara-balans);
// anywhere else it is a 404. The Iconostase materials are no pages of their
// own any more: their addresses render Iconostase with the material's
// Lightbox open (routes.md).
const layerParents = new Set(['iconostase']);

async function load(params: Props['params']) {
  const {lang, service, variant} = await params;
  return resolveService(lang, service, variant);
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang, service} = await load(params);
  return serviceMetadata(lang, service);
}

export default async function VariantRoute({params}: Props) {
  const {lang, service, dictionary} = await load(params);
  const parentSlug = service.parent?.slugs.ro;
  if (parentSlug && layerParents.has(parentSlug)) {
    const parent = await getService(lang, null, service.parent!.slug!);
    if (parent) return <IconostasePage lang={lang} service={parent} dictionary={dictionary} material={service.slugs.ro} />;
  }
  return <ServicePage lang={lang} service={service} dictionary={dictionary} />;
}
