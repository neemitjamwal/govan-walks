import L from 'leaflet';

interface MiniPoint {
  lat: number;
  lng: number;
}

interface MiniRoute {
  stops: MiniPoint[];
  crossing: (MiniPoint & { name: string }) | null;
}

function mount(el: HTMLElement, reducedMotion: boolean) {
  const route = JSON.parse(el.dataset.route ?? '{}') as MiniRoute;
  if (!route.stops?.length) return;
  const holder = document.createElement('div');
  holder.className = 'walk-minimap-map';
  holder.setAttribute('aria-hidden', 'true');
  el.appendChild(holder);

  const map = L.map(holder, {
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomControl: false,
    fadeAnimation: !reducedMotion,
    zoomAnimation: false,
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  const points = route.stops.map((s) => L.latLng(s.lat, s.lng));
  const end = route.crossing ? L.latLng(route.crossing.lat, route.crossing.lng) : null;
  map.fitBounds(L.latLngBounds(end ? [...points, end] : points), { padding: [22, 22], maxZoom: 17 });

  L.polyline(points, { color: '#b23a2a', weight: 4, opacity: 0.9, dashArray: '8 6', interactive: false }).addTo(map);
  if (end) {
    L.polyline([points[points.length - 1], end], {
      color: '#1f5f8b',
      weight: 5,
      opacity: 0.9,
      dashArray: '2 8',
      lineCap: 'round',
      interactive: false,
    }).addTo(map);
    L.circleMarker(end, { radius: 6, color: '#fff8ec', weight: 2, fillColor: '#1f5f8b', fillOpacity: 1, interactive: false }).addTo(map);
  }
  points.forEach((p, i) => {
    L.marker(p, {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: 'survey-marker-icon',
        html: `<span class="survey-marker survey-marker-mini">${i + 1}</span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    }).addTo(map);
  });
  el.classList.add('has-map');
}

/** Turns each home-page route sketch into a small, non-interactive OpenStreetMap view once it scrolls into view. */
export function mountMiniMaps() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = Array.from(document.querySelectorAll<HTMLElement>('.walk-minimap[data-route]'));
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => mount(el, reducedMotion));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        mount(e.target as HTMLElement, reducedMotion);
      }
    },
    { rootMargin: '200px' },
  );
  els.forEach((el) => io.observe(el));
}
