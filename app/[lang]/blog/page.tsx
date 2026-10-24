import type {Metadata} from 'next';
import {ComingSoon} from '@/components/site/coming-soon';
import {currentDictionary} from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  return {title: (await currentDictionary()).nav.blog};
}

export default async function BlogPage() {
  const dictionary = await currentDictionary();
  return <ComingSoon title={dictionary.nav.blog} dictionary={dictionary} />;
}
