'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';

/**
 * The header's moving part. At the top of the page it is a plain bar on the
 * ground; after 80px it becomes the floating white-glass pill (M06). Scrolling
 * down quickly hides the pill and any scroll up brings it back (M07), never
 * while a submenu is open. Reduced motion keeps it visible.
 */
export function HeaderFrame({children}: {children: ReactNode}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
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
      setScrolled(y > 80);
      const menuOpen = Boolean(frame.current?.querySelector('[aria-expanded="true"]'));
      if (still.matches || menuOpen || y < 400) setHidden(false);
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

  return (
    <div
      ref={frame}
      data-scrolled={scrolled || undefined}
      data-hidden={hidden || undefined}
      onFocusCapture={() => setHidden(false)}
      className="group/header relative mx-auto flex h-16 max-w-page items-center justify-between gap-4 border border-transparent bg-ground px-5 transition-[max-width,margin,padding,border-radius,box-shadow,background-color,transform] duration-(--duration-fade) ease-light md:px-8 lg:h-header lg:px-14 data-hidden:-translate-y-[130%] data-scrolled:mx-3 data-scrolled:mt-3 data-scrolled:max-w-(--container-header) data-scrolled:rounded-pill data-scrolled:bg-white/72 data-scrolled:border-white/90 data-scrolled:pl-5 data-scrolled:pr-2 data-scrolled:shadow-e2 data-scrolled:backdrop-blur-[16px] data-scrolled:backdrop-saturate-[1.2] lg:data-scrolled:mx-auto lg:data-scrolled:mt-4 lg:data-scrolled:h-16 lg:data-scrolled:pl-6"
    >
      {children}
    </div>
  );
}
