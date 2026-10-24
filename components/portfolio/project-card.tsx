import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {ProjectCard as ProjectCardData} from '@/sanity/portfolio';

export function projectMeta(
  project: Pick<ProjectCardData, 'location' | 'year' | 'displayDate'>,
  countries: Dictionary['countries'],
): string {
  const place = [project.location?.locality, project.location?.county].filter(Boolean).join(', ');
  const country = project.location?.country && project.location.country !== 'RO'
    ? countries[project.location.country] : null;
  return [place, country, project.displayDate ?? project.year].filter(Boolean).join(' · ');
}

// `scroll={false}` keeps the grid in place while the project opens as a
// slide-over; a direct visit to the same URL renders the full page.
export function ProjectCard({project, href, countries, priority = false}: {
  project: ProjectCardData; href: string; countries: Dictionary['countries']; priority?: boolean;
}) {
  return (
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
        <SanityImage
          image={project.coverImage}
          ratio={4 / 3}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 30vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-teal-900">
        <Link href={href} scroll={false} className="after:absolute after:inset-0 group-hover:text-teal-700">
          {project.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{projectMeta(project, countries)}</p>
      {project.summary && <p className="mt-2 line-clamp-2 leading-relaxed text-ink-soft">{project.summary}</p>}
    </article>
  );
}
