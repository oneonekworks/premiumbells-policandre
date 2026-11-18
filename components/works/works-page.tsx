import type {ReactNode} from 'react';
import {Breadcrumb} from '@/components/services/story-hero';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {craftCategories, parseWorksState} from '@/lib/works';
import {getCategories, getWorks, type Work} from '@/sanity/portfolio';
import {projectPath, worksPath} from '@/sanity/portfolio-routes';
import type {BrowserWork} from './work-tile';
import {WorksBrowser, type BrowserCategory} from './works-browser';

type SearchParams = Record<string, string | string[] | undefined>;

/** The categories and works every Works view (and the Project panel) needs. */
export async function worksData(lang: Lang) {
  const [works, categories] = await Promise.all([getWorks(lang), getCategories(lang)]);
  const browserCategories: BrowserCategory[] = categories.map((category) => ({
    slug: category.slug, craft: category.craft, displayOrder: category.displayOrder, title: category.title,
  }));
  return {works, categories: browserCategories};
}

/** Only what the browser needs from a work (no blur previews: the tiles change shape). */
function toBrowser(work: Work, lang: Lang): BrowserWork {
  const {coverImage, ...rest} = work;
  return {
    ...rest,
    href: localizedHref(lang, projectPath(work.categorySlug ?? '', work.slug ?? '')),
    image: coverImage?.asset ? {asset: coverImage.asset, crop: coverImage.crop, hotspot: coverImage.hotspot, alt: coverImage.alt, caption: coverImage.caption} : null,
  };
}

/**
 * Lucrările noastre v6.2 (boards V6Works, V6WorksSticky + Mobile): hero
 * (breadcrumb, H1 | lead), then the band with the filter bar and the wall or
 * the Hartă view. Every Works address renders this: the overview, a category
 * and, with the Project panel open over it, a project (`panel`).
 */
export async function WorksPage({lang, category, searchParams, panel}: {
  lang: Lang;
  category: string | null;
  searchParams: SearchParams;
  panel?: ReactNode;
}) {
  const dictionary = getDictionary(lang);
  const t = dictionary.works6;
  const {works, categories} = await worksData(lang);
  const initial = parseWorksState(category, searchParams);
  const bellsSlug = craftCategories(categories).clopote;
  const bellTowers = works.filter((work) => work.categorySlug === bellsSlug).length;
  const lead = t.lead
    .replace('{works}', plural(lang, works.length, dictionary.portfolio.projects))
    .replace('{bells}', plural(lang, bellTowers, t.bellTowers));

  return (
    <div className="v6-page mood-subtle">
      <WorksBrowser works={works.map((work) => toBrowser(work, lang))} categories={categories} base={localizedHref(lang, worksPath)}
        initial={initial} lang={lang} t={t} countries={dictionary.countries} athos={dictionary.home6.athos}
        projects={dictionary.portfolio.projects}>
        <section className="m-hero pb-10 pt-7 lg:pb-14 lg:pt-11">
          <div className="mx-auto max-w-(--container-page) px-5 md:px-6">
            <Breadcrumb label={dictionary.services.breadcrumb}
              items={[{label: dictionary.services.home, href: localizedHref(lang, '/')}, {label: t.title}]} />
            <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
              <h1 className="font-display text-[4rem] font-medium leading-[0.98] tracking-[-0.015em] lg:text-[clamp(4.5rem,8vw,7.25rem)]">{t.title}</h1>
              <p className="max-w-115 text-[1.0625rem] leading-[1.6] text-ink-soft lg:pb-2.5 lg:text-lead">{lead}</p>
            </div>
          </div>
        </section>
      </WorksBrowser>
      {panel}
    </div>
  );
}
