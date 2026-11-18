import {fallbackList, ProjectPanel} from '@/components/works/project-panel';
import {worksData} from '@/components/works/works-page';
import {getProject} from '@/sanity/portfolio';
import {resolveCategory, stripInterceptionMarkers} from '@/sanity/portfolio-routes';

type Props = PageProps<'/[lang]/lucrarile-noastre/[category]/[project]'>;

// A work clicked anywhere on the site (Works wall, homepage map, service-page
// cards): the Project panel over the current page (v6.2).
export default async function InterceptedProject({params}: Props) {
  const {lang: langParam, category: categorySlug, project: rawSlug} = await params;
  const projectSlug = stripInterceptionMarkers(rawSlug);
  const {lang, category, dictionary} = await resolveCategory(langParam, categorySlug, `/${projectSlug}`);
  const [project, {works, categories}] = await Promise.all([getProject(lang, category._id, projectSlug), worksData(lang)]);
  if (!project) return null;
  const list = fallbackList(works, categories, category.slug!, lang, dictionary);
  return <ProjectPanel project={project} slug={projectSlug} mode="intercepted" list={list} lang={lang} dictionary={dictionary} />;
}
