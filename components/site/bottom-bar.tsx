'use client';

import {useEffect, useState} from 'react';
import {PhoneIcon} from './icons';

/**
 * Phones and tablets: a glass pill with "Cereți o ofertă" and "Sunați" that
 * fades and rises in once the first screen has scrolled away (M13). It steps
 * aside while the footer offer is in view and while a dialog is open.
 */
export function BottomBar({offerHref, offerLabel, phoneHref, callLabel}: {
  offerHref: string;
  offerLabel: string;
  phoneHref: string;
  callLabel: string;
}) {
  const [past, setPast] = useState(false);
  const [atOffer, setAtOffer] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(scrollY > innerHeight * 0.6);
    onScroll();
    addEventListener('scroll', onScroll, {passive: true});
    const offer = document.querySelector(offerHref);
    const observer = new IntersectionObserver(([entry]) => setAtOffer(entry.isIntersecting));
    if (offer) observer.observe(offer);
    return () => {
      removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [offerHref]);

  const shown = past && !atOffer;
  return (
    <div
      inert={!shown}
      data-shown={shown || undefined}
      className="glass-light fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md translate-y-3 gap-2 rounded-pill p-1.5 opacity-0 shadow-e2 transition-[opacity,translate] duration-(--duration-fade) ease-light data-shown:translate-y-0 data-shown:opacity-100 lg:hidden [html:has(dialog[open])_&]:hidden"
    >
      <a href={offerHref} className="btn btn-sm flex-1 bg-surface text-ink">{offerLabel}</a>
      <a href={phoneHref} className="btn btn-primary btn-sm flex-1">
        <PhoneIcon className="size-4" />
        {callLabel}
      </a>
    </div>
  );
}
