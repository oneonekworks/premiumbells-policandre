import {redirect} from 'next/navigation';
import {WorksPage, worksData} from '@/components/works/works-page';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {localizedHref} from '@/lib/i18n/routing';
import {defaultCategory, parseWorksState, worksHref} from '@/lib/works';
import {routeLang, worksPath} from '@/sanity/portfolio-routes';

// Lucrările noastre has no "Toate" view (client, 2026-11-23): the address opens
// Policandre, or the first craft with works for a place / search it carries
// (homepage map links: ?tara=md). Temporary (307), since the target follows the content.
export default async function WorksOverview({params, searchParams}: PageProps<'/[lang]/lucrarile-noastre'>) {
  const lang = routeLang((await params).lang);
  const {works, categories} = await worksData(lang);
  const state = parseWorksState(null, await searchParams);
  const category = defaultCategory(works, state, categories, getDictionary(lang).countries);
  // A language with no categories yet keeps the plain page.
  if (!category) return <WorksPage lang={lang} category={null} searchParams={await searchParams} />;
  redirect(worksHref(localizedHref(lang, worksPath), {...state, category}));
}
