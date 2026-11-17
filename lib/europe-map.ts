// Where a work sits on the Europe map of the homepage map story and the Works
// Hartă view. The drawing itself is static (public/maps, from the v6 boards,
// scripts/extract-europe-map.mjs); this file projects places onto it with the
// same projection: d3-geo conicConformal, parallels 38° / 54°, rotated −12°,
// centred on 46.2° N (docs/design/clarity-v6/tools/map-europe.js).
//
// Projects store a country, a county and a locality, not coordinates
// (design-plan V0, decision 2): Romanian counties and Moldovan raioane use a
// centre lookup, the few works abroad a small place lookup.

export type MapSize = 'wide' | 'compact';

/** The two drawings: 1200 × 700 (desktop, Works) and 800 × 603 (phones). */
export const mapSizes: Record<MapSize, {width: number; height: number; src: string}> = {
  wide: {width: 1200, height: 700, src: '/maps/europe-1200x700.svg'},
  compact: {width: 800, height: 603, src: '/maps/europe-800x603.svg'},
};

const radians = Math.PI / 180;
const tany = (phi: number) => Math.tan((Math.PI / 2 + phi) / 2);
const phi0 = 38 * radians;
const phi1 = 54 * radians;
const n = Math.log(Math.cos(phi0) / Math.cos(phi1)) / Math.log(tany(phi1) / tany(phi0));
const f = (Math.cos(phi0) * Math.pow(tany(phi0), n)) / n;

/** d3's conicConformalRaw. */
function raw(lambda: number, phi: number): [number, number] {
  const r = f / Math.pow(tany(phi), n);
  return [r * Math.sin(n * lambda), f - r * Math.cos(n * lambda)];
}

// The 800 × 603 drawing: scale and translate from map-europe.js (K = 1).
const scale = 1418.495683339442;
const [centreX, centreY] = raw(0, 46.2 * radians);
const translate: [number, number] = [435.3708751396813, 308.4075131178568];
// The 1200 × 700 drawing is the same projection scaled by K and moved so the
// old (0, 0) lands at (OX, OY); fitted on the board's dots (error < 0.3 px).
const wide = {k: 1.128, ox: 270, oy: 12};

/** [longitude, latitude] → [x, y] in the chosen drawing's viewBox. */
export function project([lon, lat]: [number, number], size: MapSize): [number, number] {
  const [x, y] = raw((lon - 12) * radians, lat * radians);
  const px = translate[0] + scale * (x - centreX);
  const py = translate[1] - scale * (y - centreY);
  return size === 'compact' ? [px, py] : [wide.k * px + wide.ox, wide.k * py + wide.oy];
}

// Approximate county centres (lon, lat).
const counties: Record<string, [number, number]> = {
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

// Works abroad, by locality; then one point per country.
const localities: Record<string, [number, number]> = {
  Chișinău: [28.86, 47.01], Lleida: [0.62, 41.62],
};
const countries: Record<string, [number, number]> = {
  MD: [28.86, 47.01], ES: [0.62, 41.62], BE: [4.35, 50.85], GR: [24.33, 40.16],
};

export type MapPlace = {country?: string | null; county?: string | null; locality?: string | null};

/** A place's position on the map, or null when it cannot be placed. */
export function placeLonLat({country, county, locality}: MapPlace): [number, number] | null {
  if (county && counties[county]) return counties[county];
  if (locality && localities[locality]) return localities[locality];
  if (country && country !== 'RO' && countries[country]) return countries[country];
  return null;
}

/** The countries of the map story, in list order; GR is shown as Mount Athos. */
export const mapCountries = ['RO', 'MD', 'ES', 'BE', 'GR'] as const;
export type MapCountry = (typeof mapCountries)[number];
