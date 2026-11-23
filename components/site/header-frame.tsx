'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';

/**
 * Header v6: a floating white-glass pill from the first paint (no plain bar),
 * 16 px from the top (12 on phones). Once the page moves under it, it docks:
 * the stronger glass and shadow keep it readable over photos (v6.2). Scrolling
 * down quickly hides it, any scroll up brings it back (M07); never while a
 * menu is open, never for keyboard focus, never with reduced motion.
 * On Lucrările noastre (v6.3 fixed shelf, `data-works-shelf` on <html>) the
 * header keeps its at-rest look while scrolling, and on desktop it stays.
 */
export function HeaderFrame({children}: {children: ReactNode}) {
  const frame = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let last = scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY;
      const delta = y - last;
      last = y;
      const shelf = document.documentElement.hasAttribute('data-works-shelf');
      setDocked(y > 8 && !shelf);
      // An expanded control outside a closed dialog (the mobile menu keeps its
      // accordion state while closed, which used to keep the header from hiding).
      const menuOpen = [...frame.current?.querySelectorAll('[aria-expanded="true"]') ?? []]
        .some((control) => !control.closest('dialog:not([open])'));
      if (still.matches || menuOpen || y < 400 || (shelf && innerWidth >= 1200)) setHidden(false);
      else if (delta > 12) setHidden(true);
      else if (delta < -4) setHidden(false);
    };
    const onScroll = () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    };
    update();
    addEventListener('scroll', onScroll, {passive: true});
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // Docked bars under the header (the Works filter bar) follow it up.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-header-hidden', hidden);
  }, [hidden]);

  return (
    <div
      ref={frame}
      data-docked={docked || undefined}
      data-hidden={hidden || undefined}
      onFocusCapture={() => setHidden(false)}
      className="group/header pointer-events-auto relative isolate mx-auto flex h-15 max-w-(--container-header) items-center justify-between gap-4 rounded-pill pl-4.5 pr-2 transition-transform duration-(--duration-fade) ease-light data-hidden:-translate-y-[140%] lg:h-17 lg:pl-6 lg:pr-2.5"
    >
      {/* The glass is a layer behind the content, not the pill itself: an element
          with backdrop-filter stops its children (the mega menu) from blurring the page. */}
      <span aria-hidden="true" className={`absolute inset-0 -z-10 rounded-pill transition-[background-color,box-shadow] duration-(--duration-fade) ease-light ${
        docked ? 'glass-docked' : 'glass-light shadow-e2'
      }`} />
      {children}
    </div>
  );
}
