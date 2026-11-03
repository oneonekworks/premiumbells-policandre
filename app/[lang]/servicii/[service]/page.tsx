import type {Metadata} from 'next';
import {ServicePage, serviceMetadata} from '@/components/services/service-page';
import {resolveService} from '@/sanity/service-routes';

type Props = PageProps<'/[lang]/servicii/[service]'>;

async function load(params: Props['params']) {
  const {lang, service} = await params;
  return resolveService(lang, null, service);
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang, service} = await load(params);
  return serviceMetadata(lang, service);
}

export default async function ServiceRoute({params}: Props) {
  const {lang, service, dictionary} = await load(params);
  return <ServicePage lang={lang} service={service} dictionary={dictionary} />;
}
