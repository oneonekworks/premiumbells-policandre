import {PortableText, type PortableTextComponents} from 'next-sanity';
import {photoAlt, subject} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {ProjectDetail} from '@/sanity/portfolio';
import {Gallery} from './gallery';
import {projectMeta} from './project-card';
import {VideoEmbed} from './video-embed';

// Allow-listed rich text: paragraphs, one subheading level, lists, links.
const portableText: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="leading-relaxed">{children}</p>,
    h3: ({children}) => <h3 className="pt-2 font-display text-2xl font-semibold text-teal-900">{children}</h3>,
  },
  list: {
    bullet: ({children}) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
    number: ({children}) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  },
  marks: {
    link: ({value, children}) => {
      const href = (value as {href?: string})?.href ?? '';
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} className="text-teal-700 underline underline-offset-2" {...(external ? {rel: 'noopener', target: '_blank'} : {})}>
          {children}
        </a>
      );
    },
  },
};

// Shared by the slide-over and the full project page; only the heading level
// and spacing differ.
export function ProjectDetails({project, category, dictionary, headingLevel}: {
  project: ProjectDetail;
  category: string;
  dictionary: Dictionary;
  headingLevel: 'h1' | 'h2';
}) {
  const {portfolio} = dictionary;
  const Heading = headingLevel;
  const meta = projectMeta(project, dictionary.countries);
  const videos = project.videos ?? [];
  const specifications = project.specifications ?? [];
  const described = subject(project.title, project.location?.locality);
  const gallery = (project.gallery ?? []).map((image, index, all) => ({
    ...image,
    alt: photoAlt(image, described, {index, total: all.length, template: portfolio.photoOf}),
  }));

  return (
    <article className="space-y-10">
      <header>
        <p className="eyebrow">{category}</p>
        <Heading className="mt-3 font-display text-4xl font-semibold leading-tight text-teal-900 sm:text-5xl">{project.title}</Heading>
        {meta && <p className="mt-3 text-ink-soft">{meta}</p>}
        {project.summary && <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed">{project.summary}</p>}
      </header>

      {videos.length > 0 && (
        <section aria-label={portfolio.videos} className="grid gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <VideoEmbed key={video._key} video={video} playLabel={portfolio.playVideo} />
          ))}
        </section>
      )}

      {(project.body?.length || specifications.length > 0) && (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {project.body?.length ? (
            <div className="max-w-3xl space-y-4"><PortableText value={project.body} components={portableText} /></div>
          ) : <div />}
          {specifications.length > 0 && (
            <section className="rounded-lg border border-line bg-white p-5">
              <h2 className="eyebrow">{portfolio.specifications}</h2>
              <dl className="mt-4 divide-y divide-line">
                {specifications.map((item) => (
                  <div key={item._key} className="flex justify-between gap-4 py-2 text-sm">
                    <dt className="text-ink-soft">{item.label}</dt>
                    <dd className="text-right font-medium">{[item.value, item.unit].filter(Boolean).join(' ')}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}

      {gallery.length ? (
        <section>
          <h2 className="mb-5 font-display text-3xl font-semibold text-teal-900">
            {portfolio.gallery} <span className="text-lg font-normal text-ink-soft">({gallery.length})</span>
          </h2>
          <Gallery images={gallery} labels={portfolio} />
        </section>
      ) : null}
    </article>
  );
}
