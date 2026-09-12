import { useEffect, useState, useRef } from 'react';
import {
  loadPage,
  TYPES,
  SPACE,
  modeFilter,
  mergeRows,
  filterRows,
} from './atlas-live.mjs';
import { safeUrl } from './data.mjs';
import './live-atlas.css';
type Ref = { id: string; name: string };
type Entry = {
  id: string;
  name: string;
  description: string;
  url: string;
  population: string;
  design: string;
  sources: Ref[];
  places: Ref[];
  topics: Ref[];
  related: Ref[];
};
function GeoLink({ entry }: { entry: Ref }) {
  return (
    <a
      href={`https://www.geobrowser.io/space/${SPACE}/${entry.id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {entry.name} ↗
    </a>
  );
}
function Evidence({ entry }: { entry: Entry }) {
  const [rows, setRows] = useState<Entry[]>([]),
    [next, setNext] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState('');
  const generation = useRef(0);
  async function load(after: string | null, signal?: AbortSignal) {
    const request = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const page = await loadPage(
        TYPES.claim,
        modeFilter('evidence', entry.id),
        after,
        signal,
      );
      if (signal?.aborted || request !== generation.current) return;
      setRows((old) => (after ? mergeRows(old, page.rows) : page.rows));
      setNext(page.next);
    } catch (e) {
      if (!signal?.aborted && request === generation.current)
        setError(e instanceof Error ? e.message : 'Evidence is unavailable.');
    } finally {
      if (!signal?.aborted && request === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    const c = new AbortController();
    void load(null, c.signal);
    return () => {
      c.abort();
      generation.current++;
    };
  }, [entry.id]);
  return (
    <section className="atlas-evidence">
      <h3>Findings & arguments</h3>
      {rows.map((r) => (
        <article key={r.id}>
          <GeoLink entry={r} />
          {r.description && <p>{r.description}</p>}
          {r.sources.length > 0 && (
            <details>
              <summary>Sources</summary>
              <ul>
                {r.sources.map((s) => (
                  <li key={s.id}>
                    <GeoLink entry={s} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </article>
      ))}
      {!busy && !rows.length && !error && <p>No linked findings available.</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void load(next)}>Try again</button>
        </p>
      )}
      {busy && <p role="status">Loading findings…</p>}
      {next && !busy && (
        <button onClick={() => void load(next)}>Load more findings</button>
      )}
    </section>
  );
}
export default function LiveAtlas({
  questions = false,
}: {
  questions?: boolean;
}) {
  const [kind, setKind] = useState<'initiative' | 'study'>('initiative');
  const [rows, setRows] = useState<Entry[]>([]),
    [next, setNext] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState('');
  const [search, setSearch] = useState(''),
    [topic, setTopic] = useState(''),
    [place, setPlace] = useState(''),
    [selected, setSelected] = useState<Entry | null>(null);
  const generation = useRef(0);
  async function load(
    after: string | null,
    signal?: AbortSignal,
    force = false,
  ) {
    const request = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const page = await loadPage(
        questions ? TYPES.claim : TYPES[kind],
        modeFilter(questions ? 'questions' : 'atlas'),
        after,
        signal,
        force,
      );
      if (signal?.aborted || request !== generation.current) return;
      setRows((old) => (after ? mergeRows(old, page.rows) : page.rows));
      setNext(page.next);
    } catch (e) {
      if (!signal?.aborted && request === generation.current)
        setError(
          e instanceof Error ? e.message : 'The collection is unavailable.',
        );
    } finally {
      if (!signal?.aborted && request === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    const c = new AbortController();
    setRows([]);
    setNext(null);
    setSelected(null);
    setTopic('');
    setPlace('');
    void load(null, c.signal);
    return () => {
      c.abort();
      generation.current++;
    };
  }, [kind, questions]);
  const detail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    detail.current?.focus();
  }, [selected?.id]);
  const options = (field: 'topics' | 'places') =>
    [
      ...new Map(rows.flatMap((r) => r[field]).map((r) => [r.id, r])).values(),
    ].sort((a, b) => a.name.localeCompare(b.name));
  const filtered = filterRows(rows, search, topic, place) as Entry[];
  return (
    <div className="live-atlas">
      <div className="page-heading">
        <div>
          <h1>{questions ? 'Questions & evidence' : 'Evidence atlas'}</h1>
          <p>
            {questions
              ? 'Explore positions and the evidence behind them.'
              : 'Explore programs, studies and their findings.'}
          </p>
        </div>
        <button
          disabled={busy}
          onClick={() => void load(null, undefined, true)}
        >
          Refresh
        </button>
      </div>
      <div className="atlas-controls">
        {!questions && (
          <label>
            Explore
            <select
              value={kind}
              disabled={busy}
              onChange={(e) =>
                setKind(e.target.value as 'initiative' | 'study')
              }
            >
              <option value="initiative">Programs & initiatives</option>
              <option value="study">Studies</option>
            </select>
          </label>
        )}
        <label className="atlas-search">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a program, study or idea"
          />
        </label>
        {options('topics').length > 0 && (
          <label>
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {options('topics').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {options('places').length > 0 && (
          <label>
            Place
            <select value={place} onChange={(e) => setPlace(e.target.value)}>
              <option value="">All places</option>
              {options('places').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="atlas-count">
        {filtered.length} entries{next ? ' · More available' : ''}
      </p>
      {error && (
        <p role="alert">
          {error} <button onClick={() => void load(next)}>Try again</button>
        </p>
      )}
      {busy && <p role="status">Loading entries…</p>}
      {!busy && !filtered.length && !error && (
        <p>No entries match. Try another search or filter.</p>
      )}
      <div className="atlas-grid">
        {filtered.map((r) => (
          <article key={r.id}>
            <button className="atlas-title" onClick={() => setSelected(r)}>
              {r.name}
              <span aria-hidden="true"> ↗</span>
            </button>
            {r.description && <p>{r.description}</p>}
            <div className="atlas-tags">
              {r.places.map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
            </div>
            <GeoLink entry={{ id: r.id, name: 'Open on Geo' }} />
          </article>
        ))}
      </div>
      {next && !busy && (
        <button onClick={() => void load(next)}>Load more</button>
      )}
      {selected && (
        <div
          className="atlas-detail"
          role="region"
          aria-label={selected.name}
          tabIndex={-1}
          ref={detail}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelected(null);
          }}
        >
          <button className="atlas-close" onClick={() => setSelected(null)}>
            Close details
          </button>
          <h2>{selected.name}</h2>
          {selected.description && <p>{selected.description}</p>}
          <dl>
            {selected.population && (
              <>
                <dt>Population</dt>
                <dd>{selected.population}</dd>
              </>
            )}
            {selected.design && (
              <>
                <dt>Study design</dt>
                <dd>{selected.design}</dd>
              </>
            )}
          </dl>
          {safeUrl(selected.url) && (
            <a
              href={safeUrl(selected.url)!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Original source ↗
            </a>
          )}
          <p>
            <GeoLink entry={{ id: selected.id, name: 'Open on Geo' }} />
          </p>
          {selected.sources.length > 0 && (
            <details>
              <summary>Sources</summary>
              <ul>
                {selected.sources.map((s) => (
                  <li key={s.id}>
                    <GeoLink entry={s} />
                  </li>
                ))}
              </ul>
            </details>
          )}
          {questions ? (
            <>
              <h3>Related evidence</h3>
              <ul>
                {selected.related.map((r) => (
                  <li key={r.id}>
                    <GeoLink entry={r} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Evidence key={selected.id} entry={selected} />
          )}
        </div>
      )}
    </div>
  );
}
