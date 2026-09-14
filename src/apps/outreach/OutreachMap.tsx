import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Service } from './Directory';
export default function OutreachMap({
  services = [],
}: {
  services?: Service[];
}) {
  const container = useRef<HTMLDivElement>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false }).setView(
      [39.7684, -86.1581],
      11,
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      keepBuffer: 0,
      updateWhenIdle: true,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on('tileerror', () => setError(true))
      .addTo(map);
    const bounds: L.LatLngTuple[] = [];
    const stops = new Map<
      string,
      { point: number[]; name: string; services: string[] }
    >();
    for (const service of services)
      for (const place of service.locations) {
        if (!place.point) continue;
        const stop = stops.get(place.id) ?? {
          point: place.point,
          name: place.name,
          services: [],
        };
        stop.services.push(service.name);
        stops.set(place.id, stop);
      }
    for (const stop of stops.values()) {
      const point = stop.point as L.LatLngTuple;
      const popup = document.createElement('div');
      popup.textContent = `${stop.name}: ${stop.services.join('; ')}`;
      L.circleMarker(point, { radius: 8, color: '#176b5b', fillOpacity: 0.85 })
        .bindPopup(popup)
        .addTo(map);
      bounds.push(point);
    }
    if (bounds.length)
      map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 14 });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [services]);
  return (
    <>
      {error && (
        <p role="status">The background map is unavailable. Try again later.</p>
      )}
      <div
        ref={container}
        className="geo-leaflet outreach-leaflet"
        aria-label="Public outreach service locations; service details listed below"
      />
    </>
  );
}
