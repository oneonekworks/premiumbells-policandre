import Link from 'next/link';
import {PhoneIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';

// Shown while the `homePage` singleton is not published in this language
// (English for now, decision 12), in the v6 type: white hero, the crafts on
// the band. Remove it, with `home.*`, once the English home page is published.
export function HomePlaceholder({lang, dictionary, phoneHref}: {lang: Lang; dictionary: Dictionary; phoneHref: string}) {
  const {home} = dictionary;
  const page = 'mx-auto max-w-(--container-page) px-5 md:px-6';
  const bars = ['bar-gold', 'bar-bronze', 'bar-gilt', 'bar-gold'];

  return (
    <div className="v6-page mood-subtle">
      <section className="m-hero pb-22 pt-7 lg:pb-34 lg:pt-11">
        <div className={page}>
          <p className="kicker mb-3 md:mb-4">{home.eyebrow}</p>
          <h1 className="max-w-4xl font-display text-[3.25rem] font-medium leading-[1.02] tracking-[-0.015em] lg:text-[clamp(4rem,7vw,6rem)] lg:leading-[0.98]">
            {home.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.6] text-ink-soft lg:text-lead">{home.lead}</p>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <Link href={localizedHref(lang, '/lucrarile-noastre')} className="btn btn-primary">{home.primary}</Link>
            <a href={phoneHref} className="btn btn-secondary">
              <PhoneIcon className="size-4 text-teal-700" />
              {home.secondary}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-crafts" className="m-band py-22 lg:py-34">
        <div className={page}>
          <h2 id="home-crafts" className="section-title">{home.servicesHeading}</h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
            {home.services.map((service, index) => (
              <li key={service.title} className="rounded-tray border border-white/90 bg-white/55 px-6 pb-7 pt-6">
                <i aria-hidden="true" className={`family-bar mb-4 block ${bars[index % bars.length]}`} />
                <h3 className="font-display text-card font-semibold leading-[1.1]">{service.title}</h3>
                <p className="mt-2 text-meta leading-[1.5] text-ink-soft">{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
