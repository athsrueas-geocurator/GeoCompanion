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
import { Arguments } from './ArgumentExplorer';
import GeoReference from '../../shared/geo/GeoReference';
type Ref = { id: string; name: string; spaces?: string[] };
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
    <GeoReference
      id={entry.id}
      name={entry.name}
      spaces={entry.spaces}
      context={SPACE}
    />
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
  const detail = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (detail.current && !detail.current.open) detail.current.showModal();
  }, [selected?.id]);
  function closeDetails() {
    detail.current?.close();
    setSelected(null);
  }
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
              <option value="initiative">Initiatives</option>
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
            <GeoLink
              entry={{ id: r.id, name: 'Open on Geo', spaces: [SPACE] }}
            />
          </article>
        ))}
      </div>
      {next && !busy && (
        <button onClick={() => void load(next)}>Load more</button>
      )}
      {selected && (
        <dialog
          className="atlas-detail"
          aria-label={selected.name}
          tabIndex={-1}
          ref={detail}
          onKeyDown={(e) => {
            if (e.key !== 'Tab') return;
            const controls = [
              ...e.currentTarget.querySelectorAll<HTMLElement>(
                'button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
              ),
            ].filter((el) => el.checkVisibility() && !el.matches(':disabled'));
            const first = controls[0],
              last = controls.at(-1);
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === e.currentTarget)
            ) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
          onCancel={(e) => {
            e.preventDefault();
            closeDetails();
          }}
        >
          <button className="atlas-close" onClick={closeDetails}>
            Close details
          </button>
          {!questions && (
            <>
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
                <GeoLink
                  entry={{
                    id: selected.id,
                    name: 'Open on Geo',
                    spaces: [SPACE],
                  }}
                />
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
            </>
          )}
          {questions ? (
            <Arguments key={selected.id} id={selected.id} />
          ) : (
            <Evidence key={selected.id} entry={selected} />
          )}
        </dialog>
      )}
    </div>
  );
}
