import Link from 'next/link';
import {PortableText} from 'next-sanity';
import {portableText} from '@/components/portfolio/portable-text';
import {photoAlt, subject} from '@/lib/alt';
import {placeLonLat, project as onMap} from '@/lib/europe-map';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {youtubeId} from '@/lib/video';
import {craftMetal, crafts, filterWorks, parseWorksState, placeOf, placeText, selection, worksHref, type Craft} from '@/lib/works';
import {sanityImageUrl} from '@/sanity/image';
import type {ProjectDetail, Work} from '@/sanity/portfolio';
import {categoryPath, projectPath, worksPath} from '@/sanity/portfolio-routes';
import {RomaniaPin} from './mini-maps';
import {ProjectPanelView, type PanelPhoto, type PanelVideo} from './project-panel-view';
import type {ListItem, ProjectList} from './project-list';
import type {BrowserCategory} from './works-browser';

const metalBar = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt'} as const;

/** One row of details: values that share a label are joined ("32 · 64 · 120 kg"). */
function specRows(specs: ProjectDetail['specifications']) {
  const rows: {label: string; values: string[]; unit: string | null}[] = [];
  for (const spec of specs ?? []) {
    const value = spec.value?.trim();
    if (!value || !spec.label) continue;
    const row = rows.find((item) => item.label === spec.label && item.unit === (spec.unit ?? null));
    if (row) row.values.push(value);
    else rows.push({label: spec.label, values: [value], unit: spec.unit ?? null});
  }
  return rows.map((row) => ({label: row.label, value: [row.values.join(' · '), row.unit].filter(Boolean).join(' ')}));
}

/** The panel's list when nothing registered one: the Works page filtered like the direct visit. */
export function fallbackList(works: Work[], categories: BrowserCategory[], categorySlug: string, lang: Lang, dictionary: Dictionary): ProjectList {
  const state = parseWorksState(categorySlug, {});
  const {craft, only} = selection(state, categories);
  const t = dictionary.works6;
  const items = filterWorks(works, state, categories, dictionary.countries).map((work): ListItem => ({
    href: localizedHref(lang, projectPath(work.categorySlug ?? '', work.slug ?? '')),
    title: work.title ?? '', category: work.categoryTitle ?? '',
    thumb: work.coverImage?.asset ? sanityImageUrl(work.coverImage, 72, 96) ?? null : null,
  }));
  const label = only ? categories.find((item) => item.slug === only)?.title ?? t.all
    : craft && crafts.includes(craft as Craft) ? t.crafts[craft] : t.all;
  return {label, items};
}

/** Project panel: the server part (texts, details, map line); see ProjectPanelView. */
export function ProjectPanel({project, slug, mode, list, lang, dictionary}: {
  project: ProjectDetail;
  slug: string;
  mode: 'intercepted' | 'embedded';
  list: ProjectList;
  lang: Lang;
  dictionary: Dictionary;
}) {
  const t = dictionary.works6.panel;
  const category = project.category;
  const categorySlug = category?.slug ?? '';
  const href = localizedHref(lang, projectPath(categorySlug, slug));
  const described = subject(project.title, project.location?.locality);

  const gallery = project.gallery ?? [];
  const cover = project.coverImage?.asset && !gallery.some((image) => image.asset?._ref === project.coverImage?.asset?._ref)
    ? [{...project.coverImage, _key: 'cover'}] : [];
  const all = [...cover, ...gallery];
  const photos: PanelPhoto[] = all.map((image, index) => ({
    ...image,
    alt: photoAlt(image, described, {index, total: all.length, template: dictionary.portfolio.photoOf}),
  }));

  const first = project.videos?.find((video) => (video.provider === 'youtube' && youtubeId(video.url)) || (video.provider === 'file' && video.file));
  let video: PanelVideo | null = null;
  if (first) {
    const title = first.title || project.title || '';
    const id = first.provider === 'youtube' ? youtubeId(first.url) : null;
    const poster = first.poster?.asset ? sanityImageUrl(first.poster, 240, 240) ?? null : id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
    video = id ? {provider: 'youtube', id, title, poster} : first.file ? {provider: 'file', src: first.file, title, poster} : null;
  }

  const place = placeText(project, dictionary.countries);
  const when = project.displayDate || (project.year ? String(project.year) : null);
  const where = placeOf(project);
  const mapHref = worksHref(localizedHref(lang, worksPath), {
    category: null, tip: null, query: '', place: where, view: 'harta', page: 1,
  });
  const lonLat = placeLonLat(project.location ?? {});
  const specs = specRows(project.specifications);

  return (
    <ProjectPanelView
      mode={mode} href={href} closeHref={localizedHref(lang, categoryPath(categorySlug))}
      fallback={list} title={project.title ?? ''} bar={metalBar[craftMetal(category?.craft)]}
      category={category?.title ? {title: category.title, href: localizedHref(lang, categoryPath(categorySlug))} : null}
      meta={[place, when].filter(Boolean) as string[]}
      photos={photos} video={video} offer={category?.offerLine || t.offer}
      labels={t} lightboxLabels={dictionary.portfolio.lightbox}
    >
      {project.summary ? <p className="mt-3 text-base leading-[1.6] text-ink-soft lg:text-base">{project.summary}</p> : null}
      {project.body?.length ? (
        <div className="mt-3 space-y-3 text-[0.9375rem] leading-[1.6] text-ink-soft"><PortableText value={project.body} components={portableText} /></div>
      ) : null}
      {specs.length ? (
        <dl className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-hairline pt-3.5 lg:mt-4.5 lg:grid-cols-5">
          {specs.map((spec) => (
            <div key={spec.label} className={spec.value.length > 16 ? 'col-span-3' : spec.value.length > 7 ? 'col-span-2' : ''}>
              <dt className="text-[0.75rem] text-ink-soft">{spec.label}</dt>
              <dd className="mt-0.5 text-[0.9375rem] font-semibold tabular-nums">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {place && lonLat ? (
        <Link href={mapHref} prefetch={false} className="mt-3.5 grid min-h-14 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] bg-band py-1.5 pl-2 pr-3.5 text-ink transition-colors duration-(--duration-line) hover:bg-teal-tint focus-visible:bg-teal-tint">
          <RomaniaPin place={project.location ?? {}} className="block" />
          {project.location?.country && !['RO', 'MD'].includes(project.location.country) ? (
            <svg width="64" height="48" viewBox="0 0 800 603" aria-hidden="true" className="block rounded-[6px]">
              <image href="/maps/europe-800x603.svg" width="800" height="603" />
              <circle cx={Math.round(onMap(lonLat, 'compact')[0])} cy={Math.round(onMap(lonLat, 'compact')[1])} r="26" fill="#0f6b63" />
            </svg>
          ) : null}
          <span>
            <b className="block text-[0.9375rem] font-semibold leading-[1.3]">{t.onMap.replace('{place}', place)}</b>
            <small className="block text-[0.8125rem] leading-[1.35] text-ink-soft">{t.nearby}</small>
          </span>
          <i aria-hidden="true" className="text-lg not-italic text-teal-700">→</i>
        </Link>
      ) : null}
    </ProjectPanelView>
  );
}
