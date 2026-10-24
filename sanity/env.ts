// Public identifiers only. Never add a token to this browser-safe module.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '1fzbw4s1';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
export const apiVersion = '2026-10-10';

if (!/^[a-z0-9]+$/.test(projectId)) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID must be a valid Sanity project ID.');
}
if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset)) {
  throw new Error('NEXT_PUBLIC_SANITY_DATASET must be a valid Sanity dataset name.');
}
