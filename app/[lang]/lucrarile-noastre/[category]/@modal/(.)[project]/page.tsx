import type {Metadata} from 'next';
import {FromBlog} from '@/components/blog/from-blog';
import {ProjectDetails} from '@/components/portfolio/project-details';
import {ProjectModal} from '@/components/portfolio/project-modal';
import {getProject} from '@/sanity/portfolio';
import {resolveCategory, stripInterceptionMarkers} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/lucrarile-noastre/[category]/[project]'>;

async function load(params: Props['params']) {
  const {lang: langParam, category: categorySlug, project: rawSlug} = await params;
  const projectSlug = stripInterceptionMarkers(rawSlug);
  const resolved = await resolveCategory(langParam, categorySlug, `/${projectSlug}`);
  return {...resolved, project: await getProject(resolved.lang, resolved.category._id, projectSlug)};
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {project} = await load(params);
  return project?.title ? {title: project.title} : {};
}

// Intercepted soft navigation from the category grid: the same project content
// as the full page, inside a slide-over that keeps the grid underneath.
export default async function ProjectModalPage({params}: Props) {
  const {lang, category, dictionary, project} = await load(params);
  if (!project) return null;

  return (
    <ProjectModal title={project.title ?? ''} closeLabel={dictionary.portfolio.close}>
      <ProjectDetails project={project} category={category.title ?? ''} dictionary={dictionary} headingLevel="h2" />
      <div className="mt-12">
        <FromBlog id={project._id} lang={lang} dictionary={dictionary} columns={2} />
      </div>
    </ProjectModal>
  );
}
