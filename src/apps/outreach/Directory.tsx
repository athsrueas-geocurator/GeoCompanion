import { DAY_NAMES } from './schedule.mjs';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { loadDirectory } from './outreach-data.mjs';
import { OUTREACH_SPACE } from '../../config/geo.mjs';
const Map = lazy(() => import('./OutreachMap'));
type Entry = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  point: number[] | null;
};
export type Service = Entry & {
  hours?: {
    days: number[];
    from: number;
    to: number;
    startDate: string;
    label: string;
  } | null;
  providers: Entry[];
  locations: Entry[];
  sources: Entry[];
};
export default function Directory({ tab }: { tab: string }) {
  const [rows, setRows] = useState<Service[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [search, setSearch] = useState('');
  const generation = useRef(0);
  async function refresh(force = false) {
    const current = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const data = await loadDirectory(force);
      if (current === generation.current) setRows(data);
    } catch (e) {
      if (current === generation.current) {
        setRows([]);
        setError(e instanceof Error ? e.message : 'Services are unavailable.');
      }
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
    return () => {
      generation.current++;
    };
  }, []);
  const visible = useMemo(() => {
    const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return rows.filter((s) =>
      terms.every((t) =>
        [
          s.name,
          s.description,
          ...s.providers.map((p) => p.name),
          ...s.locations.map((p) => p.name),
        ]
          .join(' ')
          .toLowerCase()
          .includes(t),
      ),
    );
  }, [rows, search]);
  if (tab === 'food')
    return (
      <section>
        <p>Verified food-service filters are not available yet.</p>
        <a href="#/outreach/directory">
          Browse services and current provider information →
        </a>
      </section>
    );
  return (
    <section aria-label="Outreach services">
      <div className="outreach-tools">
        <label>
          Search services
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Service, need or provider"
          />
        </label>
        <button disabled={busy} onClick={() => void refresh(true)}>
          Refresh
        </button>
      </div>
      {busy && <p role="status">Loading services…</p>}
      {error && <p role="alert">{error} Use Refresh to try again.</p>}
      {!busy && !error && (
        <p>
          {visible.length} {visible.length === 1 ? 'service' : 'services'}
        </p>
      )}
      {tab === 'map' && !error && (
        <Suspense fallback={<p>Loading map…</p>}>
          <Map services={visible} />
        </Suspense>
      )}
      {tab === 'weekly' && !busy && !error && (
        <section aria-label="Published weekly hours">
          <p>
            Published hours, Indianapolis time. Confirm hours, eligibility and
            closures with the provider before traveling.
          </p>
          {DAY_NAMES.map((day, index) => {
            const services = visible
              .filter((s) => s.hours?.days.includes(index))
              .sort((a, b) => a.hours!.from - b.hours!.from);
            return (
              <section key={day}>
                <h3>{day}</h3>
                {services.length ? (
                  services.map((s) => (
                    <p key={s.id}>
                      <strong>{s.hours!.label}</strong> · {s.name} · From{' '}
                      {s.hours!.startDate}{' '}
                      {s.sources
                        .filter((p) => p.url)
                        .map((p) => (
                          <a
                            key={p.id}
                            href={p.url!}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Confirm hours ↗
                          </a>
                        ))}
                    </p>
                  ))
                ) : (
                  <p>No published hours listed.</p>
                )}
              </section>
            );
          })}
        </section>
      )}
      <div className="outreach-cards">
        {visible.map((s) => (
          <article key={s.id}>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            {s.hours ? (
              <p>
                Published hours:{' '}
                {s.hours.days.map((d) => DAY_NAMES[d]).join(', ')} ·{' '}
                {s.hours.label} (Indianapolis). From {s.hours.startDate}.
                Confirm with provider.
              </p>
            ) : (
              <p>Hours require confirmation.</p>
            )}
            {s.providers.length > 0 && (
              <p>{s.providers.map((p) => p.name).join(' · ')}</p>
            )}
            {s.locations.map((p) => (
              <p key={p.id}>
                {p.name}
                {!p.point ? ' · Map location unavailable' : ''}
              </p>
            ))}
            <div className="outreach-links">
              {s.sources
                .filter((p) => p.url)
                .map((p) => (
                  <a key={p.id} href={p.url!} target="_blank" rel="noreferrer">
                    Current service information ↗
                  </a>
                ))}
              <a
                href={`https://www.geobrowser.io/space/${OUTREACH_SPACE}/${s.id}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Geo ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      {!busy && !error && !visible.length && <p>No matching services.</p>}
    </section>
  );
}
