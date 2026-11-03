import type {Metadata} from 'next';
import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {localizedHref} from '@/lib/i18n/routing';
import {languageAlternates} from '@/lib/seo';
import {servicePath, servicesPath, serviceTree} from '@/lib/services';
import {routeLang} from '@/sanity/portfolio-routes';
import {getServices} from '@/sanity/services';

export async function generateMetadata({params}: PageProps<'/[lang]/servicii'>): Promise<Metadata> {
  const lang = routeLang((await params).lang);
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.nav.services,
    description: dictionary.services.intro,
    alternates: languageAlternates(lang, {ro: servicesPath, en: servicesPath}),
  };
}

// Active top-level services in menu order, each with its variants as links.
export default async function ServicesPage({params}: PageProps<'/[lang]/servicii'>) {
  const lang = routeLang((await params).lang);
  const dictionary = getDictionary(lang);
  const services = serviceTree(await getServices(lang));

  return (
    <div className="container-site py-14 sm:py-20">
      <p className="eyebrow">{dictionary.nav.home}</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-teal-900 sm:text-6xl">
        {dictionary.nav.services}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{dictionary.services.intro}</p>

      {services.length === 0 ? (
        <p className="mt-12 rounded-lg border border-line p-6">{dictionary.services.empty}</p>
      ) : (
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service._id}>
              <div className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
                  <SanityImage
                    image={service.coverImage && {...service.coverImage, alt: photoAlt(service.coverImage, service.title ?? '')}}
                    ratio={4 / 3}
                    priority={index < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold text-teal-900">
                  <Link href={localizedHref(lang, servicePath(null, service.slug ?? ''))} className="after:absolute after:inset-0 group-hover:text-teal-700">
                    {service.title}
                  </Link>
                </h2>
                {service.cardLabel && <p className="mt-1 text-sm text-ink-soft">{service.cardLabel}</p>}
                {service.summary && <p className="mt-2 line-clamp-3 leading-relaxed text-ink-soft">{service.summary}</p>}
              </div>
              {service.variants.length > 0 && (
                <ul aria-label={`${dictionary.services.variants}: ${service.title ?? ''}`} className="mt-3 flex flex-wrap gap-2">
                  {service.variants.map((variant) => (
                    <li key={variant._id}>
                      <Link href={localizedHref(lang, servicePath(service.slug, variant.slug ?? ''))}
                        className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm hover:border-teal-700 hover:text-teal-700">
                        {variant.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
