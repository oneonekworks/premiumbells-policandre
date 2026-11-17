'use client';

import {createContext, useContext, useState, type ReactNode} from 'react';
import {Lightbox, type LightboxSet} from '@/components/portfolio/lightbox';
import type {Dictionary} from '@/lib/i18n/dictionaries';

/**
 * One Lightbox for a group of photos on a service page (drawing plates, before /
 * after pairs, stage photos, the Uși photo group). Server-rendered tiles become
 * buttons with <LightboxTrigger index={n}>; the provider owns the layer. With
 * several sets (Iconostase materials) the trigger names its set.
 */
type Open = {set: number; index: number};
const Context = createContext<((open: Open) => void) | null>(null);

export function LightboxGroup({sets, labels, title, offer, initial = null, children}: {
  sets: LightboxSet[];
  labels: Dictionary['portfolio']['lightbox'];
  title?: string | null;
  offer?: {href: string; label: string} | null;
  /** Open on load (a material address such as /servicii/iconostase/marmura). */
  initial?: Open | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<Open | null>(initial);
  return (
    <Context.Provider value={setOpen}>
      {children}
      {open && sets[open.set]?.images.length ? (
        <Lightbox sets={sets} initialSet={open.set} index={open.index} title={title} labels={labels} offer={offer}
          onIndexChange={(index, set) => setOpen({set, index})} onClose={() => setOpen(null)} />
      ) : null}
    </Context.Provider>
  );
}

export function LightboxTrigger({index, set = 0, label, className = '', children}: {
  index: number;
  set?: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const open = useContext(Context);
  return (
    <button type="button" aria-haspopup="dialog" aria-label={label} className={`cursor-zoom-in text-left ${className}`}
      onClick={() => open?.({set, index})}>
      {children}
    </button>
  );
}
