import type {Metadata} from 'next';
import Link from 'next/link';
import {ComingSoon} from '@/components/site/coming-soon';
import {currentDictionary, currentLang} from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  return {title: (await currentDictionary()).nav.works};
}

export default async function WorksPage() {
  const [lang, dictionary] = await Promise.all([currentLang(), currentDictionary()]);
  return (
    <ComingSoon title={dictionary.nav.works} dictionary={dictionary}>
      {/* The publishing prototype is Romanian-only. */}
      {lang === 'ro' && (
        <Link href="/prototip/portofoliu" className="btn btn-secondary">
          {dictionary.comingSoon.portfolioLink}
        </Link>
      )}
    </ComingSoon>
  );
}
