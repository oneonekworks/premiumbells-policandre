'use client';

import {useEffect, useRef, useState} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {SanityImageValue} from '@/sanity/image';

/** Resolved on the server: a YouTube id or an owned file address. */
export type FacadeVideo = {title: string} & ({provider: 'youtube'; id: string} | {provider: 'file'; src: string});

// The poster stands in for the player. Nothing from YouTube or the video file
// loads until the visitor presses play; then the player takes the poster's
// place and receives focus, so keyboard users can carry on from there.
// Without a video the poster is shown on its own, with no play button.
export function VideoFacade({poster, video, playLabel, sizes}: {
  poster: SanityImageValue;
  video: FacadeVideo | null;
  playLabel: string;
  sizes: string;
}) {
  const [playing, setPlaying] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const file = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    iframe.current?.focus();
    if (file.current) {
      file.current.focus();
      file.current.play().catch(() => {});
    }
  }, [playing]);

  const frame = 'relative aspect-video overflow-hidden rounded-lg bg-teal-950 shadow-2xl shadow-teal-950/15';

  if (playing && video) {
    return (
      <div className={frame}>
        {video.provider === 'youtube' ? (
          <iframe
            ref={iframe}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video ref={file} controls preload="metadata" playsInline aria-label={video.title} className="absolute inset-0 size-full">
            <source src={video.src} />
          </video>
        )}
      </div>
    );
  }

  return (
    <div className={`${frame} group`}>
      <SanityImage image={poster} ratio={16 / 9} sizes={sizes} />
      {video && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 grid place-items-center bg-gradient-to-t from-teal-950/50 via-teal-950/10 to-transparent"
        >
          <span className="grid size-18 place-items-center rounded-full bg-paper/95 text-teal-900 shadow-xl shadow-teal-950/30 ring-8 ring-paper/20 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1 size-7"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </span>
          <span className="sr-only">{playLabel}: {video.title}</span>
        </button>
      )}
    </div>
  );
}
