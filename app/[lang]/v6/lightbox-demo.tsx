'use client';

import {useState} from 'react';
import {Lightbox, type LightboxSet} from '@/components/portfolio/lightbox';
import {photoControlClass} from '@/components/services/story-hero';
import {ZoomInIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';

/** Preview only: the Lightbox with material tabs (Lightbox · Iconostase), opened from a hero photo control. */
export function LightboxDemo({sets, labels, label}: {sets: LightboxSet[]; labels: Dictionary['portfolio']['lightbox']; label: string}) {
  const [open, setOpen] = useState<{set: number; index: number} | null>(null);
  return (
    <>
      <button type="button" aria-haspopup="dialog" className={photoControlClass} onClick={() => setOpen({set: 0, index: 0})}>
        <ZoomInIcon className="size-4" />{label}
      </button>
      {open ? (
        <Lightbox sets={sets} initialSet={open.set} index={open.index} title="Iconostase" labels={labels}
          offer={{href: '#oferta', label: labels.offer}}
          onIndexChange={(index, set) => setOpen({set, index})} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
