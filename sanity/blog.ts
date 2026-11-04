import 'server-only';
import {cache} from 'react';
import type {Lang} from '@/lib/i18n/routing';
import {cacheTags} from './cache-tags';
import {sanityFetch} from './fetch';
import {BLOG_POST_QUERY, BLOG_POSTS_QUERY, POSTS_REFERENCING_QUERY} from './queries';
import type {BLOG_POST_QUERY_RESULT, BLOG_POSTS_QUERY_RESULT, POSTS_REFERENCING_QUERY_RESULT} from './types';

// Blog reads, all under one tag (few posts). Posts are one document per
// language, so every read is for the page language only.

export type BlogCard = BLOG_POSTS_QUERY_RESULT[number];
export type BlogPost = NonNullable<BLOG_POST_QUERY_RESULT>;
export type BlogBlock = NonNullable<BlogPost['body']>[number];

export const getBlogPosts = cache((lang: Lang) =>
  sanityFetch<BLOG_POSTS_QUERY_RESULT>({query: BLOG_POSTS_QUERY, params: {lang}, tags: [cacheTags.blog]}));

/** Related projects and services can change without a blog publish; the hourly refresh covers them. */
export const getBlogPost = cache((lang: Lang, slug: string) =>
  sanityFetch<BLOG_POST_QUERY_RESULT>({
    query: BLOG_POST_QUERY, params: {lang, slug}, tags: [cacheTags.blog, cacheTags.services],
  }));

/** Up to three posts in `lang` that reference the document `id` ("Din blog"). */
export const getPostsReferencing = cache((lang: Lang, id: string) =>
  sanityFetch<POSTS_REFERENCING_QUERY_RESULT>({query: POSTS_REFERENCING_QUERY, params: {lang, id}, tags: [cacheTags.blog]}));

/** Minutes to read, from the plain-text length (about 1,000 characters a minute). */
export const readingMinutes = (textLength: number) => Math.max(1, Math.round(textLength / 1000));
