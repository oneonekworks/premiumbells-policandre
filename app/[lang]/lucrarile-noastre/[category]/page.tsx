import type {Metadata} from 'next';
import {WorksPage, worksLead} from '@/components/works/works-page';
import {languageAlternates, truncate} from '@/lib/seo';
import {categoryPath, resolveCategory} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/lucrarile-noastre/[category]'>;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang: langParam, category: slug} = await params;
  const {lang, category, dictionary} = await resolveCategory(langParam, slug);
  return {
    title: category.seo?.title ?? `${category.title} · ${dictionary.works6.title}`,
    description: category.seo?.description ?? truncate(category.summary) ?? await worksLead(lang),
    alternates: languageAlternates(lang, {
      ro: category.slugs.ro && categoryPath(category.slugs.ro),
      en: category.slugs.en && categoryPath(category.slugs.en),
    }),
    ...(category.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

// The same Works page with the craft chip on (the first category of a craft
// shows the whole craft; any other category only itself).
export default async function CategoryWorks({params, searchParams}: Props) {
  const {lang: langParam, category: slug} = await params;
  const {lang, category} = await resolveCategory(langParam, slug);
  return <WorksPage lang={lang} category={category.slug} searchParams={await searchParams} />;
}
