'use client';

import {useState} from 'react';
import {Lightbox, type LightboxSet} from '@/components/portfolio/lightbox';
import {PlayIcon, ZoomInIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {photoControlClass} from './story-hero';

/**
 * The story hero's one photo control (Mărește detaliile, Priviți de aproape):
 * a glass pill on the photo that opens the Lightbox on the given sets. Phones
 * show the short label. `href` turns it into a link (the Iconostase material
 * address), so the layer stays URL-addressable.
 */
export function PhotoControl({label, shortLabel, sets, labels, title, offer, icon = 'zoom'}: {
  label: string;
  shortLabel?: string;
  sets: LightboxSet[];
  labels: Dictionary['portfolio']['lightbox'];
  title?: string | null;
  offer?: {href: string; label: string} | null;
  icon?: 'zoom' | 'play';
}) {
  const [open, setOpen] = useState<{set: number; index: number} | null>(null);
  const usable = sets.filter((set) => set.images.length);
  if (!usable.length) return null;
  const Icon = icon === 'play' ? PlayIcon : ZoomInIcon;
  return (
    <>
      <button type="button" aria-haspopup="dialog" className={photoControlClass} onClick={() => setOpen({set: 0, index: 0})}>
        <Icon className="size-4" />
        {shortLabel ? <><span className="lg:hidden">{shortLabel}</span><span className="max-lg:hidden">{label}</span></> : label}
      </button>
      {open ? (
        <Lightbox sets={usable} initialSet={open.set} index={open.index} title={title} labels={labels} offer={offer}
          onIndexChange={(index, set) => setOpen({set, index})} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
