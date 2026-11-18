'use client';

import {useRef, useState, type ReactNode} from 'react';

// The Blog page below the breadcrumb (boards V6Blog, V6BlogMobile): H1 with
// the kind filter (a glass segmented control on desktop, a chip row on
// phones), the featured story preview of the newest post of that kind, then
// the other posts on the band, 3 columns (1 on phones), with "Arată mai
// multe". Everything is rendered on the server; the filter only picks which
// pieces show (no address change: the list is short).

export type BlogEntry = {id: string; kind: string | null; card: ReactNode; featured?: ReactNode};

const PAGE = 9;

export function BlogIndex({crumb, title, entries, kinds, labels}: {
  crumb: ReactNode;
  title: string;
  entries: BlogEntry[];
  /** The kinds that have posts, in order; the filter shows with two or more. */
  kinds: {id: string; label: string}[];
  labels: {filter: string; all: string; more: string};
}) {
  const [kind, setKind] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  // Cross-fade only after a choice, so the first paint (the LCP photo) is not delayed.
  const [chosen, setChosen] = useState(false);
  const fade = chosen ? 'works-fade' : '';
  const list = useRef<HTMLUListElement>(null);
  const filtered = kind ? entries.filter((entry) => entry.kind === kind) : entries;
  const [first, ...rest] = filtered;
  const visible = rest.slice(0, shown);

  const choose = (next: string | null) => {
    setKind(next);
    setShown(PAGE);
    setChosen(true);
  };
  const more = () => {
    const from = visible.length;
    setShown(shown + PAGE);
    // Keyboard users land on the first new card.
    requestAnimationFrame(() => list.current?.querySelectorAll<HTMLElement>(':scope > li > a')[from]?.focus());
  };

  const options = [{id: null, label: labels.all}, ...kinds];
  const filter = kinds.length > 1 ? (
    <div role="group" aria-label={labels.filter}>
      <div className="glass-light hidden gap-0.5 rounded-pill p-1 shadow-e1 lg:inline-flex">
        {options.map((option) => (
          <button key={option.id ?? 'all'} type="button" aria-pressed={kind === option.id} onClick={() => choose(option.id)}
            className="h-10 rounded-pill px-4 text-ui font-medium text-ink transition-colors duration-(--duration-line) hover:bg-teal-tint aria-pressed:bg-teal-900 aria-pressed:text-white">
            {option.label}
          </button>
        ))}
      </div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {options.map((option) => (
          <button key={option.id ?? 'all'} type="button" aria-pressed={kind === option.id} onClick={() => choose(option.id)}
            className="chip flex-none text-ui">
            {option.label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      <section className="m-hero pb-16 pt-7 lg:pb-28 lg:pt-11">
        <div className="mx-auto max-w-(--container-page) px-5 md:px-6">
          {crumb}
          <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <h1 className="font-display text-[4.5rem] font-medium leading-[0.98] tracking-[-0.015em] lg:text-[clamp(4.5rem,8vw,7.25rem)]">{title}</h1>
            {filter}
          </div>
          <div key={kind ?? 'all'} className={`${fade} -mx-5 mt-5 md:mx-0 lg:mt-22`}>{first?.featured}</div>
        </div>
      </section>

      {visible.length > 0 && (
        <section className="m-band px-5 pb-22 pt-16 md:px-0 lg:pb-34 lg:pt-28">
          <div className="mx-auto max-w-[86rem] md:px-6">
            <ul key={kind ?? 'all'} ref={list} className={`${fade} flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3`}>
              {visible.map((entry) => <li key={entry.id} className="flex">{entry.card}</li>)}
            </ul>
            {rest.length > visible.length && (
              <div className="mt-7 flex justify-center md:mt-14">
                <button type="button" onClick={more} className="btn btn-primary max-md:w-full">{labels.more}</button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
