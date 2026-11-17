'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {SanityImageValue} from '@/sanity/image';

/** Resolved on the server: a YouTube id or an owned file address. */
export type FacadeVideo = {title: string} & ({provider: 'youtube'; id: string} | {provider: 'file'; src: string});

// The poster stands in for the player. Nothing from YouTube or the video file
// loads until the visitor presses play; then the player takes the poster's
// place and receives focus, so keyboard users can carry on from there.
// Without a video the poster is shown on its own, with no play button.
export function VideoFacade({poster, video, playLabel, sizes, caption, look = 'plain'}: {
  poster: SanityImageValue;
  video: FacadeVideo | null;
  playLabel: string;
  sizes: string;
  /** Glass caption on the poster ("În turnătorie · place · length"), only with a video. */
  caption?: ReactNode;
  /** `feature`: the homepage Despre noi frame (v6.2), 4:3 on phones and 16:10 from 768px, lifts on hover. */
  look?: 'plain' | 'feature';
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

  const feature = look === 'feature';
  const frame = feature
    ? 'relative aspect-[4/3] overflow-hidden rounded-card bg-band shadow-e2 transition-[translate,box-shadow] duration-(--duration-card) ease-light hover:-translate-y-2 hover:shadow-e3 has-focus-visible:-translate-y-2 has-focus-visible:shadow-e3 motion-reduce:transform-none md:aspect-[16/10] md:rounded-tray'
    : 'relative aspect-video overflow-hidden rounded-card bg-sunk shadow-e1';

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
      <span className={`absolute inset-0 transition-transform ease-light group-hover:scale-[1.03] motion-reduce:transform-none ${feature ? 'duration-[800ms]' : 'duration-(--duration-fade)'}`}>
        <SanityImage image={poster} ratio={feature ? undefined : 16 / 9} cover={feature} sizes={sizes} />
      </span>
      {video && (
        <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 grid place-items-center">
          <span className={`glass-light grid place-items-center rounded-pill text-ink transition-transform group-hover:scale-105 ${feature ? 'size-16 duration-(--duration-card) md:size-22' : 'size-15 shadow-e2 duration-(--duration-fade) lg:size-19'}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1 size-6 lg:size-7"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </span>
          <span className="sr-only">{playLabel}: {video.title}</span>
        </button>
      )}
      {video && caption && (
        <span aria-hidden="true" className={`glass-light pointer-events-none absolute rounded-caption px-3.5 py-2.5 text-[0.875rem] text-ink ${feature ? 'bottom-3 left-3 md:bottom-5 md:left-5 [&_b]:font-semibold' : 'bottom-3 left-3 font-semibold'}`}>
          {caption}
        </span>
      )}
    </div>
  );
}
