'use client';

import Link from 'next/link';
import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {Metal} from '@/lib/shell';
import type {SanityImageValue} from '@/sanity/image';

export type TriptychSlice = {
  key: string;
  /** The service's short name: slice label and open title. */
  title: string;
  /** The word as it reads in the headline ("clopote"). */
  word: string;
  metal: Metal;
  href: string;
  line: string | null;
  cta: string;
  image: SanityImageValue | null;
};

const ROTATE_MS = 6000;
const FIRST_STEP_MS = 1200;

/**
 * The v6 hero (boards V6HomeDesktop, V6HomeMobileA): the headline in material
 * words, each linked to its service, with the teal italic line; then one panel
 * of three photo slices (slanted columns on desktop, stacked bands on 8° seams
 * on phones). A slice opens (2 : 1 : 1) on hover or focus of the slice or its
 * word; on load Clopote is open, then the slices rotate every 6 s. The first
 * hover or focus stops the rotation for good; the pause pill restarts it
 * (WCAG 2.2.2). Rotation pauses off screen and in a hidden tab. Reduced
 * motion: equal slices, no rotation, no pill.
 */
export function Triptych({slices, joiner, highlight, labels}: {
  slices: TriptychSlice[];
  /** Separators between the words: ", " and " și ". */
  joiner: [string, string];
  /** Teal italic line inside the headline. */
  highlight: string | null;
  labels: {pause: string; play: string};
}) {
  const [open, setOpen] = useState<number | null>(slices.length > 1 ? 1 : 0);
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(false);
  const [visible, setVisible] = useState(true);
  const panel = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setStill(query.matches);
      if (query.matches) setOpen(null);
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const running = playing && visible && !still && slices.length > 1;
  useEffect(() => {
    if (!running) return;
    const delay = started.current ? ROTATE_MS : FIRST_STEP_MS;
    const timer = setTimeout(() => {
      started.current = true;
      setOpen((current) => (current === null || current === 1 && delay === FIRST_STEP_MS ? 0 : (current + 1) % slices.length));
    }, delay);
    return () => clearTimeout(timer);
  }, [running, open, slices.length]);

  /** A visitor chose a slice: open it and stop the rotation for good. */
  const choose = useCallback((index: number) => {
    setOpen(index);
    setPlaying(false);
    started.current = true;
  }, []);

  const last = slices.length - 1;

  return (
    <>
      <h1 id="home-title" className="mt-4 font-display text-[2.875rem] leading-[1.02] tracking-[-0.015em] text-ink md:mt-5 md:text-hero md:leading-none lg:whitespace-nowrap">
        {slices.map((slice, index) => (
          <span key={slice.key}>
            {index === 1 ? joiner[0] : index === 2 ? joiner[1] : null}
            <Link href={slice.href} onMouseEnter={() => choose(index)} onFocus={() => choose(index)}
              data-on={open === index ? '' : undefined} className={`mw mw-${slice.metal}`}>
              {slice.word}
            </Link>
          </span>
        ))}
        {highlight && (
          <span className="mt-3 block text-[1.75rem] italic leading-[1.15] text-teal-700 md:mt-3.5 md:text-[0.64em] md:leading-[1.1]">{highlight}</span>
        )}
      </h1>

      <div className="mt-8 px-3 md:mt-12 md:px-4">
        <div ref={panel}
          className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[1.5rem] bg-teal-950 text-left shadow-e3 lg:h-[clamp(520px,44vw,640px)] lg:rounded-hero">
          <div className="flex flex-col lg:absolute lg:inset-y-0 lg:-inset-x-16 lg:flex-row lg:gap-1.5">
            {slices.map((slice, index) => {
              const isOpen = open === index;
              const seam = index === 0
                ? 'max-lg:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_26px),0_100%)]'
                : index === last
                  ? 'max-lg:-mt-[22px] max-lg:[clip-path:polygon(0_26px,100%_0,100%_100%,0_100%)]'
                  : 'max-lg:-mt-[22px] max-lg:[clip-path:polygon(0_26px,100%_0,100%_calc(100%_-_26px),0_100%)]';
              const label = index === 0 ? 'lg:right-7 lg:left-auto lg:translate-x-0' : index === last ? 'lg:left-7 lg:translate-x-0' : '';
              const text = index === 0 ? 'lg:left-44' : index === last ? 'lg:right-24' : '';
              // One value drives both layouts: band height on phones, column width on desktop.
              const grow = {'--open': open === null ? 0.5 : isOpen ? 1 : 0} as CSSProperties;
              return (
                <Link key={slice.key} href={slice.href} onMouseEnter={() => choose(index)} onFocus={() => choose(index)}
                  style={grow}
                  className={`group relative block min-w-0 overflow-hidden text-white outline-offset-[-6px] transition-[height,flex-grow] duration-(--duration-slice) ease-light focus-visible:outline-3 h-[calc(132px_+_198px_*_var(--open))] ${seam} lg:h-auto lg:basis-0 lg:[flex-grow:calc(1_+_var(--open))] lg:-skew-x-[10deg]`}>
                  <span className="absolute inset-0 lg:-inset-x-[40%] lg:skew-x-[10deg]">
                    <span className={`absolute inset-0 transition-[filter] duration-(--duration-slice) ease-light ${isOpen ? '' : 'brightness-[.92]'}`}>
                      <SanityImage image={slice.image && {...slice.image, alt: slice.image.alt ?? ''}} cover priority={index === 1}
                        sizes="(min-width: 1024px) 60vw, 100vw" />
                    </span>
                    <span aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(to_top,rgb(8_16_15/0.8),rgb(8_16_15/0))] transition-opacity duration-(--duration-fade) ease-light lg:h-[44%] lg:bg-[linear-gradient(to_top,rgb(8_16_15/0.78)_0%,rgb(8_16_15/0.45)_45%,rgb(8_16_15/0)_100%)] ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                  </span>

                  {/* Closed: the name on a glass label. */}
                  <span aria-hidden="true"
                    className={`glass-light absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-pill px-4 py-2.5 text-[0.9375rem] font-semibold text-ink transition-opacity duration-(--duration-fade) ease-light lg:skew-x-[10deg] lg:px-5 lg:py-3 lg:text-base ${label} ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    {slice.title}
                  </span>

                  {/* Open: name, one line and the call to action. */}
                  <span
                    className={`absolute inset-x-5 bottom-11 transition-opacity ease-light lg:bottom-16 lg:left-24 lg:right-[110px] lg:skew-x-[10deg] ${text} ${
                      isOpen ? 'opacity-100 delay-120 duration-(--duration-fade)' : 'pointer-events-none opacity-0 duration-(--duration-out)'
                    }`}>
                    <span className="block font-display text-[3.25rem] font-semibold leading-none tracking-[-0.015em] lg:text-[4.75rem]">{slice.title}</span>
                    {slice.line && <span className="mt-2 block text-base leading-[1.6] lg:mt-3 lg:text-[1.1875rem]">{slice.line}</span>}
                    <span className="glass-light mt-3.5 inline-flex h-11 items-center rounded-pill px-4 text-[0.9375rem] font-semibold text-ink lg:mt-5 lg:px-4.5">
                      {slice.cta} →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {!still && slices.length > 1 && (
            <div className="glass-light absolute right-3.5 top-3.5 z-[3] flex h-11 items-center gap-2 rounded-pill pl-3 pr-1.5 lg:right-6 lg:top-6 lg:gap-2.5 lg:pl-3.5">
              <span aria-hidden="true" className="flex gap-[3px] lg:gap-1">
                {slices.map((slice, index) => (
                  <span key={slice.key} className="relative h-[3px] w-3.5 overflow-hidden rounded-sm bg-ink/25 lg:w-[18px]">
                    {open === index && (
                      <span key={`${index}-${playing}`}
                        className={`absolute inset-0 origin-left bg-teal-700 ${running ? 'animate-[triptych-progress_6s_linear_forwards]' : ''}`} />
                    )}
                  </span>
                ))}
              </span>
              <button type="button" aria-label={playing ? labels.pause : labels.play}
                onClick={() => {
                  started.current = true;
                  setPlaying(!playing);
                }}
                className="relative grid size-8 place-items-center rounded-pill bg-white text-ink after:absolute after:-inset-1.5">
                {playing ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2v8M8.5 2v8" stroke="currentColor" strokeWidth="1.8" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="ml-0.5"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
