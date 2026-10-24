import Link from 'next/link';

export function Pagination({page, total, pageSize, basePath}: {
  page: number; total: number; pageSize: number; basePath: string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages < 2) return null;
  return (
    <nav aria-label="Paginare" className="flex flex-wrap items-center justify-center gap-4 py-8">
      {page > 1 && <Link className="btn btn-secondary" prefetch={false} href={`${basePath}?pagina=${page - 1}`}>Înapoi</Link>}
      <span>Pagina {page} din {pages}</span>
      {page < pages && <Link className="btn btn-secondary" prefetch={false} href={`${basePath}?pagina=${page + 1}`}>Înainte</Link>}
    </nav>
  );
}
