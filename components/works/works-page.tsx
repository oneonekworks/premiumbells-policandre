import type {ReactNode} from 'react';
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

/** The Works lead ("Parohii, mănăstiri și catedrale: 60 de lucrări …"): the page's search description since v6.3. */
export async function worksLead(lang: Lang) {
  const dictionary = getDictionary(lang);
  const t = dictionary.works6;
  const {works, categories} = await worksData(lang);
  if (!works.length) return undefined; // no works in this language yet: no "0 lucrări" description
  const bellsSlug = craftCategories(categories).clopote;
  const bellTowers = works.filter((work) => work.categorySlug === bellsSlug).length;
  return t.lead
    .replace('{works}', plural(lang, works.length, dictionary.portfolio.projects))
    .replace('{bells}', plural(lang, bellTowers, t.bellTowers));
}

/**
 * Lucrările noastre v6.2 (boards V6Works, V6WorksSticky + Mobile), v6.3: no
 * visible hero (a visually hidden H1; the lead is the meta description), the
 * band opens with the filter bar, then the edge-to-edge wall or the Hartă view. Every Works address renders this: the overview, a category
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

  return (
    <div className="v6-page mood-subtle">
      <WorksBrowser works={works.map((work) => toBrowser(work, lang))} categories={categories} base={localizedHref(lang, worksPath)}
        initial={initial} lang={lang} t={t} countries={dictionary.countries} athos={dictionary.home6.athos}
        projects={dictionary.portfolio.projects}>
        <h1 className="sr-only">{t.title}</h1>
      </WorksBrowser>
      {panel}
    </div>
  );
}
