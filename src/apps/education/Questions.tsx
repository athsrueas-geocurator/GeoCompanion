import { useEffect, useRef, useState } from 'react';
import { loadQuestions, loadAnswers } from './question-data.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { EDUCATION_SPACE } from '../../config/geo.mjs';
import { safeUrl } from './data.mjs';
import './live-atlas.css';
type Entry = {
  id: string;
  name: string;
  description: string;
  url: string;
  unavailable: boolean;
};
function Answers({ id }: { id: string }) {
  const [rows, setRows] = useState<Entry[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true);
  useEffect(() => {
    let current = true;
    setBusy(true);
    setRows([]);
    setError('');
    loadAnswers(id)
      .then((r) => {
        if (current) setRows(r);
      })
      .catch((e) => {
        if (current) setError(e.message);
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [id]);
  return (
    <section>
      <h3>Answers</h3>
      {busy && <p role="status">Loading answers…</p>}
      {error && <p role="alert">{error}</p>}
      {!busy && !error && !rows.length && <p>No answers linked yet.</p>}
      {rows.map((r) => (
        <article key={r.id}>
          <h4>{r.name}</h4>
          {r.description && <p>{r.description}</p>}
          <a
            href={`https://www.geobrowser.io/space/${EDUCATION_SPACE}/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on Geo ↗
          </a>
        </article>
      ))}
    </section>
  );
}
export default function Questions() {
  const [rows, setRows] = useState<Entry[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState<string | null>(null),
    [tick, setTick] = useState(0);
  const generation = useRef(0),
    dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const request = ++generation.current;
    setBusy(true);
    setError('');
    loadQuestions()
      .then((result) => {
        if (request !== generation.current) return;
        setRows(result);
        setSelected((id) =>
          result.some((r) => r.id === id && !r.unavailable) ? id : null,
        );
      })
      .catch((e) => {
        if (request === generation.current) setError(e.message);
      })
      .finally(() => {
        if (request === generation.current) setBusy(false);
      });
    return () => {
      generation.current++;
    };
  }, [tick]);
  useEffect(() => {
    const focus = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', focus);
    return () => document.removeEventListener('visibilitychange', focus);
  }, []);
  const chosen = rows.find((r) => r.id === selected);
  useEffect(() => {
    if (chosen && !dialog.current?.open) dialog.current?.showModal();
  }, [chosen]);
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = rows.filter((r) =>
    terms.every((t) => `${r.name} ${r.description}`.toLowerCase().includes(t)),
  );
  function close() {
    dialog.current?.close();
    setSelected(null);
  }
  return (
    <div className="live-atlas">
      <div className="page-heading">
        <div>
          <h1>Questions & evidence</h1>
          <p>Explore questions about education.</p>
        </div>
        <button
          disabled={busy}
          onClick={() => {
            geoReader.invalidate();
            setTick((t) => t + 1);
          }}
        >
          Refresh
        </button>
      </div>
      <div className="atlas-controls">
        <label className="atlas-search">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a question"
          />
        </label>
      </div>
      {busy && <p role="status">Loading questions…</p>}
      {error && (
        <p role="alert">
          {error}{' '}
          <button onClick={() => setTick((t) => t + 1)}>Try again</button>
        </p>
      )}
      {!busy && !error && !visible.length && <p>No questions match.</p>}
      <p className="atlas-count">{visible.length} questions</p>
      <div className="atlas-grid">
        {visible.map((r) => (
          <article key={r.id}>
            <button
              className="atlas-title"
              disabled={r.unavailable}
              onClick={() => setSelected(r.id)}
            >
              {r.name}
            </button>
            {r.description && <p>{r.description}</p>}
            <a
              href={`https://www.geobrowser.io/space/${EDUCATION_SPACE}/${r.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on Geo ↗
            </a>
          </article>
        ))}
      </div>
      {chosen && (
        <dialog
          className="atlas-detail"
          ref={dialog}
          aria-label={chosen.name}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <button className="atlas-close" onClick={close}>
            Close details
          </button>
          <h2>{chosen.name}</h2>
          {chosen.description && <p>{chosen.description}</p>}
          {safeUrl(chosen.url) && (
            <p>
              <a
                href={safeUrl(chosen.url)!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Original collection ↗
              </a>
            </p>
          )}
          <Answers key={`${chosen.id}-${tick}`} id={chosen.id} />
        </dialog>
      )}
    </div>
  );
}
