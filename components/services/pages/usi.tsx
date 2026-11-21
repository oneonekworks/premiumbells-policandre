import type {LightboxImage} from '@/components/portfolio/lightbox';
import {photoAlt} from '@/lib/alt';
import {getShell} from '@/lib/shell';
import {metres, usiCopy as copy} from '@/lib/service-copy';
import type {ServiceSection} from '@/sanity/services';
import {Nudges, Section, SectionHead, wrap} from '../blocks';
import {LightboxGroup} from '../lightbox-group';
import {StoryHero} from '../story-hero';
import {UsiModels, type Door} from '../usi-models';
import {crumbs, heroFacts, heroInsets, serviceBySlug, type PageProps} from './common';

type Models = Extract<ServiceSection, {_type: 'sectionModels'}>;
type Model = NonNullable<Models['models']>[number];

const specValue = (model: Model, label: string) =>
  model.specifications?.find((spec) => spec.label?.trim().toLowerCase() === label.toLowerCase())?.value?.trim() || null;

/**
 * The CMS models with a height (`Înălțime`, mm), lowest first: the door front
 * is the model cover, the photo set its gallery, `Montate la` its place.
 */
function doorsOf(models: Models | undefined, photoOf: string): Door[] {
  return (models?.models ?? []).flatMap((model) => {
    const mm = Number(specValue(model, copy.model.heightLabel));
    if (!mm || !model.cover?.asset) return [];
    const name = model.title ?? copy.model.title;
    const label = copy.model.photoOf.replace('{h}', metres(mm));
    const photos: LightboxImage[] = (model.gallery ?? []).map((image, index, all) =>
      ({...image, alt: photoAlt(image, label, {index, total: all.length, template: photoOf})}));
    const {width, height} = model.cover as {width?: number | null; height?: number | null};
    return [{
      key: model._key, mm, name, description: model.description ?? null, place: specValue(model, copy.model.placeLabel),
      front: model.cover, ratio: width && height ? width / height : 0.55, photos,
    }];
  }).sort((a, b) => a.mm - b.mm);
}

/**
 * /servicii/usi (boards V6ServiceUsi + Mobile, v6.3): story hero, then the five
 * copper doors at scale; choosing one fills the model block (photos → its
 * Lightbox set, Cupru · height, La comandă, price sentence, Calitate
 * garantată, place, quiet offer, the custom-door card).
 */
export async function UsiPage({lang, service, dictionary}: PageProps) {
  const models = service.sections?.find((section): section is Models => section._type === 'sectionModels');
  const doors = doorsOf(models, dictionary.portfolio.photoOf);
  const initial = Math.max(0, doors.findIndex((door) => door.mm === copy.defaultModelMm));
  const [shell, nudge] = await Promise.all([getShell(lang, dictionary), serviceBySlug(lang, copy.nudge.slug)]);

  return (
    <LightboxGroup sets={doors.map((door) => ({title: door.name, images: door.photos}))} labels={dictionary.portfolio.lightbox}
      offer={{href: '#oferta', label: dictionary.portfolio.lightbox.offer}}>
      <div className="v6-page mood-subtle">
        <StoryHero
          crumbs={crumbs(lang, dictionary, copy.hero.title)} crumbLabel={dictionary.services.breadcrumb}
          title={copy.hero.title} metal="gilt" subline={copy.hero.subline} lead={copy.hero.lead}
          factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={heroInsets(service)}
          place={service.heroPlace ?? copy.place}
        />

        <Section ground="band" id="model" className="max-lg:pb-18">
          <div className={`${wrap} max-md:px-0`}>
            <div className="grid gap-8 max-md:px-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
              <SectionHead kicker={copy.model.kicker} title={copy.model.title} />
              <p className="text-meta leading-[1.5] text-ink-soft max-lg:-mt-5 lg:max-w-[440px] lg:text-body lg:leading-[1.6]">
                <span className="lg:hidden">{copy.model.leadShort}</span><span className="max-lg:hidden">{copy.model.lead}</span>
              </p>
            </div>
            {doors.length ? <UsiModels doors={doors} initial={initial} copy={copy.model} phone={shell.company.phone} /> : null}
          </div>
        </Section>

        {nudge ? (
          <section className="m-white mt-2 py-14 lg:mt-8 lg:py-26">
            <div className={wrap}>
              <Nudges items={[{href: nudge.href, image: nudge.coverImage, question: copy.nudge.question, name: copy.nudge.name, why: copy.nudge.why}]} />
            </div>
          </section>
        ) : null}
      </div>
    </LightboxGroup>
  );
}
