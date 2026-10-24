import {createImageUrlBuilder} from '@sanity/image-url';
import {dataset, projectId} from './env';
import type {SanityImageCrop, SanityImageHotspot} from './types';

// Shared by Server Components (metadata, video posters) and the client image
// loader; holds only public identifiers.
export const imageBuilder = createImageUrlBuilder({projectId, dataset});

export type SanityImageValue = {
  asset: {_ref: string} | null;
  crop?: SanityImageCrop | null;
  hotspot?: SanityImageHotspot | null;
  alt?: string | null;
  caption?: string | null;
  lqip?: string | null;
};

export function imageSource(image: SanityImageValue) {
  return {asset: image.asset!, crop: image.crop ?? undefined, hotspot: image.hotspot ?? undefined};
}

/** Plain CDN URL, for attributes such as a video poster or Open Graph image. */
export function sanityImageUrl(image: SanityImageValue, width: number, height?: number): string | undefined {
  if (!image.asset?._ref) return undefined;
  const url = imageBuilder.image(imageSource(image)).width(width).auto('format');
  return height ? url.height(height).fit('crop').url() : url.url();
}
