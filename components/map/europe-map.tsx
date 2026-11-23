import type {ReactNode} from 'react';
import {mapSizes, project, type MapSize} from '@/lib/europe-map';

/**
 * The engraved Europe map (v6.2 map story; boards V6HomeDesktop, V6HomeMobileA):
 * the static drawing (sea hatching, land, borders, the five countries with
 * works) as an image, then one SVG layer for country names, dashed leaders and
 * the dots, and an HTML layer for whatever sits on top (photo pins, the glass
 * island). Coordinates are in the drawing's viewBox; children are positioned
 * in percent of the box. Decorative except for the label on the drawing; the
 * pins and the list carry the content.
 */

export type MapDot = {key: string; lonLat: [number, number]; large?: boolean};
export type MapLeader = {key: string; from: [number, number]; to: [number, number]};
export type MapLabel = {text: string; at: [number, number]; anchor?: 'start' | 'middle'};

export function EuropeMap({size, dots, leaders = [], labels = [], label, src: drawing, className = '', children}: {
  size: MapSize;
  /** Another drawing of the same size (the Works map card uses one without the sea). */
  src?: string;
  dots: MapDot[];
  leaders?: MapLeader[];
  labels?: MapLabel[];
  /** Accessible name of the drawing. */
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const {width, height, src: defaultSrc} = mapSizes[size];
  const src = drawing ?? defaultSrc;
  const placed = new Map<string, {x: number; y: number; large: boolean}>();
  for (const dot of dots) {
    const [x, y] = project(dot.lonLat, size);
    const key = `${Math.round(x)}:${Math.round(y)}`;
    const seen = placed.get(key);
    placed.set(key, {x, y, large: Boolean(dot.large || seen?.large)});
  }
  // Large dots (with a photo pin) are drawn last, on top.
  const ordered = [...placed.values()].sort((a, b) => Number(a.large) - Number(b.large));

  return (
    <div className={`relative ${className}`} style={{aspectRatio: `${width} / ${height}`}}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG drawing, no resizing needed */}
      <img src={src} alt={label} width={width} height={height} loading="lazy" decoding="async"
        className="absolute inset-0 size-full" />
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
        {labels.map((item) => (
          <text key={item.text} x={item.at[0]} y={item.at[1]} textAnchor={item.anchor ?? 'middle'}
            className="fill-ink-soft font-display text-[13px] font-semibold uppercase tracking-[0.16em]">
            {item.text}
          </text>
        ))}
        <g fill="none" stroke="var(--color-teal-700)" strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="3 3">
          {leaders.map((leader) => (
            <path key={leader.key} d={`M${leader.from[0].toFixed(1)} ${leader.from[1].toFixed(1)} L${leader.to[0].toFixed(1)} ${leader.to[1].toFixed(1)}`} />
          ))}
        </g>
        <g fill="var(--color-teal-700)" stroke="#fffefb" strokeWidth={2}>
          {ordered.map((dot) => (
            <circle key={`${dot.x}:${dot.y}`} cx={dot.x.toFixed(1)} cy={dot.y.toFixed(1)} r={dot.large ? 5.5 : 3.5} />
          ))}
        </g>
      </svg>
      {children}
    </div>
  );
}
