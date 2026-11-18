'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Lightbox, usePhotoParam, type LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {ChevronLeftIcon, ChevronRightIcon, CloseV6Icon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {FilmLayer, type FilmVideo} from '@/components/site/film-layer';
import {useProjectList, type ProjectList} from './project-list';

type T = Dictionary['works6']['panel'];

export type PanelVideo = FilmVideo & {poster: string | null};
export type PanelPhoto = LightboxImage & {alt: string};

function ZoomGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5M11 8v6M8 11h6" /></svg>;
}
function PlayGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>;
}

/**
 * Project panel v6.2 (boards V6ProjectPanel + Mobile): the only way a work is
 * shown. A floating two-column panel from the right over the dimmed page
 * (phones: a sheet from 40 px), photo column (lead photo → Lightbox, photo
 * grid with a film tile and "+N") | info column (counter through the list it
 * was opened from, metal bar, name, category · place · year, text, details,
 * "Pe hartă" line, quiet offer, Anterior / Următor).
 *
 * `intercepted`: opened over the current page; × / Esc / Back go back in
 * history, so the page underneath keeps its scroll. `embedded`: the direct
 * visit, server-rendered over Lucrările noastre; × shows the wall under it
 * (the address becomes the category's).
 */
export function ProjectPanelView({mode, href, closeHref, fallback, title, bar, category, meta, photos, video, offer, labels, lightboxLabels, children}: {
  mode: 'intercepted' | 'embedded';
  href: string;
  closeHref: string;
  fallback: ProjectList;
  title: string;
  bar: string;
  category: {title: string; href: string} | null;
  meta: string[];
  photos: PanelPhoto[];
  video: PanelVideo | null;
  offer: string;
  labels: T;
  lightboxLabels: Dictionary['portfolio']['lightbox'];
  /** Text, details and the map line (server-rendered). */
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const list = useProjectList(href, fallback);
  const photo = usePhotoParam(photos.length, true);
  const [film, setFilm] = useState(false);
  const visible = mode === 'intercepted' || pathname === href;

  useEffect(() => {
    const element = dialog.current;
    if (!element || !visible) return;
    closing.current = false;
    // The server sends the embedded panel open (visible without scripts); make it modal.
    if (element.open && !element.matches(':modal')) element.close();
    if (!element.open) element.showModal();
  }, [visible]);

  if (!visible) return null;

  const close = (then?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    if (mode === 'intercepted') {
      if (then) addEventListener('popstate', () => requestAnimationFrame(then), {once: true});
      router.back();
    } else {
      dialog.current?.close();
      history.replaceState(null, '', closeHref);
      then?.();
    }
  };

  const index = Math.max(0, list.items.findIndex((item) => item.href === href));
  const total = list.items.length;
  const previous = total > 1 ? list.items[(index - 1 + total) % total] : null;
  const next = total > 1 ? list.items[(index + 1) % total] : null;
  const fromService = Boolean(list.plain);

  const lead = photos[0];
  const rest = photos.slice(1);
  // Desktop: 2 rows of 4 (film tile, then "+N" last); phones: 2 rows of 3.
  const cells = (columns: number) => {
    const slots = columns * 2 - (video ? 1 : 0);
    const more = rest.length > slots;
    const shown = rest.slice(0, more ? slots - 1 : slots);
    return {shown, more: more ? photos.length - 1 - shown.length : 0};
  };
  const desktop = cells(4);
  const phone = cells(3);
  const gridPhotos = rest.slice(0, Math.max(desktop.shown.length, phone.shown.length));

  const counter = (short: boolean) => (short ? labels.counterShort : labels.counter)
    .replace('{n}', String(index + 1)).replace('{total}', String(total)).replace('{label}', list.label);

  const photoGrid = (
    <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
      {gridPhotos.map((image, i) => (
        <button key={image._key} type="button" aria-haspopup="dialog" aria-label={`${labels.openPhoto}: ${image.alt}`} onClick={() => photo.show(i + 1)}
          className={`relative block aspect-square cursor-zoom-in overflow-hidden rounded-[10px] bg-band ${i >= phone.shown.length ? 'max-lg:hidden' : ''} ${i >= desktop.shown.length ? 'lg:hidden' : ''}`}>
          <SanityImage image={image} ratio={1} sizes="(max-width: 1024px) 33vw, 120px" />
        </button>
      ))}
      {video ? (
        <button type="button" aria-haspopup="dialog" aria-label={labels.playFilm} onClick={() => setFilm(true)}
          className="relative block aspect-square overflow-hidden rounded-[10px] bg-teal-950 text-white after:absolute after:inset-0 after:bg-[rgb(11_37_35/0.35)]">
          {video.poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote poster (YouTube or CDN), small
            <img src={video.poster} alt="" loading="lazy" className="size-full object-cover" />
          ) : null}
          <span className="absolute left-1/2 top-[44%] z-[1] grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-teal-900 shadow-e2"><PlayGlyph /></span>
          <small className="absolute inset-x-0 bottom-1.5 z-[1] text-center text-[0.6875rem] font-semibold [text-shadow:0_1px_3px_rgb(0_0_0/0.5)]">{labels.film}</small>
        </button>
      ) : null}
      {[{cell: phone, className: 'lg:hidden'}, {cell: desktop, className: 'max-lg:hidden'}].map(({cell, className}) => cell.more > 0 ? (
        <button key={className} type="button" aria-haspopup="dialog" aria-label={labels.allPhotos.replace('{n}', String(photos.length))}
          onClick={() => photo.show(1 + cell.shown.length)}
          className={`flex aspect-square flex-col items-center justify-center rounded-[10px] bg-teal-950 text-[0.8125rem] text-on-dark ${className}`}>
          <b className="font-display text-[1.625rem] font-semibold leading-none">+{cell.more}</b>{labels.more}
        </button>
      ) : null)}
    </div>
  );

  const navLink = (item: NonNullable<typeof next>, direction: 'previous' | 'next') => (
    <Link href={item.href} replace scroll={false} aria-label={(direction === 'previous' ? labels.previousLabel : labels.nextLabel).replace('{title}', item.title)}
      className={`flex min-h-16 min-w-0 items-center gap-2.5 rounded-[16px] bg-band p-2 text-[0.875rem] font-medium leading-[1.3] text-ink transition-colors duration-(--duration-line) hover:bg-teal-tint ${direction === 'next' ? 'flex-row-reverse text-right' : ''}`}>
      {direction === 'previous' ? <ChevronLeftIcon className="size-4 flex-none" /> : <ChevronRightIcon className="size-4 flex-none" />}
      {item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- 36 × 48 CDN thumbnail
        <img src={item.thumb} alt="" width={36} height={48} loading="lazy" className="h-12 w-9 flex-none rounded-[8px] object-cover" />
      ) : <span aria-hidden="true" className="h-12 w-9 flex-none rounded-[8px] bg-white" />}
      <span className="min-w-0">
        <small className="block text-[0.75rem] text-ink-soft">{direction === 'previous' ? labels.previous : labels.next}</small>
        <b className="block truncate font-semibold max-lg:hidden">{item.title}</b>
      </span>
    </Link>
  );

  return (
    <dialog ref={dialog} aria-label={title} open={mode === 'embedded' ? true : undefined}
      onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      className="project-panel fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-[rgb(11_37_35/0.42)] p-0 text-ink backdrop-blur-[6px] backdrop:bg-transparent">
      <div className="pp-sheet absolute inset-x-0 bottom-0 top-10 overflow-y-auto overscroll-contain rounded-t-[24px] bg-white shadow-e3 lg:bottom-4 lg:left-auto lg:right-4 lg:top-4 lg:grid lg:w-[min(920px,calc(100vw-32px))] lg:grid-cols-[540px_minmax(0,1fr)] lg:overflow-hidden lg:rounded-panel">
        {/* Photo column (desktop) */}
        <div className="hidden min-h-0 flex-col gap-3 bg-band p-4 lg:flex">
          {lead ? (
            <button type="button" aria-haspopup="dialog" aria-label={`${labels.openPhoto}: ${lead.alt}`} onClick={() => photo.show(0)}
              className="group relative block min-h-0 flex-1 cursor-zoom-in overflow-hidden rounded-[18px] bg-white">
              <SanityImage image={lead} cover sizes="508px" priority className="transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.02] motion-reduce:transform-none" />
              <span className="glass-light absolute bottom-3 right-3 inline-flex h-10 items-center gap-2 rounded-pill px-3.5 text-caption font-medium text-ink"><ZoomGlyph />{labels.zoom}</span>
            </button>
          ) : <div className="flex-1 rounded-[18px] bg-white" />}
          {photos.length > 1 ? (
            <>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-caption font-semibold tabular-nums text-ink-soft">{labels.photos.replace('{n}', String(photos.length))}</p>
                <button type="button" onClick={() => photo.show(0)} className="text-caption font-semibold text-teal-700 underline underline-offset-4">{labels.seeAll}</button>
              </div>
              {photoGrid}
            </>
          ) : null}
        </div>

        {/* Info column; on phones the whole sheet scrolls */}
        <div className="flex min-h-0 flex-col lg:overflow-y-auto lg:pb-5 lg:pl-8 lg:pr-7 lg:pt-7">
          <div className="flex items-center justify-between py-3 pl-5 pr-3 lg:p-0">
            <p className="text-caption font-semibold tabular-nums text-ink-soft">
              <span className="lg:hidden">{counter(true)}</span><span className="max-lg:hidden">{counter(false)}</span>
            </p>
            <button type="button" onClick={() => close()} aria-label={labels.close} autoFocus
              className="grid size-11 flex-none place-items-center rounded-full bg-band text-ink transition-colors hover:bg-teal-tint">
              <CloseV6Icon className="size-[18px]" />
            </button>
          </div>
          {lead ? (
            <div className="px-3 lg:hidden">
              <button type="button" aria-haspopup="dialog" aria-label={`${labels.openPhoto}: ${lead.alt}`} onClick={() => photo.show(0)}
                className="relative block h-[274px] w-full overflow-hidden rounded-[18px] bg-white">
                <SanityImage image={lead} cover sizes="100vw" />
                <span className="glass-light absolute bottom-3 right-3 inline-flex h-10 items-center gap-2 rounded-pill px-3.5 text-caption font-medium text-ink"><ZoomGlyph />{labels.zoom}</span>
              </button>
            </div>
          ) : null}
          <div className="flex flex-1 flex-col px-5 pb-8 pt-5 lg:p-0">
            <i aria-hidden="true" className={`block h-[3px] w-7 rounded-[2px] lg:mt-4 ${bar}`} />
            <h2 className="mt-3 font-display text-[2.125rem] font-semibold leading-[1.05] lg:mt-3.5 lg:text-[2.75rem]">{title}</h2>
            <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-caption text-ink-soft lg:text-[0.9375rem]">
              {category ? (fromService
                ? <span>{category.title}</span>
                : <Link href={category.href} className="font-semibold text-teal-700 underline-offset-4 hover:underline">{category.title}</Link>) : null}
              {meta.map((part) => (
                <span key={part} className="contents"><span aria-hidden="true">·</span><span>{part}</span></span>
              ))}
            </p>
            {children}
            {photos.length > 1 ? (
              <div className="lg:hidden">
                <p className="mt-5 text-caption font-semibold tabular-nums text-ink-soft">{labels.photos.replace('{n}', String(photos.length))}</p>
                <div className="mt-2.5">{photoGrid}</div>
              </div>
            ) : null}
            <div className="mt-6 lg:mt-auto lg:pt-5">
              <div className="flex flex-col items-stretch gap-3 border-t border-hairline pt-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-4">
                <p className="text-[0.9375rem] leading-[1.4] text-ink-soft">{offer}</p>
                <a href="#oferta" onClick={(event) => {
                  event.preventDefault();
                  close(() => document.getElementById('oferta')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));
                }} className="btn btn-quiet h-12 justify-center px-5 text-[0.9375rem] lg:h-11.5">{labels.offerCta}</a>
              </div>
              {previous && next ? (
                <nav aria-label={labels.browse} className="mt-5 grid grid-cols-2 gap-2 lg:mt-4">
                  {navLink(previous, 'previous')}
                  {navLink(next, 'next')}
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {photo.open !== null ? (
        <Lightbox sets={[{images: photos}]} index={photo.open} title={title} labels={lightboxLabels}
          onIndexChange={(i) => photo.move(i)} onClose={photo.close} />
      ) : null}
      {film && video ? <FilmLayer video={video} label={labels.closeFilm} onClose={() => setFilm(false)} /> : null}
    </dialog>
  );
}
