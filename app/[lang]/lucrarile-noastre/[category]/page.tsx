import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Pagination} from '@/components/pagination';
import {ProjectCard} from '@/components/portfolio/project-card';
import {plural} from '@/lib/i18n/format';
import {localizedHref} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {pageNumber, PROJECT_PAGE_SIZE} from '@/sanity/pagination';
import {getCategoryProjects} from '@/sanity/portfolio';
import {categoryPath, projectPath, resolveCategory} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/lucrarile-noastre/[category]'>;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang: langParam, category: slug} = await params;
  const {lang, category} = await resolveCategory(langParam, slug);
  return {
    title: category.seo?.title ?? category.title,
    description: category.seo?.description ?? truncate(category.summary),
    alternates: languageAlternates(lang, {
      ro: category.slugs.ro && categoryPath(category.slugs.ro),
      en: category.slugs.en && categoryPath(category.slugs.en),
    }),
    ...(category.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

export default async function CategoryPage({params, searchParams}: Props) {
  const {lang: langParam, category: slug} = await params;
  const {lang, category, dictionary} = await resolveCategory(langParam, slug);
  const page = pageNumber((await searchParams).pagina);
  const projects = await getCategoryProjects(lang, category._id, page);
  if (page > 1 && !projects.items.length) notFound();

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-5xl font-semibold leading-tight text-teal-900 sm:text-6xl">{category.title}</h1>
        <p className="mt-2 text-ink-soft">{plural(lang, projects.total, dictionary.portfolio.projects)}</p>
        {category.summary && <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed">{category.summary}</p>}
      </header>

      {projects.items.length === 0 ? (
        <p className="rounded-lg border border-line p-6">{dictionary.portfolio.empty}</p>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {projects.items.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              href={localizedHref(lang, projectPath(category.slug!, project.slug!))}
              countries={dictionary.countries}
              priority={index < 3}
            />
          ))}
        </div>
      )}
      <Pagination
        page={page}
        total={projects.total}
        pageSize={PROJECT_PAGE_SIZE}
        basePath={localizedHref(lang, categoryPath(category.slug!))}
        labels={dictionary.pagination}
      />
    </>
  );
}
