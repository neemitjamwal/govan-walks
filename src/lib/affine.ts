export interface ControlPoint {
  name: string;
  px: [number, number];
  lat: number;
  lng: number;
}

/** Pixel = M · [east, north, 1] where east/north are metres from `origin`. */
export interface AffineFit {
  origin: { lat: number; lng: number };
  x: [number, number, number];
  y: [number, number, number];
}

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function toLocalMetres(origin: { lat: number; lng: number }, lat: number, lng: number): [number, number] {
  return [rad(lng - origin.lng) * R * Math.cos(rad(origin.lat)), rad(lat - origin.lat) * R];
}

function solve3(m: number[][], v: number[]): [number, number, number] {
  const a = m.map((row, i) => [...row, v[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    if (Math.abs(a[c][c]) < 1e-12) throw new Error('control points are degenerate (collinear or repeated)');
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const f = a[r][c] / a[c][c];
      for (let k = c; k < 4; k++) a[r][k] -= f * a[c][k];
    }
  }
  return [a[0][3] / a[0][0], a[1][3] / a[1][1], a[2][3] / a[2][2]];
}

export function fitAffine(points: ControlPoint[]): AffineFit {
  if (points.length < 3) throw new Error('need at least 3 control points');
  const origin = {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
  };
  const rows = points.map((p) => [...toLocalMetres(origin, p.lat, p.lng), 1]);
  const ata = [0, 1, 2].map((i) => [0, 1, 2].map((j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
  const atb = (k: 0 | 1) => [0, 1, 2].map((i) => rows.reduce((s, r, n) => s + r[i] * points[n].px[k], 0));
  return { origin, x: solve3(ata, atb(0)), y: solve3(ata, atb(1)) };
}

export function toPixel(fit: AffineFit, lat: number, lng: number): [number, number] {
  const [e, n] = toLocalMetres(fit.origin, lat, lng);
  return [fit.x[0] * e + fit.x[1] * n + fit.x[2], fit.y[0] * e + fit.y[1] * n + fit.y[2]];
}

/** Ground metres per pixel (geometric mean of the two axis scales). */
export function metresPerPixel(fit: AffineFit): number {
  const det = fit.x[0] * fit.y[1] - fit.x[1] * fit.y[0];
  return 1 / Math.sqrt(Math.abs(det));
}

/** Per-point misfit in metres: pixel error mapped back to ground through the inverse linear part. */
export function residualsMetres(fit: AffineFit, points: ControlPoint[]): number[] {
  const [a, b] = fit.x, [c, d] = fit.y;
  const det = a * d - b * c;
  return points.map((p) => {
    const [px, py] = toPixel(fit, p.lat, p.lng);
    const dx = p.px[0] - px, dy = p.px[1] - py;
    return Math.hypot((d * dx - b * dy) / det, (-c * dx + a * dy) / det);
  });
}

export function rms(values: number[]): number {
  return Math.sqrt(values.reduce((s, v) => s + v * v, 0) / values.length);
}

/** Top-left corner of a w×h window centred on (cx, cy), clamped inside an image of size W×H. */
export function cropWindow(cx: number, cy: number, w: number, h: number, W: number, H: number): { left: number; top: number } {
  return {
    left: Math.round(Math.min(Math.max(cx - w / 2, 0), W - w)),
    top: Math.round(Math.min(Math.max(cy - h / 2, 0), H - h)),
  };
}
