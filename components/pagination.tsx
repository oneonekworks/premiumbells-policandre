import Link from 'next/link';
import type {Dictionary} from '@/lib/i18n/dictionaries';

export function Pagination({page, total, pageSize, basePath, labels}: {
  page: number; total: number; pageSize: number; basePath: string; labels: Dictionary['pagination'];
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages < 2) return null;
  const href = (target: number) => (target === 1 ? basePath : `${basePath}?pagina=${target}`);
  return (
    <nav aria-label={labels.label} className="flex flex-wrap items-center justify-center gap-4 py-10">
      {page > 1 && <Link className="btn btn-secondary" href={href(page - 1)}>{labels.previous}</Link>}
      <span className="text-ink-soft">{labels.page} {page} {labels.of} {pages}</span>
      {page < pages && <Link className="btn btn-secondary" href={href(page + 1)}>{labels.next}</Link>}
    </nav>
  );
}
