import 'server-only';
import {createClient} from 'next-sanity';
import {apiVersion, dataset, projectId} from './env';

// The prototype reads fresh published content on each request. No draft token,
// browser client, or preview override. Production caching is a later milestone.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  perspective: 'published',
  useCdn: false,
  stega: false,
  timeout: 15000,
  maxRetries: 1,
});
