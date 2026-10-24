import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate, parse} from 'groq-js';
import {
  CATEGORIES_QUERY, CATEGORY_PROJECTS_QUERY, CATEGORY_QUERY, PORTFOLIO_PAGE_QUERY, PROJECT_QUERY,
} from '../sanity/queries';
import {pageNumber} from '../sanity/pagination';

const gallery = Array.from({length: 201}, (_, i) => ({
  _key: `photo-${i}`, _type: 'imageWithMetadata',
  asset: {_type: 'reference', _ref: `image-${i}-1000x750-jpg`},
  alt: {ro: `Fotografie ${i}`, ...(i === 0 ? {en: 'Photo 0'} : {})},
  caption: {ro: `Legendă ${i}`},
}));
const category = {_type: 'reference', _ref: 'clopote'};
const project = {
  _id: 'published-project', _type: 'project', _createdAt: '2026-10-10T00:00:00Z',
  publishedLanguages: ['ro'], category,
  title: {ro: 'Titlu publicat', en: 'Unreviewed English title'}, slug: {current: 'lucrare-test'}, gallery,
};
const englishProject = {
  ...project, _id: 'english-project', _createdAt: '2026-10-11T00:00:00Z', publishedLanguages: ['ro', 'en'],
  title: {ro: 'Lucrare bilingvă', en: 'Bilingual work'}, slug: {current: 'lucrare-bilingva'}, displayOrder: 1,
};
const documents = [
  project,
  englishProject,
  {...project, _id: 'other-category-project', slug: {current: 'alta'}, category: {_type: 'reference', _ref: 'usi'}},
  {...project, _id: 'drafts.published-project', title: {ro: 'Titlu secret în ciornă'}},
  {...project, _id: 'drafts.only-draft', slug: {current: 'unpublished'}},
  {...project, _id: 'versions.release.future-project', slug: {current: 'future'}},
  {
    _id: 'clopote', _type: 'workCategory', publishedLanguages: ['ro', 'en'], enabled: true, displayOrder: 30,
    title: {ro: 'Clopote', en: 'Bells'}, slug: {ro: {current: 'clopote'}, en: {current: 'bells'}},
  },
  {
    _id: 'usi', _type: 'workCategory', publishedLanguages: ['ro'], enabled: true, displayOrder: 40,
    title: {ro: 'Uși'}, slug: {ro: {current: 'usi'}},
  },
  {
    _id: 'hidden', _type: 'workCategory', publishedLanguages: ['ro'], enabled: false, displayOrder: 10,
    title: {ro: 'Ascunsă'}, slug: {ro: {current: 'ascunsa'}},
  },
  {_id: 'portfolioPage', _type: 'portfolioPage', publishedLanguages: ['ro'], title: {ro: 'Pagina publicată'}, intro: {ro: 'Text public'}},
  {_id: 'drafts.portfolioPage', _type: 'portfolioPage', title: {ro: 'Modificări private'}},
];

async function query(source: string, params = {}) {
  return (await evaluate(parse(source, {params}), {dataset: documents, params})).get();
}

test('categories are ordered, hidden ones excluded, and counts exclude drafts', async () => {
  const ro = await query(CATEGORIES_QUERY, {lang: 'ro'});
  assert.deepEqual(ro.map((item: {slug: string}) => item.slug), ['clopote', 'usi']);
  assert.equal(ro[0].projectCount, 2);
  const en = await query(CATEGORIES_QUERY, {lang: 'en'});
  assert.deepEqual(en.map((item: {slug: string; title: string}) => [item.slug, item.title]), [['bells', 'Bells']]);
});

test('a category slug from either language resolves, returning the current-language slug', async () => {
  const fromRomanian = await query(CATEGORY_QUERY, {lang: 'en', slug: 'clopote'});
  assert.equal(fromRomanian.slug, 'bells');
  assert.deepEqual(fromRomanian.slugs, {ro: 'clopote', en: 'bells'});
  assert.equal(await query(CATEGORY_QUERY, {lang: 'en', slug: 'usi'}), null);
  assert.equal(await query(CATEGORY_QUERY, {lang: 'ro', slug: 'ascunsa'}), null);
});

test('category projects exclude drafts, releases, and other categories; displayOrder first', async () => {
  const result = await query(CATEGORY_PROJECTS_QUERY, {lang: 'ro', categoryId: 'clopote', start: 0, end: 24});
  assert.equal(result.total, 2);
  assert.deepEqual(result.items.map((item: {title: string}) => item.title), ['Lucrare bilingvă', 'Titlu publicat']);
  assert.equal('gallery' in result.items[0], false);
  const english = await query(CATEGORY_PROJECTS_QUERY, {lang: 'en', categoryId: 'clopote', start: 0, end: 24});
  assert.deepEqual(english.items.map((item: {title: string}) => item.title), ['Bilingual work']);
});

test('project detail requires the matching category and a published language', async () => {
  assert.equal((await query(PROJECT_QUERY, {lang: 'ro', categoryId: 'clopote', slug: 'lucrare-test'})).title, 'Titlu publicat');
  assert.equal(await query(PROJECT_QUERY, {lang: 'ro', categoryId: 'usi', slug: 'lucrare-test'}), null);
  assert.equal(await query(PROJECT_QUERY, {lang: 'en', categoryId: 'clopote', slug: 'lucrare-test'}), null);
  for (const slug of ['unpublished', 'future', 'missing']) {
    assert.equal(await query(PROJECT_QUERY, {lang: 'ro', categoryId: 'clopote', slug}), null);
  }
});

test('full 201-image gallery keeps order; English alt falls back, captions do not', async () => {
  const ro = await query(PROJECT_QUERY, {lang: 'ro', categoryId: 'clopote', slug: 'lucrare-test'});
  assert.deepEqual(ro.gallery.map((image: {_key: string}) => image._key), gallery.map((image) => image._key));
  assert.equal(ro.gallery[5].caption, 'Legendă 5');
  const en = await query(PROJECT_QUERY, {lang: 'en', categoryId: 'clopote', slug: 'lucrare-bilingva'});
  assert.equal(en.gallery[0].alt, 'Photo 0');
  assert.equal(en.gallery[1].alt, 'Fotografie 1');
  assert.equal(en.gallery[1].caption, null);
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
