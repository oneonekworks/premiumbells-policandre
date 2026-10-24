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
    <div role="alert" className="container-site py-16">
      <h1 className="font-display text-4xl font-semibold text-teal-900">{text.title}</h1>
      <p className="mt-4 text-ink-soft">{text.text}</p>
      <button type="button" className="btn btn-primary mt-8" onClick={retry}>{text.retry}</button>
    </div>
  );
}
