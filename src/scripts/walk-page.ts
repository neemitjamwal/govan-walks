import type { LatLng } from '../lib/geo';
import { gpsView } from '../lib/gps-view';
import { onPageCache } from '../lib/page-cache';
import { createWalkState, walkReducer, type WalkAction, type WalkState } from '../lib/walk-state';
import { setupListen } from './listen';
import { createWalkMap } from './walk-map';

interface PageStop extends LatLng {
  slug: string;
  name: string;
  speech: string[];
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export function startWalkPage() {
  const data = JSON.parse($('walk-data').textContent ?? '{}') as { walk: string; stops: PageStop[] };
  const stops = data.stops;
  const slugs = stops.map((s) => s.slug);
  const names = stops.map((s) => s.name);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const indexFromHash = () => slugs.indexOf(decodeURIComponent(location.hash.slice(1)));
  const startIndex = Math.max(0, indexFromHash());
  let state: WalkState = createWalkState(stops, startIndex);
  let shownIndex = -1;
  let watchId: number | null = null;
  let hadFix = false;

  const panel = $('gps-panel');
  const gpsArrow = document.getElementById('gps-arrow') as unknown as SVGElement;
  const gpsDistance = $('gps-distance');
  const gpsMessage = $('gps-message');
  const gpsStale = $('gps-stale');
  const gpsStart = $<HTMLButtonElement>('gps-start');
  const gpsNext = $<HTMLButtonElement>('gps-next');
  const gpsStop = $<HTMLButtonElement>('gps-stop');
  const prevBtn = $<HTMLButtonElement>('prev-stop');
  const nextBtn = $<HTMLButtonElement>('next-stop');
  const endOfWalk = $('end-of-walk');
  const card = $('stop-card');
  const stopParts = Array.from(document.querySelectorAll<HTMLElement>('#stop-card [data-stop-index]'));
  const listItems = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-select-stop]'));

  const listen = setupListen($('listen'));
  const map = createWalkMap($('walk-map'), stops, (i) => select(i, { scrollToCard: false }), reducedMotion);

  function renderGps() {
    const view = gpsView(state, names);
    panel.dataset.gpsState = view.status;
    panel.toggleAttribute('data-finished', view.finished);
    gpsDistance.hidden = view.distanceText === null;
    gpsDistance.textContent = view.distanceText ?? '';
    if (gpsMessage.textContent !== view.message) gpsMessage.textContent = view.message;
    panel.toggleAttribute('data-gps-stale', view.staleText !== null);
    gpsStale.hidden = view.staleText === null;
    if (gpsStale.textContent !== (view.staleText ?? '')) gpsStale.textContent = view.staleText ?? '';
    gpsArrow.toggleAttribute('hidden', view.arrowDeg === null);
    if (view.arrowDeg !== null) gpsArrow.style.transform = `rotate(${Math.round(view.arrowDeg)}deg)`;
    gpsStart.hidden = !view.showStart;
    gpsStop.hidden = !view.showStop;
    gpsNext.hidden = !view.showNext;
    map.setUser(state.position);
  }

  function renderStop(pan: boolean) {
    const i = state.stopIndex;
    if (i === shownIndex) return;
    shownIndex = i;
    for (const el of stopParts) el.hidden = Number(el.dataset.stopIndex) !== i;
    listItems.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    const last = i === stops.length - 1;
    if (document.activeElement === prevBtn && i === 0) nextBtn.focus();
    if (document.activeElement === nextBtn && last) prevBtn.focus();
    prevBtn.hidden = i === 0;
    nextBtn.hidden = last;
    endOfWalk.hidden = !last;
    map.setCurrent(i, pan);
    listen.setStop(stops[i].speech);
  }

  function dispatch(action: WalkAction, pan = true) {
    const before = state.stopIndex;
    state = walkReducer(state, action);
    renderStop(pan);
    renderGps();
    if (state.stopIndex !== before && location.hash.slice(1) !== slugs[state.stopIndex]) {
      history.replaceState(null, '', `#${slugs[state.stopIndex]}`);
    }
  }

  function select(index: number, { scrollToCard }: { scrollToCard: boolean }) {
    dispatch({ type: 'select', index });
    if (scrollToCard) {
      card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      card.querySelector<HTMLElement>(`.stop-head[data-stop-index="${index}"] .stop-name`)?.focus({ preventScroll: true });
    }
  }

  function clearWatch() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  function startGps() {
    const supported = 'geolocation' in navigator;
    hadFix = false;
    dispatch({ type: 'start', supported }, false);
    gpsStop.focus();
    if (!supported) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        dispatch({ type: 'position', position }, false);
        if (!hadFix && state.status !== 'far' && state.status !== 'off') map.showUserAndStop(position, state.stopIndex);
        hadFix = true;
      },
      (err) => {
        dispatch({ type: 'error', code: err.code }, false);
        if (state.status === 'denied' || state.status === 'unavailable') clearWatch();
      },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }

  function stopGps() {
    clearWatch();
    dispatch({ type: 'stop' }, false);
    gpsStart.focus();
  }

  gpsStart.addEventListener('click', startGps);
  gpsStop.addEventListener('click', stopGps);
  gpsNext.addEventListener('click', () => {
    dispatch({ type: 'next' });
    if (gpsNext.hidden) gpsStop.focus();
  });
  prevBtn.addEventListener('click', () => dispatch({ type: 'prev' }));
  nextBtn.addEventListener('click', () => dispatch({ type: 'next' }));
  listItems.forEach((b) => b.addEventListener('click', () => select(Number(b.dataset.selectStop), { scrollToCard: true })));
  window.addEventListener('hashchange', () => {
    const i = indexFromHash();
    if (i >= 0) dispatch({ type: 'select', index: i });
  });
  // A page restored from the back/forward cache has no watch any more, so return the panel to off.
  onPageCache(window, {
    hide: clearWatch,
    restore: () => {
      clearWatch();
      if (state.status !== 'off') dispatch({ type: 'stop' }, false);
    },
  });

  renderStop(startIndex !== 0);
  renderGps();
}
