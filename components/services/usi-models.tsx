'use client';

import Image from 'next/image';
import {useEffect, useRef, useState, type CSSProperties} from 'react';
import type {LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {QuietOffer} from '@/components/site/quiet-offer';
import {metres} from '@/lib/service-copy';
import type {SanityImageValue} from '@/sanity/image';
import {LightboxTrigger} from './lightbox-group';

export type Door = {
  key: string;
  /** Height in mm: the order, the scale and the `?model=` key. */
  mm: number;
  name: string;
  description: string | null;
  place: string | null;
  front: SanityImageValue | null;
  /** Width / height of the door front photo. */
  ratio: number;
  photos: LightboxImage[];
};

export type UsiModelsCopy = {
  person: string; personHeight: string; note: string; pick: string; picked: string;
  photos: string; all: string; allLabel: string; more: string; moreAll: string; zoom: string;
  material: string; height: string; position: string; price: string; priceText: string; quality: string; place: string;
  question: string; call: string; offer: string;
  own: {kicker: string; title: string; line: string};
};

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

const tile = 'group relative block size-full overflow-hidden rounded-image bg-teal-950 shadow-e2 transition-[translate,box-shadow] duration-(--duration-card) ease-(--ease-light) hover:-translate-y-1 hover:shadow-e3 focus-visible:-translate-y-1 motion-reduce:still';

/**
 * Uși v6.3 (components.md “Doors at scale · Uși”, “Model block · Uși”): the
 * five copper doors at one px-per-metre (80 desktop, 64 small desktop, 44
 * phone) on a floor line next to a 1,8 m person. Each door is a toggle
 * button; the chosen one fills the model block below (photos → Lightbox set
 * of that model, info, offer). `?model=<mm>` is read on load and replaced
 * (not pushed) on every choice.
 */
export function UsiModels({doors, initial, copy, phone}: {
  doors: Door[];
  initial: number;
  copy: UsiModelsCopy;
  phone: {href: string};
}) {
  const [chosen, setChosen] = useState(initial);
  const row = useRef<HTMLDivElement>(null);
  const door = doors[chosen];

  // Centre a door inside the row (phones scroll the row; desktop shows all five).
  const centre = (index: number, smooth: boolean) => {
    const list = row.current;
    const button = list?.querySelectorAll<HTMLElement>('[data-door]')[index];
    if (!list || !button || list.scrollWidth <= list.clientWidth) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = button.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    list.scrollTo({left: offset + button.offsetWidth / 2 - list.clientWidth / 2, behavior: smooth && !reduce ? 'smooth' : 'auto'});
  };

  useEffect(() => {
    const asked = Number(new URLSearchParams(location.search).get('model'));
    const found = doors.findIndex((item) => item.mm === asked);
    const start = found >= 0 ? found : initial;
    // Reading the address happens only in the browser; the server renders the default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (start !== initial) setChosen(start);
    centre(start, false);
  }, [doors, initial]);

  const choose = (index: number) => {
    setChosen(index);
    centre(index, true);
    const url = new URL(location.href);
    url.searchParams.set('model', String(doors[index].mm));
    history.replaceState(history.state, '', url);
  };

  const shown = door.photos.slice(0, 3);
  const more = door.photos.length - shown.length;
  const allLabel = fill(copy.allLabel, {n: door.photos.length});

  return (
    <>
      <div className="mt-7 [--ppm:44] lg:mt-14 lg:[--ppm:64] xl:[--ppm:80]">
        <div ref={row} role="group" aria-label={copy.pick}
          className="overflow-x-auto px-5 pb-1 pt-3 [scrollbar-width:none] snap-x snap-proximity lg:overflow-visible lg:px-0 lg:pt-0 [&::-webkit-scrollbar]:hidden">
          <div className="relative flex w-max min-w-full items-end gap-4 lg:justify-between lg:gap-6 lg:px-6">
          {/* The floor: under every door, above the labels (74 phone / 66 desktop). */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[74px] h-px bg-ink/22 lg:bottom-[66px]" />
          <span aria-hidden="true" className="flex flex-none flex-col items-center text-ink-soft/55">
            <svg viewBox="0 0 30 112" className="block h-[calc(var(--ppm)*1.8px)] w-[calc(var(--ppm)*1.8px*0.27)]" preserveAspectRatio="xMidYMax meet">
              <circle cx="15" cy="8" r="7" fill="currentColor" />
              <path d="M6 19h18a3 3 0 0 1 3 3v30a2.5 2.5 0 0 1-5 0V30h-1v79a3 3 0 0 1-6 0V66h-0v43a3 3 0 0 1-6 0V30H8v22a2.5 2.5 0 0 1-5 0V22a3 3 0 0 1 3-3z" fill="currentColor" />
            </svg>
            {/* Same label box as a door's height (22 / 26 tall), so the feet stand on the floor line. */}
            <span className="mt-3.5 flex h-[22px] items-end font-display text-[1.0625rem] font-semibold leading-none text-ink-soft lg:mt-4 lg:h-[26px] lg:text-xl">{copy.personHeight}</span>
            <span className="mt-1.5 h-8 max-w-24 text-center text-xs leading-[1.3] text-ink-soft lg:h-[18px] lg:max-w-none lg:whitespace-nowrap lg:text-meta">{copy.person}</span>
          </span>
          {doors.map((item, index) => {
            const on = index === chosen;
            return (
              <button key={item.key} type="button" data-door aria-pressed={on} onClick={() => choose(index)}
                aria-label={`Ușa de ${metres(item.mm)}, ${item.name}${on ? `, ${copy.picked}` : ''}`}
                style={{'--m': item.mm / 1000, '--ar': item.ratio} as CSSProperties}
                className="group flex min-w-11 flex-none snap-center flex-col items-center text-ink outline-none">
                <span className={`relative block h-[calc(var(--ppm)*var(--m)*1px)] w-[calc(var(--ppm)*var(--m)*var(--ar)*1px)] overflow-hidden rounded-[calc(var(--ppm)*var(--m)*var(--ar)*0.5px)_calc(var(--ppm)*var(--m)*var(--ar)*0.5px)_4px_4px] bg-teal-950 transition-[opacity,filter,box-shadow] duration-(--duration-fade) ease-(--ease-light) group-focus-visible:outline-3 group-focus-visible:outline-offset-6 group-focus-visible:outline-focus motion-reduce:transition-none ${
                  on ? 'opacity-100 shadow-[0_0_0_3px_var(--color-band),0_0_0_5px_var(--color-teal-700),var(--shadow-e3)]'
                    : 'opacity-78 saturate-80 shadow-e2 group-hover:opacity-100 group-hover:saturate-100 group-hover:shadow-e3 group-focus-visible:opacity-100 group-focus-visible:saturate-100 group-focus-visible:shadow-e3'
                }`}>
                  <SanityImage image={item.front && {...item.front, alt: ''}} cover sizes="(max-width: 1024px) 130px, 220px" className="!object-[50%_100%]" />
                </span>
                <span className={`mt-3.5 block whitespace-nowrap font-display text-[1.375rem] font-semibold leading-none lg:mt-4 lg:text-[1.625rem] ${
                  on ? 'text-teal-900 underline decoration-teal-700 decoration-2 underline-offset-6' : 'text-ink'}`}>{metres(item.mm)}</span>
                <span className={`mt-1.5 block h-8 max-w-24 text-center text-xs leading-[1.3] lg:h-[18px] lg:max-w-none lg:whitespace-nowrap lg:text-meta ${
                  on ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{item.name}</span>
              </button>
            );
          })}
          </div>
        </div>
        <p className="mt-3.5 px-5 text-caption text-ink-soft lg:mt-5 lg:text-center lg:text-meta">{copy.note}</p>
      </div>

      <div aria-live="polite" className="mt-9 lg:mt-18 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-14">
        <div>
          <div className="mb-1 flex items-center justify-between px-5 md:px-0 lg:mb-3">
            <p className="text-caption font-semibold text-ink-soft lg:text-meta">{copy.photos} · {door.photos.length}</p>
            {door.photos.length ? <LightboxTrigger set={chosen} index={0} label={allLabel} className="text-link !cursor-pointer">{copy.all}</LightboxTrigger> : null}
          </div>
          <ul className="grid auto-rows-[150px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 md:px-0 lg:auto-rows-[248px] lg:gap-3">
            {shown.map((photo, index) => (
              <li key={photo._key} className={index === 0 ? 'row-span-2' : index === 1 ? 'col-span-2' : ''}>
                <LightboxTrigger set={chosen} index={index} label={`${copy.zoom}: ${photo.alt}`} className={tile}>
                  <SanityImage image={photo} cover sizes={index === 0 ? '(max-width: 1024px) 50vw, 400px' : '(max-width: 1024px) 50vw, 320px'}
                    className={`transition-transform duration-(--duration-image) group-hover:scale-[1.03] motion-reduce:still ${index === 0 ? '!object-[50%_20%]' : ''}`} />
                </LightboxTrigger>
              </li>
            ))}
            {door.photos.length ? (
              <li>
                <LightboxTrigger set={chosen} index={more > 0 ? shown.length : 0} label={allLabel}
                  className={`${tile} !cursor-pointer flex flex-col items-center justify-center gap-1 px-2 text-center text-[0.8125rem] text-on-dark lg:gap-1.5 lg:text-caption`}>
                  <b className="font-display text-[1.875rem] font-semibold leading-none lg:text-[2.5rem]">{more > 0 ? `+${more}` : door.photos.length}</b>
                  {more > 0 ? copy.more : copy.moreAll}
                </LightboxTrigger>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="px-5 pt-6 md:px-0 lg:pt-0">
          <p className="flex items-center gap-2 text-meta font-semibold text-ink-soft">
            <i aria-hidden="true" className="size-3 flex-none rounded-pill bg-[linear-gradient(135deg,#4a2c1e,#a0643f)]" />
            {copy.material} · {fill(copy.height, {h: metres(door.mm)})}
            <span className="ml-auto font-medium">{fill(copy.position, {n: chosen + 1, total: doors.length})}</span>
          </p>
          <h3 className="display mt-2 text-[2.125rem] font-semibold lg:mt-2.5 lg:text-[2.75rem]">{door.name}</h3>
          <p className="mt-2 text-[1.0625rem] font-semibold text-ink">{copy.price}</p>
          {door.description ? <p className="mt-3 text-body leading-[1.6] text-ink-soft">{door.description}</p> : null}
          <p className="mt-2.5 text-caption leading-[1.55] text-ink-soft">{copy.priceText}</p>
          <p className="mt-4.5 inline-flex h-9 items-center gap-2 rounded-pill bg-teal-tint px-3.5 text-caption font-semibold text-teal-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
            {copy.quality}
          </p>
          {door.place ? <p className="mt-3.5 text-meta text-ink-soft">{fill(copy.place, {place: door.place})}</p> : null}
          <QuietOffer className="mt-6" question={copy.question} offer={{href: '#oferta', label: copy.offer}} call={{href: phone.href, label: copy.call}} />
          <a href="#oferta"
            className="mt-6 grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] border border-white/90 bg-white/70 py-2.5 pl-2.5 pr-4.5 text-ink shadow-e1 transition-[background-color,box-shadow] duration-(--duration-fade) hover:bg-white hover:shadow-e2 focus-visible:bg-white focus-visible:shadow-e2">
            <span className="grid h-24 w-18 place-items-center overflow-hidden rounded-[10px] bg-white p-1 outline outline-1 -outline-offset-1 outline-hairline">
              <Image src="/img/usa-desen.webp" alt="" width={268} height={480} sizes="64px" className="h-full w-auto object-contain" />
            </span>
            <span>
              <small className="block text-[0.8125rem] text-ink-soft">{copy.own.kicker}</small>
              <b className="block font-display text-2xl font-semibold leading-[1.15]">{copy.own.title}</b>
              <span className="mt-0.5 block text-caption text-ink-soft">{copy.own.line}</span>
            </span>
            <i aria-hidden="true" className="text-xl not-italic text-teal-700">→</i>
          </a>
        </div>
      </div>
    </>
  );
}
