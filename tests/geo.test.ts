import { describe, expect, it } from 'vitest';
import { bearing, compass8, formatDistance, haversine, routeLength, walkingMinutes } from '../src/lib/geo';

const govanCross = { lat: 55.86265, lng: -4.31115 };

describe('haversine', () => {
  it('is zero for the same point', () => {
    expect(haversine(govanCross, govanCross)).toBe(0);
  });

  it('measures one degree of latitude as about 111.2 km', () => {
    expect(haversine({ lat: 55, lng: -4 }, { lat: 56, lng: -4 })).toBeCloseTo(111195, -1);
  });

  it('matches a known Glasgow to Edinburgh distance (about 66.5 km)', () => {
    const d = haversine({ lat: 55.8642, lng: -4.2518 }, { lat: 55.9533, lng: -3.1883 });
    expect(d).toBeGreaterThan(66000);
    expect(d).toBeLessThan(67500);
  });

  it('is symmetric', () => {
    const b = { lat: 55.8646, lng: -4.315 };
    expect(haversine(govanCross, b)).toBeCloseTo(haversine(b, govanCross), 6);
  });
});

describe('bearing', () => {
  it('is 0 due north and 180 due south', () => {
    expect(bearing({ lat: 55, lng: -4 }, { lat: 56, lng: -4 })).toBeCloseTo(0, 6);
    expect(bearing({ lat: 56, lng: -4 }, { lat: 55, lng: -4 })).toBeCloseTo(180, 6);
  });

  it('is about 90 due east and 270 due west', () => {
    expect(bearing({ lat: 55.86, lng: -4.32 }, { lat: 55.86, lng: -4.31 })).toBeCloseTo(90, 1);
    expect(bearing({ lat: 55.86, lng: -4.31 }, { lat: 55.86, lng: -4.32 })).toBeCloseTo(270, 1);
  });

  it('always returns a value in [0, 360)', () => {
    const v = bearing({ lat: 55.86, lng: -4.31 }, { lat: 55.87, lng: -4.32 });
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(360);
    expect(compass8(v)).toBe('north-west');
  });
});

describe('compass8', () => {
  it.each([
    [0, 'north'],
    [22.4, 'north'],
    [22.5, 'north-east'],
    [45, 'north-east'],
    [90, 'east'],
    [135, 'south-east'],
    [180, 'south'],
    [225, 'south-west'],
    [270, 'west'],
    [315, 'north-west'],
    [337.6, 'north'],
    [359.9, 'north'],
    [360, 'north'],
    [-45, 'north-west'],
    [405, 'north-east'],
  ])('%s degrees is %s', (deg, word) => {
    expect(compass8(deg)).toBe(word);
  });
});

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [85, '85 m'],
    [85.4, '85 m'],
    [999.4, '999 m'],
    [999.6, '1.0 km'],
    [1000, '1.0 km'],
    [1234, '1.2 km'],
    [66412, '66.4 km'],
  ])('%s m reads %s', (m, text) => {
    expect(formatDistance(m)).toBe(text);
  });
});

describe('routeLength', () => {
  it('is zero for no or one point', () => {
    expect(routeLength([])).toBe(0);
    expect(routeLength([govanCross])).toBe(0);
  });

  it('sums the straight-line legs in order', () => {
    const a = { lat: 55.86, lng: -4.31 };
    const b = { lat: 55.861, lng: -4.31 };
    const c = { lat: 55.861, lng: -4.312 };
    expect(routeLength([a, b, c])).toBeCloseTo(haversine(a, b) + haversine(b, c), 6);
  });
});

describe('walkingMinutes', () => {
  it('rounds 4.5 km/h walking time to the nearest 5 minutes, minimum 5', () => {
    expect(walkingMinutes(100)).toBe(5);
    expect(walkingMinutes(1000)).toBe(15); // 13.3 min
    expect(walkingMinutes(2500)).toBe(35); // 33.3 min
    expect(walkingMinutes(4500)).toBe(60);
  });
});
