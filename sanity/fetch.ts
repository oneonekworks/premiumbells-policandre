import 'server-only';
import type {QueryParams} from 'next-sanity';
import {SANITY_TAG} from './cache-tags';
import {client} from './client';

// Backup refresh in case a publish webhook is missed; the webhook revalidates
// tags immediately (app/api/revalidate).
const REVALIDATE_SECONDS = 3600;

// Local review of unpublished drafts (docs/design-plan.md, phase C): with
// SANITY_PREVIEW_DRAFTS=1 on this machine, reads use the drafts perspective
// with the token from .env.local and skip the cache. Never set it on a host.
const previewDrafts = process.env.SANITY_PREVIEW_DRAFTS === '1';
if (previewDrafts && (process.env.NETLIFY || process.env.CI)) {
  throw new Error('SANITY_PREVIEW_DRAFTS is for local review only.');
}
const previewClient = previewDrafts
  ? client.withConfig({perspective: 'drafts', token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false})
  : null;

/**
 * The one place content is fetched. Draft Mode preview will branch here later
 * (a token client with the drafts perspective and no caching), so pages and
 * loaders do not change.
 */
export function sanityFetch<T>({query, params, tags}: {query: string; params: QueryParams; tags: string[]}) {
  if (previewClient) return previewClient.fetch<T>(query, params, {cache: 'no-store'});
  return client.fetch<T>(query, params, {next: {revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG, ...tags]}});
}
