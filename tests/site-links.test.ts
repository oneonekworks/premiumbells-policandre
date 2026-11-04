import assert from 'node:assert/strict';
import test from 'node:test';
import {linkHref} from '../lib/site-links';

const contact = {phoneHref: 'tel:+40722790776', email: 'office@example.ro'};
const service = {_type: 'service', status: 'active', publishedLanguages: ['ro'], slug: 'cu-jug', parentSlug: 'clopote', parentStatus: 'active'};

test('links resolve per language and drop targets that are not public', () => {
  assert.equal(linkHref({kind: 'page', page: 'works'}, 'en', contact), '/en/our-work');
  assert.equal(linkHref({kind: 'page', page: 'about'}, 'ro', contact), '/#despre-noi');
  assert.equal(linkHref({kind: 'page', page: 'about'}, 'en', contact), '/en#despre-noi');
  assert.equal(linkHref({kind: 'document', target: service}, 'ro', contact), '/servicii/clopote/cu-jug');
  assert.equal(linkHref({kind: 'document', target: service}, 'en', contact), null);
  assert.equal(linkHref({kind: 'document', target: {...service, status: 'hidden'}}, 'ro', contact), null);
  assert.equal(linkHref({kind: 'document', target: {_type: 'blogPost', language: 'ro', slug: 'raport'}}, 'ro', contact), '/blog/raport');
  assert.equal(linkHref({kind: 'document', target: {_type: 'blogPost', language: 'ro', slug: 'raport'}}, 'en', contact), null);
  assert.equal(linkHref({kind: 'document', target: null}, 'ro', contact), null);
  assert.equal(linkHref({kind: 'phone'}, 'ro', contact), contact.phoneHref);
});
