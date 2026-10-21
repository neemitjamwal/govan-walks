import { describe, expect, it } from 'vitest';
import { STALE_TEXT, gpsView } from '../src/lib/gps-view';
import { createWalkState, walkReducer } from '../src/lib/walk-state';

const stops = [
  { lat: 55.86265, lng: -4.31115 },
  { lat: 55.86372, lng: -4.31078 },
];
const names = ['Govan Cross', 'Doomster Hill'];

const north = (p: { lat: number; lng: number }, m: number) => ({ lat: p.lat + m / 111195, lng: p.lng });

function at(position: { lat: number; lng: number }, index = 0) {
  let s = walkReducer(createWalkState(stops, index), { type: 'start', supported: true });
  s = walkReducer(s, { type: 'position', position });
  return gpsView(s, names);
}

describe('gpsView', () => {
  it('off offers Start GPS only', () => {
    const v = gpsView(createWalkState(stops), names);
    expect(v.status).toBe('off');
    expect(v.showStart).toBe(true);
    expect(v.showStop).toBe(false);
    expect(v.distanceText).toBeNull();
  });

  it('locating offers Stop GPS', () => {
    const v = gpsView(walkReducer(createWalkState(stops), { type: 'start', supported: true }), names);
    expect(v.message).toMatch(/Finding your location/);
    expect(v.showStart).toBe(false);
    expect(v.showStop).toBe(true);
  });

  it('active shows distance, compass word and arrow bearing to the current stop', () => {
    const v = at(north(stops[0], 200));
    expect(v.status).toBe('active');
    expect(v.distanceText).toBe('200 m · south');
    expect(v.arrowDeg).toBeCloseTo(180, 0);
    expect(v.message).toBe('to Govan Cross');
    expect(v.showNext).toBe(false);
  });

  it('arrived names the stop and offers Next stop', () => {
    const v = at(stops[0]);
    expect(v.status).toBe('arrived');
    expect(v.message).toBe("You've arrived at Govan Cross");
    expect(v.distanceText).toBe('0 m');
    expect(v.arrowDeg).toBeNull();
    expect(v.showNext).toBe(true);
    expect(v.finished).toBe(false);
  });

  it('arriving at the last stop finishes the walk with no Next stop', () => {
    const v = at(stops[1], 1);
    expect(v.message).toBe("You've finished the walk");
    expect(v.finished).toBe(true);
    expect(v.showNext).toBe(false);
  });

  it('far shows the distance to the start and names the first stop', () => {
    const v = at({ lat: 55.9533, lng: -3.1883 }, 1);
    expect(v.status).toBe('far');
    expect(v.distanceText).toMatch(/^\d+\.\d km$/);
    expect(v.message).toBe("You're a long way from Govan — the walk starts at Govan Cross");
  });

  it('denied and unavailable explain that the map still works and offer Stop GPS', () => {
    const denied = gpsView(
      walkReducer(walkReducer(createWalkState(stops), { type: 'start', supported: true }), { type: 'error', code: 1 }),
      names,
    );
    expect(denied.message).toBe('Location permission was denied — you can still follow the walk using the map');
    expect(denied.showStop).toBe(true);
    const unavailable = gpsView(walkReducer(createWalkState(stops), { type: 'start', supported: false }), names);
    expect(unavailable.message).toMatch(/you can still follow the walk using the map/);
    expect(unavailable.showStop).toBe(true);
  });
});

describe('gpsView stale readings', () => {
  it('a post-fix error keeps the numbers and adds the stale line; the next fix clears it', () => {
    let s = walkReducer(createWalkState(stops), { type: 'start', supported: true });
    s = walkReducer(s, { type: 'position', position: north(stops[0], 200) });
    expect(gpsView(s, names).staleText).toBeNull();
    s = walkReducer(s, { type: 'error', code: 2 });
    const stale = gpsView(s, names);
    expect(stale.status).toBe('active');
    expect(stale.distanceText).toBe('200 m · south');
    expect(stale.staleText).toBe(STALE_TEXT);
    expect(STALE_TEXT).toBe('Signal lost. Showing your last known position.');
    s = walkReducer(s, { type: 'position', position: north(stops[0], 120) });
    const fresh = gpsView(s, names);
    expect(fresh.staleText).toBeNull();
    expect(fresh.distanceText).toBe('120 m · south');
  });

  it('an error before any fix shows unavailable with no stale line', () => {
    const s = walkReducer(walkReducer(createWalkState(stops), { type: 'start', supported: true }), { type: 'error', code: 3 });
    const v = gpsView(s, names);
    expect(v.status).toBe('unavailable');
    expect(v.staleText).toBeNull();
  });
});
