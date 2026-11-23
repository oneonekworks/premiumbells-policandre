import assert from 'node:assert/strict';
import test from 'node:test';
import {fold} from '../lib/portfolio-filters';
import {defaultCategory, filterWorks, parseWorksState, placeText, tileMeta, worksHref, type WorkLike} from '../lib/works';

const categories = [
  {slug: 'policandre', craft: 'policandre', displayOrder: 10},
  {slug: 'clopote', craft: 'clopote', displayOrder: 30},
  {slug: 'automatizari', craft: 'clopote', displayOrder: 50},
];
const countries = {RO: 'România', MD: 'Moldova'};
const work = (id: string, categorySlug: string, craft: string, extra: Partial<WorkLike> = {}): WorkLike => ({
  _id: id, title: id, slug: id, categorySlug, categoryTitle: categorySlug, craft, bellTypes: null, featured: false,
  year: 2022, location: {locality: 'Iași', county: 'Iași', country: 'RO'}, specs: null, ...extra,
});
const works = [
  work('p1', 'policandre', 'policandre'),
  work('c1', 'clopote', 'clopote', {bellTypes: ['fara-balans']}),
  work('c2', 'clopote', 'clopote'),
  work('a1', 'automatizari', 'clopote', {location: {locality: 'Chișinău', country: 'MD'}}),
];
const ids = (list: WorkLike[]) => list.map((item) => item._id);

test('fold removes diacritics, case and punctuation', () => {
  assert.equal(fold('Şoimăreşti, Ţară'), 'soimaresti tara');
});

test('the address: a craft path, bell type with unmarked works, an old category, place and round trip', () => {
  const state = parseWorksState('clopote', {tip: 'cu-jug', an: '2022', tara: 'xx'});
  assert.deepEqual([state.tip, state.place, state.view, state.page], ['cu-jug', null, 'galerie', 1]);
  assert.deepEqual(ids(filterWorks(works, state, categories, countries)), ['c2', 'a1']);
  for (const pagina of ['0', '-1', '1.5', 'NaN']) assert.equal(parseWorksState(null, {pagina}).page, 1);
  assert.deepEqual(ids(filterWorks(works, parseWorksState('automatizari', {}), categories, countries)), ['a1']);
  assert.deepEqual(ids(filterWorks(works, parseWorksState(null, {tara: 'md'}), categories, countries)), ['a1']);
  assert.equal(worksHref('/lucrarile-noastre', {...state, query: 'iasi', page: 2}), '/lucrarile-noastre/clopote?tip=cu-jug&cauta=iasi&pagina=2');
});

test('the wall tile line reads craft · place · year', () => {
  const dej = work('x', 'clopote', 'clopote', {location: {locality: 'Dej', county: 'Cluj', country: 'RO'}, year: 2023});
  assert.equal(placeText(dej, countries), 'Dej, Cluj');
  assert.equal(tileMeta({...dej, categoryTitle: 'Policandre'}, countries), 'Policandre · Dej, Cluj · 2023');
});

test('no "Toate": Policandre first, or the first craft with works for a place', () => {
  assert.equal(defaultCategory(works, parseWorksState(null, {}), categories, countries), 'policandre');
  assert.equal(defaultCategory(works, parseWorksState(null, {tara: 'md'}), categories, countries), 'clopote');
});
