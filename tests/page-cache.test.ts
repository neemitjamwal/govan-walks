import { describe, expect, it, vi } from 'vitest';
import { gpsView } from '../src/lib/gps-view';
import { onPageCache } from '../src/lib/page-cache';
import { createWalkState, walkReducer, type WalkState } from '../src/lib/walk-state';

const pageEvent = (type: string, persisted: boolean) => Object.assign(new Event(type), { persisted });

describe('onPageCache', () => {
  it('runs hide on every pagehide', () => {
    const target = new EventTarget();
    const hide = vi.fn();
    const restore = vi.fn();
    onPageCache(target, { hide, restore });
    target.dispatchEvent(pageEvent('pagehide', true));
    target.dispatchEvent(pageEvent('pagehide', false));
    expect(hide).toHaveBeenCalledTimes(2);
    expect(restore).not.toHaveBeenCalled();
  });

  it('runs restore only for a pageshow from the back/forward cache', () => {
    const target = new EventTarget();
    const restore = vi.fn();
    onPageCache(target, { hide: () => {}, restore });
    target.dispatchEvent(pageEvent('pageshow', false));
    expect(restore).not.toHaveBeenCalled();
    target.dispatchEvent(pageEvent('pageshow', true));
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('a restored page with active GPS returns to off with Start GPS', () => {
    const stops = [
      { lat: 55.86265, lng: -4.31115 },
      { lat: 55.86372, lng: -4.31078 },
    ];
    let state: WalkState = walkReducer(createWalkState(stops), { type: 'start', supported: true });
    state = walkReducer(state, { type: 'position', position: { lat: 55.864, lng: -4.31115 } });
    expect(state.status).toBe('active');
    let watchId: number | null = 7;
    const target = new EventTarget();
    onPageCache(target, {
      hide: () => (watchId = null),
      restore: () => {
        watchId = null;
        state = walkReducer(state, { type: 'stop' });
      },
    });
    target.dispatchEvent(pageEvent('pagehide', true));
    expect(state.status).toBe('active');
    target.dispatchEvent(pageEvent('pageshow', true));
    expect(watchId).toBeNull();
    const view = gpsView(state, ['Govan Cross', 'Doomster Hill']);
    expect(view.status).toBe('off');
    expect(view.showStart).toBe(true);
    expect(view.distanceText).toBeNull();
  });
});
