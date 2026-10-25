import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ProjectDetails} from '@/components/portfolio/project-details';
import {photoAlt, subject} from '@/lib/alt';
import {sanityImageUrl} from '@/sanity/image';
import {localizedHref} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {getProject} from '@/sanity/portfolio';
import {categoryPath, projectPath, resolveCategory, worksPath} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/lucrarile-noastre/[category]/[project]'>;

async function load(params: Props['params']) {
  const {lang: langParam, category: categorySlug, project: projectSlug} = await params;
  const resolved = await resolveCategory(langParam, categorySlug, `/${projectSlug}`);
  const project = await getProject(resolved.lang, resolved.category._id, projectSlug);
  if (!project) notFound();
  return {...resolved, project, projectSlug};
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang, category, project, projectSlug} = await load(params);
  const share = project.seo?.shareImage ?? project.coverImage;
  const image = share ? sanityImageUrl(share, 1200, 630) : undefined;
  return {
    title: project.seo?.title ?? project.title,
    description: project.seo?.description ?? truncate(project.summary),
    alternates: languageAlternates(lang, {
      ro: category.slugs.ro && projectPath(category.slugs.ro, projectSlug),
      en: category.slugs.en && project.publishedLanguages?.includes('en') ? projectPath(category.slugs.en, projectSlug) : null,
    }),
    openGraph: {
      title: project.title ?? undefined,
      description: truncate(project.summary),
      images: image && share
        ? [{url: image, width: 1200, height: 630, alt: photoAlt(share, subject(project.title, project.location?.locality))}]
        : undefined,
    },
    ...(project.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

// Direct visits and refreshes render the complete page; client navigation
// from the grid is intercepted by @modal/(.)[project] instead.
export default async function ProjectPage({params}: Props) {
  const {lang, category, project, dictionary} = await load(params);
  const categoryHref = localizedHref(lang, categoryPath(category.slug!));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href={localizedHref(lang, worksPath)} className="hover:text-teal-700">{dictionary.nav.works}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={categoryHref} className="hover:text-teal-700">{category.title}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{project.title}</li>
        </ol>
      </nav>
      <ProjectDetails project={project} category={category.title ?? ''} dictionary={dictionary} headingLevel="h1" />
      <p className="mt-14">
        <Link href={categoryHref} className="btn btn-secondary">
          {dictionary.portfolio.backTo} {category.title}
        </Link>
      </p>
    </>
  );
}
