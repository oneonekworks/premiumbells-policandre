'use client';

import Link from 'next/link';
import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {SanityImage} from '@/components/sanity-image';
import {ArrowRightIcon} from '@/components/site/icons';
import type {SanityImageValue} from '@/sanity/image';

export type TriptychSlice = {
  key: string;
  /** The service name, also the headline word. */
  title: string;
  /** The word as it reads in the headline ("clopote"). */
  word: string;
  href: string;
  line: string | null;
  cta: string;
  image: SanityImageValue | null;
};

const ROTATE_MS = 6000;
const FIRST_STEP_MS = 1200;

/**
 * The hero (M36–M42): the headline, whose three words link to the services,
 * and one panel of three slanted photo slices. A slice opens to half the
 * panel (2:1:1) on hover or focus of the slice or its word; on load Clopote
 * is open, then the slices rotate every 6s. The first hover or focus stops the
 * rotation for good; the pause pill restarts it (WCAG 2.2.2). Rotation also
 * pauses off screen and in a hidden tab. Reduced motion: equal thirds, no
 * rotation, no pill, changes are instant.
 *
 * `between` sits between the headline and the panel (claim, buttons, figures).
 */
export function Triptych({slices, joiner, before, between, labels}: {
  slices: TriptychSlice[];
  /** Separators between the words: ", " and " și ". */
  joiner: [string, string];
  before?: ReactNode;
  between: ReactNode;
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

  const word = (slice: TriptychSlice, index: number) => (
    <Link
      href={slice.href}
      onMouseEnter={() => choose(index)}
      onFocus={() => choose(index)}
      className={`rounded-sm underline decoration-[3px] underline-offset-[0.14em] transition-[text-decoration-color] duration-(--duration-line) ease-light ${
        open === index ? 'decoration-teal-700' : 'decoration-transparent hover:decoration-teal-700'
      }`}
    >
      {slice.word}
    </Link>
  );

  return (
    <>
      {before}
      <h1 id="home-title" className="order-1 font-display text-hero-line text-ink lg:whitespace-nowrap">
        {slices.map((slice, index) => (
          <span key={slice.key}>
            {index === 1 ? joiner[0] : index === 2 ? <>{joiner[1]}<br className="lg:hidden" /></> : null}
            {word(slice, index)}
          </span>
        ))}
      </h1>
      {between}
      <div
        ref={panel}
        className="relative order-2 mx-[-0.5rem] mt-6 h-[37.5rem] lg:order-3 overflow-hidden rounded-menu bg-surface shadow-e2 sm:mx-0 lg:h-[28.75rem] lg:rounded-panel"
      >
        <div className="absolute -inset-y-12 inset-x-0 flex flex-col gap-(--spacing-triptych-seam) lg:inset-y-0 lg:-inset-x-16 lg:flex-row">
          {slices.map((slice, index) => {
            const isOpen = open === index;
            const edge = index === 0 ? 'lg:justify-end lg:pr-7' : index === slices.length - 1 ? 'lg:justify-start lg:pl-7' : 'lg:justify-center';
            const text = index === 0 ? 'lg:left-44' : index === slices.length - 1 ? 'lg:left-24 lg:right-24' : 'lg:left-24';
            return (
              <Link
                key={slice.key}
                href={slice.href}
                onMouseEnter={() => choose(index)}
                onFocus={() => choose(index)}
                style={{flexGrow: isOpen ? 2 : 1}}
                className="@container group relative min-h-0 min-w-0 basis-0 -skew-y-[8deg] overflow-hidden outline-offset-[-6px] transition-[flex-grow] duration-(--duration-slice) ease-light focus-visible:outline-3 lg:skew-y-0 lg:-skew-x-[10deg]"
              >
                <span className="absolute inset-x-0 -inset-y-[40%] skew-y-[8deg] lg:-inset-x-[40%] lg:inset-y-0 lg:skew-y-0 lg:skew-x-[10deg]">
                  <span className={`absolute inset-0 transition-[filter] duration-(--duration-slice) ease-light ${isOpen ? '' : 'brightness-[.78]'}`}>
                    <SanityImage image={slice.image && {...slice.image, alt: slice.image.alt ?? ''}} cover priority
                      sizes="(min-width: 1024px) 50vw, 100vw" />
                  </span>
                  <span aria-hidden="true"
                    className={`photo-gradient transition-opacity duration-(--duration-fade) ease-light ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                </span>

                {/* Closed: a whole glass label at mid-height, or none when the slice is narrow. */}
                <span aria-hidden="true"
                  className={`absolute inset-x-0 top-1/2 flex -translate-y-1/2 skew-y-[8deg] px-5 transition-opacity duration-(--duration-fade) @max-[9rem]:hidden lg:skew-y-0 lg:skew-x-[10deg] ${edge} ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                  }`}>
                  <span className="glass-light rounded-pill px-4 py-2 text-[0.875rem] font-semibold text-ink">{slice.title}</span>
                </span>

                {/* Open: name, one line and the call to action. */}
                <span
                  className={`absolute bottom-16 left-5 right-5 skew-y-[8deg] text-white transition-opacity ease-light lg:bottom-11 lg:skew-y-0 lg:skew-x-[10deg] ${text} ${
                    isOpen ? 'opacity-100 delay-120 duration-(--duration-fade)' : 'opacity-0 duration-(--duration-out)'
                  }`}
                >
                  <span className="block font-display text-slice-name [text-shadow:0_2px_12px_rgb(0_0_0/0.35)]">{slice.title}</span>
                  {slice.line && <span className="mt-1 block max-w-sm text-body [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">{slice.line}</span>}
                  <span className="glass-light mt-4 inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-[0.875rem] font-semibold text-ink">
                    {slice.cta}
                    <ArrowRightIcon className="size-4 transition-transform duration-(--duration-line) group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {!still && slices.length > 1 && (
          <div className="glass-light absolute right-4 top-4 flex items-center gap-2 rounded-pill py-1 pl-4 pr-1 shadow-e1 lg:right-6 lg:top-6">
            <span aria-hidden="true" className="flex gap-1.5">
              {slices.map((slice, index) => (
                <span key={slice.key} className="relative h-[3px] w-[18px] overflow-hidden rounded-pill bg-ink/15">
                  {open === index && (
                    <span
                      key={`${index}-${playing}`}
                      className={`absolute inset-0 origin-left bg-teal-700 ${running ? 'animate-[triptych-progress_6s_linear_forwards]' : ''}`}
                    />
                  )}
                </span>
              ))}
            </span>
            <button
              type="button"
              onClick={() => {
                started.current = true;
                setPlaying(!playing);
              }}
              className="grid size-11 place-items-center"
            >
              <span className="grid size-8 place-items-center rounded-pill bg-surface text-ink shadow-e1">
                {playing ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="currentColor"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="ml-0.5 size-3.5" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
                )}
              </span>
              <span className="sr-only">{playing ? labels.pause : labels.play}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
