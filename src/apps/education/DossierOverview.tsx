import { useState } from 'react';
import { loadDossier, facetCounts } from './dossier-data.mjs';
import { SPACE } from './atlas-live.mjs';
import './dossier.css';
import { geoReader } from '../../shared/geo/client.mjs';

export default function DossierOverview() {
  const [rows, setRows] = useState<Awaited<
    ReturnType<typeof loadDossier>
  > | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [kind, setKind] = useState('initiative'),
    [facet, setFacet] = useState('category'),
    [selected, setSelected] = useState('');
  async function load(refresh = false) {
    setBusy(true);
    setError('');
    try {
      if (refresh) geoReader.invalidate();
      setRows(await loadDossier());
      setSelected('');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Source records are unavailable.',
      );
    } finally {
      setBusy(false);
    }
  }
  const group = (rows || []).filter((r) => r.kind === kind);
  const counts = facetCounts(group, facet);
  const filtered = group.filter(
    (r) =>
      !selected ||
      (facet === 'category'
        ? r.category === selected
        : (facet === 'methods' ? r.methods : r.outcomes).includes(selected)),
  );
  return (
    <section
      className="dossier-overview"
      aria-label="Original dossier overview"
    >
      <h2>Explore the original collection</h2>
      {!rows && (
        <button disabled={busy} onClick={() => void load()}>
          {busy ? 'Loading overview…' : 'Show category and method charts'}
        </button>
      )}
      {error && (
        <p role="alert">
          {error}{' '}
          <button disabled={busy} onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      {rows && (
        <>
          <button disabled={busy} onClick={() => void load(true)}>
            {busy ? 'Refreshing overview…' : 'Refresh overview'}
          </button>
          <div className="atlas-controls">
            <label>
              Records
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setFacet('methods');
                  setSelected('');
                }}
              >
                <option value="initiative">Initiatives</option>
                <option value="source">Sources</option>
              </select>
            </label>
            <label>
              Group by
              <select
                value={facet}
                onChange={(e) => {
                  setFacet(e.target.value);
                  setSelected('');
                }}
              >
                {kind === 'initiative' && (
                  <option value="category">Original category</option>
                )}
                <option value="methods">Original method label</option>
                {kind === 'source' && (
                  <option value="outcomes">Outcome tags</option>
                )}
              </select>
            </label>
            {selected && (
              <button onClick={() => setSelected('')}>Clear selection</button>
            )}
          </div>
          <p>
            {group.length} records ·{' '}
            {new Set(group.flatMap((r) => r.subjects.map((s) => s.id))).size}{' '}
            distinct subjects
          </p>
          <div className="dossier-bars">
            {counts.map(([label, count]) => (
              <button
                key={label}
                aria-pressed={selected === label}
                onClick={() => setSelected(selected === label ? '' : label)}
              >
                <span>{label}</span>
                <strong>{count}</strong>
                <meter
                  min={0}
                  max={group.length || 1}
                  value={count}
                  aria-label={`${label}: ${count} records`}
                />
              </button>
            ))}
          </div>
          {!counts.length && <p>No labels are available for this grouping.</p>}
          <details>
            <summary>
              Records {selected ? `— ${selected}` : ''} ({filtered.length})
            </summary>
            <ul>
              {filtered.map((r) => (
                <li key={r.id}>
                  <a
                    href={`https://www.geobrowser.io/space/${SPACE}/${r.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.key || 'Source record'}
                  </a>{' '}
                  —{' '}
                  {r.subjects.map((s) => s.name).join('; ') ||
                    'Subject not linked'}
                  {r.period && ` · ${r.period}`}
                </li>
              ))}
            </ul>
          </details>
          <details>
            <summary>How to read these charts</summary>
            <p>
              Labels describe the original Education Initiatives dossier. They
              are not independent study-quality judgments. A source may have
              multiple historical records or tags; counts are records, not
              independent trials. Unlabeled records stay in the total.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
