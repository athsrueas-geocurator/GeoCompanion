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
import DossierOverview from './DossierOverview';
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
  categories: Ref[];
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
    [category, setCategory] = useState(''),
    [comparison, setComparison] = useState<string[]>(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem('geo:initiative-comparison') || '[]',
        );
        return Array.isArray(saved)
          ? saved.filter((id) => typeof id === 'string')
          : [];
      } catch {
        return [];
      }
    }),
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
    setCategory('');
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
  useEffect(() => {
    localStorage.setItem(
      'geo:initiative-comparison',
      JSON.stringify(comparison),
    );
  }, [comparison]);
  const options = (field: 'topics' | 'places' | 'categories') =>
    [
      ...new Map(rows.flatMap((r) => r[field]).map((r) => [r.id, r])).values(),
    ].sort((a, b) => a.name.localeCompare(b.name));
  const filtered = filterRows(rows, search, topic, place, category) as Entry[];
  const categoryCounts = new Map<string, { entry: Ref; count: number }>();
  rows.forEach((row) =>
    row.categories.forEach((entry) =>
      categoryCounts.set(entry.id, {
        entry,
        count: (categoryCounts.get(entry.id)?.count || 0) + 1,
      }),
    ),
  );
  const compared = comparison
    .map((id) => rows.find((row) => row.id === id))
    .filter(Boolean) as Entry[];
  function toggleComparison(id: string) {
    setComparison((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id].slice(-3),
    );
  }
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
      {!questions && <DossierOverview />}
      {!questions && (categoryCounts.size > 0 || rows.length > 0) && (
        <section
          className="atlas-category-summary"
          aria-label="Initiative categories"
        >
          <h2>Categories</h2>
          <div>
            {[...categoryCounts.values()]
              .sort(
                (a, b) =>
                  b.count - a.count || a.entry.name.localeCompare(b.entry.name),
              )
              .map(({ entry, count }) => (
                <button
                  key={entry.id}
                  aria-pressed={category === entry.id}
                  onClick={() =>
                    setCategory(category === entry.id ? '' : entry.id)
                  }
                >
                  {entry.name} <span>{count}</span>
                </button>
              ))}
            <button
              aria-pressed={category === 'unclassified'}
              onClick={() =>
                setCategory(category === 'unclassified' ? '' : 'unclassified')
              }
            >
              Unclassified{' '}
              <span>
                {rows.filter((row) => row.categories.length === 0).length}
              </span>
            </button>
          </div>
        </section>
      )}
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
        {!questions && (
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {options('categories').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="unclassified">Unclassified</option>
            </select>
          </label>
        )}
      </div>
      {!questions && compared.length > 0 && (
        <section
          className="atlas-comparison"
          aria-label="Selected initiative comparison"
        >
          <h2>Compare initiatives</h2>
          <div className="atlas-comparison-table" role="region" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Initiative</th>
                  <th>Finding or limitation</th>
                  <th>Population</th>
                  <th>Study design</th>
                  <th>Sources</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {compared.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.name}</th>
                    <td>{r.description || 'Not stated'}</td>
                    <td>{r.population || 'Not stated'}</td>
                    <td>{r.design || 'Not stated'}</td>
                    <td>{r.sources.length}</td>
                    <td>
                      <button onClick={() => toggleComparison(r.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {compared.length > 1 && (
            <p>
              Shared sources:{' '}
              {compared.reduce(
                (shared, r) =>
                  shared.filter((id) => r.sources.some((s) => s.id === id)),
                compared[0].sources.map((s) => s.id),
              ).length || 'None'}
            </p>
          )}
        </section>
      )}
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
              {r.categories.map((p) => (
                <button key={p.id} onClick={() => setCategory(p.id)}>
                  {p.name}
                </button>
              ))}
              {r.places.map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
            </div>
            {!questions && (
              <button
                aria-pressed={comparison.includes(r.id)}
                onClick={() => toggleComparison(r.id)}
              >
                {comparison.includes(r.id)
                  ? 'Remove from comparison'
                  : 'Add to comparison'}
              </button>
            )}
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
