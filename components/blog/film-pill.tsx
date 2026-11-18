'use client';

import {useState} from 'react';
import {FilmLayer, type FilmVideo} from '@/components/site/film-layer';
import {PlayIcon} from '@/components/site/icons';

/**
 * The featured story's film control: a glass pill on the cover (bottom-right
 * on desktop with the film's title, top-right "Film" on phones), above the
 * stretched title link. Opens the film layer; YouTube loads only then.
 */
export function FilmPill({video, label, text, short, close}: {video: FilmVideo; label: string; text: string; short: string; close: string}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-label={label} onClick={() => setOpen(true)}
        className="glass-light absolute right-3 top-3 z-[3] inline-flex h-11 max-w-[calc(100%-24px)] items-center gap-2 rounded-pill pl-[7px] pr-3.5 text-caption font-semibold text-ink shadow-e1 transition-colors duration-(--duration-line) hover:bg-white lg:bottom-5 lg:right-5 lg:top-auto lg:gap-2.5 lg:pl-2 lg:pr-4.5 lg:text-ui">
        <i className="grid size-[30px] flex-none place-items-center rounded-pill bg-teal-900 not-italic text-white">
          <PlayIcon className="ml-0.5 size-3" />
        </i>
        <span className="truncate lg:hidden">{short}</span>
        <span className="truncate max-lg:hidden">{text}</span>
      </button>
      {open && <FilmLayer video={video} label={close} onClose={() => setOpen(false)} />}
    </>
  );
}
