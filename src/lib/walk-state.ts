import { bearing, haversine, type LatLng } from './geo';

export const ARRIVAL_RADIUS_M = 30;
export const FAR_THRESHOLD_M = 5000;

export type GpsStatus = 'off' | 'locating' | 'active' | 'arrived' | 'far' | 'denied' | 'unavailable';

export interface WalkState {
  stops: LatLng[];
  stopIndex: number;
  status: GpsStatus;
  position: LatLng | null;
  /** Metres from the position to the current stop. */
  distance: number | null;
  /** Degrees from the position to the current stop. */
  bearing: number | null;
  /** Metres from the position to the walk's first stop. */
  distanceToStart: number | null;
  /** The watch has errored since the last fix, so the position is only the last known one. */
  stale: boolean;
}

export type WalkAction =
  | { type: 'start'; supported: boolean }
  | { type: 'position'; position: LatLng }
  | { type: 'error'; code: number }
  | { type: 'stop' }
  | { type: 'select'; index: number }
  | { type: 'next' }
  | { type: 'prev' };

/** GeolocationPositionError.PERMISSION_DENIED */
const PERMISSION_DENIED = 1;

const clampIndex = (stops: LatLng[], index: number) => Math.min(Math.max(0, index), stops.length - 1);

const watching = (status: GpsStatus) => status === 'locating' || status === 'active' || status === 'arrived' || status === 'far';

const cleared = { position: null, distance: null, bearing: null, distanceToStart: null, stale: false };

export function createWalkState(stops: LatLng[], stopIndex = 0): WalkState {
  if (stops.length === 0) throw new Error('A walk needs at least one stop');
  return { stops, stopIndex: clampIndex(stops, stopIndex), status: 'off', ...cleared };
}

function measure(state: WalkState, position: LatLng): WalkState {
  const stop = state.stops[state.stopIndex];
  const distance = haversine(position, stop);
  const distanceToStart = haversine(position, state.stops[0]);
  const status: GpsStatus =
    distanceToStart > FAR_THRESHOLD_M ? 'far' : distance <= ARRIVAL_RADIUS_M ? 'arrived' : 'active';
  return { ...state, status, position, distance, bearing: bearing(position, stop), distanceToStart };
}

function moveTo(state: WalkState, index: number): WalkState {
  if (index < 0 || index >= state.stops.length || index === state.stopIndex) return state;
  const moved = { ...state, stopIndex: index };
  return moved.position && watching(moved.status) ? measure(moved, moved.position) : moved;
}

export function walkReducer(state: WalkState, action: WalkAction): WalkState {
  switch (action.type) {
    case 'start':
      return { ...state, ...cleared, status: action.supported ? 'locating' : 'unavailable' };
    case 'stop':
      return { ...state, ...cleared, status: 'off' };
    case 'position':
      return watching(state.status) ? measure({ ...state, stale: false }, action.position) : state;
    case 'error':
      if (!watching(state.status)) return state;
      if (action.code === PERMISSION_DENIED) return { ...state, ...cleared, status: 'denied' };
      // After a fix the watch stays alive, so a later fix recovers; until then the reading is marked stale.
      return state.position ? { ...state, stale: true } : { ...state, status: 'unavailable' };
    case 'select':
      return moveTo(state, action.index);
    case 'next':
      return moveTo(state, state.stopIndex + 1);
    case 'prev':
      return moveTo(state, state.stopIndex - 1);
  }
}

export function nextStopIndex(state: WalkState): number | null {
  return state.stopIndex < state.stops.length - 1 ? state.stopIndex + 1 : null;
}

export function prevStopIndex(state: WalkState): number | null {
  return state.stopIndex > 0 ? state.stopIndex - 1 : null;
}

export function isLastStop(state: WalkState): boolean {
  return state.stopIndex === state.stops.length - 1;
}

export function isFinished(state: WalkState): boolean {
  return state.status === 'arrived' && isLastStop(state);
}
