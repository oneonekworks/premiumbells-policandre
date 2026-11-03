import {Gallery} from '@/components/portfolio/gallery';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import type {Lang} from '@/lib/i18n/routing';
import {catalogAnchors, catalogKey, formatLength} from '@/lib/services';
import {getCatalogItems, type CatalogItem, type ServiceSection} from '@/sanity/services';
import {DialogGrid} from './dialog-grid';
import {describedImages, DialogCard, numberLocale} from './shared';

type Section = Extract<ServiceSection, {_type: 'sectionCatalogue'}>;

function details(item: CatalogItem, lang: Lang, labels: Dictionary['services']['catalogue']) {
  const locale = numberLocale(lang);
  const number = new Intl.NumberFormat(locale);
  const rows: {key: string; label: string; value: string}[] = [];
  const add = (key: string, label: string, value: string | null) => value && rows.push({key, label, value});
  add('levels', labels.levels, item.levels != null ? number.format(item.levels) : null);
  add('candles', labels.candles, item.candles != null ? number.format(item.candles) : null);
  add('height', labels.height, item.heightCm != null ? formatLength(item.heightCm, locale) : null);
  add('diameter', labels.diameter, item.diameterCm != null ? formatLength(item.diameterCm, locale) : null);
  add('width', labels.width, item.widthCm != null ? formatLength(item.widthCm, locale) : null);
  add('depth', labels.depth, item.depthCm != null ? formatLength(item.depthCm, locale) : null);
  add('weight', labels.weight, item.weightKg != null ? `${number.format(item.weightKg)} kg` : null);
  for (const spec of item.specifications ?? []) {
    add(spec._key, spec.label ?? '', [spec.value, spec.unit].filter(Boolean).join(' '));
  }
  return rows;
}

// Published items of the section's families, each opening a dialog. Old
// `#Policandru-N` links open the matching item (see catalogAnchors).
export async function CatalogueSection({section, lang, dictionary}: {
  section: Section;
  lang: Lang;
  dictionary: Dictionary;
}) {
  const {services, portfolio} = dictionary;
  const labels = services.catalogue;
  const catalog = await getCatalogItems(lang, catalogKey(section.families));

  const items = catalog.map((item) => {
    const title = item.title ?? '';
    const rows = details(item, lang, labels);
    const images = describedImages([...(item.image ? [{...item.image, _key: `${item._id}-image`}] : []), ...(item.gallery ?? [])], title, portfolio.photoOf);
    const summary = [item.levels != null && plural(lang, item.levels, labels.levelCount), item.heightCm != null && formatLength(item.heightCm, numberLocale(lang))]
      .filter(Boolean).join(' · ');
    return {
      key: item._id,
      ids: catalogAnchors(item),
      title,
      card: <DialogCard image={item.image} title={title} subtitle={summary || item.number} ratio={3 / 4} contain />,
      content: (
        <article className="space-y-8">
          <header>
            {item.number && <p className="eyebrow">{item.number}</p>}
            <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-teal-900">{title}</h2>
            {item.madeToOrder && <p className="mt-2 font-medium text-teal-700">{labels.madeToOrder}</p>}
          </header>
          {item.summary && <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed">{item.summary}</p>}
          <div className="grid gap-6 md:grid-cols-2">
            {rows.length > 0 && (
              <section className="rounded-lg border border-line bg-white p-5">
                <h3 className="eyebrow">{portfolio.specifications}</h3>
                <dl className="mt-4 divide-y divide-line">
                  {rows.map((row) => (
                    <div key={row.key} className="flex justify-between gap-4 py-2 text-sm">
                      <dt className="text-ink-soft">{row.label}</dt>
                      <dd className="text-right font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {item.variants?.length ? (
              <section className="h-fit rounded-lg border border-line bg-white p-5">
                <h3 className="eyebrow">{labels.finishes}</h3>
                <ul className="mt-4 divide-y divide-line text-sm">
                  {item.variants.map((variant) => (
                    <li key={variant._key} className="flex justify-between gap-4 py-2">
                      <span className="text-ink-soft">{labels.finish[variant.finish ?? ''] ?? variant.finish}</span>
                      <span className="font-medium">{labels.code} {variant.referenceCode}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          {images.length ? <Gallery images={images} labels={portfolio} /> : null}
        </article>
      ),
    };
  });

  return (
    <section>
      {section.heading && <h2 className="mb-6 font-display text-3xl font-semibold text-teal-900">{section.heading}</h2>}
      {items.length ? (
        <DialogGrid items={items} closeLabel={services.close} detailsLabel={services.details}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4" />
      ) : (
        <p className="rounded-lg border border-line p-6">{labels.empty}</p>
      )}
    </section>
  );
}
