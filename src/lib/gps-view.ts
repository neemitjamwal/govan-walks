import { compass8, formatDistance } from './geo';
import { isFinished, isLastStop, type GpsStatus, type WalkState } from './walk-state';

export interface GpsView {
  status: GpsStatus;
  /** "200 m · south-east", or just the distance when far away. */
  distanceText: string | null;
  /** Bearing to rotate a north-up arrow by, when there is one to show. */
  arrowDeg: number | null;
  message: string;
  showStart: boolean;
  showStop: boolean;
  showNext: boolean;
  finished: boolean;
  /** Set when the shown reading is only the last known position. */
  staleText: string | null;
}

export const STALE_TEXT = 'Signal lost. Showing your last known position.';

const STILL_WORKS = 'you can still follow the walk using the map';

/** What the GPS panel should say for a walk state; stopNames are in walk order. */
export function gpsView(state: WalkState, stopNames: string[]): GpsView {
  const view = baseView(state, stopNames);
  const stale = state.stale && state.position !== null && view.distanceText !== null;
  return { ...view, staleText: stale ? STALE_TEXT : null };
}

function baseView(state: WalkState, stopNames: string[]): Omit<GpsView, 'staleText'> {
  const current = stopNames[state.stopIndex];
  const base: Omit<GpsView, 'staleText'> = {
    status: state.status,
    distanceText: null,
    arrowDeg: null,
    message: '',
    showStart: false,
    showStop: true,
    showNext: false,
    finished: false,
  };
  const directions = () =>
    state.distance !== null && state.bearing !== null
      ? { distanceText: `${formatDistance(state.distance)} · ${compass8(state.bearing)}`, arrowDeg: state.bearing }
      : {};

  switch (state.status) {
    case 'off':
      return {
        ...base,
        message: 'Start GPS to see how far you are from each stop. Your location stays on your phone.',
        showStart: true,
        showStop: false,
      };
    case 'locating':
      return { ...base, message: 'Finding your location…' };
    case 'active':
      return { ...base, ...directions(), message: `to ${current}` };
    case 'arrived': {
      const finished = isFinished(state);
      // Within the arrival radius a compass direction would just be noise, so only the distance is shown.
      return {
        ...base,
        distanceText: state.distance === null ? null : formatDistance(state.distance),
        message: finished ? "You've finished the walk" : `You've arrived at ${current}`,
        showNext: !isLastStop(state),
        finished,
      };
    }
    case 'far':
      return {
        ...base,
        distanceText: state.distanceToStart === null ? null : formatDistance(state.distanceToStart),
        message: `You're a long way from Govan — the walk starts at ${stopNames[0]}`,
      };
    case 'denied':
      return { ...base, message: `Location permission was denied — ${STILL_WORKS}` };
    case 'unavailable':
      return { ...base, message: `Your location isn't available on this device — ${STILL_WORKS}` };
  }
}
