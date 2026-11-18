import {placeLonLat, type MapPlace} from '@/lib/europe-map';

// Small maps for the Project panel's "Pe hartă" line (V6ProjectPanel): the
// board's Romania outline (64 × 44, viewBox −20 −10 640 430) with the work's
// pin. Places are put on it linearly (the outline spans 20.26–29.7° E,
// 43.62–48.27° N); Moldova falls just east of it, inside the box.

const outline = 'M14.8 202.5 L45.6 188.6 L68.4 180.4 L85.5 147.6 L108.3 98.4 L131.1 73.8 L165.3 53.3 L199.5 49.2 L239.4 53.3 L279.3 72.2 L313.4 54.9 L347.6 50.8 L376.1 27.9 L410.3 69.7 L433.1 102.5 L455.9 131.2 L467.3 172.2 L464.5 217.3 L467.3 254.2 L495.8 274.7 L535.7 262.4 L552.8 282.9 L547.1 307.5 L507.2 336.2 L490.1 397.7 L450.2 378.8 L398.9 367.4 L347.6 403.4 L284.9 401.8 L228.0 400.2 L171.0 393.6 L142.5 360.8 L153.9 332.1 L114.0 326.4 L79.8 311.6 L85.5 278.8 L45.6 254.2 Z';

function onRomania([lon, lat]: [number, number]): [number, number] {
  return [Math.round(11 + ((lon - 20.26) / 9.44) * 545), Math.round(27 + ((48.27 - lat) / 4.67) * 377)];
}

/** Romania (and Moldova) with the pin; null for places further away. */
export function RomaniaPin({place, className = ''}: {place: MapPlace; className?: string}) {
  const lonLat = placeLonLat(place);
  const country = place.country ?? 'RO';
  if (!lonLat || (country !== 'RO' && country !== 'MD')) return null;
  const [x, y] = onRomania(lonLat);
  return (
    <svg width="64" height="44" viewBox="-20 -10 640 430" aria-hidden="true" className={className}>
      <path d={outline} fill="#ffffff" stroke="#4a5553" strokeWidth="5" />
      <circle cx={x} cy={y} r="30" fill="#0f6b63" />
    </svg>
  );
}
