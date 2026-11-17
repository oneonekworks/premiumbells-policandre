import Link from 'next/link';
import type {LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import {localizedHref} from '@/lib/i18n/routing';
import {comandaCopy as copy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import type {ServiceSection} from '@/sanity/services';
import {IncludedList, MediaPanel, Section, SectionHead, Steps, wrap} from '../blocks';
import {LightboxGroup, LightboxTrigger} from '../lightbox-group';
import {StoryHero} from '../story-hero';
import {crumbs, heroFacts, heroInsets, relatedWorks, type PageProps} from './common';

type Gallery = Extract<ServiceSection, {_type: 'sectionGallery'}>;
type Included = Extract<ServiceSection, {_type: 'sectionIncluded'}>;
type Steps = Extract<ServiceSection, {_type: 'sectionSteps'}>;

/** /servicii/policandre-la-comanda (boards V6ServiceComanda + Mobile). */
export async function ComandaPage({lang, service, dictionary}: PageProps) {
  const sections = service.sections ?? [];
  const gallery = sections.find((section): section is Gallery => section._type === 'sectionGallery');
  const included = sections.find((section): section is Included => section._type === 'sectionIncluded');
  const cmsSteps = sections.find((section): section is Steps => section._type === 'sectionSteps');
  const works = await relatedWorks(lang, service);

  const plates: LightboxImage[] = (gallery?.images ?? []).map((image, index, all) => ({
    ...image, alt: photoAlt(image, copy.plates.title, {index, total: all.length, template: dictionary.portfolio.photoOf}),
  }));
  const cover = service.coverImage?.asset ? [{...service.coverImage, _key: 'cover'} as LightboxImage] : [];
  const images = [...cover, ...plates];
  const steps = cmsSteps?.steps?.length
    ? cmsSteps.steps.map((step) => ({title: step.title ?? '', text: step.text}))
    : copy.steps.items;
  const includedItems = included?.items?.length ? included.items.map((item) => item.title ?? '') : copy.included.items;

  return (
    <LightboxGroup sets={[{title: copy.plates.title, images}]} labels={dictionary.portfolio.lightbox}>
      <div className="v6-page mood-subtle">
        <StoryHero
          crumbs={crumbs(lang, dictionary, copy.crumb, [{label: 'Policandre', href: localizedHref(lang, servicePath(null, 'policandre'))}])}
          crumbLabel={dictionary.services.breadcrumb}
          title={copy.hero.title} titleSize="large" metal="gold" subline={copy.hero.subline} lead={copy.hero.lead}
          factsLabel={dictionary.services.facts} facts={heroFacts(service)}
          photo={service.coverImage} photoRatio={5 / 7} plate wide tight insets={heroInsets(service)}
          control={cover.length ? <LightboxTrigger index={0} label={copy.zoom} className="absolute inset-0 z-[1] rounded-[24px]"><span className="sr-only">{copy.zoom}</span></LightboxTrigger> : null}
        />

        <Section ground="band">
          <div className={wrap}>
            <SectionHead kicker={copy.steps.kicker} title={cmsSteps?.heading ?? copy.steps.title} />
            <Steps steps={steps} metal="gold" />
          </div>
        </Section>

        {plates.length ? (
          <MediaPanel id="proiecte" kicker={copy.plates.kicker} title={copy.plates.title} className="mt-2 lg:mt-4">
            <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
              {plates.slice(0, copy.plates.shown).map((plate, index) => (
                <li key={plate._key}>
                  <LightboxTrigger index={cover.length + index} label={`${copy.plates.zoom}: ${plate.alt}`}
                    className="group block aspect-[5/7] w-full overflow-hidden rounded-[14px] bg-white p-2 shadow-e2 transition-[transform,box-shadow] duration-(--duration-card) ease-(--ease-light) hover:-translate-y-1.5 hover:shadow-e3 focus-visible:-translate-y-1.5 lg:rounded-image lg:p-3 motion-reduce:hover:translate-y-0">
                    <span className="relative block size-full">
                      <SanityImage image={plate} sizes="(max-width: 1024px) 50vw, 332px"
                        className="transition-transform duration-(--duration-image) ease-(--ease-light) group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
                    </span>
                  </LightboxTrigger>
                </li>
              ))}
              <li>
                <a href="#oferta" className="flex aspect-[5/7] flex-col justify-end rounded-[14px] border border-white/16 bg-white/8 p-3.5 text-on-dark lg:rounded-image lg:p-6">
                  <i aria-hidden="true" className="mb-2.5 block h-[3px] w-6 rounded-[2px] bar-gold lg:mb-3.5 lg:w-7" />
                  <b className="font-display text-2xl font-semibold leading-[1.1] lg:text-[2rem]">{copy.plates.call}</b>
                  <span className="text-link mt-2 !min-h-0 !text-teal-tint max-lg:text-meta">{copy.plates.offer}</span>
                </a>
              </li>
            </ul>
          </MediaPanel>
        ) : null}

        <Section ground="white">
          <div className={`${wrap} flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-18`}>
            <div className="contents lg:block">
              <SectionHead kicker={copy.included.kicker} title={included?.heading ?? copy.included.title} />
              <div className="order-3 max-lg:mt-7 lg:order-none lg:mt-5">
                <p className="text-[1.0625rem] leading-[1.6] text-ink-soft lg:max-w-[420px] lg:text-body">{included?.sentence ?? copy.included.sentence}</p>
                {works ? <Link href={works.href} className="text-link mt-2 lg:mt-3">{copy.included.link}</Link> : null}
              </div>
            </div>
            <IncludedList items={includedItems} metal="gold" className="order-2 max-lg:mt-7 lg:order-none" />
          </div>
        </Section>
      </div>
    </LightboxGroup>
  );
}
