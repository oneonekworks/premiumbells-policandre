import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate, parse} from 'groq-js';
import {PORTFOLIO_PAGE_QUERY, PROJECT_QUERY, PROJECTS_QUERY} from '../sanity/queries';
import {GALLERY_PAGE_SIZE, pageNumber} from '../sanity/pagination';

const gallery = Array.from({length: 201}, (_, i) => ({
  _key: `photo-${i}`, _type: 'imageWithMetadata',
  asset: {_type: 'reference', _ref: `image-${i}-1000x750-jpg`},
  alt: `Photo ${i}`, caption: `Caption ${i}`,
}));
const project = {
  _id: 'published-project', _type: 'project', _createdAt: '2026-10-10T00:00:00Z',
  title: 'Published title', slug: {current: 'lucrare-test'}, gallery,
  category: {_ref: 'category', _type: 'reference'},
};
const documents = [
  project,
  {...project, _id: 'drafts.published-project', title: 'Secret draft title'},
  {...project, _id: 'drafts.only-draft', slug: {current: 'unpublished'}},
  {...project, _id: 'versions.release.future-project', slug: {current: 'future'}},
  {_id: 'category', _type: 'workCategory', title: 'Clopote'},
  {_id: 'portfolioPage', _type: 'portfolioPage', title: 'Published page', intro: 'Public copy'},
  {_id: 'drafts.portfolioPage', _type: 'portfolioPage', title: 'Private page changes'},
];

async function query(source: string, params = {}) {
  return (await evaluate(parse(source, {params}), {dataset: documents, params})).get();
}

test('listing excludes drafts/releases, dereferences category, and omits full galleries', async () => {
  const result = await query(PROJECTS_QUERY, {start: 0, end: 12});
  assert.equal(result.total, 1);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].title, 'Published title');
  assert.equal(result.items[0].category, 'Clopote');
  assert.equal('gallery' in result.items[0], false);
});

test('draft-only and release-only detail URLs return no document', async () => {
  for (const slug of ['unpublished', 'future', 'missing']) {
    assert.equal(await query(PROJECT_QUERY, {slug, start: 0, end: 24}), null);
  }
});

test('201-image galleries paginate without losing order, captions, or keys', async () => {
  const seen: string[] = [];
  for (let start = 0; start < 201; start += GALLERY_PAGE_SIZE) {
    const result = await query(PROJECT_QUERY, {slug: 'lucrare-test', start, end: start + GALLERY_PAGE_SIZE});
    assert.equal(result.imageCount, 201);
    assert.ok(result.gallery.length <= 24);
    assert.equal(result.gallery[0].caption, `Caption ${start}`);
    seen.push(...result.gallery.map((image: {_key: string}) => image._key));
  }
  assert.deepEqual(seen, gallery.map((image) => image._key));
});

test('page copy reads only the published singleton', async () => {
  assert.deepEqual(await query(PORTFOLIO_PAGE_QUERY), {title: 'Published page', intro: 'Public copy'});
});

test('pagination rejects malformed or unbounded page parameters', () => {
  for (const value of [undefined, ['2'], '0', '-1', '1.5', 'NaN', '10001', '9007199254740993']) {
    assert.equal(pageNumber(value), 1);
  }
  assert.equal(pageNumber('9'), 9);
});
