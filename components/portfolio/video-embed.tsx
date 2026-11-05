'use client';

import {useState} from 'react';
import {sanityImageUrl} from '@/sanity/image';
import type {ProjectDetail} from '@/sanity/portfolio';
import {youtubeId} from '@/lib/video';

type Video = NonNullable<ProjectDetail['videos']>[number];

export {youtubeId};

// YouTube loads only after a click (privacy-enhanced domain), so a project
// with several videos does not pull in several players up front.
export function VideoEmbed({video, playLabel}: {video: Video; playLabel: string}) {
  const [playing, setPlaying] = useState(false);
  const title = video.title ?? '';
  const id = video.provider === 'youtube' ? youtubeId(video.url) : null;

  if (video.provider === 'file' && video.file) {
    return (
      <figure>
        <video controls preload="none" poster={video.poster ? sanityImageUrl(video.poster, 1280) : undefined} className="aspect-video w-full rounded-lg bg-ink">
          <source src={video.file} />
        </video>
        {title && <figcaption className="mt-2 text-sm text-ink-soft">{title}</figcaption>}
      </figure>
    );
  }
  if (!id) return null;

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0">
            {/* Remote YouTube poster; not routed through the image optimiser. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover opacity-90" />
            <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-teal-700 text-white shadow-lg transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1 size-7"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="sr-only">{playLabel}: {title}</span>
          </button>
        )}
      </div>
      {title && <figcaption className="mt-2 text-sm text-ink-soft">{title}</figcaption>}
    </figure>
  );
}
