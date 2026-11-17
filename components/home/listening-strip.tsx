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

// The board's generic bell-strike shape (V6HomeDesktopB): five strikes that
// decay, 96 bars. Stands in until the CMS has the recording's own waveform.
const strikeShape = Array.from({length: 96}, (_, index) => {
  const phase = ((index / 96) * 5) % 1;
  return 0.12 + 0.88 * Math.exp(-phase * 3.2) * (0.8 + 0.2 * Math.sin(index * 2.3));
});

/**
 * The listening card · v6 (boards V6HomeDesktopB, V6HomeMobileB; M34): play,
 * the "Ascultați" label, the title and the place, a link to the Clopote page,
 * then the waveform and the time. Nothing loads until play. The bars fill as
 * the recording plays. While it plays and the card has scrolled out of view,
 * a small glass mini player stays at the bottom until paused or ended.
 */
export function BellPlayer({src, type, title, duration, waveform, labels, kicker, context, link}: {
  src: string;
  type: string;
  title: string;
  duration: number | null;
  waveform: number[] | null;
  labels: {play: string; pause: string};
  /** "Ascultați", the section's heading. */
  kicker: string;
  context: string | null;
  link?: ReactNode;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration ?? 0);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const element = card.current;
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
  const bars = waveform?.length ? waveform : strikeShape;
  const timeLine = <span className="tabular-nums">{clock(time)} / {total ? clock(total) : '–:––'}</span>;

  return (
    <div ref={card}
      className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-4 rounded-tray bg-white px-5 pb-3 pt-5 shadow-e2 md:w-[min(100%,55rem)] md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:gap-x-6 md:rounded-panel md:px-8 md:pb-5.5 md:pt-7">
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

      <button type="button" onClick={toggle}
        className="grid size-15 place-items-center rounded-pill bg-teal-900 text-white transition-[background-color,scale] duration-(--duration-line) ease-light hover:scale-104 hover:bg-teal-950 motion-reduce:hover:scale-100 md:size-18">
        <PlayIcon playing={playing} className="size-5" />
        <span className="sr-only">{name}</span>
      </button>
      <div className="min-w-0">
        <h2 id="home-audio" className="text-[0.8125rem] font-semibold tracking-[0.02em] text-ink-soft md:text-[0.875rem]">{kicker}</h2>
        <p className="mt-0.5 font-display text-[1.75rem] font-semibold leading-none md:mt-1 md:text-[2.125rem]">{title}</p>
        {context && <p className="mt-0.5 text-caption text-ink-soft md:mt-1 md:text-meta">{context}</p>}
      </div>
      {link && <div className="hidden self-start md:block">{link}</div>}

      <div aria-hidden="true" className="col-span-full mt-4 flex h-11 items-center justify-between overflow-hidden md:mt-5 md:h-14">
        {bars.map((value, index) => (
          <span key={index}
            className={`w-0.5 flex-none rounded-sm transition-colors duration-(--duration-open) md:w-[3px] ${index / bars.length < progress ? 'bg-teal-700' : 'bg-teal-700/24'}`}
            style={{height: `${(((6 + Math.max(0, Math.min(1, value)) * 44) / 56) * 100).toFixed(1)}%`}} />
        ))}
      </div>
      <p className="col-span-full mt-1.5 hidden justify-self-end text-meta text-ink-soft md:block">{timeLine}</p>
      <div className="col-span-full mt-1 flex items-center justify-between border-t border-hairline md:hidden">
        {link ?? <span />}
        <span className="text-caption text-ink-soft">{timeLine}</span>
      </div>

      {/* Mini player while the card is out of view. */}
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
