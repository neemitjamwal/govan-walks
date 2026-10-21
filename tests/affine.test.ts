import { describe, expect, it } from 'vitest';
import { cropWindow, fitAffine, metresPerPixel, residualsMetres, rms, toPixel, type ControlPoint } from '../src/lib/affine';

// A synthetic map: 0.9 m per pixel, rotated 2 degrees, origin at Govan Cross.
const origin = { lat: 55.8627, lng: -4.3112 };
const mPerDegLat = (Math.PI / 180) * 6371008.8;
const mPerDegLng = mPerDegLat * Math.cos((origin.lat * Math.PI) / 180);
const rot = (2 * Math.PI) / 180;
function truePixel(lat: number, lng: number): [number, number] {
  const e = (lng - origin.lng) * mPerDegLng, n = (lat - origin.lat) * mPerDegLat;
  const x = (e * Math.cos(rot) - n * Math.sin(rot)) / 0.9 + 1500;
  const y = -(e * Math.sin(rot) + n * Math.cos(rot)) / 0.9 + 4000;
  return [x, y];
}
const sample: [number, number][] = [
  [55.8705, -4.2995],
  [55.8707, -4.3126],
  [55.8537, -4.2785],
  [55.8609, -4.3274],
  [55.8646, -4.313],
];
const exact: ControlPoint[] = sample.map(([lat, lng], i) => ({ name: `p${i}`, lat, lng, px: truePixel(lat, lng) }));

describe('affine georeferencing', () => {
  it('recovers an exact transform with zero residuals', () => {
    const fit = fitAffine(exact);
    for (const r of residualsMetres(fit, exact)) expect(r).toBeLessThan(0.01);
    const [x, y] = toPixel(fit, 55.8641, -4.3201);
    const [tx, ty] = truePixel(55.8641, -4.3201);
    expect(Math.abs(x - tx)).toBeLessThan(0.05);
    expect(Math.abs(y - ty)).toBeLessThan(0.05);
    expect(metresPerPixel(fit)).toBeCloseTo(0.9, 3);
  });

  it('reports a residual in metres for a misplaced control point', () => {
    const pts = exact.map((p) => ({ ...p, px: [...p.px] as [number, number] }));
    pts[4].px[0] += 50; // 50 px = 45 m on a 0.9 m/px map
    const res = residualsMetres(fitAffine(pts), pts);
    expect(res[4]).toBeGreaterThan(20);
    expect(res[4]).toBeLessThan(45);
    expect(rms(res)).toBeGreaterThan(0);
  });

  it('rejects fewer than three or collinear points', () => {
    expect(() => fitAffine(exact.slice(0, 2))).toThrow();
    const line = [0, 1, 2, 3].map((i) => ({ name: `l${i}`, lat: 55.86 + i * 0.001, lng: -4.31 + i * 0.001, px: [i, i] as [number, number] }));
    expect(() => fitAffine(line)).toThrow();
  });

  it('rms is the root mean square', () => {
    expect(rms([3, 4])).toBeCloseTo(Math.sqrt(12.5));
  });
});

describe('cropWindow', () => {
  it('centres the window on the point', () => {
    expect(cropWindow(5000, 4000, 1000, 750, 10688, 7166)).toEqual({ left: 4500, top: 3625 });
  });
  it('clamps the window inside the image near an edge', () => {
    expect(cropWindow(100, 50, 1000, 750, 10688, 7166)).toEqual({ left: 0, top: 0 });
    expect(cropWindow(10600, 7100, 1000, 750, 10688, 7166)).toEqual({ left: 9688, top: 6416 });
  });
});
