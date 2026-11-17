import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {cacheTags} from './cache-tags';
import {sanityFetch} from './fetch';
import {CATALOG_DOWNLOADS_QUERY, HOME_QUERY} from './queries';
import type {CATALOG_DOWNLOADS_QUERY_RESULT, HOME_QUERY_RESULT} from './types';

// The home page singleton with its testimonial and audio, and the reviewed
// catalogue downloads. Services and posts come from their own loaders.

export type HomeContent = NonNullable<HOME_QUERY_RESULT>;
export type CatalogDownload = CATALOG_DOWNLOADS_QUERY_RESULT[number];

export const getHomePage = cache((lang: Lang) =>
  sanityFetch<HOME_QUERY_RESULT>({
    query: HOME_QUERY, params: {lang}, // The map story reads every public project: new or moved works clear it too.
    tags: [cacheTags.homePage, cacheTags.homeMedia, cacheTags.services, cacheTags.blog, cacheTags.categories, cacheTags.projectCounts],
  }));

export const getCatalogDownloads = cache(() =>
  sanityFetch<CATALOG_DOWNLOADS_QUERY_RESULT>({query: CATALOG_DOWNLOADS_QUERY, params: {}, tags: [cacheTags.homeMedia]}));
