'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {alternateHref, languages, type Lang} from '@/lib/i18n/routing';

export function LanguageSwitcher({current, label, names, missing, onDark = false}: {
  current: Lang;
  /** On teal-950 (the footer). */
  onDark?: boolean;
  label: string;
  names: Record<Lang, string>;
  /** Internal paths each language does not have (see alternateHref). */
  missing: Partial<Record<Lang, string[]>>;
}) {
  const pathname = usePathname();
  return (
    <div role="group" aria-label={label}>
      <ul className="flex items-center text-chip font-semibold tracking-wide">
        {languages.map((lang, index) => (
          <li key={lang} className="flex items-center">
            {index > 0 && <span aria-hidden="true" className={`px-0.5 ${onDark ? 'text-on-dark/30' : 'text-ink/25'}`}>|</span>}
            {lang === current ? (
              <span aria-current="true" lang={lang} title={names[lang]} className={`inline-flex min-h-11 min-w-9 items-center justify-center ${onDark ? 'text-on-dark' : 'text-teal-900'}`}>
                {lang.toUpperCase()}
                <span className="sr-only"> ({names[lang]})</span>
              </span>
            ) : (
              <Link
                href={alternateHref(pathname, lang, missing[lang])}
                hrefLang={lang}
                lang={lang}
                className={`inline-flex min-h-11 min-w-9 items-center justify-center ${onDark ? 'text-on-dark-soft hover:text-on-dark' : 'text-ink-soft hover:text-teal-700'}`}
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

/**
 * v6 "RO / EN": one link to the other language (header, mobile menu, footer).
 * The aria-label names the current language and offers the other one in its
 * own language ("Limba: română. Switch to English").
 */
export function LanguageToggle({current, names, missing, variant = 'header'}: {
  current: Lang;
  names: Record<Lang, string> & {label: string; switchTo: string};
  missing: Partial<Record<Lang, string[]>>;
  variant?: 'header' | 'menu' | 'footer';
}) {
  const pathname = usePathname();
  const other = languages.find((lang) => lang !== current) ?? current;
  const styles = {
    header: 'inline-flex h-11 items-center rounded-pill px-4 text-[0.875rem] font-medium text-ink-soft transition-colors duration-(--duration-line) hover:bg-teal-tint',
    menu: 'text-link text-ink-soft',
    footer: 'inline-flex h-11 items-center rounded-pill border border-on-dark/18 px-3.5 text-[0.8125rem] font-semibold tracking-[0.04em] text-on-dark hover:bg-on-dark/8 md:h-10',
  };
  return (
    <Link
      href={alternateHref(pathname, other, missing[other])}
      hrefLang={other}
      aria-label={`${names.label}: ${names[current].toLowerCase()}. ${names.switchTo}`}
      className={styles[variant]}
    >
      {languages.map((lang) => lang.toUpperCase()).join(' / ')}
    </Link>
  );
}
