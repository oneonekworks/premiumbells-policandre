import type {Metadata} from 'next';
import {WorksPage} from '@/components/works/works-page';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {languageAlternates} from '@/lib/seo';
import {routeLang, worksPath} from '@/sanity/portfolio-routes';

export async function generateMetadata({params}: PageProps<'/[lang]/lucrarile-noastre'>): Promise<Metadata> {
  const lang = routeLang((await params).lang);
  const t = getDictionary(lang).works6;
  return {
    title: t.title,
    alternates: languageAlternates(lang, {ro: worksPath, en: worksPath}),
  };
}

// Lucrările noastre, filter Toate (v6.2): one page with the filter bar.
export default async function WorksOverview({params, searchParams}: PageProps<'/[lang]/lucrarile-noastre'>) {
  const lang = routeLang((await params).lang);
  return <WorksPage lang={lang} category={null} searchParams={await searchParams} />;
}
