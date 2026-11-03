import type {Metadata} from 'next';
import {ServicePage, serviceMetadata} from '@/components/services/service-page';
import {resolveService} from '@/sanity/service-routes';

type Props = PageProps<'/[lang]/servicii/[service]/[variant]'>;

// A variant only exists under its own parent (/servicii/clopote/cu-jug);
// anywhere else it is a 404.
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
  return <ServicePage lang={lang} service={service} dictionary={dictionary} />;
}
