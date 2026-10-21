import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stops } from '../src/data/stops';

interface SourceConfig {
  commonsPage: string;
  controlPoints: { name: string; px: [number, number]; lat: number; lng: number; residualM: number }[];
  rmsM: number;
}
interface StopCrop {
  source: string | null;
  ring?: [number, number];
}
const config = JSON.parse(readFileSync(new URL('../scripts/then-config.json', import.meta.url), 'utf8')) as {
  crop: { width: number; height: number; maxRmsM: number; minControlPoints: number };
  sources: Record<string, SourceConfig>;
  stops: Record<string, StopCrop>;
};
const thenFile = (slug: string) => new URL(`../public/then/${slug}.webp`, import.meta.url);

describe('then-picture georeferencing', () => {
  const used = new Set(stops.flatMap((s) => (s.then ? [s.then.source] : [])));

  it.each(Object.entries(config.sources))('%s has enough control points with residuals and an RMS within 40 m', (_id, src) => {
    expect(src.controlPoints.length).toBeGreaterThanOrEqual(4);
    for (const p of src.controlPoints) expect(typeof p.residualM).toBe('number');
    expect(src.rmsM).toBeLessThanOrEqual(40);
  });

  it('every source used by a stop is georeferenced', () => {
    for (const id of used) expect(config.sources[id], id).toBeDefined();
  });

  it('then credits link to the Commons page of their source', () => {
    for (const stop of stops) if (stop.then) expect(stop.then.creditUrl, stop.slug).toBe(config.sources[stop.then.source].commonsPage);
  });
});

describe('then-picture crop list', () => {
  it('has one crop entry per stop and no others', () => {
    expect(Object.keys(config.stops).sort()).toEqual(stops.map((s) => s.slug).sort());
  });

  it.each(stops.map((s) => [s.slug, s] as const))('%s: stops.ts agrees with the crop script output', (slug, stop) => {
    const entry = config.stops[slug];
    if (stop.then) {
      expect(stop.then.src).toBe(`/then/${slug}.webp`);
      expect(entry.source).toBe(stop.then.source);
      const [x, y] = entry.ring!;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(config.crop.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(config.crop.height);
      expect(existsSync(thenFile(slug))).toBe(true);
      expect(statSync(thenFile(slug)).size).toBeLessThan(250 * 1024);
    } else {
      expect(entry.source).toBeNull();
      expect(existsSync(thenFile(slug))).toBe(false);
    }
  });
});
