import Link from 'next/link';
import {Gallery} from '@/components/portfolio/gallery';
import {VideoEmbed} from '@/components/portfolio/video-embed';
import {MailIcon, PhoneIcon} from '@/components/site/icons';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import type {Lang} from '@/lib/i18n/routing';
import {site} from '@/lib/site';
import type {ServiceSection} from '@/sanity/services';
import {CatalogueSection} from './catalogue-section';
import {DialogGrid} from './dialog-grid';
import {describedImages, DialogCard, numberLocale} from './shared';

type Section<T extends ServiceSection['_type']> = Extract<ServiceSection, {_type: T}>;
type Context = {lang: Lang; dictionary: Dictionary; subject: string};

function SectionHeading({children}: {children: React.ReactNode}) {
  return <h2 className="mb-6 font-display text-3xl font-semibold text-teal-900">{children}</h2>;
}

function GallerySection({section, context}: {section: Section<'sectionGallery'>; context: Context}) {
  const images = describedImages(section.images, section.heading ?? context.subject, context.dictionary.portfolio.photoOf);
  if (!images.length) return null;
  return (
    <section>
      {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
      <Gallery images={images} labels={context.dictionary.portfolio} />
    </section>
  );
}

function StepsSection({section, context}: {section: Section<'sectionSteps'>; context: Context}) {
  const {services, portfolio} = context.dictionary;
  return (
    <section>
      {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
      <ol className="space-y-12">
        {(section.steps ?? []).map((step, index) => (
          <li key={step._key}>
            <p className="eyebrow">{services.step} {index + 1}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-teal-900">{step.title}</h3>
            {step.text && <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed">{step.text}</p>}
            {step.images?.length ? (
              <div className="mt-5">
                <Gallery images={describedImages(step.images, step.title ?? context.subject, portfolio.photoOf)} labels={portfolio} />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Specifications({rows, heading}: {rows: {key: string; label: string; value: string}[]; heading: string}) {
  if (!rows.length) return null;
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h3 className="eyebrow">{heading}</h3>
      <dl className="mt-4 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.key} className="flex justify-between gap-4 py-2 text-sm">
            <dt className="text-ink-soft">{row.label}</dt>
            <dd className="text-right font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ModelsSection({section, context}: {section: Section<'sectionModels'>; context: Context}) {
  const {services, portfolio} = context.dictionary;
  const items = (section.models ?? []).map((model) => {
    const title = model.title ?? '';
    const images = describedImages([...(model.cover ? [{...model.cover, _key: `${model._key}-cover`}] : []), ...(model.gallery ?? [])], title, portfolio.photoOf);
    const specifications = (model.specifications ?? []).map((item) => ({
      key: item._key, label: item.label ?? '', value: [item.value, item.unit].filter(Boolean).join(' '),
    }));
    return {
      key: model._key,
      ids: [model.anchorId || `model-${model._key}`],
      title,
      card: <DialogCard image={model.cover} title={title} />,
      content: (
        <article className="space-y-8">
          <h2 className="font-display text-4xl font-semibold leading-tight text-teal-900">{title}</h2>
          {model.description && <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed">{model.description}</p>}
          <Specifications rows={specifications} heading={portfolio.specifications} />
          {images.length ? <Gallery images={images} labels={portfolio} /> : null}
        </article>
      ),
    };
  });
  return (
    <section>
      {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
      <DialogGrid items={items} closeLabel={services.close} detailsLabel={services.details}
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4" />
    </section>
  );
}

function BellSizesSection({section, context}: {section: Section<'sectionBellSizes'>; context: Context}) {
  const labels = context.dictionary.services.bellSizes;
  const number = new Intl.NumberFormat(numberLocale(context.lang));
  const rows = section.rows ?? [];
  return (
    <section>
      {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
      <div className="overflow-x-auto rounded-lg border border-line bg-white" tabIndex={0} aria-label={section.heading ?? labels.weight}>
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-stone text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">{labels.weight}</th>
              <th scope="col" className="px-4 py-3 font-medium">{labels.diameter}</th>
              <th scope="col" className="px-4 py-3 font-medium">{labels.height}</th>
              <th scope="col" className="px-4 py-3 font-medium">{labels.note}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row._key}>
                <th scope="row" className="px-4 py-2 font-medium">{row.weightKg != null ? `${number.format(row.weightKg)} kg` : '–'}</th>
                <td className="px-4 py-2">{row.diameterCm != null ? `${number.format(row.diameterCm)} cm` : '–'}</td>
                <td className="px-4 py-2">{row.heightCm != null ? `${number.format(row.heightCm)} cm` : '–'}</td>
                <td className="px-4 py-2">{row.note ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-soft sm:hidden">{labels.scroll}</p>
      {section.footnote && <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed">{section.footnote}</p>}
    </section>
  );
}

function BellSetsSection({section, context}: {section: Section<'sectionBellSets'>; context: Context}) {
  const labels = context.dictionary.services.bellSets;
  const number = new Intl.NumberFormat(numberLocale(context.lang));
  return (
    <section>
      {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(section.sets ?? []).map((set) => {
          const weights = set.weightsKg ?? [];
          return (
            <li key={set._key} className="rounded-lg border border-line bg-white p-5">
              <h3 className="font-display text-xl font-semibold text-teal-900">{set.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {plural(context.lang, weights.length, labels.bells)}: {weights.map((weight) => `${number.format(weight)} kg`).join(' + ')}
              </p>
              {set.withElectronicRinger && <p className="mt-2 text-sm font-medium text-teal-700">{labels.withRinger}</p>}
              {set.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{set.description}</p>}
              {set.audio && (
                <audio controls preload="none" src={set.audio} aria-label={`${labels.listen}: ${set.title ?? ''}`} className="mt-4 w-full" />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function VideosSection({section, context}: {section: Section<'sectionVideos'>; context: Context}) {
  const videos = section.videos ?? [];
  if (!videos.length) return null;
  return (
    <section>
      <SectionHeading>{section.heading ?? context.dictionary.portfolio.videos}</SectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        {videos.map((video) => <VideoEmbed key={video._key} video={video} playLabel={context.dictionary.portfolio.playVideo} />)}
      </div>
    </section>
  );
}

/** Contact box; also the default call to action at the end of every service page. */
export function ContactSection({section, dictionary}: {
  section?: Pick<Section<'sectionCta'>, 'heading' | 'text' | 'label' | 'contact' | 'href'>;
  dictionary: Dictionary;
}) {
  const {cta} = dictionary.services;
  const contact = section?.contact ?? 'phoneEmail';
  const label = section?.label ?? cta.label;
  return (
    <section className="rounded-xl bg-teal-900 px-6 py-10 text-white sm:px-10">
      <h2 className="font-display text-3xl font-semibold">{section?.heading ?? cta.heading}</h2>
      <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-white/85">{section?.text ?? cta.text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {contact === 'link' && section?.href ? (
          <Link href={section.href} className="btn bg-white text-teal-900 hover:bg-stone">{label}</Link>
        ) : (
          <>
            {(contact === 'phoneEmail' || contact === 'phone') && (
              <a href={site.phone.href} className="btn bg-white text-teal-900 hover:bg-stone">
                <PhoneIcon className="size-5" /> {contact === 'phone' ? label : `${label}: ${site.phone.display}`}
              </a>
            )}
            {(contact === 'phoneEmail' || contact === 'email') && (
              <a href={`mailto:${site.email}`} className="btn border border-white/60 text-white hover:bg-white/10">
                <MailIcon className="size-5" /> {contact === 'email' ? label : site.email}
              </a>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function ServiceSections({sections, lang, dictionary, subject}: {
  sections: ServiceSection[];
  lang: Lang;
  dictionary: Dictionary;
  subject: string;
}) {
  const context = {lang, dictionary, subject};
  return sections.map((section) => {
    switch (section._type) {
      case 'sectionGallery': return <GallerySection key={section._key} section={section} context={context} />;
      case 'sectionSteps': return <StepsSection key={section._key} section={section} context={context} />;
      case 'sectionModels': return <ModelsSection key={section._key} section={section} context={context} />;
      case 'sectionBellSizes': return <BellSizesSection key={section._key} section={section} context={context} />;
      case 'sectionBellSets': return <BellSetsSection key={section._key} section={section} context={context} />;
      case 'sectionVideos': return <VideosSection key={section._key} section={section} context={context} />;
      case 'sectionCatalogue': return <CatalogueSection key={section._key} section={section} lang={lang} dictionary={dictionary} />;
      case 'sectionCta': return <ContactSection key={section._key} section={section} dictionary={dictionary} />;
      default: return null;
    }
  });
}
