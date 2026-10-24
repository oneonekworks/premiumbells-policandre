import Link from 'next/link';
import {notFound} from 'next/navigation';
import {client} from '@/sanity/client';
import {PROJECT_QUERY} from '@/sanity/queries';
import {GALLERY_PAGE_SIZE, pageNumber} from '@/sanity/pagination';
import {SanityImage} from '@/components/sanity-image';
import {Pagination} from '@/components/pagination';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({params, searchParams}: {
  params: Promise<{slug: string}>;
  searchParams: Promise<{pagina?: string | string[]}>;
}) {
  const {slug} = await params;
  const page = pageNumber((await searchParams).pagina);
  const project = await client.fetch(PROJECT_QUERY, {
    slug, start: (page - 1) * GALLERY_PAGE_SIZE, end: page * GALLERY_PAGE_SIZE,
  }, {cache: 'no-store'});
  if (!project || (page > 1 && !project.gallery?.length)) notFound();

  return (
    <article>
      <Link className="mb-8 inline-flex min-h-11 items-center underline" href="/prototip/portofoliu">← Toate lucrările</Link>
      <p className="mb-3 text-sm uppercase tracking-widest">{project.category}</p>
      <h1 className="max-w-3xl font-display font-semibold text-teal-900 text-4xl leading-tight sm:text-6xl">{project.title}</h1>
      <p className="mt-4">{[project.location?.locality, project.location?.county, project.location?.country].filter(Boolean).join(', ')}</p>
      <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed">{project.summary}</p>
      <h2 className="mb-6 mt-12 font-display font-semibold text-teal-900 text-3xl">Fotografii ({project.imageCount ?? 0})</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {project.gallery?.map((image) => (
          <figure key={image._key}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
              <SanityImage image={image} />
            </div>
            {image.caption && <figcaption className="mt-3 text-sm leading-relaxed">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Pagination page={page} total={project.imageCount ?? 0} pageSize={GALLERY_PAGE_SIZE} basePath={`/prototip/portofoliu/${encodeURIComponent(slug)}`} />
    </article>
  );
}
