import type {NextRequest} from 'next/server';
import {parseBody} from 'next-sanity/webhook';
import {revalidationTags, type PublishPayload} from './cache-tags';

type Options = {
  secret: string | undefined;
  revalidate: (tag: string) => void;
  /** parseBody waits 3 s so queries after the webhook see the new content. */
  waitForConsistency?: boolean;
};

/**
 * Signed Sanity publish webhook: verifies the signature, maps the changed
 * document to cache tags, and revalidates them. Never accepts unsigned calls.
 */
export async function handleRevalidate(request: Request, {secret, revalidate, waitForConsistency = true}: Options) {
  if (!secret) return Response.json({message: 'Revalidation secret is not configured'}, {status: 500});

  let parsed;
  try {
    parsed = await parseBody<PublishPayload>(request as NextRequest, secret, waitForConsistency);
  } catch {
    return Response.json({message: 'Invalid body'}, {status: 400});
  }
  if (parsed.isValidSignature !== true) return Response.json({message: 'Invalid signature'}, {status: 401});

  const body = parsed.body;
  if (!body || typeof body !== 'object' || typeof body._type !== 'string') {
    return Response.json({message: 'Missing document type'}, {status: 400});
  }

  const tags = revalidationTags(body);
  for (const tag of tags) revalidate(tag);
  return Response.json({revalidated: true, tags});
}
