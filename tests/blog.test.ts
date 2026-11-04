import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate, parse} from 'groq-js';
import {BLOG_POST_QUERY, BLOG_POSTS_QUERY} from '../sanity/queries';

const block = (text: string) => ({_key: text.slice(0, 4), _type: 'block', style: 'normal', markDefs: [], children: [{_key: 'c', _type: 'span', text, marks: []}]});
const post = (id: string, language: string, slug: string, publishedAt: string, extra = {}) =>
  ({_id: id, _type: 'blogPost', language, title: id, slug: {current: slug}, publishedAt, body: [block('Clopotele noi au bătut.')], ...extra});

const documents = [
  post('putna', 'ro', 'clopotele-manastirii-putna', '2023-02-17'),
  post('raport', 'ro', 'raport-18-ianuarie-2023', '2023-02-18'),
  post('putna-en', 'en', 'putna-monastery-bells', '2023-02-17', {translationOf: {_type: 'reference', _ref: 'putna'}}),
  post('drafts.raport', 'ro', 'raport-18-ianuarie-2023', '2023-02-18', {title: 'Ciornă'}),
  post('drafts.new', 'ro', 'nepublicat', '2024-01-01'),
];

async function query(source: string, params: Record<string, unknown>) {
  return (await evaluate(parse(source, {params}), {dataset: documents, params})).get();
}

test('the blog lists published posts of one language, newest first', async () => {
  assert.deepEqual((await query(BLOG_POSTS_QUERY, {lang: 'ro'})).map((item: {_id: string}) => item._id), ['raport', 'putna']);
  assert.deepEqual((await query(BLOG_POSTS_QUERY, {lang: 'en'})).map((item: {_id: string}) => item._id), ['putna-en']);
});

test('a post finds its translation in both directions and measures its text', async () => {
  const ro = await query(BLOG_POST_QUERY, {lang: 'ro', slug: 'clopotele-manastirii-putna'});
  assert.deepEqual(ro.translations, [{language: 'en', slug: 'putna-monastery-bells'}]);
  assert.equal(ro.textLength, 'Clopotele noi au bătut.'.length);
  const en = await query(BLOG_POST_QUERY, {lang: 'en', slug: 'putna-monastery-bells'});
  assert.deepEqual(en.translations, [{language: 'ro', slug: 'clopotele-manastirii-putna'}]);
  assert.equal(await query(BLOG_POST_QUERY, {lang: 'en', slug: 'clopotele-manastirii-putna'}), null);
});
