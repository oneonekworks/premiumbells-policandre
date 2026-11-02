import Link from 'next/link';
import type {Dictionary} from '@/lib/i18n/dictionaries';

// `href` builds each page's URL, so other query parameters (filters) are kept.
export function Pagination({page, total, pageSize, href, labels}: {
  page: number; total: number; pageSize: number; href: (page: number) => string; labels: Dictionary['pagination'];
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages < 2) return null;
  return (
    <nav aria-label={labels.label} className="flex flex-wrap items-center justify-center gap-4 py-10">
      {page > 1 && <Link className="btn btn-secondary" href={href(page - 1)}>{labels.previous}</Link>}
      <span className="text-ink-soft">{labels.page} {page} {labels.of} {pages}</span>
      {page < pages && <Link className="btn btn-secondary" href={href(page + 1)}>{labels.next}</Link>}
    </nav>
  );
}
