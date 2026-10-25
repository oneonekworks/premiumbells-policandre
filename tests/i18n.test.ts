import assert from 'node:assert/strict';
import test from 'node:test';
import {youtubeId} from '../components/portfolio/video-embed';
import {photoAlt, subject} from '../lib/alt';
import {plural} from '../lib/i18n/format';
import {alternateHref, localizedHref, parsePublicPath, resolveEnglishPath} from '../lib/i18n/routing';
import {languageAlternates} from '../lib/seo';

test('Romanian plurals use "de" from 20 upward; English uses one/other', () => {
  const forms = ['lucrare', 'lucrări', 'de lucrări'];
  assert.deepEqual([0, 1, 2, 19, 20, 39, 101, 119, 120].map((n) => plural('ro', n, forms)), [
    '0 lucrări', '1 lucrare', '2 lucrări', '19 lucrări', '20 de lucrări', '39 de lucrări',
    '101 lucrări', '119 lucrări', '120 de lucrări',
  ]);
  assert.deepEqual([1, 2, 39].map((n) => plural('en', n, ['project', 'projects', 'projects'])), [
    '1 project', '2 projects', '39 projects',
  ]);
});

test('section names translate in English URLs and back', () => {
  assert.equal(localizedHref('ro', '/lucrarile-noastre/clopote/schitul-duca'), '/lucrarile-noastre/clopote/schitul-duca');
  assert.equal(localizedHref('en', '/lucrarile-noastre/bells/schitul-duca'), '/en/our-work/bells/schitul-duca');
  assert.equal(localizedHref('en', '/'), '/en');
  assert.deepEqual(resolveEnglishPath('/our-work/bells'), {internal: '/lucrarile-noastre/bells'});
  assert.deepEqual(resolveEnglishPath('/lucrarile-noastre/bells'), {redirect: '/en/our-work/bells'});
  assert.deepEqual(parsePublicPath('/en/services'), {lang: 'en', internal: '/servicii'});
  assert.equal(alternateHref('/lucrarile-noastre', 'en'), '/en/our-work');
  assert.equal(alternateHref('/lucrarile-noastre/clopote/schitul-duca', 'en'), '/en');
});

test('hreflang alternates list only published languages with Romanian as x-default', () => {
  assert.deepEqual(languageAlternates('ro', {ro: '/lucrarile-noastre/clopote', en: null}), {
    canonical: '/lucrarile-noastre/clopote',
    languages: {'ro': '/lucrarile-noastre/clopote', 'x-default': '/lucrarile-noastre/clopote'},
  });
  assert.deepEqual(languageAlternates('en', {ro: '/lucrarile-noastre/clopote', en: '/lucrarile-noastre/bells'})?.canonical,
    '/en/our-work/bells');
});

test('YouTube IDs are read from watch, short, embed, and shorts URLs', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ?t=3',
    'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
  ]) assert.equal(youtubeId(url), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://vimeo.com/1'), null);
});

test('photo alt text: written text first, then caption, then generated description', () => {
  const place = subject('Schitul Duca', 'Brasov', 'Brasov');
  assert.equal(place, 'Schitul Duca, Brasov');
  const position = {index: 2, total: 12, template: 'fotografia {index} din {total}'};
  assert.equal(photoAlt({alt: 'Clopot de 600 kg'}, place, position), 'Clopot de 600 kg');
  assert.equal(photoAlt({alt: ' ', caption: 'Anul 2022'}, place, position), 'Anul 2022');
  assert.equal(photoAlt({alt: null, caption: null}, place, position), 'Schitul Duca, Brasov – fotografia 3 din 12');
  assert.equal(photoAlt({}, 'Bilingual work', {index: 0, total: 1, template: 'photo {index} of {total}'}), 'Bilingual work – photo 1 of 1');
  assert.equal(photoAlt({}, 'Clopote'), 'Clopote');
});
