import type {LightboxImage} from '@/components/portfolio/lightbox';
import type {Lang} from '@/lib/i18n/routing';
import {catalogAnchors, catalogKey} from '@/lib/services';
import {policandreCopy as copy} from '@/lib/service-copy';
import {getCatalogItems, type CatalogItem, type ServiceSection} from '@/sanity/services';
import {HeadLink, Nudges, RailButton, Section, SectionHead, Steps, WorkCards, wrap, type Nudge} from '../blocks';
import {ModelCatalogue, type CatalogueModel} from '../model-catalogue';
import {PhotoControl} from '../photo-control';
import {numberLocale} from '../shared';
import {StoryHero} from '../story-hero';
import {crumbs, fill, heroFacts, heroInsets, heroPhotos, relatedWorks, serviceBySlug, type PageProps} from './common';

type CatalogueSection = Extract<ServiceSection, {_type: 'sectionCatalogue'}>;

const levelsIn = (title: string) => Number(title.match(/(\d+)\s+nivel/)?.[1] ?? 0);

/** Filter group: Horos family → h; else the levels in the title (data can disagree), 4–7 together. */
function group(item: CatalogItem): string {
  if (item.family === 'horos') return 'h';
  const levels = levelsIn(item.title ?? '') || item.levels || 0;
  return levels >= 4 ? '4' : String(levels || 1);
}

/** "Policandru 2 nivele, nr. 2" → name "Policandru 2 nivele" + "nr. 2" (the number in the title wins). */
function nameAndNumber(item: CatalogItem) {
  const title = item.title ?? '';
  const match = title.match(/,?\s*nr\.\s*(\d+)\s*$/);
  if (match) return {name: title.slice(0, match.index).trim(), number: `nr. ${match[1]}`};
  return {name: title, number: item.number ?? null};
}

function spec(item: CatalogItem, pattern: RegExp) {
  const found = item.specifications?.find((row) => pattern.test(row.label ?? ''));
  return found?.value ? [found.value, found.unit].filter(Boolean).join(' ') : null;
}

function catalogueModels(items: CatalogItem[], lang: Lang): CatalogueModel[] {
  const locale = numberLocale(lang);
  const number = new Intl.NumberFormat(locale);
  // The catalogue reads in metres throughout (boards: "0,9 m", "1,22 m").
  const metres = new Intl.NumberFormat(locale, {maximumFractionDigits: 2});
  const length = (cm: number | null | undefined) => (cm != null ? `${metres.format(cm / 100)} m` : null);
  return items.map((item) => {
    const {name, number: nr} = nameAndNumber(item);
    const perSection = spec(item, /greutatea unei sec/i);
    const weight = item.weightKg != null ? `${number.format(item.weightKg)} kg` : perSection ? `${perSection} / secție` : null;
    const finishes = (item.variants ?? []).filter((variant) => variant.finish === 'varnished' || variant.finish === 'gilded')
      .sort((a, b) => (a.finish === 'varnished' ? -1 : 1) - (b.finish === 'varnished' ? -1 : 1))
      .map((variant) => ({
        key: variant._key,
        label: variant.finish === 'gilded' ? 'Aurit' : 'Lăcuit',
        code: variant.referenceCode ?? null,
        dot: variant.finish === 'gilded' ? 'aur' as const : 'lac' as const,
        price: copy.models.price,
      }));
    const code = finishes.find((finish) => finish.dot === 'aur')?.code ?? finishes[0]?.code ?? '';
    return {
      key: item._id,
      ids: catalogAnchors(item),
      group: group(item),
      name,
      number: nr,
      specs: [
        {label: 'Înălțime', value: length(item.heightCm) ?? '—'},
        {label: 'Diametru', value: length(item.diameterCm) ?? spec(item, /^diametru/i) ?? '—'},
        {label: 'Lumânări', value: item.candles != null ? number.format(item.candles) : '—'},
        {label: 'Greutate', value: weight ?? '—'},
      ],
      finishes,
      image: item.image?.asset ? {...item.image, _key: `${item._id}-image`} as LightboxImage : null,
      placeholder: `${copy.models.photo} ${code}`.trim(),
    };
  });
}

/** /servicii/policandre (boards V6ServicePolicandre + B, Mobile + MobileB). */
export async function PolicandrePage({lang, service, dictionary}: PageProps) {
  const catalogue = service.sections?.find((section): section is CatalogueSection => section._type === 'sectionCatalogue');
  const [items, works, comanda, reconditionare] = await Promise.all([
    catalogue ? getCatalogItems(lang, catalogKey(catalogue.families)) : Promise.resolve([]),
    relatedWorks(lang, service),
    ...copy.nudges.map((nudge) => serviceBySlug(lang, nudge.slug)),
  ]);
  const nudges: Nudge[] = copy.nudges.flatMap((nudge, index) => {
    const target = [comanda, reconditionare][index];
    return target ? [{href: target.href, image: target.coverImage, question: nudge.question, name: nudge.name, why: nudge.why}] : [];
  });
  const photos = heroPhotos(service);
  const count = works?.works.length ?? 0;

  return (
    <div className="v6-page mood-subtle">
      <StoryHero
        crumbs={crumbs(lang, dictionary, copy.hero.title)} crumbLabel={dictionary.services.breadcrumb}
        title={copy.hero.title} metal="gold" subline={copy.hero.subline} lead={copy.hero.lead}
        factsLabel={dictionary.services.facts} facts={heroFacts(service)} factsAsStats
        photo={service.coverImage} insets={heroInsets(service)}
        control={<PhotoControl label={copy.zoom} shortLabel={copy.zoomShort} sets={[{title: copy.hero.title, images: photos}]} labels={dictionary.portfolio.lightbox} title={copy.hero.title} />}
      />

      {catalogue ? (
        <Section ground="band" id="modele">
          <div className={wrap}>
            {/* The date line waits for the price list: "La comandă" shows no date (user, 2026-11-17). */}
            <ModelCatalogue
              head={<SectionHead kicker={copy.models.kicker} title={catalogue.heading && catalogue.heading !== 'Catalog' ? catalogue.heading : copy.models.title} lead={copy.models.lead} />}
              models={catalogueModels(items, lang)}
              filters={copy.models.filters.map(([id, label]) => ({id, label}))}
              labels={{filter: copy.models.filter, showAll: copy.models.showAll, zoom: copy.models.zoom, code: dictionary.services.catalogue.code}}
              lightbox={dictionary.portfolio.lightbox} />
            <Nudges items={nudges} className="mt-10 lg:mt-18" />
          </div>
        </Section>
      ) : null}

      <Section ground="white">
        <div className={wrap}>
          <SectionHead kicker={copy.steps.kicker} title={copy.steps.title} />
          <Steps steps={copy.steps.items} metal="gold" />
        </div>
      </Section>

      {works && count ? (
        <Section ground="band">
          <div className={wrap}>
            <SectionHead kicker={copy.works.kicker} title={fill(copy.works.title, {n: count})}
              aside={<HeadLink href={works.href} label={fill(copy.works.all, {n: count})} />} />
            <WorkCards works={works.works.slice(0, 4)} lang={lang} categorySlug={works.slug} metal="gold" countries={dictionary.countries} />
            <RailButton href={works.href} label={fill(copy.works.all, {n: count})} />
          </div>
        </Section>
      ) : null}
    </div>
  );
}
