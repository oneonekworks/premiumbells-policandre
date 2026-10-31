import 'server-only';
import type {QueryParams} from 'next-sanity';
import {SANITY_TAG} from './cache-tags';
import {client} from './client';

// Backup refresh in case a publish webhook is missed; the webhook revalidates
// tags immediately (app/api/revalidate).
const REVALIDATE_SECONDS = 3600;

/**
 * The one place published content is fetched. Draft Mode preview will branch
 * here later (a token client with the drafts perspective and no caching), so
 * pages and loaders do not change.
 */
export function sanityFetch<T>({query, params, tags}: {query: string; params: QueryParams; tags: string[]}) {
  return client.fetch<T>(query, params, {next: {revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG, ...tags]}});
}
