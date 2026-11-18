'use client';

import {useEffect, useRef} from 'react';
import {CloseV6Icon} from './icons';

export type FilmVideo = {title: string} & ({provider: 'youtube'; id: string} | {provider: 'file'; src: string});

/**
 * A film in a layer over the page (Project panel film tile, the Blog's
 * featured story): teal overlay, 16:9 player, close top-right. YouTube loads
 * only now (privacy-enhanced domain); Esc and a click outside close it.
 */
export function FilmLayer({video, label, onClose}: {video: FilmVideo; label: string; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog ref={dialog} aria-label={video.title} onClose={onClose}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      className="overlay-backdrop m-0 grid h-dvh max-h-none w-screen max-w-none place-items-center border-0 p-3 text-overlay-text backdrop:bg-transparent md:p-16">
      <button type="button" onClick={() => dialog.current?.close()} aria-label={label} autoFocus
        className="glass-on-dark absolute right-4 top-4 grid size-11 place-items-center rounded-full text-overlay-text">
        <CloseV6Icon className="size-[18px]" />
      </button>
      <div className="relative aspect-video w-full max-w-275 overflow-hidden rounded-[12px] bg-black shadow-overlay-photo md:rounded-image">
        {video.provider === 'youtube' ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 size-full" />
        ) : (
          <video controls autoPlay playsInline preload="metadata" aria-label={video.title} className="absolute inset-0 size-full">
            <source src={video.src} />
          </video>
        )}
      </div>
    </dialog>
  );
}
