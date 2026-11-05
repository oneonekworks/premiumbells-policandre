'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {alternateHref, languages, type Lang} from '@/lib/i18n/routing';

export function LanguageSwitcher({current, label, names, missing}: {
  current: Lang;
  label: string;
  names: Record<Lang, string>;
  /** Internal paths each language does not have (see alternateHref). */
  missing: Partial<Record<Lang, string[]>>;
}) {
  const pathname = usePathname();
  return (
    <div role="group" aria-label={label}>
      <ul className="flex items-center text-sm font-semibold tracking-wide">
        {languages.map((lang, index) => (
          <li key={lang} className="flex items-center">
            {index > 0 && <span aria-hidden="true" className="px-0.5 text-line">|</span>}
            {lang === current ? (
              <span aria-current="true" lang={lang} title={names[lang]} className="inline-flex min-h-11 min-w-9 items-center justify-center text-teal-700">
                {lang.toUpperCase()}
                <span className="sr-only"> ({names[lang]})</span>
              </span>
            ) : (
              <Link
                href={alternateHref(pathname, lang, missing[lang])}
                hrefLang={lang}
                lang={lang}
                className="inline-flex min-h-11 min-w-9 items-center justify-center text-ink-soft hover:text-teal-700"
              >
                {lang.toUpperCase()}
                <span className="sr-only"> ({names[lang]})</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
