'use client';

import Image from 'next/image';
import {createImageUrlBuilder} from '@sanity/image-url';
import {dataset, projectId} from '@/sanity/env';
import type {PROJECT_QUERY_RESULT} from '@/sanity/types';

const builder = createImageUrlBuilder({projectId, dataset});

export function SanityImage({image, cover = false}: {
  image: NonNullable<PROJECT_QUERY_RESULT>['coverImage'];
  cover?: boolean;
}) {
  if (!image?.asset?._ref) return null;
  const source = {asset: image.asset, crop: image.crop ?? undefined, hotspot: image.hotspot ?? undefined};
  return (
    <Image
      src={builder.image(source).width(800).auto('format').url()}
      loader={({width, quality}) => {
        const url = builder.image(source).width(width).quality(quality ?? 75).auto('format');
        return cover ? url.height(Math.round(width * 0.75)).fit('crop').url() : url.fit('max').url();
      }}
      alt={image.alt ?? image.caption ?? 'Fotografie din lucrare'}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
      className={cover ? 'object-cover' : 'object-contain'}
    />
  );
}
