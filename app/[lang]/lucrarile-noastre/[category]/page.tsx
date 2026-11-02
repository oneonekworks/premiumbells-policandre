import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Pagination} from '@/components/pagination';
import {ProjectCard} from '@/components/portfolio/project-card';
import {ProjectFilters} from '@/components/portfolio/project-filters';
import {plural} from '@/lib/i18n/format';
import {localizedHref} from '@/lib/i18n/routing';
import {applyFilters, filterOptions, filtersHref, hasFilters, parseFilters} from '@/lib/portfolio-filters';
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
  const query = await searchParams;
  // One cached read of every card; search, filters and pages are applied here.
  const projects = await getCategoryProjects(lang, category._id);
  const options = filterOptions(projects, dictionary.countries);
  const filters = parseFilters(query, options);
  const matches = applyFilters(projects, filters, dictionary.countries);
  const page = pageNumber(query.pagina);
  const items = matches.slice((page - 1) * PROJECT_PAGE_SIZE, page * PROJECT_PAGE_SIZE);
  if (page > 1 && !items.length) notFound();
  const basePath = localizedHref(lang, categoryPath(category.slug!));
  const {filters: labels} = dictionary.portfolio;
  const total = plural(lang, projects.length, dictionary.portfolio.projects);

  const grid = items.length === 0 ? (
    <p className="rounded-lg border border-line p-6">{hasFilters(filters) ? labels.noResults : dictionary.portfolio.empty}</p>
  ) : (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((project, index) => (
        <ProjectCard
          key={project._id}
          project={project}
          href={localizedHref(lang, projectPath(category.slug!, project.slug!))}
          countries={dictionary.countries}
          priority={index < 3}
        />
      ))}
    </div>
  );

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-5xl font-semibold leading-tight text-teal-900 sm:text-6xl">{category.title}</h1>
        <p className="mt-2 text-ink-soft">{total}</p>
        {category.summary && <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed">{category.summary}</p>}
      </header>

      {projects.length === 0 ? grid : (
        <ProjectFilters
          basePath={basePath}
          filters={filters}
          options={options}
          labels={labels}
          result={hasFilters(filters)
            ? labels.results.replace('{count}', String(matches.length)).replace('{total}', total)
            : null}
        >
          {grid}
          <Pagination
            page={page}
            total={matches.length}
            pageSize={PROJECT_PAGE_SIZE}
            href={(target) => filtersHref(basePath, filters, target)}
            labels={dictionary.pagination}
          />
        </ProjectFilters>
      )}
    </>
  );
}
