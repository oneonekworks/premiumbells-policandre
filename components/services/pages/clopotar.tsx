import {VideoFacade, type FacadeVideo} from '@/components/home/video-facade';
import type {LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import {localizedHref} from '@/lib/i18n/routing';
import {clopotarCopy as copy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import {youtubeId} from '@/lib/video';
import type {SanityImageValue} from '@/sanity/image';
import type {ServiceSection} from '@/sanity/services';
import {MediaPanel, Section, SectionHead, wrap} from '../blocks';
import {LightboxGroup, LightboxTrigger} from '../lightbox-group';
import {StoryHero} from '../story-hero';
import {crumbs, heroFacts, heroInsets, type PageProps} from './common';

type Of<T extends ServiceSection['_type']> = Extract<ServiceSection, {_type: T}>;
type Part = {anchor: string; name: string; code: string; text: string; image: SanityImageValue | null};

const card = 'flex rounded-[18px] border border-white/90 bg-white/70 shadow-e1 lg:rounded-[24px]';

function PartCard({part, row = false}: {part: Part; row?: boolean}) {
  return (
    <div className={`${card} items-center gap-3 p-2.5 ${row ? 'lg:flex-row lg:gap-4.5 lg:p-3.5' : 'lg:flex-col lg:items-stretch lg:gap-0 lg:p-3.5'}`}>
      <span className={`relative block h-[92px] w-28 flex-none overflow-hidden rounded-[12px] bg-white p-1.5 ${row ? 'lg:h-28 lg:w-[150px] lg:rounded-image lg:p-2' : 'lg:aspect-[4/3] lg:h-auto lg:w-full lg:rounded-image lg:p-4'}`}>
        <span className="relative block size-full">
          {part.image?.asset ? <SanityImage image={{...part.image, alt: part.name}} sizes="(max-width: 1024px) 112px, 360px" />
            : <span className="grid size-full place-items-center bg-teal-tint text-[0.75rem] text-ink-soft">[fotografie]</span>}
        </span>
      </span>
      <div className={`min-w-0 ${row ? 'lg:px-2 lg:py-1.5' : 'lg:px-2.5 lg:pb-3 lg:pt-4.5'}`}>
        <b className={`block font-display text-[1.4375rem] font-semibold leading-[1.1] ${row ? 'lg:text-[1.625rem]' : 'lg:text-[1.875rem]'}`}>{part.name}</b>
        <span className="mt-0.5 block text-caption font-semibold text-teal-700 lg:mt-1 lg:text-meta">{part.code}</span>
        <p className={`mt-1 text-caption leading-[1.5] text-ink-soft ${row ? 'lg:mt-1.5 lg:text-meta' : 'lg:mt-2.5 lg:text-base'}`}>{part.text}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div aria-hidden="true" className="flex h-8 items-center justify-center text-ink-soft max-lg:rotate-90 lg:h-auto">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </div>
  );
}

function videoOf(video: NonNullable<Of<'sectionVideos'>['videos']>[number], fallback: string): FacadeVideo | null {
  const title = video.title ?? fallback;
  if (video.provider === 'youtube') {
    const id = youtubeId(video.url);
    return id ? {provider: 'youtube', id, title} : null;
  }
  return video.file ? {provider: 'file', src: video.file, title} : null;
}

/** /servicii/clopotar-electronic (boards V6ClopotarElectronic + Mobile). */
export function ClopotarPage({lang, service, dictionary}: PageProps) {
  const sections = service.sections ?? [];
  const models = sections.find((section): section is Of<'sectionModels'> => section._type === 'sectionModels');
  const gallery = sections.find((section): section is Of<'sectionGallery'> => section._type === 'sectionGallery');
  const videos = sections.find((section): section is Of<'sectionVideos'> => section._type === 'sectionVideos');
  const factsSection = sections.find((section): section is Of<'sectionFacts'> => section._type === 'sectionFacts');
  const byAnchor = new Map((models?.models ?? []).map((model) => [model.anchorId, model]));
  const part = (item: (typeof copy.flow.steps)[number]): Part => ({...item, image: byAnchor.get(item.anchor)?.cover ?? null});

  // The full feature list: the CMS facts section, else the controller's description, one line each.
  const fullList = factsSection?.fullList?.length
    ? factsSection.fullList.map((item) => item.text ?? '').filter(Boolean)
    : (byAnchor.get(copy.facts.listFrom)?.description ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  const facts = factsSection?.items?.length
    ? factsSection.items.map((item) => ({value: item.value ?? '', label: item.label ?? ''}))
    : copy.facts.items;
  const photos: LightboxImage[] = (gallery?.images ?? []).map((image, index, all) => ({
    ...image, alt: photoAlt(image, copy.photos.title, {index, total: all.length, template: dictionary.portfolio.photoOf}),
  }));
  const tiles = (videos?.videos ?? []).flatMap((video) => {
    const resolved = videoOf(video, copy.videos.title);
    return resolved && video.poster?.asset ? [{key: video._key, video: resolved, poster: video.poster}] : [];
  });

  return (
    <LightboxGroup sets={[{title: copy.photos.title, images: photos}]} labels={dictionary.portfolio.lightbox}>
      <div className="v6-page mood-subtle">
        <StoryHero
          crumbs={crumbs(lang, dictionary, copy.hero.title, [
            {label: 'Clopote', href: localizedHref(lang, servicePath(null, 'clopote'))},
            {label: 'Fără balans', href: localizedHref(lang, servicePath('clopote', 'fara-balans'))},
          ])}
          crumbLabel={dictionary.services.breadcrumb}
          title={copy.hero.title} titleSize="words" sublineEm={0.42} metal="graphite" subline={copy.hero.subline} lead={copy.hero.lead}
          factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} photoRatio={16 / 10}
          insets={heroInsets(service)} insetLayout="clopotar" tight
        />

        <Section ground="band">
          <div className={wrap}>
            <SectionHead kicker={copy.flow.kicker} title={copy.flow.title} />
            <div className="mt-7 grid items-stretch lg:mt-14 lg:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)_44px_minmax(0,1fr)]">
              {copy.flow.steps.map((step, index) => (
                <div key={step.anchor} className="contents">
                  {index ? <Arrow /> : null}
                  <PartCard part={part(step)} />
                </div>
              ))}
            </div>
            <p className="kicker mt-12 text-center max-lg:mt-10">{copy.flow.optional}</p>
            <div className="mx-auto mt-3 grid max-w-[960px] gap-2.5 lg:mt-5 lg:grid-cols-2 lg:gap-6">
              {copy.flow.options.map((option) => <PartCard key={option.anchor} part={part(option)} row />)}
            </div>
          </div>
        </Section>

        <Section ground="white">
          <div className={`${wrap} lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start lg:gap-18`}>
            <SectionHead kicker={copy.facts.kicker} title={factsSection?.heading ?? copy.facts.title} />
            <div className="mt-6 lg:mt-0">
              <dl className="grid grid-cols-2 gap-x-4 lg:grid-cols-3 lg:gap-x-8">
                {facts.map((fact) => (
                  <div key={fact.value + fact.label} className="border-t border-hairline pb-3.5 pt-3 lg:pb-5.5 lg:pt-4.5">
                    <dt className="font-display text-[2.25rem] font-semibold leading-none lg:text-[3.25rem]">{fact.value}</dt>
                    <dd className="mt-1 text-caption leading-[1.4] text-ink-soft lg:mt-1.5 lg:text-meta">{fact.label}</dd>
                  </div>
                ))}
              </dl>
              {fullList.length ? (
                <details className="mt-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-teal-700">
                    {copy.facts.all}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="transition-transform [details[open]_&]:rotate-180"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
                  </summary>
                  <ul className="mt-3 list-disc pl-5 text-meta leading-[1.5] text-ink-soft lg:columns-2 lg:gap-x-10 lg:text-base">
                    {fullList.map((line) => <li key={line} className="mb-1.5 break-inside-avoid lg:mb-2">{line}</li>)}
                  </ul>
                </details>
              ) : null}
            </div>
          </div>
        </Section>

        <MediaPanel id="filme" kicker={copy.videos.kicker} title={videos?.heading ?? copy.videos.title} className="max-lg:pb-4">
          <ul className="grid gap-2.5 lg:grid-cols-3 lg:gap-4">
            {tiles.length ? tiles.map((tile) => (
              <li key={tile.key}>
                <VideoFacade poster={tile.poster} video={tile.video} playLabel={copy.videos.play} sizes="(max-width: 1024px) 100vw, 448px" />
              </li>
            )) : Array.from({length: copy.videos.slots}, (_, index) => (
              <li key={index} className="grid aspect-video place-items-center rounded-[14px] border border-white/12 bg-white/6 text-caption text-on-dark-soft lg:rounded-image">
                {copy.videos.placeholder}
              </li>
            ))}
          </ul>
        </MediaPanel>

        {photos.length ? (
          <Section ground="band" className="mt-2 lg:mt-4">
            <div className={wrap}>
              <SectionHead kicker={copy.photos.kicker} title={copy.photos.title} />
              <ul className="mt-7 grid grid-cols-2 gap-2 lg:mt-12 lg:grid-cols-3 lg:gap-4">
                {photos.slice(0, copy.photos.shown).map((photo, index) => (
                  <li key={photo._key}>
                    <LightboxTrigger index={index} label={`${copy.photos.zoom}: ${photo.alt}`}
                      className="group relative block aspect-square w-full overflow-hidden rounded-[12px] bg-band shadow-e1 lg:rounded-image">
                      <SanityImage image={photo} ratio={1} sizes="(max-width: 1024px) 50vw, 400px"
                        className="transition-transform duration-(--duration-image) ease-(--ease-light) group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
                    </LightboxTrigger>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        ) : null}
      </div>
    </LightboxGroup>
  );
}
