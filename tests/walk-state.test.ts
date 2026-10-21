import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_RADIUS_M,
  FAR_THRESHOLD_M,
  createWalkState,
  isFinished,
  isLastStop,
  nextStopIndex,
  prevStopIndex,
  walkReducer,
  type WalkState,
} from '../src/lib/walk-state';
import { haversine } from '../src/lib/geo';

const stops = [
  { lat: 55.86265, lng: -4.31115 },
  { lat: 55.86372, lng: -4.31078 },
  { lat: 55.86398, lng: -4.31045 },
];

// Moves north from a point by the given number of metres.
function north(p: { lat: number; lng: number }, metres: number) {
  return { lat: p.lat + metres / 111195, lng: p.lng };
}

function started(state = createWalkState(stops)): WalkState {
  return walkReducer(state, { type: 'start', supported: true });
}

describe('constants', () => {
  it('uses a 30 m arrival radius and a 5 km far threshold', () => {
    expect(ARRIVAL_RADIUS_M).toBe(30);
    expect(FAR_THRESHOLD_M).toBe(5000);
  });
});

describe('createWalkState', () => {
  it('starts off at the first stop with no position', () => {
    const s = createWalkState(stops);
    expect(s.status).toBe('off');
    expect(s.stopIndex).toBe(0);
    expect(s.position).toBeNull();
    expect(s.distance).toBeNull();
  });

  it('clamps the starting stop index', () => {
    expect(createWalkState(stops, 7).stopIndex).toBe(2);
    expect(createWalkState(stops, -2).stopIndex).toBe(0);
  });
});

describe('starting and stopping GPS', () => {
  it('goes off -> locating when geolocation is supported', () => {
    expect(started().status).toBe('locating');
  });

  it('goes to unavailable when geolocation is not supported', () => {
    const s = walkReducer(createWalkState(stops), { type: 'start', supported: false });
    expect(s.status).toBe('unavailable');
  });

  it('error code 1 means denied', () => {
    const s = walkReducer(started(), { type: 'error', code: 1 });
    expect(s.status).toBe('denied');
  });

  it('other errors before a fix mean unavailable', () => {
    expect(walkReducer(started(), { type: 'error', code: 2 }).status).toBe('unavailable');
    expect(walkReducer(started(), { type: 'error', code: 3 }).status).toBe('unavailable');
  });

  it('a transient error after a fix keeps the last reading', () => {
    let s = walkReducer(started(), { type: 'position', position: north(stops[0], 150) });
    s = walkReducer(s, { type: 'error', code: 3 });
    expect(s.status).toBe('active');
    expect(s.distance).not.toBeNull();
  });

  it('stop clears the position and returns to off', () => {
    let s = walkReducer(started(), { type: 'position', position: north(stops[0], 150) });
    s = walkReducer(s, { type: 'stop' });
    expect(s.status).toBe('off');
    expect(s.position).toBeNull();
    expect(s.distance).toBeNull();
    expect(s.bearing).toBeNull();
  });

  it('ignores late positions after GPS is stopped or denied', () => {
    const off = walkReducer(walkReducer(started(), { type: 'stop' }), {
      type: 'position',
      position: stops[0],
    });
    expect(off.status).toBe('off');
    const denied = walkReducer(walkReducer(started(), { type: 'error', code: 1 }), {
      type: 'position',
      position: stops[0],
    });
    expect(denied.status).toBe('denied');
  });
});

describe('positions', () => {
  it('is active with distance and bearing when away from the stop', () => {
    const s = walkReducer(started(), { type: 'position', position: north(stops[0], 150) });
    expect(s.status).toBe('active');
    expect(s.distance).toBeCloseTo(150, 0);
    expect(s.bearing).toBeCloseTo(180, 0);
  });

  it('arrives at exactly the 30 m boundary', () => {
    const p = north(stops[0], 30);
    expect(haversine(p, stops[0])).toBeLessThanOrEqual(30);
    const s = walkReducer(started(), { type: 'position', position: p });
    expect(s.status).toBe('arrived');
  });

  it('is not arrived just outside 30 m', () => {
    const s = walkReducer(started(), { type: 'position', position: north(stops[0], 30.5) });
    expect(s.status).toBe('active');
  });

  it('is far when more than 5 km from the first stop', () => {
    const s = walkReducer(started(), { type: 'position', position: { lat: 55.9533, lng: -3.1883 } });
    expect(s.status).toBe('far');
    expect(s.distanceToStart).toBeGreaterThan(5000);
    expect(s.distance).toBeGreaterThan(5000);
  });

  it('is not far at 4.9 km from the first stop', () => {
    const s = walkReducer(started(), { type: 'position', position: north(stops[0], 4900) });
    expect(s.status).toBe('active');
  });

  it('measures far from the first stop even when another stop is current', () => {
    let s = walkReducer(started(createWalkState(stops, 2)), {
      type: 'position',
      position: north(stops[0], 5100),
    });
    expect(s.status).toBe('far');
    s = walkReducer(started(createWalkState(stops, 2)), {
      type: 'position',
      position: north(stops[0], 4900),
    });
    expect(s.status).toBe('active');
  });
});

describe('stop selection', () => {
  it('next and prev move one stop and stay in range', () => {
    let s = createWalkState(stops);
    expect(nextStopIndex(s)).toBe(1);
    expect(prevStopIndex(s)).toBeNull();
    s = walkReducer(s, { type: 'prev' });
    expect(s.stopIndex).toBe(0);
    s = walkReducer(s, { type: 'next' });
    s = walkReducer(s, { type: 'next' });
    expect(s.stopIndex).toBe(2);
    expect(nextStopIndex(s)).toBeNull();
    expect(isLastStop(s)).toBe(true);
    s = walkReducer(s, { type: 'next' });
    expect(s.stopIndex).toBe(2);
  });

  it('select jumps to a stop and ignores out-of-range indexes', () => {
    let s = walkReducer(createWalkState(stops), { type: 'select', index: 1 });
    expect(s.stopIndex).toBe(1);
    s = walkReducer(s, { type: 'select', index: 9 });
    expect(s.stopIndex).toBe(1);
  });

  it('after arriving, next stop re-measures to the new stop', () => {
    let s = walkReducer(started(), { type: 'position', position: stops[0] });
    expect(s.status).toBe('arrived');
    s = walkReducer(s, { type: 'next' });
    expect(s.stopIndex).toBe(1);
    expect(s.status).toBe('active');
    expect(s.distance).toBeCloseTo(haversine(stops[0], stops[1]), 3);
  });

  it('changing stop while GPS is off keeps it off', () => {
    const s = walkReducer(createWalkState(stops), { type: 'next' });
    expect(s.status).toBe('off');
    expect(s.distance).toBeNull();
  });
});

describe('finishing', () => {
  it('is finished only when arrived at the last stop', () => {
    let s = started(createWalkState(stops, 1));
    s = walkReducer(s, { type: 'position', position: stops[1] });
    expect(s.status).toBe('arrived');
    expect(isFinished(s)).toBe(false);
    s = walkReducer(s, { type: 'next' });
    s = walkReducer(s, { type: 'position', position: stops[2] });
    expect(s.status).toBe('arrived');
    expect(isFinished(s)).toBe(true);
  });

  it('walking through every stop ends finished', () => {
    let s = started();
    for (let i = 0; i < stops.length; i++) {
      s = walkReducer(s, { type: 'position', position: stops[i] });
      expect(s.status).toBe('arrived');
      if (i < stops.length - 1) s = walkReducer(s, { type: 'next' });
    }
    expect(isFinished(s)).toBe(true);
  });
});

describe('errors after a fix', () => {
  const fixed = () => walkReducer(started(), { type: 'position', position: north(stops[0], 150) });

  it('a post-fix unavailable or timeout error marks the last reading stale', () => {
    for (const code of [2, 3]) {
      const s = walkReducer(fixed(), { type: 'error', code });
      expect(s.status).toBe('active');
      expect(s.stale).toBe(true);
      expect(s.distance).toBeCloseTo(150, 0);
    }
  });

  it('stays stale over consecutive errors and clears on the next fix', () => {
    let s = walkReducer(fixed(), { type: 'error', code: 2 });
    s = walkReducer(s, { type: 'error', code: 3 });
    expect(s.stale).toBe(true);
    s = walkReducer(s, { type: 'position', position: north(stops[0], 80) });
    expect(s.stale).toBe(false);
    expect(s.distance).toBeCloseTo(80, 0);
  });

  it('is never stale before a fix, after stop, or after denial', () => {
    expect(started().stale).toBe(false);
    expect(walkReducer(started(), { type: 'error', code: 2 }).stale).toBe(false);
    const stale = walkReducer(fixed(), { type: 'error', code: 2 });
    expect(walkReducer(stale, { type: 'stop' }).stale).toBe(false);
    expect(walkReducer(stale, { type: 'error', code: 1 }).stale).toBe(false);
    expect(walkReducer(walkReducer(stale, { type: 'stop' }), { type: 'start', supported: true }).stale).toBe(false);
  });

  it('changing stop while stale keeps the stale mark', () => {
    const s = walkReducer(walkReducer(fixed(), { type: 'error', code: 2 }), { type: 'next' });
    expect(s.stopIndex).toBe(1);
    expect(s.stale).toBe(true);
  });
});
