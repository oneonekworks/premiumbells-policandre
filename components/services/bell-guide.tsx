'use client';

import {useRef, useState, type CSSProperties} from 'react';
import {PlayIcon} from '@/components/site/icons';
import {kg} from '@/lib/bells';

/**
 * Size guide v6.2 (boards V6ClopoteCuJug, V6ClopoteFaraBalans + Mobile;
 * components.md "Size guide", "Dimension table + groups", "Set row"): the bell
 * table in weight groups and the recommended sets with miniature bells; the
 * selected row or set is drawn to scale beside a 1,75 m person (1 px = 1 cm,
 * reduced only to fit). Cu jug: oak yoke + steel hanger; fără balans: steel
 * beam + the rope on the clapper. Desktop: sticky panel left; phones: a sticky
 * panel at the bottom, small stage, no measures. Audio only where a set has a
 * recording.
 */

export type BellRow = {key: string; weight: number; diameter: number; height: number; note: string};
export type BellSet = {key: string; title: string; weights: number[]; ringer: boolean; audio: string | null};
type Kind = 'jug' | 'fix';

export type BellGuideLabels = {
  table: string;
  columns: [string, string, string, string];
  groups: [string, string, string, string];
  groupNotes: [string | null, string | null, string | null, string | null];
  groupNotePlaceholder: string;
  setsTitle: string;
  short: string;
  person: string;
  bells: string;
  ringer: string;
  play: string;
  pause: string;
  offer: string;
  offerShort: string;
};

const GROUPS = [[0, 100], [100, 1000], [1000, 5000], [5000, 1e9]] as const;
// Board geometry: desktop stage 430 × 300 with measures, phones 128 × 88.
const STAGES = {desktop: {w: 430, h: 300, dims: true, mini: 62, miniW: 330}, phone: {w: 128, h: 88, dims: false, mini: 52, miniW: 250}};
const BELL = 'M36 14C36 9 42 8 50 8C58 8 64 9 64 14C66 20 69 26 71 36C74 52 76 66 84 78C88 84 94 88 98 90L98 96L2 96L2 90C6 88 12 84 16 78C24 66 26 52 29 36C31 26 34 20 36 14Z';
const CROWN = 'M42 9L42 4Q42 0 46 0L54 0Q58 0 58 4L58 9Z';
const BANDS = 'M33 27H67M29 40H71M15 80H85M6 89H94';

const num = (value: number) => String(value).replace('.', ',');
const human = (h: number) => (h <= 40 ? 'Sub genunchiul unui om' : h <= 60 ? 'Până la genunchiul unui om' : h <= 85 ? 'Până la șoldul unui om'
  : h <= 110 ? 'Până la brâul unui om' : h <= 140 ? 'Până la pieptul unui om' : h <= 160 ? 'Până la umărul unui om'
    : h <= 185 ? 'Cât un om' : h <= 240 ? 'Mai înalt decât un om' : 'Aproape de două ori cât un om');

function BellShape({kind, className, style, rope = false, gradient}: {kind: Kind; className?: string; style?: CSSProperties; rope?: boolean; gradient: string}) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} style={style} aria-hidden="true" overflow="visible">
      <path d={CROWN} fill={`url(#${gradient})`} />
      <path d={BELL} fill={`url(#${gradient})`} />
      <circle cx="50" cy="97" r="3" fill={`url(#${gradient})`} />
      <path d={BANDS} fill="none" stroke={kind === 'jug' ? 'rgb(255 232 188 / .5)' : 'rgb(235 240 243 / .55)'} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {rope ? <path d="M50 97C32 106 4 106 -18 88" fill="none" stroke="#8a8378" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" /> : null}
    </svg>
  );
}

/** The bells drawn to scale beside the person (one stage size). */
function Stage({kind, bells, multi, stage, gradient}: {kind: Kind; bells: BellRow[]; multi: boolean; stage: typeof STAGES.desktop; gradient: string}) {
  const jug = kind === 'jug';
  const YH = jug ? 14 : 5;
  const CAP = jug ? 16 : 0;
  const single = !multi;
  const sumD = bells.reduce((sum, bell) => sum + bell.diameter * 1.2, 0) + (bells.length - 1) * 6;
  const rope = !jug && single ? bells[0].diameter * 0.2 : 0;
  const maxH = Math.max(175, ...bells.map((bell) => bell.height + YH + CAP));
  const reserve = 64 + (stage.dims ? 76 : 0);
  const k = Math.min(stage.h / maxH, (stage.w - reserve) / (sumD + 50 + rope), 1);
  const r = Math.round;
  return (
    <div className={`relative flex items-end justify-center border-b-2 border-hairline ${stage.dims ? 'mb-[34px]' : ''}`}
      style={{height: stage.h + 28, gap: Math.max(multi ? 2 : 8, r((6 + rope) * k))}}>
      <div className="relative flex">
        {stage.dims ? <span className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-caption text-ink-soft">1,75 m</span> : null}
        <svg viewBox="0 0 40 175" preserveAspectRatio="none" style={{width: r(40 * k), height: r(175 * k)}} className="block flex-none fill-[#a4b0ad]" aria-hidden="true">
          <circle cx="20" cy="13" r="12" />
          <path d="M20 29c-10 0-16 6-16 16v46h7v84h8V108h2v67h8V91h7V45c0-10-6-16-16-16z" />
        </svg>
      </div>
      {bells.map((bell, index) => {
        const w = Math.max(4, r(bell.diameter * k));
        const h = Math.max(4, r(bell.height * k));
        const ch = Math.max(2, r(CAP * k));
        const yh = Math.max(2, r(YH * k));
        return (
          <div key={`${bell.key}-${index}`} className="relative flex flex-col items-center">
            {jug ? (
              <>
                <div className="pointer-events-none absolute left-1/2 top-0 z-[1] -translate-x-1/2 rounded-t-[2px] border-solid border-[#2e3a3e]"
                  style={{
                    width: Math.max(6, r(bell.diameter * 0.3 * k)), height: ch + yh + r(bell.height * 0.05 * k),
                    borderWidth: `${Math.max(1, r(3 * k))}px ${Math.max(1, r(3 * k))}px 0`,
                    background: 'linear-gradient(90deg,transparent calc(50% - 1px),#46545a calc(50% - 1px),#46545a calc(50% + 1px),transparent calc(50% + 1px))',
                  }} />
                <div className="flex-none" style={{height: ch}} />
              </>
            ) : null}
            <div className="flex-none rounded-[2px]" style={{width: r(bell.diameter * 1.2 * k), height: yh, background: jug ? '#8a6a45' : '#6b7478'}} />
            <div className="relative" style={{width: w, height: h}}>
              <BellShape kind={kind} gradient={gradient} rope={!jug && single} style={{width: w, height: h, display: 'block'}} />
              {stage.dims && single ? (
                <>
                  <span className="absolute bottom-0 left-full ml-2 flex items-center whitespace-nowrap border-l border-ink-soft pl-1.5 text-caption text-ink-soft" style={{height: h}}>{num(bell.height)} cm</span>
                  <span className="absolute inset-x-0 top-[calc(100%+8px)] whitespace-nowrap border-t border-ink-soft pt-[3px] text-center text-caption text-ink-soft">{num(bell.diameter)} cm</span>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BellGuide({kind, rows, sets, labels, initial}: {
  kind: Kind;
  rows: BellRow[];
  sets: BellSet[];
  labels: BellGuideLabels;
  /** The row selected on load (boards: 420 kg cu jug, 60 kg fără balans). */
  initial: number;
}) {
  const [sel, setSel] = useState(Math.min(initial, rows.length - 1));
  const [setIndex, setSetIndex] = useState(-1);
  const [playing, setPlaying] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const gradient = kind === 'jug' ? 'bronzeG' : 'graphiteG';

  const rowFor = (weight: number) => rows.reduce((best, row) => (Math.abs(row.weight - weight) < Math.abs(best.weight - weight) ? row : best), rows[0]);
  const multi = setIndex >= 0;
  const activeRows = multi ? sets[setIndex].weights.map(rowFor) : [rows[sel]];
  const activeKeys = new Set(activeRows.map((row) => row.key));
  const top = activeRows.reduce((max, row) => Math.max(max, row.height), 0);
  const r0 = rows[sel];
  const set = multi ? sets[setIndex] : null;

  // Miniature bells share one scale across every set.
  const mini = (stage: typeof STAGES.desktop) => {
    const maxH = Math.max(...sets.map((item) => Math.max(...item.weights.map((weight) => rowFor(weight).height))));
    const sumD = Math.max(...sets.map((item) => item.weights.reduce((sum, weight) => sum + rowFor(weight).diameter, 0)));
    return Math.min(stage.mini / maxH, stage.miniW / sumD);
  };
  const mk = {desktop: mini(STAGES.desktop), phone: mini(STAGES.phone)};

  const toggleAudio = (index: number, url: string) => {
    if (playing === index) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    const player = new Audio(url);
    player.onended = () => setPlaying(null);
    audio.current = player;
    void player.play();
    setPlaying(index);
  };

  const kicker = multi ? `Set ${setIndex + 1} de clopote ${labels.short}` : `Clopot ${labels.short}`;
  const title = multi ? `${set!.weights.length} ${labels.bells}` : kg(r0.weight);
  const humanLine = multi ? `Cel mai mare: ${human(top).charAt(0).toLowerCase()}${human(top).slice(1)}` : human(top);
  const sub = multi ? `${set!.weights.map(num).join(', ')} kg` : `Diametru ${num(r0.diameter)} cm · Înălțime ${num(r0.height)} cm · Notă ${r0.note}`;
  const offer = multi ? `${labels.offer} Set ${setIndex + 1}` : `${labels.offer} ${kg(r0.weight)}`;

  let group = -1;
  return (
    <div className="mt-7 flex flex-col lg:mt-14 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="bronzeG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f2a16" /><stop offset=".18" stopColor="#7d5a2e" /><stop offset=".36" stopColor="#d8ae68" />
            <stop offset=".5" stopColor="#ad8344" /><stop offset=".76" stopColor="#6e4c26" /><stop offset="1" stopColor="#352312" />
          </linearGradient>
          <linearGradient id="graphiteG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1c2022" /><stop offset=".18" stopColor="#454c50" /><stop offset=".36" stopColor="#b4bdc1" />
            <stop offset=".5" stopColor="#737c81" /><stop offset=".76" stopColor="#3b4145" /><stop offset="1" stopColor="#181b1d" />
          </linearGradient>
        </defs>
      </svg>

      <aside aria-live="polite"
        className="order-last z-[5] max-lg:sticky max-lg:bottom-21 max-lg:mt-4 max-lg:grid max-lg:grid-cols-[128px_minmax(0,1fr)] max-lg:items-center max-lg:gap-3 max-lg:rounded-card max-lg:bg-white/92 max-lg:px-3 max-lg:py-2.5 max-lg:shadow-e2 max-lg:backdrop-blur-[16px] lg:sticky lg:top-26 lg:order-none lg:rounded-[24px] lg:border lg:border-white/90 lg:bg-white/70 lg:p-6 lg:shadow-e1">
        <div aria-hidden="true">
          <div className="max-lg:hidden"><Stage kind={kind} bells={activeRows} multi={multi} stage={STAGES.desktop} gradient={gradient} /></div>
          <div className="lg:hidden"><Stage kind={kind} bells={activeRows} multi={multi} stage={STAGES.phone} gradient={gradient} /></div>
        </div>
        <div>
          <p className="text-[0.8125rem] font-semibold text-ink-soft lg:mt-5 lg:text-meta">{kicker}</p>
          <b className="mt-0.5 block font-display text-[1.875rem] font-semibold leading-none lg:mt-1.5 lg:text-[3.5rem]">{title}</b>
          <p className="mt-0.5 font-display text-[1.1875rem] italic leading-[1.15] text-teal-700 lg:mt-1.5 lg:text-[1.625rem]">{humanLine}</p>
          <p className="mt-0.5 text-caption leading-[1.45] text-ink-soft lg:mt-2 lg:text-base">{sub}</p>
          <a href="#oferta" className="btn btn-primary mt-5 max-lg:hidden">{offer}</a>
          <a href="#oferta" className="text-link text-caption underline-offset-4 lg:hidden">{labels.offerShort}</a>
        </div>
      </aside>

      <div>
        <div role="table" aria-label={labels.table} className="overflow-hidden rounded-[18px] border border-white/90 bg-white/70 shadow-e1 lg:rounded-[24px]">
          <div role="row" className="grid min-h-11 grid-cols-[1.25fr_1fr_1fr_.85fr] items-center border-b border-hairline px-3 text-[0.8125rem] font-semibold text-ink-soft lg:min-h-12 lg:px-6 lg:text-meta">
            {labels.columns.map((column) => <div key={column} role="columnheader">{column}</div>)}
          </div>
          {rows.map((row, index) => {
            const groupIndex = GROUPS.findIndex(([from, to]) => row.weight >= from && row.weight < to);
            const heading = groupIndex !== group ? groupIndex : -1;
            group = groupIndex;
            const on = activeKeys.has(row.key);
            return (
              <div key={row.key} className="contents">
                {heading >= 0 ? (
                  <div role="row" className="border-b border-hairline bg-teal-tint px-3 py-2 lg:px-6 lg:py-[9px]">
                    <div role="cell" className="flex items-center justify-between gap-3">
                      <b className="text-caption font-semibold text-ink lg:text-meta">{labels.groups[heading]}</b>
                      <span className="text-[0.8125rem] text-ink-soft lg:text-caption">{labels.groupNotes[heading] ?? labels.groupNotePlaceholder}</span>
                    </div>
                  </div>
                ) : null}
                <div role="row" className={`relative grid min-h-11 grid-cols-[1.25fr_1fr_1fr_.85fr] items-center border-b border-hairline px-3 text-caption transition-colors duration-(--duration-line) last:border-b-0 lg:min-h-12 lg:px-6 lg:text-base ${
                  on ? 'bg-teal-900 text-white' : 'text-ink-soft hover:bg-teal-tint'}`}>
                  <div role="rowheader">
                    <button type="button" aria-pressed={on} onClick={() => { setSel(index); setSetIndex(-1); }}
                      className={`text-left font-semibold after:absolute after:inset-0 ${on ? 'text-white' : 'text-ink'}`}>{kg(row.weight)}</button>
                  </div>
                  <div role="cell">{num(row.diameter)} cm</div>
                  <div role="cell">{num(row.height)} cm</div>
                  <div role="cell">{row.note}</div>
                </div>
              </div>
            );
          })}
        </div>

        {sets.length ? (
          <>
            <h3 className="display mt-10 text-[1.875rem] lg:mt-14 lg:text-[2.25rem]">{labels.setsTitle}</h3>
            <ul className="mt-4 overflow-hidden rounded-[18px] border border-white/90 bg-white/70 shadow-e1 lg:mt-5 lg:rounded-[24px]">
              {sets.map((item, index) => {
                const on = index === setIndex;
                const label = `${item.weights.length} ${labels.bells} · ${item.weights.map(num).join(', ')} kg${item.ringer ? ` + ${labels.ringer}` : ''}`;
                const minis = (scale: number, height: string, gap: string, className: string) => (
                  <span className={`flex flex-none items-end ${gap} ${height} ${className}`} aria-hidden="true">
                    {item.weights.map((weight, bell) => {
                      const row = rowFor(weight);
                      return (
                        <svg key={bell} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" className="block flex-none"
                          style={{width: Math.max(5, Math.round(row.diameter * scale)), height: Math.max(5, Math.round(row.height * scale))}}>
                          <path d={CROWN} fill={on ? '#fff' : `url(#${gradient})`} />
                          <path d={BELL} fill={on ? '#fff' : `url(#${gradient})`} />
                          <circle cx="50" cy="97" r="3" fill={on ? '#fff' : `url(#${gradient})`} />
                          <path d={BANDS} fill="none" stroke={on ? 'rgb(14 58 54 / .35)' : kind === 'jug' ? 'rgb(255 232 188 / .5)' : 'rgb(255 255 255 / .34)'} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        </svg>
                      );
                    })}
                  </span>
                );
                return (
                  <li key={item.key} className={`flex items-center gap-2.5 border-b border-hairline px-3 py-2.5 transition-colors duration-(--duration-line) last:border-b-0 lg:gap-4 lg:px-5 lg:py-3 ${
                    on ? 'bg-teal-900 text-white' : 'hover:bg-teal-tint'}`}>
                    <button type="button" aria-pressed={on} onClick={() => setSetIndex(on ? -1 : index)}
                      className="flex min-w-0 flex-1 flex-col-reverse items-start gap-2 py-0.5 text-left lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-1">
                      <span className="block min-w-0">
                        <b className="block font-display text-2xl font-semibold leading-[1.1] lg:text-[1.75rem]">{item.title}</b>
                        <span className={`mt-px block text-caption leading-[1.4] lg:mt-0.5 lg:text-meta ${on ? 'text-teal-tint' : 'text-ink-soft'}`}>{label}</span>
                      </span>
                      {minis(mk.desktop, 'h-16', 'gap-[3px]', 'max-lg:hidden')}
                      {minis(mk.phone, 'h-14', 'gap-0.5', 'lg:hidden')}
                    </button>
                    {item.audio ? (
                      <button type="button" aria-label={`${playing === index ? labels.pause : labels.play} ${item.title}`} aria-pressed={playing === index}
                        onClick={() => toggleAudio(index, item.audio!)}
                        className={`grid size-11 flex-none place-items-center rounded-pill ${on ? 'bg-white text-teal-950' : 'bg-teal-900 text-white'}`}>
                        {playing === index
                          ? <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1h3v12H1zM8 1h3v12H8z" fill="currentColor" /></svg>
                          : <PlayIcon className="size-3.5" />}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
