// Permanent (308) redirects for broken, duplicate or template legacy URLs,
// from docs/url-map.md. next.config.ts redirects() run before proxy.ts, so
// sources and destinations are public (Romanian, unprefixed) paths.
// Tested in tests/redirects.test.ts.
export const legacyRedirects = [
  {source: '/servicii/servicii/iconostase', destination: '/servicii/iconostase'},
  {source: '/servicii/servicii/usi', destination: '/servicii/usi'},
  {source: '/servicii/iconostase/lemn-bronz', destination: '/servicii/iconostase'},
  // Copy of the pristol page (decided 2026-11-03).
  {source: '/servicii/iconostase/lemn', destination: '/servicii/iconostase'},
  {source: '/_lucrarile-noastre', destination: '/lucrarile-noastre'},
].map((redirect) => ({...redirect, permanent: true as const}));
