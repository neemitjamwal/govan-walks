import { describe, expect, it } from 'vitest';
import { routeSketch } from '../src/lib/route-sketch';
import { stopsForWalk, walks } from '../src/data/walks';

const box = { width: 200, height: 120, pad: 12 };

describe('routeSketch', () => {
  it('keeps every point inside the padded box', () => {
    for (const walk of walks) {
      const { points } = routeSketch(stopsForWalk(walk), box);
      expect(points).toHaveLength(walk.stops.length);
      for (const p of points) {
        expect(p.x).toBeGreaterThanOrEqual(box.pad - 1e-9);
        expect(p.x).toBeLessThanOrEqual(box.width - box.pad + 1e-9);
        expect(p.y).toBeGreaterThanOrEqual(box.pad - 1e-9);
        expect(p.y).toBeLessThanOrEqual(box.height - box.pad + 1e-9);
      }
    }
  });

  it('draws north up and east to the right', () => {
    const { points } = routeSketch(
      [
        { lat: 55.86, lng: -4.32 },
        { lat: 55.87, lng: -4.31 },
      ],
      box,
    );
    expect(points[1].y).toBeLessThan(points[0].y);
    expect(points[1].x).toBeGreaterThan(points[0].x);
  });

  it('keeps ground proportions by scaling longitude by cos(latitude)', () => {
    const lat = 55.86;
    const dLat = 0.004;
    const dLng = dLat / Math.cos((lat * Math.PI) / 180);
    const { points } = routeSketch(
      [
        { lat, lng: -4.32 },
        { lat: lat + dLat, lng: -4.32 + dLng },
      ],
      { width: 300, height: 300, pad: 10 },
    );
    expect(Math.abs(points[1].x - points[0].x)).toBeCloseTo(Math.abs(points[1].y - points[0].y), 1);
  });

  it('centres a single point', () => {
    const { points, path } = routeSketch([{ lat: 55.86, lng: -4.31 }], box);
    expect(points[0]).toEqual({ x: 100, y: 60 });
    expect(path).toBe('M100 60');
  });

  it('builds an SVG path through the points in order', () => {
    const { path, points } = routeSketch(stopsForWalk(walks[0]), box);
    expect(path.startsWith('M')).toBe(true);
    expect(path.split('L')).toHaveLength(points.length);
    const [x0, y0] = path.slice(1).split('L')[0].trim().split(' ').map(Number);
    expect(x0).toBeCloseTo(points[0].x, 1);
    expect(y0).toBeCloseTo(points[0].y, 1);
  });
});
