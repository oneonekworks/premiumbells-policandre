import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate, parse} from 'groq-js';
import {PORTFOLIO_PAGE_QUERY, PROJECT_QUERY, PROJECTS_QUERY} from '../sanity/queries';
import {GALLERY_PAGE_SIZE, pageNumber} from '../sanity/pagination';

const gallery = Array.from({length: 201}, (_, i) => ({
  _key: `photo-${i}`, _type: 'imageWithMetadata',
  asset: {_type: 'reference', _ref: `image-${i}-1000x750-jpg`},
  alt: {ro: `Fotografie ${i}`, ...(i === 0 ? {en: 'Photo 0'} : {})},
  caption: {ro: `Legendă ${i}`},
}));
const project = {
  _id: 'published-project', _type: 'project', _createdAt: '2026-10-10T00:00:00Z',
  publishedLanguages: ['ro'],
  title: {ro: 'Titlu publicat', en: 'Unreviewed English title'}, slug: {current: 'lucrare-test'}, gallery,
  category: {_ref: 'category', _type: 'reference'},
};
const englishProject = {
  ...project, _id: 'english-project', _createdAt: '2026-10-11T00:00:00Z', publishedLanguages: ['ro', 'en'],
  title: {ro: 'Lucrare bilingvă', en: 'Bilingual work'}, slug: {current: 'lucrare-bilingva'},
};
const documents = [
  project,
  englishProject,
  {...project, _id: 'drafts.published-project', title: {ro: 'Titlu secret în ciornă'}},
  {...project, _id: 'drafts.only-draft', slug: {current: 'unpublished'}},
  {...project, _id: 'versions.release.future-project', slug: {current: 'future'}},
  {_id: 'category', _type: 'workCategory', title: {ro: 'Clopote', en: 'Bells'}},
  {_id: 'portfolioPage', _type: 'portfolioPage', publishedLanguages: ['ro'], title: {ro: 'Pagina publicată'}, intro: {ro: 'Text public'}},
  {_id: 'drafts.portfolioPage', _type: 'portfolioPage', title: {ro: 'Modificări private'}},
];

async function query(source: string, params = {}) {
  return (await evaluate(parse(source, {params}), {dataset: documents, params})).get();
}

test('listing excludes drafts/releases, dereferences category, and omits full galleries', async () => {
  const result = await query(PROJECTS_QUERY, {lang: 'ro', start: 0, end: 12});
  assert.equal(result.total, 2);
  assert.deepEqual(result.items.map((item: {title: string}) => item.title), ['Lucrare bilingvă', 'Titlu publicat']);
  assert.equal(result.items[1].category, 'Clopote');
  assert.equal('gallery' in result.items[1], false);
});

test('English lists and details include only projects published in English', async () => {
  const list = await query(PROJECTS_QUERY, {lang: 'en', start: 0, end: 12});
  assert.equal(list.total, 1);
  assert.equal(list.items[0].title, 'Bilingual work');
  assert.equal(list.items[0].category, 'Bells');
  assert.equal(await query(PROJECT_QUERY, {lang: 'en', slug: 'lucrare-test', start: 0, end: 24}), null);
});

test('English alt text falls back to Romanian; captions do not', async () => {
  const result = await query(PROJECT_QUERY, {lang: 'en', slug: 'lucrare-bilingva', start: 0, end: 2});
  assert.equal(result.gallery[0].alt, 'Photo 0');
  assert.equal(result.gallery[1].alt, 'Fotografie 1');
  assert.equal(result.gallery[1].caption, null);
});

test('draft-only and release-only detail URLs return no document', async () => {
  for (const slug of ['unpublished', 'future', 'missing']) {
    assert.equal(await query(PROJECT_QUERY, {lang: 'ro', slug, start: 0, end: 24}), null);
  }
});

test('201-image galleries paginate without losing order, captions, or keys', async () => {
  const seen: string[] = [];
  for (let start = 0; start < 201; start += GALLERY_PAGE_SIZE) {
    const result = await query(PROJECT_QUERY, {lang: 'ro', slug: 'lucrare-test', start, end: start + GALLERY_PAGE_SIZE});
    assert.equal(result.imageCount, 201);
    assert.ok(result.gallery.length <= 24);
    assert.equal(result.gallery[0].caption, `Legendă ${start}`);
    seen.push(...result.gallery.map((image: {_key: string}) => image._key));
  }
  assert.deepEqual(seen, gallery.map((image) => image._key));
});

test('page copy reads only the published singleton in a published language', async () => {
  assert.deepEqual(await query(PORTFOLIO_PAGE_QUERY, {lang: 'ro'}), {title: 'Pagina publicată', intro: 'Text public'});
  assert.equal(await query(PORTFOLIO_PAGE_QUERY, {lang: 'en'}), null);
});

test('pagination rejects malformed or unbounded page parameters', () => {
  for (const value of [undefined, ['2'], '0', '-1', '1.5', 'NaN', '10001', '9007199254740993']) {
    assert.equal(pageNumber(value), 1);
  }
  assert.equal(pageNumber('9'), 9);
});
