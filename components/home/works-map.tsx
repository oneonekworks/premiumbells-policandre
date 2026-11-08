// The map tile's drawing: Romania and Moldova as simplified outlines with one
// dot per county that has works (dot size grows with the count). Decorative;
// the tile's text carries the numbers. Coordinates are approximate county
// centres (lon, lat); a county missing here simply gets no dot.

const centres: Record<string, [number, number]> = {
  Alba: [23.4, 46.15], Arad: [21.7, 46.25], Argeș: [24.85, 45.05], Bacău: [26.8, 46.5], Bihor: [22.1, 47.0],
  'Bistrița-Năsăud': [24.5, 47.2], Botoșani: [26.75, 47.85], Brașov: [25.35, 45.75], Brăila: [27.6, 45.15],
  București: [26.1, 44.43], Buzău: [26.75, 45.3], 'Caraș-Severin': [21.95, 45.2], Călărași: [27.0, 44.3],
  Cluj: [23.6, 46.8], Constanța: [28.35, 44.2], Covasna: [26.0, 45.9], Dâmbovița: [25.4, 44.9], Dolj: [23.75, 44.2],
  Galați: [27.75, 45.8], Giurgiu: [25.85, 44.1], Gorj: [23.3, 45.0], Harghita: [25.6, 46.5], Hunedoara: [22.85, 45.8],
  Ialomița: [27.35, 44.6], Iași: [27.35, 47.2], Ilfov: [26.15, 44.6], Maramureș: [24.0, 47.65], Mehedinți: [22.85, 44.6],
  Mureș: [24.6, 46.6], Neamț: [26.15, 47.0], Olt: [24.4, 44.3], Prahova: [26.0, 45.1], 'Satu Mare': [22.95, 47.7],
  Sălaj: [23.1, 47.2], Sibiu: [24.2, 45.8], Suceava: [25.6, 47.55], Teleorman: [25.2, 44.0], Timiș: [21.3, 45.75],
  Tulcea: [28.85, 45.0], Vaslui: [27.7, 46.6], Vâlcea: [24.1, 45.2], Vrancea: [27.0, 45.8],
  // Moldova (raioane)
  Ialoveni: [28.75, 46.9], Chișinău: [28.85, 47.0], Orhei: [28.8, 47.4], Bălți: [27.95, 47.75], Cahul: [28.2, 45.9],
};

const romania: [number, number][] = [
  [22.9, 47.95], [23.5, 48.0], [24.6, 47.95], [25.3, 47.85], [26.2, 48.0], [26.6, 48.25], [27.2, 47.85], [27.4, 47.6],
  [27.8, 47.15], [28.1, 46.65], [28.2, 46.0], [28.2, 45.47], [28.8, 45.25], [29.7, 45.2], [29.65, 44.85], [28.95, 44.6],
  [28.65, 44.2], [28.58, 43.75], [27.95, 43.98], [27.3, 44.1], [26.1, 43.68], [25.4, 43.63], [24.4, 43.7], [23.5, 43.85],
  [22.9, 43.98], [22.5, 44.5], [22.0, 44.6], [21.4, 44.8], [21.4, 45.2], [20.7, 45.5], [20.26, 46.11], [21.2, 46.4],
  [21.6, 47.0], [22.0, 47.5],
];

const moldova: [number, number][] = [
  [26.6, 48.25], [27.5, 48.47], [28.3, 48.15], [29.2, 47.95], [29.6, 47.4], [29.9, 46.9], [30.1, 46.4], [29.9, 46.1],
  [29.0, 46.0], [28.9, 45.5], [28.2, 45.47], [28.2, 46.0], [28.1, 46.65], [27.8, 47.15], [27.4, 47.6], [27.2, 47.85],
];

// Equirectangular projection with the longitude shrunk by cos(46°).
const west = 20.1, north = 48.6, scale = 40, shrink = Math.cos((46 * Math.PI) / 180);
const point = ([lon, lat]: [number, number]) => [(lon - west) * shrink * scale, (north - lat) * scale] as const;
const path = (outline: [number, number][]) =>
  `M${outline.map((corner) => point(corner).map((value) => value.toFixed(1)).join(' ')).join('L')}Z`;

export function WorksMap({places}: {places: {country: string | null; county: string | null}[]}) {
  const counts = new Map<string, number>();
  for (const place of places) {
    if (place.county && centres[place.county]) counts.set(place.county, (counts.get(place.county) ?? 0) + 1);
  }
  const [width] = point([30.3, north]);
  const [, height] = point([west, 43.5]);

  return (
    <svg viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`} aria-hidden="true" className="h-auto w-full">
      <path d={path(romania)} className="fill-teal-tint stroke-teal-700/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={path(moldova)} className="fill-teal-tint/60 stroke-teal-700/25" strokeWidth="1.5" strokeLinejoin="round" />
      {[...counts].map(([county, count]) => {
        const [x, y] = point(centres[county]);
        return (
          <g key={county}>
            <circle cx={x} cy={y} r={4 + Math.min(count, 8) * 1.1} className="fill-teal-700/15" />
            <circle cx={x} cy={y} r={3.5} className="fill-teal-700" />
          </g>
        );
      })}
    </svg>
  );
}
