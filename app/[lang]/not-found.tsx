import Link from 'next/link';
import {currentDictionary, currentLang} from '@/lib/i18n/server';
import {localizedHref} from '@/lib/i18n/routing';

export default async function NotFound() {
  const [lang, {notFound}] = await Promise.all([currentLang(), currentDictionary()]);
  return (
    <section className="container-site py-20 sm:py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold text-teal-900">{notFound.title}</h1>
      <p className="mt-5 max-w-xl text-lg text-ink-soft">{notFound.text}</p>
      <Link href={localizedHref(lang, '/')} className="btn btn-primary mt-10">{notFound.back}</Link>
    </section>
  );
}
