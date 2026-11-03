import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {cacheTags} from './cache-tags';
import {sanityFetch} from './fetch';
import {CATALOG_QUERY, SERVICE_QUERY, SERVICES_QUERY} from './queries';
import type {CATALOG_QUERY_RESULT, SERVICE_QUERY_RESULT, SERVICES_QUERY_RESULT} from './types';

// Published service and catalogue reads, cached by tag (see cache-tags.ts).
// React cache() shares one read between a page and its metadata.

export type ServiceListItem = SERVICES_QUERY_RESULT[number];
export type ServiceDetail = NonNullable<SERVICE_QUERY_RESULT>;
export type ServiceSection = NonNullable<ServiceDetail['sections']>[number];
export type CatalogItem = CATALOG_QUERY_RESULT[number];

export const getServices = cache((lang: Lang) =>
  sanityFetch<SERVICES_QUERY_RESULT>({query: SERVICES_QUERY, params: {lang}, tags: [cacheTags.services]}));

/** A top-level service (`parentSlug` null) or a variant of `parentSlug`; slugs in either language. */
export const getService = cache((lang: Lang, parentSlug: string | null, slug: string) =>
  sanityFetch<SERVICE_QUERY_RESULT>({
    query: SERVICE_QUERY, params: {lang, parentSlug, slug}, tags: [cacheTags.services],
  }));

/** Published items of the given families in catalogue order; `families` comes from catalogKey(). */
export const getCatalogItems = cache((lang: Lang, families: string) => {
  const list = families.split(',').filter(Boolean);
  return sanityFetch<CATALOG_QUERY_RESULT>({
    query: CATALOG_QUERY, params: {lang, families: list}, tags: list.map(cacheTags.catalog),
  });
});
