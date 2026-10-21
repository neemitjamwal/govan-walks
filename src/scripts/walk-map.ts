import L from 'leaflet';
import type { LatLng } from '../lib/geo';

export interface MapStop extends LatLng {
  name: string;
}

export interface WalkMap {
  setCurrent(index: number, pan: boolean): void;
  setUser(position: LatLng | null): void;
  showUserAndStop(position: LatLng, index: number): void;
}

export function createWalkMap(
  el: HTMLElement,
  stops: MapStop[],
  onSelect: (index: number) => void,
  reducedMotion: boolean,
): WalkMap {
  const map = L.map(el, {
    scrollWheelZoom: false,
    zoomAnimation: !reducedMotion,
    fadeAnimation: !reducedMotion,
    markerZoomAnimation: !reducedMotion,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  const points = stops.map((s) => L.latLng(s.lat, s.lng));
  // Leaflet only adds layers once the map has a view, so set it before creating markers whose elements we decorate.
  map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 17 });

  L.polyline(points, { color: '#b23a2a', weight: 4, opacity: 0.85, dashArray: '8 6', className: 'route-line' }).addTo(map);

  const markers = stops.map((stop, i) => {
    const marker = L.marker(points[i], {
      icon: L.divIcon({
        className: 'survey-marker-icon',
        html: `<span class="survey-marker" aria-hidden="true">${i + 1}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
      title: `Stop ${i + 1}: ${stop.name}`,
      keyboard: true,
      riseOnHover: true,
    }).addTo(map);
    const icon = marker.getElement();
    if (icon) {
      icon.setAttribute('role', 'button');
      icon.setAttribute('aria-label', `Stop ${i + 1}: ${stop.name}`);
      icon.dataset.markerIndex = String(i);
      icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(i);
        }
      });
    }
    marker.on('click', () => onSelect(i));
    return marker;
  });

  let user: L.CircleMarker | null = null;
  const animate = !reducedMotion;

  return {
    setCurrent(index, pan) {
      markers.forEach((m, i) => {
        const dot = m.getElement()?.querySelector('.survey-marker');
        dot?.classList.toggle('is-current', i === index);
        m.getElement()?.setAttribute('aria-current', i === index ? 'step' : 'false');
        m.setZIndexOffset(i === index ? 1000 : 0);
      });
      if (pan) map.panTo(points[index], { animate });
    },
    setUser(position) {
      if (!position) {
        user?.remove();
        user = null;
        delete el.dataset.userLat;
        delete el.dataset.userLng;
        return;
      }
      const ll = L.latLng(position.lat, position.lng);
      if (!user) {
        user = L.circleMarker(ll, {
          radius: 8,
          color: '#ffffff',
          weight: 3,
          fillColor: '#1f6fd1',
          fillOpacity: 1,
          className: 'user-location',
          interactive: false,
        }).addTo(map);
      } else {
        user.setLatLng(ll);
      }
      el.dataset.userLat = String(position.lat);
      el.dataset.userLng = String(position.lng);
    },
    showUserAndStop(position, index) {
      map.fitBounds(L.latLngBounds([L.latLng(position.lat, position.lng), points[index]]), {
        padding: [40, 40],
        maxZoom: 18,
        animate,
      });
    },
  };
}
