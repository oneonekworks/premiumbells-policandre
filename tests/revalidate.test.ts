import assert from 'node:assert/strict';
import test from 'node:test';
import {encodeSignatureHeader, SIGNATURE_HEADER_NAME} from '@sanity/webhook';
import {cacheTags, revalidationTags, SANITY_TAG} from '../sanity/cache-tags';
import {handleRevalidate} from '../sanity/revalidate';

const secret = 'test-secret';
const state = (slug: string | null, category: string | null, languages: string[] | null = ['ro']) =>
  ({slug, category, languages});

async function signedRequest(body: string, signWith = secret) {
  const signature = await encodeSignatureHeader(body, Date.now(), signWith);
  return new Request('http://localhost/api/revalidate', {
    method: 'POST', body, headers: {'content-type': 'application/json', [SIGNATURE_HEADER_NAME]: signature},
  });
}

async function run(request: Request, secretValue: string | undefined = secret) {
  const revalidated: string[] = [];
  const response = await handleRevalidate(request, {
    secret: secretValue, revalidate: (tag) => revalidated.push(tag), waitForConsistency: false,
  });
  return {status: response.status, json: await response.json(), revalidated};
}

test('project text edits revalidate the project and its category grid, not the counts', () => {
  assert.deepEqual(revalidationTags({
    _type: 'project', operation: 'update', before: state('drobeta', 'clopote'), after: state('drobeta', 'clopote'),
  }), [cacheTags.project('drobeta'), cacheTags.categoryProjects('clopote')]);
});

test('renames and category moves revalidate both the old and the new scope', () => {
  assert.deepEqual(revalidationTags({
    _type: 'project', operation: 'update', before: state('vechi', 'clopote'), after: state('nou', 'policandre'),
  }), [
    cacheTags.project('vechi'), cacheTags.project('nou'),
    cacheTags.categoryProjects('clopote'), cacheTags.categoryProjects('policandre'), cacheTags.projectCounts,
  ]);
});

test('publishing, unpublishing and language changes revalidate category counts', () => {
  for (const payload of [
    {operation: 'create' as const, before: null, after: state('nou', 'clopote')},
    {operation: 'delete' as const, before: state('nou', 'clopote'), after: null},
    {operation: 'update' as const, before: state('nou', 'clopote'), after: state('nou', 'clopote', ['en', 'ro'])},
  ]) {
    assert.ok(revalidationTags({_type: 'project', ...payload}).includes(cacheTags.projectCounts), payload.operation);
  }
});

test('other document types map to their tag or to everything', () => {
  assert.deepEqual(revalidationTags({_type: 'workCategory'}), [cacheTags.categories]);
  assert.deepEqual(revalidationTags({_type: 'portfolioPage'}), [cacheTags.portfolioPage]);
  assert.deepEqual(revalidationTags({_type: 'blogPost'}), [SANITY_TAG]);
  assert.deepEqual(revalidationTags({_type: 'project', operation: 'update'}), [SANITY_TAG]);
});

test('a correctly signed webhook revalidates the mapped tags', async () => {
  const body = JSON.stringify({
    _id: 'legacy-clopote-drobeta', _type: 'project', operation: 'update',
    before: state('drobeta', 'clopote'), after: state('drobeta', 'clopote'),
  });
  const result = await run(await signedRequest(body));
  assert.equal(result.status, 200);
  assert.deepEqual(result.revalidated, [cacheTags.project('drobeta'), cacheTags.categoryProjects('clopote')]);
  assert.deepEqual(result.json.tags, result.revalidated);
});

test('wrong, missing or unconfigured signatures revalidate nothing', async () => {
  const body = JSON.stringify({_type: 'workCategory'});
  const wrong = await run(await signedRequest(body, 'other-secret'));
  assert.equal(wrong.status, 401);
  const unsigned = await run(new Request('http://localhost/api/revalidate', {method: 'POST', body}));
  assert.equal(unsigned.status, 401);
  const tampered = await signedRequest(body);
  const forged = await run(new Request(tampered.url, {
    method: 'POST', body: JSON.stringify({_type: 'portfolioPage'}), headers: tampered.headers,
  }));
  assert.equal(forged.status, 401);
  const unconfigured = await run(await signedRequest(body), '');
  assert.equal(unconfigured.status, 500);
  for (const result of [wrong, unsigned, forged, unconfigured]) assert.deepEqual(result.revalidated, []);
});

test('signed bodies that are not documents are rejected', async () => {
  assert.equal((await run(await signedRequest('{"_id": "x"}'))).status, 400);
  assert.equal((await run(await signedRequest('not json'))).status, 400);
});

test('services share one tag; catalogue items revalidate their old and new family', () => {
  assert.deepEqual(revalidationTags({_type: 'service', operation: 'update'}), [cacheTags.services]);
  assert.deepEqual(revalidationTags({_type: 'service', operation: 'delete', before: {}, after: null}), [cacheTags.services]);
  assert.deepEqual(revalidationTags({
    _type: 'catalogItem', operation: 'update', before: {family: 'policandre'}, after: {family: 'policandre'},
  }), [cacheTags.catalog('policandre')]);
  assert.deepEqual(revalidationTags({
    _type: 'catalogItem', operation: 'update', before: {family: 'policandre'}, after: {family: 'horos'},
  }), [cacheTags.catalog('policandre'), cacheTags.catalog('horos')]);
  assert.deepEqual(revalidationTags({_type: 'catalogItem', operation: 'create', before: null, after: {family: 'aplice'}}),
    [cacheTags.catalog('aplice')]);
});

test('a catalogue payload without a family (old webhook projection) clears everything', () => {
  assert.deepEqual(revalidationTags({_type: 'catalogItem', operation: 'update'}), [SANITY_TAG]);
  assert.deepEqual(revalidationTags({
    _type: 'catalogItem', operation: 'update', before: {slug: null, family: null}, after: {slug: null},
  }), [SANITY_TAG]);
});

test('a signed service webhook revalidates the service tag', async () => {
  const body = JSON.stringify({_id: 'legacy-service-clopote', _type: 'service', operation: 'update', before: {}, after: {}});
  const result = await run(await signedRequest(body));
  assert.equal(result.status, 200);
  assert.deepEqual(result.revalidated, [cacheTags.services]);
});
