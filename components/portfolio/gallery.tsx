'use client';

import {useState} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {ProjectDetail} from '@/sanity/portfolio';
import {Lightbox} from './lightbox';

export type GalleryImage = NonNullable<ProjectDetail['gallery']>[number];

// Galleries reach 200+ photos. Thumbnails render 24 at a time (each lazy and
// CDN-resized); the lightbox pages through the whole set.
const STEP = 24;

export function Gallery({images, labels}: {images: GalleryImage[]; labels: Dictionary['portfolio']}) {
  const [visible, setVisible] = useState(STEP);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {images.slice(0, visible).map((image, index) => (
          <li key={image._key}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={[labels.lightbox.open, image.alt].filter(Boolean).join(': ')}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-md bg-stone"
            >
              <SanityImage
                image={image}
                ratio={1}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      {visible < images.length && (
        <div className="mt-6 text-center">
          <button type="button" className="btn btn-secondary" onClick={() => setVisible((count) => count + STEP)}>
            {labels.showMore} ({images.length - visible})
          </button>
        </div>
      )}
      {open !== null && (
        <Lightbox images={images} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} labels={labels.lightbox} />
      )}
    </>
  );
}
