// Writes the two base maps of the homepage map story (and the Works Hartă
// view) from the v6 boards: sea, hatching, land, borders and the five
// countries with works. Dots, labels, leaders and pins are drawn by the site
// (components/map/europe-map.tsx), so only this static drawing lives here.
// The boards' paths come from docs/design/clarity-v6/tools/map-europe.js
// (Natural Earth 1:50m, conic conformal); re-run after a board changes:
//   node scripts/extract-europe-map.mjs
import {readFileSync, writeFileSync} from 'node:fs';

const boards = 'docs/design/clarity-v6/reference/boards';
const maps = [
  {board: 'V6HomeDesktop.dc.html', open: /<svg class="wsvg"[^>]*>/, end: '<text', out: 'public/maps/europe-1200x700.svg', size: [1200, 700]},
  {board: 'V6HomeMobileA.dc.html', open: /<svg class="wsvgm"[^>]*>/, end: '<g fill="#0f6b63"', out: 'public/maps/europe-800x603.svg', size: [800, 603]},
];

for (const {board, open, end, out, size: [w, h]} of maps) {
  const html = readFileSync(`${boards}/${board}`, 'utf8');
  const start = html.search(open);
  if (start < 0) throw new Error(`No map in ${board}`);
  const body = html.slice(start).replace(open, '');
  const drawing = body.slice(0, body.indexOf(end))
    .replace(/<\/path>/g, '').replace(/<path([^>]*?)\s*\/?>/g, '<path$1/>')
    .replace(/<rect([^>]*?)\s*\/?>(<\/rect>)?/g, '<rect$1/>')
    .replace(/id="engm?"/, 'id="eng"').replace(/url\(#engm\)/, 'url(#eng)');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${drawing}</svg>\n`;
  writeFileSync(out, svg);
  console.log(out, svg.length);
}
