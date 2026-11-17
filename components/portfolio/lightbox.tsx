'use client';

import {useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent} from 'react';
import {CloseV6Icon, ChevronLeftIcon, ChevronRightIcon, LinkIcon, ZoomInIcon, ZoomOutIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {imageBuilder, imageSource, type SanityImageValue} from '@/sanity/image';

/**
 * Lightbox v6.2 (boards V6Lightbox, V6IconostasViewer): the one photo layer of
 * the site. Translucent teal overlay; the photo shown whole at its own shape,
 * as large as the stage allows; zoom is its one feature: click / tap 2.5× at
 * that point (again for the whole photo), wheel and pinch 1–5×, drag pans when
 * zoomed; at 1× arrows, swipe, keys and the thumbnail strip (sets > 8) change
 * the photo. Optional material tabs (Iconostase) switch between photo sets.
 * A native modal <dialog>: focus trap, Escape; focus returns to the opener.
 */

export type LightboxImage = SanityImageValue & {_key: string; width?: number | null; height?: number | null};
export type LightboxSet = {
  /** Tab label (only shown with more than one set). */
  tab?: string;
  /** Caption title when the photo has no caption of its own. */
  title?: string | null;
  /** Caption line under the title. */
  line?: string | null;
  images: LightboxImage[];
};
type Labels = Dictionary['portfolio']['lightbox'];

const ZOOM = 2.5;
const MAX_ZOOM = 5;
const STRIP_FROM = 9;

/** Width / height of the image as shown (after the editor's crop). */
export function imageRatio(image: LightboxImage): number {
  const crop = image.crop;
  const width = (image.width ?? 0) * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
  const height = (image.height ?? 0) * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
  if (width > 0 && height > 0) return width / height;
  // Sanity asset ids carry the original size: image-<hash>-<w>x<h>-<ext>.
  const match = image.asset?._ref.match(/-(\d+)x(\d+)-/);
  return match ? Number(match[1]) / Number(match[2]) : 4 / 3;
}

const widths = [640, 1080, 1600, 2400, 3200];
function srcSet(image: LightboxImage) {
  const source = imageSource(image);
  return widths.map((width) => `${imageBuilder.image(source).width(width).fit('max').auto('format').url()} ${width}w`).join(', ');
}

type View = {z: number; cx: number; cy: number};
const whole: View = {z: 1, cx: 0.5, cy: 0.5};

function fit(ratio: number, stageWidth: number, stageHeight: number) {
  return ratio > stageWidth / stageHeight
    ? {fw: stageWidth, fh: stageWidth / ratio}
    : {fw: stageHeight * ratio, fh: stageHeight};
}

/** Clamp the view centre so the zoomed photo always covers its box. */
function place(fw: number, fh: number, {z, cx, cy}: View) {
  const W = fw * z;
  const H = fh * z;
  const half = 0.5 / z;
  const x = Math.min(1 - half, Math.max(half, cx));
  const y = Math.min(1 - half, Math.max(half, cy));
  return {W, H, L: fw / 2 - x * W, T: fh / 2 - y * H, cx: x, cy: y};
}

export function Lightbox({sets, initialSet = 0, index, onIndexChange, onClose, labels, title, offer}: {
  sets: LightboxSet[];
  initialSet?: number;
  index: number;
  onIndexChange: (index: number, set: number) => void;
  onClose: () => void;
  labels: Labels;
  /** Top-bar title (desktop), e.g. the project or "Iconostase". */
  title?: string | null;
  /** The caption's quiet offer: "Cereți o ofertă pentru unul asemănător". */
  offer?: {href: string; label: string} | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLElement>(null);
  const [setIndex, setSetIndex] = useState(initialSet);
  const [size, setSize] = useState({width: 0, height: 0});
  const [view, setView] = useState<View>(whole);
  const [animate, setAnimate] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const pointers = useRef(new Map<number, {x: number; y: number; x0: number; y0: number}>());
  const gesture = useRef({moved: 0, pinch: 0});

  const set = sets[setIndex] ?? sets[0];
  const count = set.images.length;
  const image = set.images[Math.min(index, count - 1)];
  const ratio = imageRatio(image);
  const {fw, fh} = fit(ratio, size.width || 1, size.height || 1);
  const g = place(fw, fh, view);
  const zoomed = view.z > 1.001;
  const viewRef = useRef(view);
  useLayoutEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    opener.current = document.activeElement;
    dialog.current?.showModal();
    const back = opener.current;
    return () => {
      if (back instanceof HTMLElement) back.focus({preventScroll: true});
    };
  }, []);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({width: entry.contentRect.width, height: entry.contentRect.height}));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({block: 'nearest', inline: 'center'});
  }, [index, setIndex]);

  const go = useCallback((next: number, nextSet = setIndex) => {
    const total = sets[nextSet].images.length;
    setView(whole);
    setAnimate(false);
    if (nextSet !== setIndex) setSetIndex(nextSet);
    onIndexChange(((next % total) + total) % total, nextSet);
  }, [onIndexChange, setIndex, sets]);

  /** Zoom to `z`, keeping the photo point under (px, py) (box coordinates) in place. */
  const zoomTo = useCallback((z: number, px: number, py: number, smooth: boolean) => {
    const current = place(fw, fh, viewRef.current);
    const nz = Math.max(1, Math.min(MAX_ZOOM, z));
    const ix = (px - current.L) / current.W;
    const iy = (py - current.T) / current.H;
    const W2 = fw * nz;
    const H2 = fh * nz;
    const next = place(fw, fh, {z: nz, cx: (fw / 2 - (px - ix * W2)) / W2, cy: (fh / 2 - (py - iy * H2)) / H2});
    setAnimate(smooth);
    setView({z: nz, cx: next.cx, cy: next.cy});
  }, [fw, fh]);

  const toggleZoom = () => {
    if (zoomed) {
      setAnimate(true);
      setView(whole);
    } else zoomTo(ZOOM, fw / 2, fh / 2, true);
  };

  const local = (event: PointerEvent | WheelEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button > 0) return;
    const point = local(event);
    pointers.current.set(event.pointerId, {...point, x0: point.x, y0: point.y});
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current.moved = 0;
    const all = [...pointers.current.values()];
    if (all.length === 2) gesture.current.pinch = Math.hypot(all[0].x - all[1].x, all[0].y - all[1].y);
    setAnimate(false);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(event.pointerId);
    if (!last) return;
    const point = local(event);
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    last.x = point.x;
    last.y = point.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    const all = [...pointers.current.values()];
    if (all.length >= 2) {
      const distance = Math.hypot(all[0].x - all[1].x, all[0].y - all[1].y);
      if (gesture.current.pinch) zoomTo(viewRef.current.z * distance / gesture.current.pinch, (all[0].x + all[1].x) / 2, (all[0].y + all[1].y) / 2, false);
      gesture.current.pinch = distance;
      gesture.current.moved += 99;
      return;
    }
    if (viewRef.current.z > 1.001) {
      const current = place(fw, fh, viewRef.current);
      const next = place(fw, fh, {z: viewRef.current.z, cx: current.cx - dx / current.W, cy: current.cy - dy / current.H});
      setView({z: viewRef.current.z, cx: next.cx, cy: next.cy});
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointers.current.get(event.pointerId);
    pointers.current.delete(event.pointerId);
    gesture.current.pinch = 0;
    if (pointers.current.size) return;
    setDragging(false);
    setAnimate(true);
    if (!start || event.type === 'pointercancel') return;
    const sx = start.x - start.x0;
    const sy = start.y - start.y0;
    if (!zoomed && Math.abs(sx) > 48 && Math.abs(sx) > Math.abs(sy)) {
      go(index + (sx < 0 ? 1 : -1));
      return;
    }
    if (gesture.current.moved < 6) {
      if (zoomed) setView(whole);
      else zoomTo(ZOOM, start.x, start.y, true);
    }
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const point = local(event);
    zoomTo(viewRef.current.z * Math.exp(-event.deltaY * 0.0015), point.x, point.y, false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const {key} = event;
    const step = 0.12 / view.z;
    const pan = (dx: number, dy: number) => {
      const next = place(fw, fh, {z: view.z, cx: g.cx + dx, cy: g.cy + dy});
      setAnimate(true);
      setView({z: view.z, cx: next.cx, cy: next.cy});
    };
    if (key === '+' || key === '=') zoomTo(view.z * 1.5, fw / 2, fh / 2, true);
    else if (key === '-') zoomTo(view.z / 1.5, fw / 2, fh / 2, true);
    else if (key === '0') {
      setAnimate(true);
      setView(whole);
    } else if (key === 'ArrowLeft') {
      if (zoomed) pan(-step, 0);
      else go(index - 1);
    } else if (key === 'ArrowRight') {
      if (zoomed) pan(step, 0);
      else go(index + 1);
    }
    else if (key === 'ArrowUp' && zoomed) pan(0, -step);
    else if (key === 'ArrowDown' && zoomed) pan(0, step);
    else return;
    event.preventDefault();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address bar still holds the link.
    }
  };

  const caption = image.caption || set.title;
  const control = 'glass-on-dark inline-flex h-11 items-center justify-center gap-2 rounded-pill text-[0.875rem] font-medium text-overlay-text transition-colors duration-(--duration-line)';
  const hasStrip = count >= STRIP_FROM;
  const tabs = sets.length > 1 && (
    <div role="tablist" aria-label={labels.material} className="glass-on-dark inline-flex gap-0.5 rounded-pill p-1">
      {sets.map((item, i) => (
        <button key={item.tab ?? i} type="button" role="tab" aria-selected={i === setIndex} onClick={() => go(0, i)}
          className="h-10 whitespace-nowrap rounded-pill px-4 text-ui font-medium text-overlay-text hover:bg-white/8 aria-selected:bg-overlay-text aria-selected:text-teal-950 md:px-4.5">
          {item.tab}
        </button>
      ))}
    </div>
  );

  return (
    <dialog
      ref={dialog}
      aria-label={title ? `${labels.photos}, ${title}` : labels.label}
      onClose={(event) => event.target === event.currentTarget && onClose()}
      onKeyDown={onKeyDown}
      className="overlay-backdrop m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0 text-overlay-text opacity-100 transition-[opacity,display,overlay] transition-discrete duration-(--duration-open) ease-light backdrop:bg-transparent starting:open:opacity-0 [&_:focus-visible]:outline-focus-on-dark"
    >
      <div className="flex h-full flex-col">
        {/* Top bar: title + counter (+ tabs) | copy link · zoom · close */}
        <div className="flex h-18 shrink-0 items-center justify-between gap-4 pl-5 pr-3 md:h-20 md:pl-10 md:pr-6">
          <div className="flex min-w-0 items-baseline gap-3 md:items-center md:gap-6">
            {title ? <p className="hidden truncate font-display text-[1.875rem] font-semibold leading-none md:block">{title}</p> : null}
            <div className="hidden md:block">{tabs}</div>
            <p aria-live="polite" className="text-meta tabular-nums text-overlay-text">{index + 1} / {count}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={copyLink} className={`${control} size-11 md:w-auto md:px-3.5`}>
              <LinkIcon className="size-4" />
              <span className="max-md:sr-only">{copied ? labels.copied : labels.copyLink}</span>
            </button>
            <button type="button" onClick={toggleZoom} className={`${control} px-3.5 max-md:hidden`}>
              {zoomed ? <ZoomOutIcon className="size-4" /> : <ZoomInIcon className="size-4" />}
              {zoomed ? labels.zoomOut : labels.zoomIn}
            </button>
            <button type="button" onClick={() => dialog.current?.close()} className={`${control} size-11`} autoFocus>
              <CloseV6Icon className="size-4.5" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </div>
        </div>
        {tabs ? <div className="flex shrink-0 justify-center pb-3 md:hidden">{tabs}</div> : null}

        {/* Stage: the photo box is the photo's own shape; zoom happens inside it. */}
        <div className="relative min-h-0 flex-1 px-3 pt-4 md:px-34">
          <div ref={stage} className="flex h-full items-center justify-center">
            <div
              role="img"
              tabIndex={0}
              aria-label={`${image.alt ?? ''}${zoomed ? labels.zoomedHint : labels.zoomHint}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              style={{width: fw, height: fh}}
              className={`relative touch-none select-none overflow-hidden rounded-caption bg-[rgb(4_20_19/0.4)] shadow-overlay-photo md:rounded-image ${
                zoomed ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              }`}
            >
              {size.width ? (
                <div
                  className={`absolute left-0 top-0 origin-top-left will-change-transform ${animate ? 'transition-transform duration-[450ms] ease-light' : ''}`}
                  style={{width: fw, height: fh, transform: `translate(${g.L}px, ${g.T}px) scale(${view.z})`}}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- srcset follows the zoom level */}
                  <img
                    key={image._key}
                    src={imageBuilder.image(imageSource(image)).width(1600).fit('max').auto('format').url()}
                    srcSet={srcSet(image)}
                    sizes={`${Math.ceil(fw * view.z)}px`}
                    alt=""
                    draggable={false}
                    className="pointer-events-none block size-full"
                  />
                </div>
              ) : null}
              {zoomed ? (
                <p className="glass-on-dark pointer-events-none absolute left-1/2 top-3.5 flex h-9 -translate-x-1/2 items-center whitespace-nowrap rounded-pill px-3.5 text-[0.8125rem] font-medium md:text-[0.875rem]">
                  <span className="md:hidden">{labels.dragHintTouch}</span>
                  <span className="max-md:hidden">{labels.dragHint}</span>
                </p>
              ) : (
                <p className="glass-on-dark pointer-events-none absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-pill px-3 text-[0.8125rem] font-medium md:hidden">
                  <ZoomInIcon className="size-4" />{labels.tapHint}
                </p>
              )}
            </div>
          </div>
          {count > 1 ? (
            <>
              <button type="button" onClick={() => go(index - 1)} className={`${control} absolute left-10 top-1/2 size-14 -translate-y-1/2 max-md:hidden`}>
                <ChevronLeftIcon className="size-5" />
                <span className="sr-only">{labels.previous}</span>
              </button>
              <button type="button" onClick={() => go(index + 1)} className={`${control} absolute right-10 top-1/2 size-14 -translate-y-1/2 max-md:hidden`}>
                <ChevronRightIcon className="size-5" />
                <span className="sr-only">{labels.next}</span>
              </button>
            </>
          ) : null}
        </div>

        {/* Phones: strip above the caption; desktop: caption, then the strip. */}
        <div className="flex shrink-0 flex-col max-md:flex-col-reverse">
          <div className="flex flex-col gap-x-8 px-5 pb-7 pt-3 md:mx-auto md:w-full md:max-w-[880px] md:flex-row md:items-end md:justify-between md:px-0 md:pb-6 md:pt-6">
            <div className="min-w-0">
              {caption ? <p className="font-display text-[1.75rem] font-medium leading-[1.1] md:text-[2.25rem]">{caption}</p> : null}
              {set.line ? <p className="mt-1.5 text-meta text-overlay-soft">{set.line}</p> : null}
            </div>
            {offer ? (
              <a href={offer.href} onClick={() => dialog.current?.close()}
                className="mt-1.5 flex min-h-11 items-center whitespace-nowrap text-ui font-semibold text-overlay-text underline underline-offset-[6px] md:mt-0">
                {offer.label}
              </a>
            ) : null}
          </div>
          {hasStrip ? (
            <nav ref={strip} aria-label={labels.thumbnails}
              className="flex gap-1.5 overflow-x-auto px-4 pb-1 pt-3 [mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)] [scrollbar-width:none] md:mx-auto md:w-full md:max-w-[888px] md:gap-2 md:px-1 md:pb-9 md:pt-1 md:[mask-image:linear-gradient(to_right,transparent,#000_40px,#000_calc(100%-40px),transparent)]">
              {set.images.map((thumb, i) => (
                <button key={thumb._key} type="button" onClick={() => go(i)}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={`${labels.photo} ${i + 1}${thumb.alt ? `: ${thumb.alt}` : ''}`}
                  className="h-11 w-15 flex-none overflow-hidden rounded-lg bg-[#173431] opacity-55 transition-opacity duration-(--duration-line) hover:opacity-85 aria-[current]:opacity-100 aria-[current]:shadow-[0_0_0_2px_#eef3f1] md:h-14 md:w-19">
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny CDN thumbnails */}
                  <img src={imageBuilder.image(imageSource(thumb)).width(160).height(120).fit('crop').auto('format').url()} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

/**
 * The open photo as `?foto=N` (1-based) on the current address, so a link
 * opens it and Back closes it. `addressable` galleries also open from a link
 * on load (one per page: the project gallery); the others still write the
 * parameter while open.
 */
export function usePhotoParam(count: number, addressable: boolean) {
  const [open, setOpen] = useState<number | null>(null);
  const pushed = useRef(false);

  const write = (index: number | null, push: boolean) => {
    const url = new URL(location.href);
    if (index === null) url.searchParams.delete('foto');
    else url.searchParams.set('foto', String(index + 1));
    history[push ? 'pushState' : 'replaceState'](history.state, '', url);
  };

  useEffect(() => {
    if (addressable) {
      const value = Number(new URLSearchParams(location.search).get('foto'));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the address once on load
      if (Number.isInteger(value) && value >= 1 && value <= count) setOpen(value - 1);
    }
    const onPop = () => {
      if (!new URLSearchParams(location.search).has('foto')) {
        pushed.current = false;
        setOpen(null);
      }
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [addressable, count]);

  return {
    open,
    show(index: number) {
      write(index, true);
      pushed.current = true;
      setOpen(index);
    },
    move(index: number) {
      write(index, false);
      setOpen(index);
    },
    close() {
      setOpen(null);
      if (pushed.current) {
        pushed.current = false;
        history.back();
      } else if (new URLSearchParams(location.search).has('foto')) write(null, false);
    },
  };
}
