import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {cacheTags} from './cache-tags';
import {sanityFetch} from './fetch';
import {SITE_QUERY} from './queries';
import type {SITE_QUERY_RESULT} from './types';

// Site settings and navigation for the layout (header, footer, menu).
// Links can point at services, categories and posts, so their tags apply too;
// a renamed project behind a menu link shows after the hourly refresh.

export type SiteContent = SITE_QUERY_RESULT;
export type SiteLink = NonNullable<NonNullable<SITE_QUERY_RESULT['navigation']>['header']>[number];

export const getSiteContent = cache((lang: Lang) =>
  sanityFetch<SITE_QUERY_RESULT>({
    query: SITE_QUERY, params: {lang},
    tags: [cacheTags.global, cacheTags.services, cacheTags.categories, cacheTags.blog],
  }));
