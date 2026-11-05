import type {Metadata} from 'next';
import Link from 'next/link';
import {PortableText} from 'next-sanity';
import {FromBlog} from '@/components/blog/from-blog';
import {portableText} from '@/components/portfolio/project-details';
import {ProjectCard} from '@/components/portfolio/project-card';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {servicePath, servicesPath} from '@/lib/services';
import {sanityImageUrl} from '@/sanity/image';
import {getCategoryProjects} from '@/sanity/portfolio';
import {categoryPath, projectPath} from '@/sanity/portfolio-routes';
import type {ServiceDetail} from '@/sanity/services';
import {ContactSection, ServiceSections} from './service-sections';

/** Internal paths per published language, for canonical and hreflang. */
function servicePaths(service: ServiceDetail) {
  const ro = service.slugs.ro && servicePath(service.parent?.slugs.ro, service.slugs.ro);
  const en = service.slugs.en && (!service.parent || service.parent.slugs.en)
    ? servicePath(service.parent?.slugs.en, service.slugs.en) : null;
  return {ro: service.parent && !service.parent.slugs.ro ? null : ro, en};
}

export function serviceMetadata(lang: Lang, service: ServiceDetail): Metadata {
  const share = service.seo?.shareImage ?? service.coverImage;
  const image = share ? sanityImageUrl(share, 1200, 630) : undefined;
  const description = service.seo?.description ?? truncate(service.summary);
  return {
    title: service.seo?.title ?? service.title,
    description,
    alternates: languageAlternates(lang, servicePaths(service)),
    openGraph: {
      title: service.title ?? undefined,
      description,
      images: image && share ? [{url: image, width: 1200, height: 630, alt: photoAlt(share, service.title ?? '')}] : undefined,
    },
    ...(service.seo?.noIndex ? {robots: {index: false}} : {}),
  };
}

async function RelatedWorks({lang, category, dictionary}: {
  lang: Lang;
  category: NonNullable<ServiceDetail['relatedCategory']>;
  dictionary: Dictionary;
}) {
  if (!category.slug) return null;
  const works = (await getCategoryProjects(lang, category._id)).slice(0, 3);
  if (!works.length) return null;
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold text-teal-900">{dictionary.services.relatedWorks}</h2>
        <Link href={localizedHref(lang, categoryPath(category.slug))} className="btn btn-secondary">
          {dictionary.services.seeWorks}: {category.title}
        </Link>
      </div>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <li key={work._id}>
            <ProjectCard project={work} href={localizedHref(lang, projectPath(category.slug!, work.slug ?? ''))} countries={dictionary.countries} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// The full page of a service or a variant; a service with variants also
// lists them (Clopote → Cu jug, Fără balans).
export function ServicePage({lang, service, dictionary}: {lang: Lang; service: ServiceDetail; dictionary: Dictionary}) {
  const sections = service.sections ?? [];
  const title = service.title ?? '';
  const parentHref = service.parent?.slug ? localizedHref(lang, servicePath(null, service.parent.slug)) : null;

  return (
    <div className="container-site space-y-16 py-10 sm:py-14">
      <div>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href={localizedHref(lang, servicesPath)} className="hover:text-teal-700">{dictionary.nav.services}</Link></li>
            {service.parent && parentHref && (
              <>
                <li aria-hidden="true">/</li>
                <li><Link href={parentHref} className="hover:text-teal-700">{service.parent.title}</Link></li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{title}</li>
          </ol>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <header>
            <p className="eyebrow">{service.parent?.title ?? dictionary.nav.services}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-teal-900 sm:text-5xl">{title}</h1>
            {service.summary && <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink-soft">{service.summary}</p>}
          </header>
          {service.coverImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
              <SanityImage image={{...service.coverImage, alt: photoAlt(service.coverImage, title)}} ratio={4 / 3} priority
                sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          )}
        </div>
      </div>

      {service.body?.length ? (
        <div className="max-w-3xl space-y-4 text-lg">
          <PortableText value={service.body} components={portableText} />
        </div>
      ) : null}

      {service.variants.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-3xl font-semibold text-teal-900">{dictionary.services.variants}</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.variants.map((variant) => (
              <li key={variant._id} className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
                  <SanityImage image={variant.coverImage && {...variant.coverImage, alt: photoAlt(variant.coverImage, variant.title ?? '')}}
                    ratio={4 / 3} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-teal-900">
                  <Link href={localizedHref(lang, servicePath(service.slug, variant.slug ?? ''))}
                    className="after:absolute after:inset-0 group-hover:text-teal-700">{variant.title}</Link>
                </h3>
                {variant.cardLabel && <p className="mt-1 text-sm text-ink-soft">{variant.cardLabel}</p>}
                {variant.summary && <p className="mt-2 line-clamp-3 leading-relaxed text-ink-soft">{variant.summary}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ServiceSections sections={sections} lang={lang} dictionary={dictionary} subject={title} />

      {service.relatedCategory && <RelatedWorks lang={lang} category={service.relatedCategory} dictionary={dictionary} />}

      <FromBlog id={service._id} lang={lang} dictionary={dictionary} />

      {!sections.some((section) => section._type === 'sectionCta') && <ContactSection dictionary={dictionary} />}
    </div>
  );
}
