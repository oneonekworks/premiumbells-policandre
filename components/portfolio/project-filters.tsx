'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode} from 'react';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {
  filtersHref, hasFilters, noFilters, SEARCH_MAX_LENGTH, type FilterOptions, type Filters,
} from '@/lib/portfolio-filters';

const TYPING_DELAY_MS = 350;

// Search field and filters above a category grid (`children`). The URL is the
// state: the server filters and renders the grid, and this component only
// navigates. Starting a search, choosing a filter, Enter and "Clear" push a
// history entry, so Back undoes them; further typing replaces that entry. Without JavaScript the GET form
// submits the same parameters. Phones: search on its own row, the two
// selects side by side below it.
export function ProjectFilters({basePath, filters, options, labels, result, children}: {
  basePath: string;
  filters: Filters;
  options: FilterOptions;
  labels: Dictionary['portfolio']['filters'];
  result: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(filters);
  const [text, setText] = useState(filters.query);
  // The search last sent by typing. A different query in the URL comes from
  // Back/Forward or a link, and replaces what is in the field.
  const [sent, setSent] = useState(filters.query);
  const [seen, setSeen] = useState(filters.query);
  if (filters.query !== seen) {
    setSeen(filters.query);
    if (filters.query !== sent) {
      setText(filters.query);
      setSent(filters.query);
    }
  }
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const navigate = (next: Filters, mode: 'push' | 'replace') => {
    clearTimeout(timer.current);
    setSent(next.query);
    startTransition(() => {
      setShown(next);
      router[mode](filtersHref(basePath, next), {scroll: false});
    });
  };

  const type = (value: string) => {
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // A project opened from the grid meanwhile: leave its URL alone.
      if (decodeURI(location.pathname) !== basePath) return;
      // Starting a search adds one history entry; refining it replaces that one.
      navigate({...shown, query: value.trim()}, shown.query ? 'replace' : 'push');
    }, TYPING_DELAY_MS);
  };

  const clear = () => {
    setText('');
    navigate(noFilters, 'push');
  };

  const field = 'min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-ink focus:border-teal-700';

  return (
    <>
      <form
        role="search"
        aria-label={labels.label}
        action={basePath}
        onSubmit={(event) => {
          event.preventDefault();
          navigate({...shown, query: text.trim()}, 'push');
        }}
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_12rem]"
      >
        <label className="col-span-2 flex flex-col gap-1 text-sm font-medium sm:col-span-1">
          {labels.search}
          <input
            type="search"
            name="cauta"
            value={text}
            onChange={(event) => type(event.target.value)}
            placeholder={labels.placeholder}
            maxLength={SEARCH_MAX_LENGTH}
            enterKeyHint="search"
            autoComplete="off"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.year}
          <select
            name="an"
            value={shown.year ?? ''}
            onChange={(event) => navigate({...shown, query: text.trim(), year: Number(event.target.value) || null}, 'push')}
            className={field}
          >
            <option value="">{labels.allYears}</option>
            {options.years.map((option) => (
              <option key={option.value} value={option.value}>{option.label} ({option.count})</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.county}
          <select
            name="judet"
            value={shown.county ?? ''}
            onChange={(event) => navigate({...shown, query: text.trim(), county: event.target.value || null}, 'push')}
            className={field}
          >
            <option value="">{labels.allCounties}</option>
            {options.counties.map((option) => (
              <option key={option.value} value={option.value}>{option.label} ({option.count})</option>
            ))}
          </select>
        </label>
        <button type="submit" className="sr-only">{labels.search}</button>
      </form>

      {/* Kept in the page while empty so screen readers announce new results. */}
      <div className={result ? 'mb-6 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2' : 'contents'}>
        <p aria-live="polite" className="text-ink-soft">{result}</p>
        {hasFilters(shown) && (
          <button type="button" onClick={clear} className="btn btn-secondary min-h-9 px-3 py-1 text-sm">{labels.clear}</button>
        )}
      </div>

      <div data-pending={pending || undefined} className="transition-opacity data-pending:opacity-60">{children}</div>
    </>
  );
}
