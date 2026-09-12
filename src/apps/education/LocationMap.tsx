import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './location-map.css';
import {
  fetchLocations,
  readCache,
  KEY,
  TTL,
  SPACE,
  GEOGRAPHY,
} from './location-data.mjs';
type Place = {
  id: string;
  name: string;
  point: number[] | null;
  records: { id: string; name: string }[];
};
type Snapshot = {
  version: number;
  at: number;
  locations: Place[];
  partial: boolean;
};
export default function LocationMap() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(() => {
    try {
      return readCache(localStorage);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(''),
    [search, setSearch] = useState(''),
    [tileError, setTileError] = useState(false),
    [storageError, setStorageError] = useState(false);
  const container = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    markers = useRef<L.LayerGroup | null>(null),
    request = useRef<AbortController | null>(null),
    lastAttempt = useRef(0);
  async function refresh() {
    if (Date.now() - lastAttempt.current < 10000) return;
    lastAttempt.current = Date.now();
    request.current?.abort();
    const c = new AbortController();
    request.current = c;
    const timer = setTimeout(() => c.abort(), 30000);
    setBusy(true);
    setError('');
    try {
      const d = await fetchLocations(c.signal);
      if (c.signal.aborted) return;
      setSnapshot(d);
      try {
        localStorage.setItem(KEY, JSON.stringify(d));
      } catch {
        setStorageError(true);
      }
    } catch (e) {
      setError(
        c.signal.aborted
          ? 'Geo request timed out or was cancelled.'
          : e instanceof Error
            ? e.message
            : 'Geo is unavailable.',
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!snapshot || Date.now() - snapshot.at > TTL) void refresh();
    return () => request.current?.abort();
  }, []);
  useEffect(() => {
    if (!container.current) return;
    const m = L.map(container.current, {
      scrollWheelZoom: false,
      maxZoom: 12,
    }).setView([39, -96], 4);
    map.current = m;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      keepBuffer: 0,
      updateWhenIdle: true,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on('tileerror', () => setTileError(true))
      .addTo(m);
    markers.current = L.layerGroup().addTo(m);
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);
  const places = snapshot?.locations ?? [];
  useEffect(() => {
    const m = map.current,
      layer = markers.current;
    if (!m || !layer) return;
    layer.clearLayers();
    const points: L.LatLngTuple[] = [];
    for (const g of places) {
      if (!g.point) continue;
      const p = g.point as L.LatLngTuple;
      points.push(p);
      const label = document.createElement('span');
      label.textContent = g.name;
      L.circleMarker(p, {
        radius: 9,
        color: '#195f55',
        fillColor: '#e7b85b',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(label)
        .on('click', () => setSelected(g.id))
        .addTo(layer);
    }
    if (points.length)
      m.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 7 });
  }, [snapshot]);
  const chosen = places.find((g) => g.id === selected);
  function choose(g: Place) {
    setSelected(g.id);
    if (g.point) map.current?.setView(g.point as L.LatLngTuple, 7);
  }
  return (
    <section className="location-view">
      <div className="eyebrow">EDUCATION GEOGRAPHY</div>
      <h1>Where was this studied?</h1>
      <p>
        Explore education research by location. Markers indicate study areas,
        not exact sites.
      </p>
      <div className="location-status" aria-live="polite">
        {busy
          ? 'Loading…'
          : snapshot && Date.now() - snapshot.at > TTL
            ? 'Showing earlier results.'
            : ''}{' '}
        <button disabled={busy} onClick={() => void refresh()}>
          Refresh
        </button>
      </div>
      {error && (
        <p role="alert">
          {error}{' '}
          {snapshot
            ? 'The previous snapshot remains visible.'
            : 'Use Refresh to try again.'}
        </p>
      )}
      {storageError && <p>This view could not be saved for your next visit.</p>}
      {snapshot?.partial && (
        <p role="status">Showing part of the available locations.</p>
      )}
      <div className="location-layout">
        <div>
          <div
            className="geo-leaflet"
            ref={container}
            aria-label="Education locations map"
          />
          {tileError && (
            <p role="status">
              Some map tiles are unavailable. Locations and record links remain
              available below.
            </p>
          )}
          <p className="muted">
            {places.filter((g) => g.point).length} mapped places ·{' '}
            {places.filter((g) => !g.point).length} not mapped.{' '}
            <a
              href="https://www.openstreetmap.org/fixthemap"
              target="_blank"
              rel="noreferrer"
            >
              Report a basemap issue ↗
            </a>
          </p>
        </div>
        <div className="location-list">
          <label>
            Find a place
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter loaded locations"
            />
          </label>
          {places
            .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
            .map((g) => (
              <button
                key={g.id}
                aria-pressed={selected === g.id}
                onClick={() => choose(g)}
              >
                <strong>{g.name}</strong>
                <span>
                  {g.records.length} linked records
                  {!g.point ? ' · Not mapped' : ''}
                </span>
              </button>
            ))}
          {snapshot && !places.length && <p>No locations found.</p>}
        </div>
      </div>
      {chosen ? (
        <section className="location-records">
          <h2>{chosen.name}</h2>
          <a
            href={`https://www.geobrowser.io/space/${GEOGRAPHY}/${chosen.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Place on Geo ↗
          </a>
          <ul>
            {chosen.records.map((r) => (
              <li key={r.id}>
                <a
                  href={`https://www.geobrowser.io/space/${SPACE}/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p>Select a marker or a place to explore its linked records.</p>
      )}
    </section>
  );
}
