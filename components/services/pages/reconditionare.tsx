import type {LightboxImage, LightboxSet} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import {localizedHref} from '@/lib/i18n/routing';
import {reconditionareCopy as copy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import type {ServiceSection} from '@/sanity/services';
import {MediaPanel, Section, SectionHead, wrap} from '../blocks';
import {LightboxGroup, LightboxTrigger} from '../lightbox-group';
import {StoryHero} from '../story-hero';
import {crumbs, fill, heroFacts, heroInsets, type PageProps} from './common';

type Of<T extends ServiceSection['_type']> = Extract<ServiceSection, {_type: T}>;
type Pair = {key: string; image: LightboxImage; layout: 'stacked' | 'side'; label: string};

const chip = 'glass-light absolute inline-flex h-7 items-center rounded-pill px-2.5 text-caption font-semibold text-ink lg:h-8 lg:px-3';

/**
 * /servicii/reconditionare-policandre (boards V6ServiceReconditionare + Mobile):
 * story hero, a dark media panel of before / after squares, then the case
 * study in stages (same direction on every row; each stage's photos open the
 * Lightbox).
 */
export function ReconditionarePage({lang, service, dictionary}: PageProps) {
  const sections = service.sections ?? [];
  const pairsSection = sections.find((section): section is Of<'sectionBeforeAfter'> => section._type === 'sectionBeforeAfter');
  const gallery = sections.find((section): section is Of<'sectionGallery'> => section._type === 'sectionGallery');
  const stagesSection = sections.find((section): section is Of<'sectionStages'> => section._type === 'sectionStages');
  const stepsSection = sections.find((section): section is Of<'sectionSteps'> => section._type === 'sectionSteps');
  const photoOf = dictionary.portfolio.photoOf;

  // Before / after: the CMS pairs when they exist, else the gallery's composite squares.
  const pairs: Pair[] = pairsSection?.items?.length
    ? pairsSection.items.flatMap((pair) => (pair.after?.asset ? [{
      key: pair._key, image: {...pair.after, _key: pair._key} as LightboxImage, layout: pair.layout === 'side' ? 'side' as const : 'stacked' as const, label: pair.label ?? copy.beforeAfter.title,
    }] : []))
    : (gallery?.images ?? []).slice(0, copy.beforeAfter.shown).map((image, index) => ({
      key: image._key, image, layout: copy.beforeAfter.layouts[index] ?? 'stacked', label: photoAlt(image, copy.beforeAfter.title),
    }));

  // Stages: the CMS "Etapele unei lucrări", else the legacy steps.
  const stages = (stagesSection?.items ?? stepsSection?.steps ?? []).map((stage) => ({
    key: stage._key, title: stage.title ?? '', text: stage.text,
    images: (stage.images ?? []).map((image, index, all) => ({...image, alt: photoAlt(image, stage.title ?? '', {index, total: all.length, template: photoOf})})),
  }));
  const sets: LightboxSet[] = [
    {title: copy.beforeAfter.title, images: pairs.map((pair) => pair.image)},
    ...stages.map((stage) => ({title: stage.title, line: stage.text, images: stage.images})),
  ];

  return (
    <LightboxGroup sets={sets} labels={dictionary.portfolio.lightbox}>
      <div className="v6-page mood-subtle">
        <StoryHero
          crumbs={crumbs(lang, dictionary, copy.hero.title, [{label: 'Policandre', href: localizedHref(lang, servicePath(null, 'policandre'))}])}
          crumbLabel={dictionary.services.breadcrumb}
          title={copy.hero.title} titleSize="long" sublineEm={0.4} metal="gold" subline={copy.hero.subline} lead={copy.hero.lead}
          factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={heroInsets(service)}
        />

        {pairs.length ? (
          <MediaPanel kicker={copy.beforeAfter.kicker} title={pairsSection?.heading ?? copy.beforeAfter.title} className="mt-2 max-lg:pb-4 lg:mt-4">
            <ul className="grid gap-3 lg:grid-cols-3 lg:gap-4">
              {pairs.map((pair, index) => (
                <li key={pair.key}>
                  <LightboxTrigger index={index} label={`${copy.stages.zoom}: ${pair.label}`}
                    className="relative block aspect-square w-full overflow-hidden rounded-image bg-teal-950 lg:rounded-card">
                    <SanityImage image={pair.image} ratio={1} sizes="(max-width: 1024px) 100vw, 448px" />
                    <span className={`${chip} left-3 top-3`}>{copy.beforeAfter.before}</span>
                    <span className={`${chip} ${pair.layout === 'side' ? 'left-[calc(50%+10px)] top-3' : 'left-3 top-[calc(50%+10px)]'}`}>{copy.beforeAfter.after}</span>
                  </LightboxTrigger>
                </li>
              ))}
            </ul>
          </MediaPanel>
        ) : null}

        {stages.length ? (
          <Section ground="band" id="etape" className="mt-2 lg:mt-4">
            <div className={wrap}>
              <SectionHead kicker={stagesSection?.church ? [stagesSection.church, stagesSection.place].filter(Boolean).join(' · ') : copy.stages.kicker}
                title={copy.stages.title} />
              <ol className="mt-10 flex flex-col gap-14 lg:mt-18 lg:gap-22">
                {stages.map((stage, index) => (
                  <li key={stage.key} className="grid gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start lg:gap-16">
                    <div>
                      <div className="font-display text-[3.5rem] font-semibold leading-[.9] lg:text-[4.5rem]">
                        <i aria-hidden="true" className="mb-4 block h-[3px] w-6 rounded-[2px] bar-gold lg:mb-6 lg:w-7" />
                        {index + 1}
                      </div>
                      <h3 className="mt-2.5 font-display text-[1.75rem] font-semibold leading-[1.1] lg:mt-4 lg:text-[2.25rem]">{stage.title}</h3>
                      {stage.text ? <p className="mt-2 text-meta leading-[1.55] text-ink-soft lg:mt-3 lg:max-w-[340px] lg:text-body lg:leading-[1.6]">{stage.text}</p> : null}
                      {stage.images.length ? (
                        <LightboxTrigger index={0} set={index + 1} label={fill(copy.stages.all, {n: stage.images.length})} className="text-link mt-2">
                          {fill(copy.stages.all, {n: stage.images.length})}
                        </LightboxTrigger>
                      ) : null}
                    </div>
                    <ul className="grid grid-cols-2 gap-2 lg:gap-4">
                      {stage.images.slice(0, 4).map((image, photo) => (
                        <li key={image._key}>
                          <LightboxTrigger index={photo} set={index + 1} label={`${copy.stages.zoom}: ${image.alt}`}
                            className="group relative block aspect-[3/2] w-full overflow-hidden rounded-[12px] bg-band shadow-e1 lg:rounded-image">
                            <SanityImage image={image} ratio={3 / 2} sizes="(max-width: 1024px) 50vw, 380px"
                              className="transition-transform duration-(--duration-image) ease-(--ease-light) group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
                          </LightboxTrigger>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        ) : null}
      </div>
    </LightboxGroup>
  );
}
