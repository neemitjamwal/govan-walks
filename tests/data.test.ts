import { describe, expect, it } from 'vitest';
import { getStop, stops } from '../src/data/stops';
import { getWalk, stopsForWalk, walks, walkStats } from '../src/data/walks';
import { haversine } from '../src/lib/geo';

const expectedMembership: Record<string, string[]> = {
  'ancient-govan': [
    'govan-cross',
    'govan-old-church',
    'doomster-hill',
    'old-govan-walkway',
    'water-row',
    'govan-ferry',
    'govan-partick-bridge',
  ],
  'the-yards': [
    'govan-graving-docks',
    'pearce-statue',
    'pearce-institute',
    'st-anthonys-church',
    'lyceum-cinema',
    'fairfield-heritage',
    'shipyards',
    'linthouse',
    'clyde-tunnel',
  ],
  'isabella-elder': ['fairfield-heritage', 'elder-park-library', 'isabella-elder-mural', 'elder-park', 'elder-cottage-hospital'],
};

describe('walks', () => {
  it('has exactly the three walks', () => {
    expect(walks.map((w) => w.slug)).toEqual(['ancient-govan', 'the-yards', 'isabella-elder']);
  });

  it.each(walks.map((w) => [w.slug, w] as const))('%s keeps its agreed stop membership', (slug, walk) => {
    expect([...walk.stops].sort()).toEqual([...expectedMembership[slug]].sort());
    expect(new Set(walk.stops).size).toBe(walk.stops.length);
  });

  it('every walk stop slug resolves to a stop', () => {
    for (const walk of walks) {
      for (const slug of walk.stops) expect(getStop(slug), `${walk.slug} -> ${slug}`).toBeDefined();
      expect(stopsForWalk(walk)).toHaveLength(walk.stops.length);
    }
  });

  it('every walk has a name, one-line theme and a short intro', () => {
    for (const walk of walks) {
      expect(walk.name.length).toBeGreaterThan(0);
      expect(walk.theme.length).toBeGreaterThan(0);
      expect(walk.theme).not.toMatch(/\n/);
      const sentences = walk.intro.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeGreaterThanOrEqual(2);
      expect(sentences.length).toBeLessThanOrEqual(3);
    }
  });

  it('getWalk finds walks by slug', () => {
    expect(getWalk('the-yards')?.name).toBe('The Yards');
    expect(getWalk('nope')).toBeUndefined();
  });

  it('walk lengths are plausible for the planned routes', () => {
    const km = (slug: string) => walkStats(getWalk(slug)!).distanceM / 1000;
    expect(km('ancient-govan')).toBeGreaterThan(0.3);
    expect(km('ancient-govan')).toBeLessThan(1.5);
    expect(km('the-yards')).toBeGreaterThan(1.5);
    expect(km('the-yards')).toBeLessThan(3.5);
    expect(km('isabella-elder')).toBeGreaterThan(0.3);
    expect(km('isabella-elder')).toBeLessThan(2);
    expect(walkStats(getWalk('isabella-elder')!).stopCount).toBe(5);
  });

  it('no leg between consecutive stops is longer than 1 km', () => {
    for (const walk of walks) {
      const s = stopsForWalk(walk);
      for (let i = 1; i < s.length; i++) expect(haversine(s[i - 1], s[i]), `${walk.slug} leg ${i}`).toBeLessThan(1000);
    }
  });

  it('consecutive stops are more than the 30 m arrival radius apart', () => {
    for (const walk of walks) {
      const s = stopsForWalk(walk);
      for (let i = 1; i < s.length; i++) expect(haversine(s[i - 1], s[i]), `${walk.slug} leg ${i}`).toBeGreaterThan(30);
    }
  });
});

describe('stops', () => {
  it('has the 20 stops used by the walks and no others', () => {
    const used = new Set(walks.flatMap((w) => w.stops));
    expect(stops).toHaveLength(20);
    expect(new Set(stops.map((s) => s.slug))).toEqual(used);
  });

  it('has unique slugs', () => {
    expect(new Set(stops.map((s) => s.slug)).size).toBe(stops.length);
  });

  it.each(stops.map((s) => [s.slug, s] as const))('%s has text, facts and a coordinate note', (_slug, stop) => {
    expect(stop.name.trim()).not.toBe('');
    expect(stop.era.trim()).not.toBe('');
    expect(stop.tagline.trim()).not.toBe('');
    expect(stop.story.length).toBeGreaterThan(0);
    for (const p of stop.story) expect(p.trim()).not.toBe('');
    expect(stop.quickFacts.length).toBeGreaterThan(0);
    expect(stop.coordNote.trim().length).toBeGreaterThan(10);
  });

  it.each(stops.map((s) => [s.slug, s] as const))('%s lies inside the Govan area', (_slug, stop) => {
    expect(stop.lat).toBeGreaterThanOrEqual(55.845);
    expect(stop.lat).toBeLessThanOrEqual(55.875);
    expect(stop.lng).toBeGreaterThanOrEqual(-4.35);
    expect(stop.lng).toBeLessThanOrEqual(-4.29);
  });

  it('every stop has a credited then-picture or a thenUnavailable reason', () => {
    for (const stop of stops) {
      if (stop.then) {
        expect(stop.then.src, stop.slug).toMatch(/^\/then\/[a-z0-9-]+\.webp$/);
        expect(stop.then.caption.trim(), stop.slug).not.toBe('');
        expect(stop.then.credit.trim(), stop.slug).not.toBe('');
        expect(stop.then.creditUrl, stop.slug).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      } else {
        expect(stop.thenUnavailable?.trim(), stop.slug).toBeTruthy();
      }
    }
  });
});
