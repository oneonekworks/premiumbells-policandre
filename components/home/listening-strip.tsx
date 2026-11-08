'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function PlayIcon({playing, className}: {playing: boolean; className: string}) {
  return playing ? (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="currentColor"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`${className} ml-0.5`} fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
  );
}

/**
 * The bell player of the listening strip (M34). Nothing loads until play.
 * The waveform comes precomputed from the CMS (100 values, 0–1); without it a
 * plain progress line stands in. While it plays and the strip has scrolled
 * out of view, a small glass mini player stays at the bottom until paused or
 * ended.
 */
export function BellPlayer({src, type, title, duration, waveform, labels, aside}: {
  src: string;
  type: string;
  title: string;
  duration: number | null;
  waveform: number[] | null;
  labels: {play: string; pause: string};
  /** The link at the end of the strip. */
  aside?: ReactNode;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration ?? 0);
  const [away, setAway] = useState(false);

  useEffect(() => {
    // The wrapper is display: contents, so watch the section it sits in.
    const element = strip.current?.closest('section');
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const element = audio.current;
    if (!element) return;
    if (element.paused) element.play().catch(() => setPlaying(false));
    else element.pause();
  };
  const progress = total ? Math.min(1, time / total) : 0;
  const name = (playing ? labels.pause : labels.play).replace('{title}', title);

  return (
    <div ref={strip} className="contents">
      <audio
        ref={audio}
        preload="none"
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => Number.isFinite(event.currentTarget.duration) && setTotal(event.currentTarget.duration)}
      >
        <source src={src} type={type} />
      </audio>

      <div className="flex min-w-0 items-center gap-5">
        <button
          type="button"
          onClick={toggle}
          className="grid size-16 shrink-0 place-items-center rounded-pill bg-teal-900 text-white transition-colors duration-(--duration-line) hover:bg-teal-950"
        >
          <PlayIcon playing={playing} className="size-5" />
          <span className="sr-only">{name}</span>
        </button>
        <div className="min-w-0 flex-1">
          {waveform?.length ? (
            <div aria-hidden="true" className="flex h-14 items-center gap-[2px]">
              {waveform.map((value, index) => (
                <span
                  key={index}
                  className={`w-[2px] shrink-0 rounded-pill transition-colors duration-(--duration-open) ${
                    index / waveform.length < progress ? 'bg-teal-700' : 'bg-teal-700/26'
                  }`}
                  style={{height: `${Math.max(8, value * 100)}%`}}
                />
              ))}
            </div>
          ) : (
            <div aria-hidden="true" className="h-1 overflow-hidden rounded-pill bg-teal-700/20">
              <div className="h-full origin-left bg-teal-700" style={{transform: `scaleX(${progress})`}} />
            </div>
          )}
          <p className="mt-2 text-caption tabular-nums text-ink-soft">
            {clock(time)}{total ? ` / ${clock(total)}` : ''}
          </p>
        </div>
      </div>
      {aside}

      {/* Mini player while the strip is out of view. */}
      <div
        inert={!(playing && away)}
        aria-hidden={!(playing && away)}
        className={`glass-light fixed inset-x-3 bottom-24 z-30 mx-auto flex max-w-sm items-center gap-3 rounded-pill p-1.5 pr-5 shadow-e2 transition-[opacity,translate] duration-(--duration-fade) ease-light lg:bottom-6 ${
          playing && away ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <button type="button" onClick={toggle} className="grid size-11 shrink-0 place-items-center rounded-pill bg-teal-900 text-white">
          <PlayIcon playing={playing} className="size-4" />
          <span className="sr-only">{name}</span>
        </button>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.875rem] font-semibold text-ink">{title}</span>
          <span aria-hidden="true" className="mt-1 block h-0.5 overflow-hidden rounded-pill bg-teal-700/20">
            <span className="block h-full origin-left bg-teal-700" style={{transform: `scaleX(${progress})`}} />
          </span>
        </span>
      </div>
    </div>
  );
}
