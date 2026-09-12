import { useEffect, useRef, useState } from 'react';
import { argumentReader, SPACE } from './argument-data.mjs';
import './arguments.css';

type Entry = {
  id: string;
  space: string;
  name: string;
  description: string;
  factual: boolean | null;
  locator: string;
  url: string;
};
type Question = Entry & { topics: { id: string; name: string }[] };
type Graph = {
  node: Entry;
  groups: Record<'supports' | 'opposes' | 'related' | 'source', Entry[]>;
};
const geo = (entry: Entry) =>
  `https://www.geobrowser.io/space/${entry.space}/${entry.id}`;
const label = (entry: Entry) =>
  entry.factual === true
    ? 'Checkable claim'
    : entry.factual === false
      ? 'Position'
      : 'Claim';

export function Arguments({
  id,
  space = SPACE,
}: {
  id: string;
  space?: string;
}) {
  const [path, setPath] = useState([{ id, space }]);
  const [data, setData] = useState<Graph | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  const selected = path[path.length - 1];
  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    argumentReader
      .node(selected.id, selected.space)
      .then((value) => {
        if (active) setData(value as Graph);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Arguments could not be loaded.',
          );
      });
    return () => {
      active = false;
    };
  }, [selected.id, selected.space, retry]);
  useEffect(() => {
    if (data) title.current?.focus();
  }, [data]);
  function select(entry: Entry) {
    const previous = path.findIndex(
      (p) => p.id === entry.id && p.space === entry.space,
    );
    setPath(
      previous >= 0
        ? path.slice(0, previous + 1)
        : [...path, { id: entry.id, space: entry.space }],
    );
  }
  return (
    <section
      className="argument-detail"
      aria-label="Claim and arguments"
      aria-busy={!data && !error}
    >
      {path.length > 1 && (
        <button onClick={() => setPath(path.slice(0, -1))}>
          ← Previous claim
        </button>
      )}
      {error && (
        <p role="alert">
          {error} <button onClick={() => setRetry(retry + 1)}>Try again</button>
        </p>
      )}
      {!data && !error && <p role="status">Loading arguments…</p>}
      {data && (
        <>
          <span className="eyebrow">{label(data.node)}</span>
          <h2 ref={title} tabIndex={-1}>
            {data.node.name}
          </h2>
          {data.node.description && (
            <p className="argument-description">{data.node.description}</p>
          )}
          <a href={geo(data.node)} target="_blank" rel="noopener noreferrer">
            Open claim on Geo ↗
          </a>
          <div className="argument-columns">
            {(['supports', 'opposes'] as const).map((role) => (
              <section key={role}>
                <h3>
                  {role === 'supports'
                    ? 'Supporting arguments'
                    : 'Opposing arguments'}
                </h3>
                {data.groups[role].length ? (
                  <ul>
                    {data.groups[role].map((entry) => (
                      <li key={entry.id}>
                        <span className="eyebrow">{label(entry)}</span>
                        <button
                          className="argument-title"
                          onClick={() => select(entry)}
                        >
                          {entry.name}
                        </button>
                        {entry.description && <p>{entry.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">
                    No {role === 'supports' ? 'supporting' : 'opposing'}{' '}
                    arguments linked.
                  </p>
                )}
              </section>
            ))}
          </div>
          {!!data.groups.related.length && (
            <details className="argument-context">
              <summary>Related claims ({data.groups.related.length})</summary>
              <ul>
                {data.groups.related.map((entry) => (
                  <li key={entry.id}>
                    <button
                      className="argument-title"
                      onClick={() => select(entry)}
                    >
                      {entry.name}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <details className="argument-context" open>
            <summary>Sources</summary>
            {data.groups.source.length ? (
              <ul>
                {data.groups.source.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={geo(entry)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sources linked.</p>
            )}
            {data.node.locator && <p>{data.node.locator}</p>}
          </details>
        </>
      )}
    </section>
  );
}

export default function ArgumentExplorer() {
  const [rows, setRows] = useState<Question[]>([]),
    [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [search, setSearch] = useState(''),
    [topic, setTopic] = useState('');
  const [selected, setSelected] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const requestNumber = useRef(0);
  async function load(after: string | null = null) {
    const request = ++requestNumber.current;
    setBusy(true);
    setError('');
    try {
      const collected: Question[] = [];
      const cursors = new Set<string>();
      let cursor = after;
      // Small sequential pages; stop at 100 questions per user action.
      for (let i = 0; i < 4; i++) {
        const page = await argumentReader.discover(cursor);
        if (request !== requestNumber.current) return;
        collected.push(...(page.rows as Question[]));
        if (page.next && (page.next === cursor || cursors.has(page.next)))
          throw Error('The question list did not advance.');
        cursor = page.next;
        if (!cursor) break;
        cursors.add(cursor);
      }
      setRows((old) => [
        ...new Map(
          [...(after ? old : []), ...collected].map((r) => [r.id, r]),
        ).values(),
      ]);
      setNext(cursor);
    } catch (e) {
      if (request === requestNumber.current)
        setError(
          e instanceof Error ? e.message : 'Questions could not be loaded.',
        );
    } finally {
      if (request === requestNumber.current) setBusy(false);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      requestNumber.current++;
    };
  }, []);
  const topics = [
    ...new Map(rows.flatMap((r) => r.topics).map((t) => [t.id, t])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = rows
    .filter(
      (r) =>
        (!topic || r.topics.some((t) => t.id === topic)) &&
        terms.every((t) =>
          [r.name, r.description, ...r.topics.map((t) => t.name)]
            .join(' ')
            .toLowerCase()
            .includes(t),
        ),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="argument-explorer">
      <div className="page-heading">
        <div>
          <div className="eyebrow">EDUCATION</div>
          <h1>Questions, arguments & evidence.</h1>
          <p>Explore a position and the claims that support or challenge it.</p>
        </div>
      </div>
      <div className="argument-toolbar">
        <label>
          Search questions
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="A topic, author or question…"
          />
        </label>
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={busy}
          onClick={() => {
            argumentReader.clear();
            setRevision((r) => r + 1);
            void load();
          }}
        >
          Refresh
        </button>
      </div>
      {error && (
        <p role="alert">
          {error}{' '}
          <button disabled={busy} onClick={() => void load(next)}>
            Try again
          </button>
        </p>
      )}
      {busy && <p role="status">Loading questions…</p>}
      <div className="argument-workspace">
        <section aria-label="Questions">
          <h2 ref={heading} tabIndex={-1}>
            {visible.length} questions
          </h2>
          <ul className="argument-questions">
            {visible.map((r) => (
              <li key={r.id}>
                <button
                  aria-pressed={selected === r.id}
                  onClick={() => setSelected(r.id)}
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
          {!busy && !error && !visible.length && (
            <p>
              No matching questions.
              {next
                ? ' Load more questions or change the filters.'
                : ' Try another topic or search.'}
            </p>
          )}
          {next && (
            <button disabled={busy} onClick={() => void load(next)}>
              Load more questions
            </button>
          )}
        </section>
        <div>
          {selected ? (
            <>
              <button
                className="argument-back"
                onClick={() => {
                  setSelected(null);
                  heading.current?.focus();
                }}
              >
                ← Back to questions
              </button>
              <Arguments key={`${selected}:${revision}`} id={selected} />
            </>
          ) : (
            <p className="argument-placeholder">
              Choose a question to explore its arguments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
