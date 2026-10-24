import type {ReactNode} from 'react';
import type {Dictionary} from '@/lib/i18n/dictionaries';

// Temporary section placeholder so the shell navigation can be reviewed
// before the real pages exist.
export function ComingSoon({title, dictionary, children}: {
  title: string;
  dictionary: Dictionary;
  children?: ReactNode;
}) {
  return (
    <section className="container-site py-16 sm:py-24">
      <p className="eyebrow">{dictionary.comingSoon.title}</p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-teal-900 sm:text-6xl">{title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{dictionary.comingSoon.text}</p>
      {children && <div className="mt-10">{children}</div>}
    </section>
  );
}
