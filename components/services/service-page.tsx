import type {Metadata} from 'next';
import {PortableText} from 'next-sanity';
import {portableText} from '@/components/portfolio/project-details';
import {photoAlt} from '@/lib/alt';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {Lang} from '@/lib/i18n/routing';
import {languageAlternates, truncate} from '@/lib/seo';
import {servicePath} from '@/lib/services';
import {sanityImageUrl} from '@/sanity/image';
import type {ServiceDetail} from '@/sanity/services';
import {Section, wrap} from './blocks';
import {crumbs, heroFacts, heroInsets} from './pages/common';
import {ComandaPage} from './pages/comanda';
import {PolicandrePage} from './pages/policandre';
import {ReconditionarePage} from './pages/reconditionare';
import {ServiceSections} from './service-sections';
import {StoryHero} from './story-hero';

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

type Props = {lang: Lang; service: ServiceDetail; dictionary: Dictionary};

/**
 * Any other public service: the story hero, its text and its CMS sections.
 * The v6 pages (boards) are below; every current service has one.
 */
function GenericServicePage({lang, service, dictionary}: Props) {
  const title = service.shortName ?? service.title ?? '';
  const middle = service.parent?.slug ? [{label: service.parent.title ?? '', href: servicePath(null, service.parent.slug)}] : [];
  return (
    <div className="v6-page mood-subtle">
      <StoryHero crumbs={crumbs(lang, dictionary, title, middle)} crumbLabel={dictionary.services.breadcrumb}
        title={title} metal="gold" subline={service.cardLabel} lead={service.summary}
        factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={heroInsets(service)} />
      <Section ground="band">
        <div className={`${wrap} space-y-16`}>
          {service.body?.length ? (
            <div className="max-w-(--container-text) space-y-4 text-body">
              <PortableText value={service.body} components={portableText} />
            </div>
          ) : null}
          <ServiceSections sections={service.sections ?? []} lang={lang} dictionary={dictionary} subject={service.title ?? ''} />
        </div>
      </Section>
    </div>
  );
}

const pages: Record<string, (props: Props) => Promise<React.ReactNode> | React.ReactNode> = {
  policandre: PolicandrePage,
  'policandre-la-comanda': ComandaPage,
  'reconditionare-policandre': ReconditionarePage,
};

/** The v6 page of a service, chosen by its Romanian slug (boards per page). */
export function ServicePage(props: Props) {
  const Page = pages[props.service.slugs.ro ?? ''] ?? GenericServicePage;
  return <Page {...props} />;
}
