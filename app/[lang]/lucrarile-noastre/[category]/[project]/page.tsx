import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {fallbackList, ProjectPanel} from '@/components/works/project-panel';
import {worksData, WorksPage} from '@/components/works/works-page';
import {photoAlt, subject} from '@/lib/alt';
import {languageAlternates, truncate} from '@/lib/seo';
import {sanityImageUrl} from '@/sanity/image';
import {getProject} from '@/sanity/portfolio';
import {projectPath, resolveCategory} from '@/sanity/portfolio-routes';

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

// No project page (v6.2): a direct visit or shared link renders Lucrările
// noastre filtered to the project's category with the Project panel open,
// server-rendered so the text and photos are indexable. Clicks from any page
// are intercepted by app/[lang]/@modal instead.
export default async function ProjectDirect({params, searchParams}: Props) {
  const {lang, category, project, projectSlug, dictionary} = await load(params);
  const {works, categories} = await worksData(lang);
  const list = fallbackList(works, categories, category.slug!, lang, dictionary);
  return (
    <WorksPage lang={lang} category={category.slug} searchParams={await searchParams}
      panel={<ProjectPanel project={project} slug={projectSlug} mode="embedded" list={list} lang={lang} dictionary={dictionary} />} />
  );
}
