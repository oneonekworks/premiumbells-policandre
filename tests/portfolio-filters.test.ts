import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyFilters, filterOptions, filtersHref, fold, hasFilters, noFilters, parseFilters, SEARCH_MAX_LENGTH,
} from '../lib/portfolio-filters';

const countries = {RO: 'România', MD: 'Republica Moldova'};
const work = (title: string, year: number | null, locality?: string, county?: string, country: 'RO' | 'MD' = 'RO') =>
  ({title, year, location: {locality, county, country}});
const projects = [
  work('Parohia Ziua Crucii, Iași', 2022, 'Iași', 'Iași'),
  work('Parohia Roșu Chiajna, Sfințire', 2022, 'Roșu, Chiajna', 'Ilfov'),
  work('Capela Militara, Botosani', 2018, 'Botoșani', 'Botoșani'),
  work('Saveni, Botosani', 2018, 'Săveni', 'Botoșani'),
  work('Resita, Biserica Caminelor', 2019, 'Reșița', 'Caraș-Severin'),
  work('Ialoveni', 2016, 'Ialoveni', 'Ialoveni', 'MD'),
  work('Clopotele Catedralei Mitropolitane Chisinau', 2019, 'Chișinău', undefined, 'MD'),
  work('Lucrare de test', null, 'Mogosoaia', 'Ilfov'),
];
const options = filterOptions(projects, countries);
const titles = (list: {title: string | null}[]) => list.map((project) => project.title);
const search = (query: string) => titles(applyFilters(projects, {...noFilters, query}, countries));

test('fold removes diacritics (comma and cedilla forms), case and punctuation', () => {
  assert.equal(fold('Iași'), 'iasi');
  assert.equal(fold('ROȘU'), 'rosu');
  assert.equal(fold('Şoimăreşti, Ţară'), 'soimaresti tara');
  assert.equal(fold('Drăgănești-Vlașca  Î â'), 'draganesti vlasca i a');
  assert.equal(fold('  —  '), '');
});

test('search ignores diacritics and needs every word', () => {
  assert.deepEqual(search('iasi'), ['Parohia Ziua Crucii, Iași']);
  assert.deepEqual(search('rosu'), ['Parohia Roșu Chiajna, Sfințire']);
  assert.deepEqual(search('ROȘU chiajna'), ['Parohia Roșu Chiajna, Sfințire']);
  assert.deepEqual(search('rosu iasi'), []);
  assert.deepEqual(search('Botoșani'), ['Capela Militara, Botosani', 'Saveni, Botosani']);
  // The place is searched too: county and country names.
  assert.deepEqual(search('caras severin'), ['Resita, Biserica Caminelor']);
  assert.deepEqual(search('moldova'), ['Ialoveni', 'Clopotele Catedralei Mitropolitane Chisinau']);
  assert.equal(search('').length, projects.length);
  assert.equal(search(' , ').length, projects.length);
});

test('options list the years newest first and the counties in Romanian order, Moldova grouped last', () => {
  assert.deepEqual(options.years.map((option) => [option.value, option.count]), [[2022, 2], [2019, 2], [2018, 2], [2016, 1]]);
  assert.deepEqual(options.counties.map((option) => [option.value, option.label, option.count]), [
    ['botosani', 'Botoșani', 2],
    ['caras-severin', 'Caraș-Severin', 1],
    ['iasi', 'Iași', 1],
    ['ilfov', 'Ilfov', 2],
    ['moldova', 'Republica Moldova', 2],
  ]);
});

test('year and county filter exactly and combine with the search', () => {
  const filter = (filters: Partial<typeof noFilters>) => titles(applyFilters(projects, {...noFilters, ...filters}, countries));
  assert.deepEqual(filter({year: 2019}), ['Resita, Biserica Caminelor', 'Clopotele Catedralei Mitropolitane Chisinau']);
  assert.deepEqual(filter({county: 'moldova'}), ['Ialoveni', 'Clopotele Catedralei Mitropolitane Chisinau']);
  assert.deepEqual(filter({county: 'ilfov', year: 2022}), ['Parohia Roșu Chiajna, Sfințire']);
  assert.deepEqual(filter({county: 'botosani', query: 'saveni'}), ['Saveni, Botosani']);
  assert.deepEqual(filter({county: 'iasi', year: 2018}), []);
});

test('query parsing keeps valid values and ignores the rest', () => {
  assert.deepEqual(parseFilters({cauta: '  Roșu   Chiajna ', an: '2022', judet: 'ilfov', pagina: '2'}, options),
    {query: 'Roșu Chiajna', year: 2022, county: 'ilfov'});
  assert.deepEqual(parseFilters({}, options), noFilters);
  // A year or county the category does not have, malformed values, arrays.
  assert.deepEqual(parseFilters({an: '2020', judet: 'cluj'}, options), noFilters);
  assert.deepEqual(parseFilters({an: '2022abc', judet: 'Ilfov'}, options), noFilters);
  assert.deepEqual(parseFilters({cauta: ['iasi', 'rosu'], an: ['2022']}, options), noFilters);
  assert.equal(parseFilters({cauta: 'x'.repeat(500)}, options).query.length, SEARCH_MAX_LENGTH);
  assert.equal(hasFilters(noFilters), false);
  assert.equal(hasFilters({...noFilters, year: 2022}), true);
});

test('grid URLs keep the filters, leave out defaults and encode the search', () => {
  const base = '/lucrarile-noastre/clopote';
  assert.equal(filtersHref(base, noFilters), base);
  assert.equal(filtersHref(base, noFilters, 1), base);
  assert.equal(filtersHref(base, noFilters, 2), `${base}?pagina=2`);
  assert.equal(filtersHref(base, {query: 'Roșu Chiajna', year: 2022, county: 'ilfov'}, 3),
    `${base}?cauta=Ro%C8%99u+Chiajna&an=2022&judet=ilfov&pagina=3`);
  const parsed = new URL(filtersHref(base, {query: 'a&b=c', year: null, county: null}), 'http://x').searchParams;
  assert.equal(parsed.get('cauta'), 'a&b=c');
});
