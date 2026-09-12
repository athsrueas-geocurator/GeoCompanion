import { useEffect, useRef, useState } from 'react';
import { KINDS, loadConnections } from './connection-data.mjs';
import './connections.css';
type Data = {
  edges: unknown[];
  cursors: Record<string, string | null>;
  more: boolean;
  spaces: { id: string; name: string }[];
  groups: {
    id: string;
    name: string;
    targetSpace: string;
    spaces: string[];
    kinds: string[];
    count: number;
    links: {
      id: string;
      space: string;
      relation: string;
      sourceId: string;
      name: string;
    }[];
  }[];
};
export default function Connections() {
  const [data, setData] = useState<Data | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [space, setSpace] = useState(''),
    [kind, setKind] = useState(''),
    [search, setSearch] = useState(''),
    [shared, setShared] = useState(false);
  const controller = useRef<AbortController | null>(null),
    lock = useRef(false),
    last = useRef(0);
  async function load(more = false, force = false) {
    if (lock.current || (force && Date.now() - last.current < 10000)) return;
    last.current = Date.now();
    lock.current = true;
    const c = new AbortController();
    controller.current = c;
    const timer = setTimeout(() => c.abort(), 25000);
    setBusy(true);
    setError('');
    try {
      const next = await loadConnections(more ? data : null, c.signal, force);
      if (!c.signal.aborted) setData(next);
    } catch (e) {
      if (!c.signal.aborted)
        setError(e instanceof Error ? e.message : 'Connections unavailable.');
      else setError('The request timed out. Please try again.');
    } finally {
      clearTimeout(timer);
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
    return () => controller.current?.abort();
  }, []);
  const groups = (data?.groups ?? []).filter(
    (g) =>
      (!space || g.spaces.includes(space)) &&
      (!kind || g.kinds.includes(kind)) &&
      (!shared || g.count > 1) &&
      `${g.name} ${g.links.map((l) => l.name).join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="connections">
      <div className="page-heading">
        <div>
          <div className="eyebrow">FOLLOW THE CONNECTIONS</div>
          <h1>Find the common threads.</h1>
          <p>
            Explore shared sources, study links, places and related reading.
          </p>
        </div>
        <button disabled={busy} onClick={() => void load(false, true)}>
          Refresh
        </button>
      </div>
      <div className="connection-filters">
        <label>
          Space
          <select value={space} onChange={(e) => setSpace(e.target.value)}>
            <option value="">All connected spaces</option>
            {data?.spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Connection
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All connections</option>
            <option value={KINDS.sources}>Shared sources</option>
            <option value={KINDS.places}>Places</option>
            <option value={KINDS.related}>Related records & reading</option>
          </select>
        </label>
        <label>
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a topic or finding…"
          />
        </label>
      </div>
      <label className="shared-toggle">
        <input
          type="checkbox"
          checked={shared}
          onChange={(e) => setShared(e.target.checked)}
        />{' '}
        Shared by multiple records
      </label>
      {error && (
        <p role="alert">
          {error}{' '}
          <button disabled={busy} onClick={() => void load()}>
            Try again
          </button>
        </p>
      )}
      {busy && <p role="status">Loading connections…</p>}
      <p className="connection-summary">
        {groups.length} {groups.length === 1 ? 'connection' : 'connections'}
        {data?.more ? ' · More available' : ''}
      </p>
      <div className="connection-grid">
        {groups.map((g) => (
          <article key={g.id}>
            <h2>{g.name}</h2>
            <span className="connection-count">
              {g.count} connected {g.count === 1 ? 'record' : 'records'}
            </span>
            <details>
              <summary>Explore connections</summary>
              <ul>
                {g.links.map((l) => (
                  <li key={l.id}>
                    <span>{l.relation}</span>
                    <a
                      href={`https://www.geobrowser.io/space/${l.space}/${l.sourceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={`https://www.geobrowser.io/space/${g.targetSpace}/${g.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open connected record ↗
              </a>
            </details>
          </article>
        ))}
      </div>
      {data && !groups.length && !busy && (
        <p>No connections match these filters.</p>
      )}
      {data?.more && data.edges.length < 2000 && (
        <button
          className="load-more"
          disabled={busy}
          onClick={() => void load(true)}
        >
          Load more connections
        </button>
      )}
      {data && data.edges.length >= 2000 && (
        <p>
          Connection limit reached. Use the filters to explore this selection.
        </p>
      )}
    </section>
  );
}
