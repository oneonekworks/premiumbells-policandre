import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {cacheTags} from './cache-tags';
import {sanityFetch} from './fetch';
import {
  CATEGORIES_QUERY, CATEGORY_PROJECTS_QUERY, CATEGORY_QUERY, PORTFOLIO_PAGE_QUERY, PROJECT_QUERY,
} from './queries';
import type {
  CATEGORIES_QUERY_RESULT, CATEGORY_PROJECTS_QUERY_RESULT, CATEGORY_QUERY_RESULT,
  PORTFOLIO_PAGE_QUERY_RESULT, PROJECT_QUERY_RESULT,
} from './types';

// Published reads are cached by tag and cleared by the publish webhook; see
// cache-tags.ts. React cache() shares one read between a page and its metadata.

export type ProjectCard = CATEGORY_PROJECTS_QUERY_RESULT[number];
export type ProjectDetail = NonNullable<PROJECT_QUERY_RESULT>;
export type Category = NonNullable<CATEGORY_QUERY_RESULT>;

export const getPortfolioPage = cache((lang: Lang) =>
  sanityFetch<PORTFOLIO_PAGE_QUERY_RESULT>({
    query: PORTFOLIO_PAGE_QUERY, params: {lang}, tags: [cacheTags.portfolioPage],
  }));

// Includes per-category project counts.
export const getCategories = cache((lang: Lang) =>
  sanityFetch<CATEGORIES_QUERY_RESULT>({
    query: CATEGORIES_QUERY, params: {lang}, tags: [cacheTags.categories, cacheTags.projectCounts],
  }));

export const getCategory = cache((lang: Lang, slug: string) =>
  sanityFetch<CATEGORY_QUERY_RESULT>({
    query: CATEGORY_QUERY, params: {lang, slug}, tags: [cacheTags.categories],
  }));

// All cards of a category: one cache entry per category and language, whatever
// the search, filters or page in the URL.
export const getCategoryProjects = cache((lang: Lang, categoryId: string) =>
  sanityFetch<CATEGORY_PROJECTS_QUERY_RESULT>({
    query: CATEGORY_PROJECTS_QUERY, params: {lang, categoryId}, tags: [cacheTags.categoryProjects(categoryId)],
  }));

export const getProject = cache((lang: Lang, categoryId: string, slug: string) =>
  sanityFetch<PROJECT_QUERY_RESULT>({
    query: PROJECT_QUERY, params: {lang, categoryId, slug}, tags: [cacheTags.project(slug)],
  }));
