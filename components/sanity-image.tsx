'use client';

import Image from 'next/image';
import {imageBuilder, imageSource, type SanityImageValue} from '@/sanity/image';

/**
 * Fills its positioned parent. With `ratio` (width/height) the Sanity CDN crops
 * around the editor's hotspot; with `cover` the image fills a box whose shape
 * changes with the screen, centred on the hotspot; otherwise the whole image
 * is scaled to fit. Every width is a CDN transform, so originals are never
 * downloaded.
 */
export function SanityImage({image, sizes, ratio, cover = false, priority = false, className = ''}: {
  image: SanityImageValue | null | undefined;
  sizes: string;
  ratio?: number;
  cover?: boolean;
  priority?: boolean;
  className?: string;
}) {
  if (!image?.asset?._ref) return null;
  const source = imageSource(image);
  return (
    <Image
      src={imageBuilder.image(source).width(800).auto('format').url()}
      loader={({width, quality}) => {
        const url = imageBuilder.image(source).width(width).quality(quality ?? 75).auto('format');
        return ratio ? url.height(Math.round(width / ratio)).fit('crop').url() : url.fit('max').url();
      }}
      alt={image.alt ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      // The blur preview fills the box, so only use it when the image is cropped
      // to that box; letterboxed (contain) images would show a stretched blur.
      placeholder={ratio && image.lqip ? 'blur' : 'empty'}
      blurDataURL={ratio ? image.lqip ?? undefined : undefined}
      style={cover && image.hotspot ? {objectPosition: `${(image.hotspot.x ?? 0.5) * 100}% ${(image.hotspot.y ?? 0.5) * 100}%`} : undefined}
      className={`${ratio || cover ? 'object-cover' : 'object-contain'} ${className}`}
    />
  );
}
