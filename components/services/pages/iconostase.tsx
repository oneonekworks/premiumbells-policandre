import type {LightboxImage, LightboxSet} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {ZoomInIcon} from '@/components/site/icons';
import {photoAlt} from '@/lib/alt';
import {plural} from '@/lib/i18n/format';
import {localizedHref} from '@/lib/i18n/routing';
import {iconostaseCopy as copy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import {getService, type ServiceDetail} from '@/sanity/services';
import {Nudges, Section, SectionHead, Steps, wrap} from '../blocks';
import {MaterialLayer, MaterialLink} from '../material-layer';
import {StoryHero} from '../story-hero';
import {crumbs, heroFacts, heroInsets, serviceBySlug, type PageProps} from './common';

/** Every photo of a material page: gallery photos, or each model's cover + gallery. */
function materialImages(material: ServiceDetail, template: string): LightboxImage[] {
  const subject = material.title ?? '';
  const images = (material.sections ?? []).flatMap((section) => {
    if (section._type === 'sectionGallery') return section.images ?? [];
    if (section._type === 'sectionModels') {
      return (section.models ?? []).flatMap((model) => [
        ...(model.cover?.asset ? [{...model.cover, _key: `${model._key}-cover`, caption: model.cover.caption ?? model.title}] : []),
        ...(model.gallery ?? []),
      ]);
    }
    return [];
  });
  // The caption is the material (name + line, from the set), as on the board; the photo keeps its alt.
  return images.map((image, index, all) => ({...image, caption: null, alt: photoAlt(image, subject, {index, total: all.length, template})}));
}

/**
 * /servicii/iconostase (boards V6ServiceIconostase + Mobile), and the material
 * addresses /servicii/iconostase/marmura · /lemn-aur · /pristol-marmura, which
 * render this page with the Lightbox · Iconostase open on that material.
 */
export async function IconostasePage({lang, service, dictionary, material = null}: PageProps & {material?: string | null}) {
  const [materials, nudge] = await Promise.all([
    Promise.all(copy.materials.items.map((item) => getService(lang, service.slug, item.slug))),
    serviceBySlug(lang, copy.nudge.slug),
  ]);
  const shown = copy.materials.items.flatMap((item, index) => {
    const detail = materials[index];
    if (!detail?.slug) return [];
    const images = materialImages(detail, dictionary.portfolio.photoOf);
    return images.length ? [{...item, detail, images, href: localizedHref(lang, servicePath(service.slug, detail.slug))}] : [];
  });
  const sets: LightboxSet[] = shown.map((item) => ({tab: item.tab, title: item.name, line: item.line, images: item.images}));
  const paths = shown.map((item) => item.href);
  const basePath = localizedHref(lang, servicePath(null, service.slug ?? 'iconostase'));
  const initial = material ? shown.findIndex((item) => item.slug === material) : -1;

  return (
    <MaterialLayer sets={sets} paths={paths} basePath={basePath} initial={initial >= 0 ? initial : null}
      labels={dictionary.portfolio.lightbox} title={copy.layerTitle} offer={{href: '#oferta', label: dictionary.portfolio.lightbox.offer}}>
      <div className="v6-page mood-subtle">
        <StoryHero
          crumbs={crumbs(lang, dictionary, copy.hero.title)} crumbLabel={dictionary.services.breadcrumb}
          title={copy.hero.title} titleSize="wide" metal="gilt" subline={copy.hero.subline} lead={copy.hero.lead}
          factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={heroInsets(service)} phoneTall
          control={shown.length ? (
            <MaterialLink set={0} href={paths[0]} label={copy.closerLabel} className="group absolute inset-0 z-[1]">
              <span className="glass-light absolute bottom-3 right-3 inline-flex h-10 items-center gap-2 rounded-pill px-3.5 text-caption font-semibold text-ink shadow-e1 group-hover:bg-white lg:bottom-auto lg:right-4 lg:top-4 lg:h-11 lg:px-4.5 lg:text-meta">
                <ZoomInIcon className="size-4" />{copy.closer}
              </span>
            </MaterialLink>
          ) : null}
        />

        {shown.length ? (
          <Section ground="band" className="max-lg:pb-18">
            <div className={wrap}>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
                <SectionHead kicker={copy.materials.kicker} title={copy.materials.title} />
                <p className="text-meta leading-[1.5] text-ink-soft max-lg:-mt-5 lg:max-w-[440px] lg:text-body lg:leading-[1.6]">
                  <span className="lg:hidden">{copy.materials.leadShort}</span><span className="max-lg:hidden">{copy.materials.lead}</span>
                </p>
              </div>
              <ul className="-mx-3 mt-7 grid grid-cols-2 gap-x-2 gap-y-6 px-3 md:mx-0 md:px-0 lg:mt-16 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
                {shown.map((item, index) => (
                  <li key={item.slug} className={index === 0 ? 'col-span-2 lg:col-span-1' : ''}>
                    <MaterialLink set={index} href={item.href} className="bo bo-left group h-full max-md:!px-1.5">
                      <span className={`ph relative !aspect-[2/3] lg:!aspect-[4/5] ${index === 0 ? 'max-lg:!aspect-square' : ''}`}>
                        <SanityImage image={item.detail.coverImage && {...item.detail.coverImage, alt: item.detail.title ?? item.name}} cover
                          sizes="(max-width: 1024px) 50vw, 400px" className={index === 0 ? 'max-lg:!object-[50%_30%]' : ''} />
                        <span className="glass-light absolute bottom-2 left-2 inline-flex h-8 items-center gap-1.5 rounded-pill px-2.5 text-[0.8125rem] font-semibold text-ink lg:bottom-3 lg:left-3 lg:h-9 lg:px-3 lg:text-caption">
                          <ZoomInIcon className="size-3.5" />{plural(lang, item.images.length, copy.materials.photos)}
                        </span>
                      </span>
                      <span className="tx max-md:!px-1 max-md:!pb-2 max-md:!pt-3">
                        <i className="bar bar-gilt" aria-hidden="true" />
                        <b>{item.name}</b>
                        <small>{item.line}</small>
                      </span>
                    </MaterialLink>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        ) : null}

        <Section ground="white">
          <div className={wrap}>
            <SectionHead kicker={copy.steps.kicker} title={copy.steps.title} />
            <Steps steps={copy.steps.items} metal="gilt" />
            {nudge ? (
              <Nudges className="mt-10 lg:mt-24"
                items={[{href: nudge.href, image: nudge.coverImage, question: copy.nudge.question, name: copy.nudge.name, why: copy.nudge.why}]} />
            ) : null}
          </div>
        </Section>
      </div>
    </MaterialLayer>
  );
}
