import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default function OutreachMap() {
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
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
    };
  }, []);
  return (
    <>
      {error && (
        <p role="status">The background map is unavailable. Try again later.</p>
      )}
      <div
        ref={container}
        aria-label="Indianapolis map, no verified service markers yet"
        style={{ height: 380, marginTop: 24, borderRadius: 10 }}
      />
    </>
  );
}
