import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {currentDictionary, currentLang} from '@/lib/i18n/server';
import {localizedHref} from '@/lib/i18n/routing';
import {getShell} from '@/lib/shell';

// 404 v6 (boards V6NotFound, V6NotFoundMobile; pages.md "404"): centred
// kicker + H1 + lead + Acasă / Lucrările noastre, then "Alegeți după imagine":
// one break-out card per craft (the menus' columns: the first service's photo,
// the craft page, a short line). The footer is the only dark panel.

export default async function NotFound() {
  const [lang, dictionary] = await Promise.all([currentLang(), currentDictionary()]);
  const t = dictionary.notFound;
  const shell = await getShell(lang, dictionary);
  const crafts = shell.serviceGroups.slice(0, 3).flatMap((group, index) => {
    const first = group.items[0];
    return first ? [{title: group.title, href: group.href ?? first.href, image: first.image, metal: group.metal, line: t.crafts[index] ?? first.hint}] : [];
  });

  return (
    <div className="v6-page mood-subtle">
      <section className="m-hero px-5 pb-18 pt-14 text-center lg:pb-28 lg:pt-23">
        <p className="kicker mb-3 md:mb-4">{t.kicker}</p>
        <h1 className="text-balance font-display text-[3.75rem] font-medium leading-none tracking-[-0.015em] lg:text-[clamp(4rem,7vw,6.5rem)] lg:leading-[0.98]">{t.title}</h1>
        <p className="mt-4 text-[1.0625rem] leading-[1.6] text-ink-soft lg:mt-5 lg:text-lead">{t.text}</p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3 lg:mt-7">
          <Link href={localizedHref(lang, '/')} className="btn btn-primary">{t.home}</Link>
          <Link href={localizedHref(lang, '/lucrarile-noastre')} className="btn btn-secondary">{t.works}</Link>
        </div>
      </section>

      {crafts.length > 0 && (
        <section aria-labelledby="alegeti" className="m-band px-5 pb-22 pt-18 md:px-0 lg:py-34">
          <div className="mx-auto max-w-(--container-page) md:px-6">
            <h2 id="alegeti" className="section-title text-center">{t.choose}</h2>
            <ul className="mt-10 grid gap-7 md:grid-cols-3 md:gap-8 lg:mt-16">
              {crafts.map((craft) => (
                <li key={craft.title} className="flex">
                  <Link href={craft.href} className="bo w-full">
                    <span className="ph relative">
                      <SanityImage image={craft.image && {...craft.image, alt: craft.image.alt ?? ''}} ratio={4 / 3}
                        sizes="(min-width: 1248px) 380px, (min-width: 768px) 33vw, 100vw" />
                    </span>
                    <span className="tx max-md:px-2.5">
                      <i aria-hidden="true" className={`bar bar-${craft.metal}`} />
                      <b className="max-md:!text-[1.625rem]">{craft.title}</b>
                      {craft.line ? <small>{craft.line}</small> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
