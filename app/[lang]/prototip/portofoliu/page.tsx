import Link from 'next/link';
import {notFound} from 'next/navigation';
import {client} from '@/sanity/client';
import {PORTFOLIO_PAGE_QUERY, PROJECTS_QUERY} from '@/sanity/queries';
import type {PORTFOLIO_PAGE_QUERY_RESULT, PROJECTS_QUERY_RESULT} from '@/sanity/types';
import {pageNumber, PROJECT_PAGE_SIZE} from '@/sanity/pagination';
import {SanityImage} from '@/components/sanity-image';
import {Pagination} from '@/components/pagination';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage({searchParams}: {
  searchParams: Promise<{pagina?: string | string[]}>;
}) {
  const page = pageNumber((await searchParams).pagina);
  const [copy, projects] = await Promise.all([
    client.fetch<PORTFOLIO_PAGE_QUERY_RESULT>(PORTFOLIO_PAGE_QUERY, {lang: 'ro'}, {cache: 'no-store'}),
    client.fetch<PROJECTS_QUERY_RESULT>(PROJECTS_QUERY, {lang: 'ro', start: (page - 1) * PROJECT_PAGE_SIZE, end: page * PROJECT_PAGE_SIZE}, {cache: 'no-store'}),
  ]);
  if (page > 1 && !projects.items.length) notFound();

  return (
    <>
      <p className="eyebrow mb-4">Lucrări și detalii</p>
      <h1 className="max-w-3xl font-display font-semibold text-teal-900 text-4xl leading-tight sm:text-6xl">{copy?.title ?? 'Lucrările noastre'}</h1>
      {copy?.intro && <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed">{copy.intro}</p>}
      {!projects.items.length ? (
        <p className="my-12 rounded-lg border border-line p-6">Nu există încă lucrări publicate.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.items.map((project) => (
            <article key={project._id}>
              <Link className="group block" href={`/prototip/portofoliu/${project.slug}`} prefetch={false}>
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-stone">
                  <SanityImage image={project.coverImage} cover />
                </div>
                <p className="mb-2 text-sm">{[project.category, project.location?.locality].filter(Boolean).join(' · ')}</p>
                <h2 className="font-display font-semibold text-teal-900 text-2xl group-hover:underline">{project.title}</h2>
              </Link>
              {project.summary && <p className="mt-3 line-clamp-3 leading-relaxed">{project.summary}</p>}
            </article>
          ))}
        </div>
      )}
      <Pagination page={page} total={projects.total} pageSize={PROJECT_PAGE_SIZE} basePath="/prototip/portofoliu" />
    </>
  );
}
