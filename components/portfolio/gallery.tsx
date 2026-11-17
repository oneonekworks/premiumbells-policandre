'use client';

import {useState} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {ProjectDetail} from '@/sanity/portfolio';
import {Lightbox, usePhotoParam} from './lightbox';

export type GalleryImage = NonNullable<ProjectDetail['gallery']>[number];

// Galleries reach 200+ photos. Thumbnails render 24 at a time (each lazy and
// CDN-resized); the lightbox pages through the whole set. The open photo is
// `?foto=N` on the address; `addressable` galleries also open from such a link.
const STEP = 24;

export function Gallery({images, labels, title, addressable = false}: {
  images: GalleryImage[];
  labels: Dictionary['portfolio'];
  title?: string | null;
  addressable?: boolean;
}) {
  const [visible, setVisible] = useState(STEP);
  const photo = usePhotoParam(images.length, addressable);

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {images.slice(0, visible).map((image, index) => (
          <li key={image._key}>
            <button
              type="button"
              onClick={() => photo.show(index)}
              aria-haspopup="dialog"
              aria-label={[labels.lightbox.open, image.alt].filter(Boolean).join(': ')}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-md bg-band"
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
      {photo.open !== null && (
        <Lightbox sets={[{images}]} index={photo.open} title={title}
          onIndexChange={(index) => photo.move(index)} onClose={photo.close} labels={labels.lightbox} />
      )}
    </>
  );
}
