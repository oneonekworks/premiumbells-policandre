'use client';

import {useEffect, useState} from 'react';

/**
 * Bottom bar v6 (phones and tablets): a glass pill with "Sunați" (white) and
 * "Cereți o ofertă" (teal-900), 64 tall with 52 buttons. It fades and rises in
 * once the first screen has scrolled away (M13), steps aside while the footer
 * offer is in view, and hides while a menu or the Lightbox (any dialog) is open.
 */
export function BottomBar({offerHref, offerLabel, phoneHref, callLabel, label}: {
  offerHref: string;
  offerLabel: string;
  phoneHref: string;
  callLabel: string;
  label: string;
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
    <nav
      aria-label={label}
      inert={!shown}
      data-shown={shown || undefined}
      className="glass-light fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto grid h-16 max-w-md translate-y-3 grid-cols-2 gap-1.5 rounded-pill p-1.5 opacity-0 shadow-e2 transition-[opacity,translate] duration-(--duration-fade) ease-light data-shown:translate-y-0 data-shown:opacity-100 lg:hidden [html:has(dialog[open])_&]:hidden"
    >
      <a href={phoneHref} className="btn min-h-0 bg-surface px-4 text-ui text-ink shadow-e1">{callLabel}</a>
      <a href={offerHref} className="btn btn-primary min-h-0 px-4 text-ui">{offerLabel}</a>
    </nav>
  );
}
