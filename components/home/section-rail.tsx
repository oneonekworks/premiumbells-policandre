'use client';

import {useEffect, useState} from 'react';

/**
 * Desktop (≥ 1200px): a fixed column of dots on the right, one per home
 * section, hidden over the hero and fading in from the second section. The
 * active dot is teal-700 and slightly larger; labels show on hover or focus.
 */
export function SectionRail({sections, label}: {sections: {id: string; label: string}[]; label: string}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections.flatMap(({id}) => document.getElementById(id) ?? []);
    const observer = new IntersectionObserver((entries) => {
      const seen = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (seen) setActive(seen.target.id);
    }, {rootMargin: '-45% 0px -45% 0px'});
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const shown = active !== sections[0]?.id;
  return (
    <nav
      aria-label={label}
      inert={!shown}
      aria-hidden={!shown}
      className={`fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-(--duration-fade) min-[75rem]:block ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <ul className="flex flex-col items-end">
        {sections.map(({id, label: name}) => {
          const current = id === active;
          return (
            <li key={id}>
              <a href={`#${id}`} aria-current={current ? 'location' : undefined}
                className="group flex h-7 items-center justify-end gap-3 rounded-pill">
                <span className="pointer-events-none rounded-pill bg-surface px-3 py-1 text-caption font-medium text-ink opacity-0 shadow-e1 transition-opacity duration-(--duration-fade) group-hover:opacity-100 group-focus-visible:opacity-100">
                  {name}
                </span>
                <span className={`block size-2 rounded-pill transition-[transform,background-color] duration-(--duration-line) ${
                  current ? 'scale-125 bg-teal-700' : 'bg-ink/25 group-hover:bg-ink/50'
                }`} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
