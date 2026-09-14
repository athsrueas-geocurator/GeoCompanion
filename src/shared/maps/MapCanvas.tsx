import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { groupPoints } from './model.mjs';
import './maps.css';
export type MapPoint = {
  id: string;
  name: string;
  point: number[] | null;
  detail?: string;
};
export type PointLayer = { id: string; label: string; features: MapPoint[] };
export default function MapCanvas({
  layers,
  center,
  zoom,
  maxZoom = 14,
  selected,
  onSelect,
}: {
  layers: PointLayer[];
  center: [number, number];
  zoom: number;
  maxZoom?: number;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null);
  const groups = useRef<L.LayerGroup[]>([]),
    fitted = useRef(false);
  const previous = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  const [hidden, setHidden] = useState<string[]>([]),
    [tileError, setTileError] = useState(false);
  const [choice, setChoice] = useState('');
  const active = layers.filter((l) => !hidden.includes(l.id));
  const features = active.flatMap((l) => l.features);
  useEffect(() => {
    if (choice && !features.some((f) => f.id === choice)) setChoice('');
  }, [layers, hidden, choice]);
  const current = features.find((f) => f.id === (selected ?? choice));
  const choose = useRef((id: string) => {});
  choose.current = (id) => {
    setChoice(id);
    onSelect?.(id);
  };
  function fit() {
    const points = groupPoints(features).map(
      (g) => g[0].point as L.LatLngTuple,
    );
    if (points.length)
      map.current?.fitBounds(points, { padding: [30, 30], maxZoom });
  }
  useEffect(() => {
    if (!element.current) return;
    const m = L.map(element.current, {
      scrollWheelZoom: false,
      maxZoom,
    }).setView(center, zoom);
    map.current = m;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom,
      keepBuffer: 0,
      updateWhenIdle: true,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on('tileerror', () => setTileError(true))
      .addTo(m);
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(element.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
      fitted.current = false;
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    m.closePopup();
    groups.current.forEach((g) => m.removeLayer(g));
    // A group per enabled layer; coincident points offer a chooser across all visible layers.
    const coincident = groupPoints(features) as MapPoint[][];
    const drawn = new Set<string>();
    groups.current = active.map((layer) => {
      const group = L.layerGroup().addTo(m);
      for (const feature of layer.features) {
        const matches = coincident.find((g) =>
          g.some((f) => f.id === feature.id),
        );
        if (!matches || drawn.has(matches[0].point!.join(','))) continue;
        drawn.add(matches[0].point!.join(','));
        const popup = document.createElement('div');
        for (const item of matches) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = item.name;
          button.addEventListener('click', () => choose.current(item.id));
          popup.append(button);
        }
        const label = document.createElement('span');
        label.textContent = matches.map((f) => f.name).join(' · ');
        L.circleMarker(matches[0].point as L.LatLngTuple, {
          radius: matches.length > 1 ? 11 : 8,
          color: '#195f55',
          fillColor: '#e7b85b',
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(label)
          .bindPopup(popup)
          .on('click', () => {
            if (matches.length === 1) choose.current(matches[0].id);
          })
          .addTo(group);
      }
      return group;
    });
    if (!fitted.current && coincident.length) {
      fit();
      fitted.current = true;
    }
  }, [layers, hidden]);
  useEffect(() => {
    if (!current?.point || !map.current) return;
    previous.current ??= {
      center: map.current.getCenter(),
      zoom: map.current.getZoom(),
    };
    map.current.setView(current.point as L.LatLngTuple, maxZoom);
  }, [current?.id, current?.point?.[0], current?.point?.[1]]);
  return (
    <section className="shared-map" aria-label="Interactive location map">
      <div className="map-toolbar">
        <details>
          <summary>Layers</summary>
          <div className="map-layer-options">
            {layers.map((l) => (
              <label key={l.id}>
                <input
                  type="checkbox"
                  checked={!hidden.includes(l.id)}
                  onChange={(e) =>
                    setHidden((old) =>
                      e.target.checked
                        ? old.filter((id) => id !== l.id)
                        : [...old, l.id],
                    )
                  }
                />
                {l.label}
              </label>
            ))}
          </div>
        </details>
        <button onClick={fit} disabled={!features.some((f) => f.point)}>
          Fit locations
        </button>
        <button
          onClick={() => {
            if (previous.current)
              map.current?.setView(
                previous.current.center,
                previous.current.zoom,
              );
            else fit();
          }}
        >
          Restore view
        </button>
      </div>
      <div
        ref={element}
        className="shared-map-canvas"
        aria-label="Map; locations also available in the list"
      />
      {tileError && (
        <p role="status">
          The background map is unavailable. Use the location list below.
        </p>
      )}
      <details className="map-location-list">
        <summary>Locations ({features.length})</summary>
        {features.map((f) => (
          <button
            key={f.id}
            aria-pressed={current?.id === f.id}
            onClick={() => choose.current(f.id)}
          >
            {f.name}
            {!f.point ? ' · Not mapped' : ''}
          </button>
        ))}
        {!features.length && <p>No visible locations.</p>}
      </details>
      {current && (
        <div className="map-selection" aria-live="polite">
          <strong>{current.name}</strong>
          {current.detail && <p>{current.detail}</p>}
        </div>
      )}
    </section>
  );
}
