import Link from 'next/link';
import {ArrowRightIcon, PhoneIcon} from '@/components/site/icons';
import {currentDictionary, currentLang} from '@/lib/i18n/server';
import {localizedHref} from '@/lib/i18n/routing';
import {site} from '@/lib/site';

// Placeholder home page to review the type scale, buttons, and cards. Copy and
// imagery move to the Sanity `homePage` singleton.
export default async function HomePage() {
  const lang = await currentLang();
  const {home} = await currentDictionary();

  return (
    <>
      <section className="border-b border-line bg-stone">
        <div className="container-site py-16 sm:py-24 lg:py-28">
          <p className="eyebrow">{home.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-teal-900 sm:text-6xl lg:text-7xl">
            {home.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">{home.lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={localizedHref(lang, '/lucrarile-noastre')} className="btn btn-primary">
              {home.primary}
              <ArrowRightIcon className="size-4" />
            </Link>
            <a href={site.phone.href} className="btn btn-secondary">
              <PhoneIcon className="size-4 text-teal-700" />
              {home.secondary}
            </a>
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-20">
        <h2 className="font-display text-4xl font-semibold text-teal-900">{home.servicesHeading}</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {home.services.map((service) => (
            <li key={service.title}>
              <Link
                href={localizedHref(lang, '/servicii')}
                className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-teal-900/5"
              >
                <span aria-hidden="true" className="mb-5 h-0.5 w-10 bg-gold-500" />
                <span className="font-display text-2xl font-semibold text-teal-900 group-hover:text-teal-700">{service.title}</span>
                <span className="mt-3 leading-relaxed text-ink-soft">{service.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
