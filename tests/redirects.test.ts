import assert from 'node:assert/strict';
import test from 'node:test';
import nextConfig from '../next.config';
import {legacyRedirects} from '../lib/redirects';

test('next.config serves the legacy redirect table as 308s', async () => {
  const redirects = await nextConfig.redirects!();
  assert.deepEqual(redirects, legacyRedirects);
  assert.deepEqual(
    Object.fromEntries(redirects.map(({source, destination}) => [source, destination])),
    {
      '/servicii/servicii/iconostase': '/servicii/iconostase',
      '/servicii/servicii/usi': '/servicii/usi',
      '/servicii/iconostase/lemn-bronz': '/servicii/iconostase',
      '/servicii/iconostase/lemn': '/servicii/iconostase',
      '/_lucrarile-noastre': '/lucrarile-noastre',
    },
  );
  for (const redirect of redirects) assert.equal(redirect.permanent, true, redirect.source);
});

test('redirects are literal paths with no chains, loops or duplicates', () => {
  const sources = new Set(legacyRedirects.map(({source}) => source));
  assert.equal(sources.size, legacyRedirects.length);
  for (const {source, destination} of legacyRedirects) {
    assert.match(source, /^\/[a-z0-9_/-]+$/, source);
    assert.ok(!sources.has(destination), `${source} -> ${destination} is a chain`);
    assert.notEqual(source, destination);
  }
});

test('live service variants are not redirected', () => {
  for (const path of ['/servicii/iconostase/marmura', '/servicii/iconostase/lemn-aur', '/servicii/clopote/cu-jug']) {
    assert.ok(!legacyRedirects.some(({source}) => source === path), path);
  }
});
