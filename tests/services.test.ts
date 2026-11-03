import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate, parse} from 'groq-js';
import * as queries from '../sanity/queries';
import {CATALOG_QUERY, SERVICE_QUERY, SERVICES_QUERY} from '../sanity/queries';
import {catalogAnchors, catalogKey, formatLength, servicePath, serviceTree} from '../lib/services';

const image = (id: string) => ({_type: 'imageWithMetadata', asset: {_type: 'reference', _ref: `image-${id}-800x600-jpg`}});
const service = (id: string, extra: Record<string, unknown>) => ({
  _id: id, _type: 'service', publishedLanguages: ['ro'], status: 'active', displayOrder: 10, coverImage: image(id),
  ...extra,
});
const documents = [
  service('clopote', {title: {ro: 'Clopote', en: 'Bells'}, slug: {ro: {current: 'clopote'}, en: {current: 'bells'}},
    publishedLanguages: ['ro', 'en'], displayOrder: 30, relatedCategory: {_type: 'reference', _ref: 'cat-clopote'},
    sections: [
      {_key: 's1', _type: 'sectionBellSizes', heading: {ro: 'Dimensiuni'},
        rows: [{_key: 'r1', weightKg: 160, diameterCm: 65, heightCm: 55, note: 'Mi'}], note: {ro: 'Include: limba'}},
      {_key: 's2', _type: 'sectionCatalogue', families: ['policandre']},
      {_key: 's3', _type: 'sectionCta', label: {ro: 'Cereți o ofertă'}, contact: 'phoneEmail'},
    ]}),
  service('cu-jug', {title: {ro: 'Cu jug'}, slug: {ro: {current: 'cu-jug'}}, displayOrder: 20, parent: {_type: 'reference', _ref: 'clopote'}}),
  service('ascuns', {title: {ro: 'Variantă ascunsă'}, slug: {ro: {current: 'ascuns'}}, status: 'hidden',
    parent: {_type: 'reference', _ref: 'clopote'}}),
  service('policandre', {title: {ro: 'Policandre'}, slug: {ro: {current: 'policandre'}}, displayOrder: 10}),
  service('cupole', {title: {ro: 'Cupole'}, slug: {ro: {current: 'cupole'}}, status: 'hidden'}),
  service('sub-cupole', {title: {ro: 'Sub cupole'}, slug: {ro: {current: 'inox'}}, parent: {_type: 'reference', _ref: 'cupole'}}),
  service('drafts.policandre', {title: {ro: 'Ciornă privată'}, slug: {ro: {current: 'policandre'}}}),
  service('drafts.nou', {title: {ro: 'Doar ciornă'}, slug: {ro: {current: 'nou'}}}),
  {_id: 'cat-clopote', _type: 'workCategory', publishedLanguages: ['ro'], enabled: true, title: {ro: 'Clopote'},
    slug: {ro: {current: 'clopote'}}},
  {_id: 'p7', _type: 'catalogItem', publishedLanguages: ['ro'], family: 'policandre', displayOrder: 7,
    title: {ro: 'Policandru nr. 7'}, image: image('p7'), anchorIds: ['Policandru-7'],
    variants: [{_key: 'v1', finish: 'gilded', referenceCode: '110311'}]},
  {_id: 'p1', _type: 'catalogItem', publishedLanguages: ['ro'], family: 'policandre', displayOrder: 1,
    title: {ro: 'Policandru nr. 1'}, image: image('p1')},
  {_id: 'h1', _type: 'catalogItem', publishedLanguages: ['ro'], family: 'horos', displayOrder: 1,
    title: {ro: 'Horos 1'}, image: image('h1')},
  {_id: 'drafts.p2', _type: 'catalogItem', publishedLanguages: ['ro'], family: 'policandre', displayOrder: 2,
    title: {ro: 'Ciornă'}, image: image('p2')},
];

async function query(source: string, params: Record<string, unknown>) {
  return (await evaluate(parse(source, {params}), {dataset: documents, params})).get();
}

test('no query reads prices or spreads whole documents', () => {
  for (const [name, source] of Object.entries(queries)) {
    if (typeof source !== 'string') continue;
    assert.doesNotMatch(source, /price|pre[tț]|cost/i, name);
    // A spread is `...` after `{`, `,` or a space; `[0...500]` is a slice.
    assert.doesNotMatch(source, /(^|[{,\s])\.\.\.(?!\d)/, name);
  }
});

test('the overview lists active published services in order; hidden ones and their variants are absent', async () => {
  const list = await query(SERVICES_QUERY, {lang: 'ro'});
  assert.deepEqual(list.map((item: {slug: string}) => item.slug), ['policandre', 'cu-jug', 'clopote']);
  const tree = serviceTree(list);
  assert.deepEqual(tree.map((node) => [node.slug, node.variants.map((variant) => variant.slug)]),
    [['policandre', []], ['clopote', ['cu-jug']]]);
  assert.equal(list.find((item: {slug: string}) => item.slug === 'policandre').title, 'Policandre');
  const en = await query(SERVICES_QUERY, {lang: 'en'});
  assert.deepEqual(en.map((item: {slug: string}) => item.slug), ['bells']);
});

test('a service resolves by either language slug; variants only under their parent', async () => {
  const hub = await query(SERVICE_QUERY, {lang: 'ro', parentSlug: null, slug: 'bells'});
  assert.equal(hub.slug, 'clopote');
  assert.deepEqual(hub.variants.map((variant: {slug: string}) => variant.slug), ['cu-jug']);
  assert.deepEqual(hub.relatedCategory, {_id: 'cat-clopote', title: 'Clopote', slug: 'clopote'});
  assert.deepEqual(hub.sections[0].rows[0], {_key: 'r1', weightKg: 160, diameterCm: 65, heightCm: 55, note: 'Mi'});
  assert.equal(hub.sections[0].footnote, 'Include: limba');
  assert.deepEqual(hub.sections[1].families, ['policandre']);
  assert.equal(hub.sections[2].contact, 'phoneEmail');

  const variant = await query(SERVICE_QUERY, {lang: 'ro', parentSlug: 'clopote', slug: 'cu-jug'});
  assert.equal(variant.parent.slug, 'clopote');
  assert.equal(await query(SERVICE_QUERY, {lang: 'ro', parentSlug: null, slug: 'cu-jug'}), null);
  assert.equal(await query(SERVICE_QUERY, {lang: 'ro', parentSlug: 'policandre', slug: 'cu-jug'}), null);
  assert.equal(await query(SERVICE_QUERY, {lang: 'ro', parentSlug: 'clopote', slug: 'ascuns'}), null);
  assert.equal(await query(SERVICE_QUERY, {lang: 'ro', parentSlug: 'cupole', slug: 'inox'}), null);
  assert.equal(await query(SERVICE_QUERY, {lang: 'ro', parentSlug: null, slug: 'nou'}), null);
  assert.equal((await query(SERVICE_QUERY, {lang: 'ro', parentSlug: null, slug: 'policandre'})).title, 'Policandre');
  // English exists only for services published in English.
  assert.equal(await query(SERVICE_QUERY, {lang: 'en', parentSlug: 'bells', slug: 'cu-jug'}), null);
});

test('catalogue items come in family order, published only', async () => {
  const items = await query(CATALOG_QUERY, {lang: 'ro', families: ['policandre']});
  assert.deepEqual(items.map((item: {_id: string}) => item._id), ['p1', 'p7']);
  assert.deepEqual(items[1].variants, [{_key: 'v1', finish: 'gilded', referenceCode: '110311'}]);
  const both = await query(CATALOG_QUERY, {lang: 'ro', families: ['horos', 'policandre']});
  assert.equal(both.length, 3);
});

test('route helpers', () => {
  assert.equal(servicePath(null, 'policandre'), '/servicii/policandre');
  assert.equal(servicePath('clopote', 'cu-jug'), '/servicii/clopote/cu-jug');
  assert.equal(catalogKey(['policandre', 'horos', 'policandre']), 'horos,policandre');
  assert.equal(catalogKey(null), '');
  assert.deepEqual(catalogAnchors({_id: 'legacy-catalog-policandre-09', anchorIds: ['Policandru-9', 'Policandru-10']}),
    ['Policandru-9', 'Policandru-10', 'legacy-catalog-policandre-09']);
  assert.deepEqual(catalogAnchors({_id: 'x', slug: 'nr-1', anchorIds: null}), ['nr-1']);
  assert.equal(formatLength(310, 'ro-RO'), '3,1 m');
  assert.equal(formatLength(85, 'ro-RO'), '85 cm');
  assert.equal(formatLength(160, 'en-GB'), '1.6 m');
});
