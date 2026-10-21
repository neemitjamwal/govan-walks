export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;
const WALKING_SPEED_M_PER_MIN = 4500 / 60;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in metres. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b in degrees clockwise from true north, in [0, 360). */
export function bearing(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS8 = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'] as const;
export type Compass8 = (typeof COMPASS8)[number];

export function compass8(deg: number): Compass8 {
  const normalised = ((deg % 360) + 360) % 360;
  return COMPASS8[Math.floor((normalised + 22.5) / 45) % 8];
}

/** "85 m" below a kilometre, otherwise one decimal place of kilometres ("1.2 km"). */
export function formatDistance(metres: number): string {
  const rounded = Math.round(metres);
  if (rounded < 1000) return `${rounded} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Sum of the straight-line legs between consecutive points, in metres. */
export function routeLength(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i]);
  return total;
}

/** Walking time at 4.5 km/h, rounded to the nearest 5 minutes (at least 5). */
export function walkingMinutes(metres: number): number {
  return Math.max(5, Math.round(metres / WALKING_SPEED_M_PER_MIN / 5) * 5);
}
