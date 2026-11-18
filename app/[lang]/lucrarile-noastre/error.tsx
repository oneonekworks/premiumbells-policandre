'use client';

import {usePathname} from 'next/navigation';
import {parsePublicPath} from '@/lib/i18n/routing';

const copy = {
  ro: {title: 'Lucrările nu pot fi încărcate momentan.', text: 'Verificați conexiunea și încercați din nou.', retry: 'Încearcă din nou'},
  en: {title: 'Our work cannot be loaded right now.', text: 'Check your connection and try again.', retry: 'Try again'},
};

export default function WorksError({retry}: {retry: () => void}) {
  const {lang} = parsePublicPath(usePathname());
  const text = copy[lang];
  return (
    <div role="alert" className="mx-auto max-w-(--container-page) px-5 pb-22 pt-7 md:px-6 lg:pb-34 lg:pt-11">
      <h1 className="font-display text-[2.5rem] font-medium leading-[1.05] tracking-[-0.015em] lg:text-[3.5rem]">{text.title}</h1>
      <p className="mt-4 text-ink-soft">{text.text}</p>
      <button type="button" className="btn btn-primary mt-8" onClick={retry}>{text.retry}</button>
    </div>
  );
}
