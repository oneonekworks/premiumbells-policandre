import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {client} from './client';
import {PROJECT_PAGE_SIZE} from './pagination';
import {
  CATEGORIES_QUERY, CATEGORY_PROJECTS_QUERY, CATEGORY_QUERY, PORTFOLIO_PAGE_QUERY, PROJECT_QUERY,
} from './queries';
import type {
  CATEGORIES_QUERY_RESULT, CATEGORY_PROJECTS_QUERY_RESULT, CATEGORY_QUERY_RESULT,
  PORTFOLIO_PAGE_QUERY_RESULT, PROJECT_QUERY_RESULT,
} from './types';

// Published reads stay uncached so a refresh shows a publish immediately, as
// in the phone acceptance runbook. Tag-based caching with a signed publish
// webhook replaces `no-store` in the data-delivery milestone.
const options = {cache: 'no-store'} as const;

export type ProjectCard = CATEGORY_PROJECTS_QUERY_RESULT['items'][number];
export type ProjectDetail = NonNullable<PROJECT_QUERY_RESULT>;
export type Category = NonNullable<CATEGORY_QUERY_RESULT>;

export const getPortfolioPage = cache((lang: Lang) =>
  client.fetch<PORTFOLIO_PAGE_QUERY_RESULT>(PORTFOLIO_PAGE_QUERY, {lang}, options));

export const getCategories = cache((lang: Lang) =>
  client.fetch<CATEGORIES_QUERY_RESULT>(CATEGORIES_QUERY, {lang}, options));

export const getCategory = cache((lang: Lang, slug: string) =>
  client.fetch<CATEGORY_QUERY_RESULT>(CATEGORY_QUERY, {lang, slug}, options));

export const getCategoryProjects = cache((lang: Lang, categoryId: string, page: number) =>
  client.fetch<CATEGORY_PROJECTS_QUERY_RESULT>(CATEGORY_PROJECTS_QUERY, {
    lang, categoryId, start: (page - 1) * PROJECT_PAGE_SIZE, end: page * PROJECT_PAGE_SIZE,
  }, options));

export const getProject = cache((lang: Lang, categoryId: string, slug: string) =>
  client.fetch<PROJECT_QUERY_RESULT>(PROJECT_QUERY, {lang, categoryId, slug}, options));
