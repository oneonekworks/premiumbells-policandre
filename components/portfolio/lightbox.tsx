'use client';

import {useEffect, useRef, type PointerEvent} from 'react';
import {SanityImage} from '@/components/sanity-image';
import {ArrowRightIcon, CloseIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {GalleryImage} from './gallery';

// Fullscreen modal <dialog>: Escape closes it (only the topmost dialog, so a
// surrounding project slide-over stays open), arrows and swipes navigate, and
// focus returns to the opening thumbnail.
export function Lightbox({images, index, onIndexChange, onClose, labels}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: Dictionary['portfolio']['lightbox'];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<HTMLUListElement>(null);
  const swipeStart = useRef<number | null>(null);
  const count = images.length;
  const image = images[index];
  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    thumbnails.current?.querySelector('[aria-current="true"]')?.scrollIntoView({block: 'nearest', inline: 'center'});
  }, [index]);

  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1);
  };

  const control = 'grid size-12 place-items-center rounded-full bg-paper/10 text-paper hover:bg-paper/20';

  return (
    <dialog
      ref={dialog}
      aria-label={labels.label}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(1);
        if (event.key === 'ArrowLeft') go(-1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-teal-950 p-0 text-paper backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <p aria-live="polite" className="text-sm tabular-nums text-paper/80">
            {index + 1} {labels.of} {count}
          </p>
          <button type="button" onClick={() => dialog.current?.close()} className={control} autoFocus>
            <CloseIcon className="size-6" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>

        <div
          className="relative flex-1 touch-pan-y select-none"
          onPointerDown={(event) => { swipeStart.current = event.clientX; }}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { swipeStart.current = null; }}
        >
          <figure className="absolute inset-x-0 inset-y-2 sm:inset-x-20">
            <div className="relative size-full">
              <SanityImage key={image._key} image={image} sizes="100vw" priority />
            </div>
          </figure>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className={`${control} absolute left-3 top-1/2 -translate-y-1/2 max-sm:hidden`}>
                <ArrowRightIcon className="size-5 rotate-180" />
                <span className="sr-only">{labels.previous}</span>
              </button>
              <button type="button" onClick={() => go(1)} className={`${control} absolute right-3 top-1/2 -translate-y-1/2 max-sm:hidden`}>
                <ArrowRightIcon className="size-5" />
                <span className="sr-only">{labels.next}</span>
              </button>
            </>
          )}
        </div>

        <p className="min-h-10 px-4 pt-3 text-center text-sm text-paper/85">{image.caption}</p>

        {count > 1 && (
          <ul ref={thumbnails} aria-label={labels.thumbnails} className="flex gap-1.5 overflow-x-auto px-4 pb-4 pt-2">
            {images.map((thumbnail, thumbnailIndex) => (
              <li key={thumbnail._key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onIndexChange(thumbnailIndex)}
                  aria-current={thumbnailIndex === index ? 'true' : undefined}
                  aria-label={`${thumbnailIndex + 1} ${labels.of} ${count}`}
                  className={`relative block size-14 overflow-hidden rounded ${thumbnailIndex === index ? 'ring-2 ring-gold-500' : 'opacity-60 hover:opacity-100'}`}
                >
                  <SanityImage image={{...thumbnail, alt: ''}} ratio={1} sizes="56px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
