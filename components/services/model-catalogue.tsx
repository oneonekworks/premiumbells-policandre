'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {Lightbox, type LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import type {Dictionary} from '@/lib/i18n/dictionaries';

/**
 * Policandre model catalogue (boards V6ServicePolicandre + Mobile, components.md
 * "Model card", "Level filter"): a level filter that changes the grid without
 * a reload, then break-out model cards (text left) with 2 × 2 specs and one row
 * per finish (dot, finish name, "cod …" | price). Prices: a temporary "La
 * comandă" until the client sends the list (user, 2026-11-17). The photo opens
 * the Lightbox. Phones show 12 cards + "Arătați toate modelele". Legacy
 * `#Policandru-N` anchors land on their card (the filter resets to Toate).
 */

export type CatalogueModel = {
  key: string;
  /** DOM ids: legacy anchors (`Policandru-7`) and the slug. */
  ids: string[];
  group: string;
  name: string;
  number: string | null;
  specs: {label: string; value: string}[];
  finishes: {key: string; label: string; code: string | null; dot: 'aur' | 'lac'; price: string}[];
  image: LightboxImage | null;
  placeholder: string;
};

const PHONE_LIMIT = 12;

export function ModelCatalogue({head, models, filters, labels, lightbox}: {
  /** Kicker, title and lead; the desktop filter sits right of it. */
  head: ReactNode;
  models: CatalogueModel[];
  filters: {id: string; label: string}[];
  labels: {filter: string; showAll: string; zoom: string; code: string};
  lightbox: Dictionary['portfolio']['lightbox'];
}) {
  const [group, setGroup] = useState('all');
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const shown = models.filter((model) => group === 'all' || model.group === group);
  const photos = shown.flatMap((model) => (model.image ? [{...model.image, caption: model.image.caption ?? model.name}] : []));

  // A legacy anchor (#Policandru-7) shows every model and scrolls to its card.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || !models.some((model) => model.ids.includes(id))) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the address once on load
    setMore(true);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({block: 'start'}));
  }, [models]);

  const pick = (id: string) => {
    setGroup(id);
    setMore(false);
  };

  const filterButtons = (phone: boolean) => filters.map((filter) => {
    const on = filter.id === group;
    return (
      <button key={filter.id} type="button" aria-pressed={on} onClick={() => pick(filter.id)}
        className={phone ? 'chip flex-none text-meta' : `h-10 rounded-pill px-4 text-meta font-medium transition-colors duration-(--duration-line) ${on ? 'bg-teal-900 text-white' : 'text-ink hover:bg-teal-tint'}`}>
        {filter.label}
      </button>
    );
  });

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
        {head}
        <div role="group" aria-label={labels.filter} className="glass-light inline-flex gap-0.5 rounded-pill p-1 shadow-e1 max-lg:hidden">
          {filterButtons(false)}
        </div>
      </div>
      <div role="group" aria-label={labels.filter} className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none] lg:hidden">
        {filterButtons(true)}
      </div>
      <ul className="-mx-3 mt-6 grid grid-cols-2 gap-x-2 gap-y-6 px-3 md:mx-0 md:grid-cols-3 md:px-0 lg:mt-16 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10" data-catalogue>
        {shown.map((model, index) => {
          let photo = -1;
          if (model.image) photo = photos.findIndex((image) => image._key === model.image!._key);
          const hiddenOnPhone = !more && index >= PHONE_LIMIT;
          return (
            <li key={model.key} id={model.ids[0]} className={`bo bo-left mc scroll-mt-28 ${hiddenOnPhone ? 'max-md:hidden' : ''}`}>
              {model.ids.slice(1).map((id) => <span key={id} id={id} aria-hidden="true" />)}
              <button type="button" className="ph relative cursor-zoom-in" aria-haspopup="dialog" aria-label={`${labels.zoom}: ${model.name}${model.number ? `, ${model.number}` : ''}`}
                onClick={() => photo >= 0 && setOpen(photo)} disabled={photo < 0}>
                {model.image
                  ? <SanityImage image={{...model.image, alt: model.name}} sizes="(max-width: 768px) 50vw, 280px" className="p-3.5" />
                  : <span className="grid h-full place-items-center bg-teal-tint text-caption font-medium text-ink-soft">{model.placeholder}</span>}
              </button>
              <div className="tx">
                <i className="bar bar-gold" aria-hidden="true" />
                <b>{model.name}</b>
                <span className="nr">{model.number}</span>
                <dl className="sp">
                  {model.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
                </dl>
                <ul className="fin">
                  {model.finishes.map((finish) => (
                    <li key={finish.key}>
                      <i className={finish.dot === 'aur' ? 'dot-aur' : 'dot-lac'} aria-hidden="true" />
                      <span className="fn"><span>{finish.label}</span>{finish.code ? <small>{labels.code} {finish.code}</small> : null}</span>
                      <span className="pr">{finish.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
      {!more && shown.length > PHONE_LIMIT ? (
        <div className="mt-7 md:hidden">
          <button type="button" className="btn btn-secondary w-full" onClick={() => setMore(true)}>{labels.showAll}</button>
        </div>
      ) : null}
      {open !== null && photos.length ? (
        <Lightbox sets={[{images: photos}]} index={open} labels={lightbox}
          onIndexChange={(index) => setOpen(index)} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
