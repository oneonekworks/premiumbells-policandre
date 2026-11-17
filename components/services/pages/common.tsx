import type {LightboxImage} from '@/components/portfolio/lightbox';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {servicePath} from '@/lib/services';
import {getCategoryProjects, type ProjectCard} from '@/sanity/portfolio';
import {categoryPath} from '@/sanity/portfolio-routes';
import {getServices, type ServiceDetail, type ServiceListItem} from '@/sanity/services';
import type {Crumb, HeroFact, HeroInset} from '../story-hero';

export type PageProps = {lang: Lang; service: ServiceDetail; dictionary: Dictionary};

/** "Servicii" in every breadcrumb points at the homepage services section (no /servicii page). */
export const servicesHref = (lang: Lang) => `${localizedHref(lang, '/')}#servicii`;

/** Acasă / Servicii / …middle / current (phones drop Acasă). */
export function crumbs(lang: Lang, dictionary: Dictionary, current: string, middle: Crumb[] = []): Crumb[] {
  return [
    {label: dictionary.services.home, href: localizedHref(lang, '/')},
    {label: dictionary.nav.services, href: servicesHref(lang)},
    ...middle,
    {label: current},
  ];
}

export function heroFacts(service: ServiceDetail): HeroFact[] {
  return (service.heroFacts ?? []).flatMap((fact) => (fact.figure && fact.line ? [{figure: fact.figure, line: fact.line}] : []));
}

/** The two framed insets, or none (the CMS allows exactly two). */
export function heroInsets(service: ServiceDetail): [HeroInset, HeroInset] | [] {
  const insets = (service.heroInsets ?? []).map((inset) => ({image: inset.image ?? null, title: inset.title ?? '', line: inset.line}));
  return insets.length >= 2 ? [insets[0], insets[1]] : [];
}

/** Hero photo + inset photos as one Lightbox set (Mărește detaliile). */
export function heroPhotos(service: ServiceDetail): LightboxImage[] {
  const images = [
    service.coverImage && {...service.coverImage, _key: 'cover'},
    ...(service.heroInsets ?? []).map((inset) => inset.image && {...inset.image, _key: inset._key, caption: inset.image.caption ?? inset.title}),
  ];
  return images.filter((image): image is NonNullable<typeof image> & LightboxImage => Boolean(image?.asset));
}

/** Public service by Romanian slug (for thumbnail links and "Celălalt fel"). */
export async function serviceBySlug(lang: Lang, slug: string): Promise<(ServiceListItem & {href: string}) | null> {
  const services = await getServices(lang);
  const service = services.find((item) => item.slug === slug);
  if (!service?.slug) return null;
  const parent = service.parentId ? services.find((item) => item._id === service.parentId) : null;
  return {...service, href: localizedHref(lang, servicePath(parent?.slug, service.slug))};
}

/** The service's works (its related category), for the works sections. */
export async function relatedWorks(lang: Lang, service: ServiceDetail): Promise<{works: ProjectCard[]; slug: string; href: string} | null> {
  const category = service.relatedCategory;
  if (!category?.slug) return null;
  const works = await getCategoryProjects(lang, category._id);
  return {works, slug: category.slug, href: localizedHref(lang, categoryPath(category.slug))};
}

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
