import type {LightboxImage} from '@/components/portfolio/lightbox';
import {SanityImage} from '@/components/sanity-image';
import {QuietOffer} from '@/components/site/quiet-offer';
import {photoAlt} from '@/lib/alt';
import {getShell} from '@/lib/shell';
import {usiCopy as copy} from '@/lib/service-copy';
import type {ServiceSection} from '@/sanity/services';
import {Nudges, Section, SectionHead, wrap} from '../blocks';
import {LightboxGroup, LightboxTrigger} from '../lightbox-group';
import {StoryHero} from '../story-hero';
import {crumbs, fill, heroFacts, heroInsets, serviceBySlug, type PageProps} from './common';

type Models = Extract<ServiceSection, {_type: 'sectionModels'}>;

const tile = 'group relative block size-full overflow-hidden rounded-image bg-teal-950 shadow-e2 transition-[transform,box-shadow] duration-(--duration-card) ease-(--ease-light) hover:-translate-y-1 hover:shadow-e3 focus-visible:-translate-y-1 motion-reduce:hover:translate-y-0';

/**
 * /servicii/usi (boards V6ServiceUsi + Mobile): the client keeps one door
 * model, Uși din cupru, shown inline: photo group (front view, detail, the
 * mounted doors, "+N" tile; each opens the Lightbox) | Cupru, La comandă,
 * Calitate garantată, mounted example, quiet offer, the custom-door card.
 */
export async function UsiPage({lang, service, dictionary}: PageProps) {
  const models = service.sections?.find((section): section is Models => section._type === 'sectionModels');
  const model = models?.models?.find((item) => copy.modelMatch.test(item.title ?? '')) ?? models?.models?.[0];
  const [shell, nudge] = await Promise.all([getShell(lang, dictionary), serviceBySlug(lang, copy.nudge.slug)]);
  const title = model?.title ?? copy.model.title;
  const photos: LightboxImage[] = model ? [
    ...(model.cover?.asset ? [{...model.cover, _key: `${model._key}-cover`}] : []),
    ...(model.gallery ?? []),
  ].map((image, index, all) => ({...image, alt: photoAlt(image, title, {index, total: all.length, template: dictionary.portfolio.photoOf})})) : [];
  const shown = photos.slice(0, 3);
  const more = photos.length - shown.length;
  const allLabel = fill(copy.model.allLabel, {n: photos.length});

  return (
    <LightboxGroup sets={[{title, images: photos}]} labels={dictionary.portfolio.lightbox}
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
            <div className="mt-6 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-14">
              {photos.length ? (
                <div>
                  <div className="mb-1 flex items-center justify-between px-5 md:px-0 lg:mb-3">
                    <p className="text-caption font-semibold text-ink-soft lg:text-meta">{copy.model.photos} · {photos.length}</p>
                    <LightboxTrigger index={0} label={allLabel} className="text-link !cursor-pointer">{copy.model.all}</LightboxTrigger>
                  </div>
                  <ul className="grid auto-rows-[150px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 md:px-0 lg:auto-rows-[248px] lg:gap-3">
                    {shown.map((photo, index) => (
                      <li key={photo._key} className={index === 0 ? 'row-span-2' : index === 1 ? 'col-span-2' : ''}>
                        <LightboxTrigger index={index} label={`${copy.model.zoom}: ${photo.alt}`} className={tile}>
                          <SanityImage image={photo} cover sizes="(max-width: 1024px) 50vw, 400px"
                            className={`transition-transform duration-(--duration-image) group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 ${index === 0 ? '!object-[50%_20%]' : ''}`} />
                        </LightboxTrigger>
                      </li>
                    ))}
                    {more > 0 ? (
                      <li>
                        <LightboxTrigger index={shown.length} label={allLabel} className={`${tile} !cursor-pointer flex flex-col items-center justify-center gap-1 text-[0.8125rem] text-on-dark lg:gap-1.5 lg:text-caption`}>
                          <b className="font-display text-[1.875rem] font-semibold leading-none lg:text-[2.5rem]">+{more}</b>{copy.model.more}
                        </LightboxTrigger>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
              <div className="px-5 pt-6 md:px-0 lg:pt-0">
                <p className="flex items-center gap-2 text-meta font-semibold text-ink-soft">
                  <i aria-hidden="true" className="size-3 rounded-pill bg-[linear-gradient(135deg,#4a2c1e,#a0643f)]" />{copy.model.material}
                </p>
                <p className="display mt-2.5 text-[2rem] font-semibold lg:text-[2.5rem]">{copy.model.price}</p>
                <p className="mt-3 text-body leading-[1.6] text-ink-soft">{model?.description ?? copy.model.text}</p>
                <p className="mt-4.5 inline-flex h-9 items-center gap-2 rounded-pill bg-teal-tint px-3.5 text-caption font-semibold text-teal-900">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
                  {copy.model.quality}
                </p>
                <p className="mt-3.5 text-meta text-ink-soft">{copy.model.example}</p>
                <QuietOffer className="mt-6" question={copy.model.question} offer={{href: '#oferta', label: copy.model.offer}}
                  call={{href: shell.company.phone.href, label: copy.model.call}} />
                <a href="#oferta"
                  className="mt-6 grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] border border-white/90 bg-white/70 py-2.5 pl-2.5 pr-4.5 text-ink shadow-e1 transition-[background-color,box-shadow] duration-(--duration-fade) hover:bg-white hover:shadow-e2 focus-visible:bg-white focus-visible:shadow-e2">
                  <span className="grid h-24 w-18 place-items-center rounded-[10px] bg-white text-center text-[0.6875rem] leading-tight text-ink-soft outline outline-1 -outline-offset-1 outline-hairline">[desen]</span>
                  <span>
                    <small className="block text-[0.8125rem] text-ink-soft">{copy.model.own.kicker}</small>
                    <b className="block font-display text-2xl font-semibold leading-[1.15]">{copy.model.own.title}</b>
                    <span className="mt-0.5 block text-caption text-ink-soft">{copy.model.own.line}</span>
                  </span>
                  <i aria-hidden="true" className="text-xl not-italic text-teal-700">→</i>
                </a>
              </div>
            </div>
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
