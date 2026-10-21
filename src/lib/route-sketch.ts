import type { LatLng } from './geo';

export interface SketchBox {
  width: number;
  height: number;
  pad: number;
}

export interface SketchPoint {
  x: number;
  y: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Projects route points into an SVG box, north up, keeping ground proportions
 * (longitude scaled by cos of the mean latitude) and centring the route.
 */
export function routeSketch(route: LatLng[], box: SketchBox): { points: SketchPoint[]; path: string } {
  if (route.length === 0) return { points: [], path: '' };
  const meanLat = route.reduce((s, p) => s + p.lat, 0) / route.length;
  const kx = Math.cos((meanLat * Math.PI) / 180);
  const xs = route.map((p) => p.lng * kx);
  const ys = route.map((p) => p.lat);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = maxY - Math.min(...ys);
  const innerW = box.width - 2 * box.pad;
  const innerH = box.height - 2 * box.pad;
  const scale = spanX === 0 && spanY === 0 ? 0 : Math.min(spanX ? innerW / spanX : Infinity, spanY ? innerH / spanY : Infinity);
  const offX = (box.width - spanX * scale) / 2;
  const offY = (box.height - spanY * scale) / 2;
  const points = route.map((_, i) => ({ x: offX + (xs[i] - minX) * scale, y: offY + (maxY - ys[i]) * scale }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)} ${round(p.y)}`).join(' ');
  return { points, path };
}
