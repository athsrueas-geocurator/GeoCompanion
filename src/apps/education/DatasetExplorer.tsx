import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import {
  datasetCatalog,
  datasetBlocks,
  resultRows,
  field,
  estimate,
  F,
} from './dataset-data.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { EDUCATION_SPACE } from '../../config/geo.mjs';
import { safeUrl } from './data.mjs';
import './live-atlas.css';
import './dataset-explorer.css';
import CollectionPlot from './CollectionPlot';
import useRevalidation from '../../shared/geo/useRevalidation';
type RecordRow = {
  id: string;
  name: string;
  description: string;
  fields: {
    id: string;
    name: string;
    value: string | number | boolean;
    numeric: boolean;
  }[];
  relations: {
    id: string;
    typeId: string;
    toEntityId: string;
    type: { name: string };
    toEntity: { id: string; name: string; spaceIds: string[] } | null;
  }[];
  unavailable: boolean;
};
type Summary = { id: string; name: string; description: string };
function Link({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a
      href={`https://www.geobrowser.io/space/${EDUCATION_SPACE}/${id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} ↗
    </a>
  );
}
function Text({ value }: { value: unknown }) {
  return typeof value === 'string' ? (
    <Markdown
      skipHtml
      components={{
        a: ({ href, children }) =>
          safeUrl(href) ? (
            <a href={safeUrl(href)!} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            <>{children}</>
          ),
        img: ({ src, alt }) =>
          safeUrl(src) ? (
            <a href={safeUrl(src)!} target="_blank" rel="noopener noreferrer">
              {alt || 'Open image'}
            </a>
          ) : null,
      }}
    >
      {value}
    </Markdown>
  ) : null;
}
function Result({ row }: { row: RecordRow }) {
  const e = estimate(row);
  return (
    <article className="result-record">
      <h3>
        <Link id={row.id}>{row.name}</Link>
      </h3>
      {row.description && <p>{row.description}</p>}
      {row.unavailable ? (
        <p>Some fields could not be read. Open the entry to review it.</p>
      ) : (
        <>
          {e && (
            <p className="result-estimate">
              <strong>
                {e.value.toLocaleString(undefined, {
                  maximumSignificantDigits: 6,
                })}
              </strong>{' '}
              {e.unit}{' '}
              <span>
                SE{' '}
                {e.se.toLocaleString(undefined, {
                  maximumSignificantDigits: 4,
                })}
              </span>
            </p>
          )}
          <details>
            <summary>Details & sources</summary>
            <dl>
              {row.fields
                .filter(
                  (f) => ![F.name, F.description, F.markdown].includes(f.id),
                )
                .map((f) => (
                  <div key={f.id}>
                    <dt>{f.name}</dt>
                    <dd>{String(f.value)}</dd>
                  </div>
                ))}
            </dl>
            <Text value={field(row, F.markdown)} />
            <ul>
              {row.relations
                .filter((r) => r.typeId !== '8f151ba4de204e3c9cb499ddf96f48f1')
                .map((r) => {
                  const spaces = r.toEntity?.spaceIds || [];
                  const contexts = spaces.includes(EDUCATION_SPACE)
                    ? [EDUCATION_SPACE]
                    : spaces;
                  return (
                    <li key={r.id}>
                      {r.type.name}:{' '}
                      {contexts.length === 1 ? (
                        <a
                          href={`https://www.geobrowser.io/space/${contexts[0]}/${r.toEntityId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {r.toEntity?.name || 'Open reference'} ↗
                        </a>
                      ) : (
                        <span>{r.toEntity?.name || 'Reference'}</span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </details>
        </>
      )}
    </article>
  );
}
function Collection({ block }: { block: RecordRow }) {
  const [rows, setRows] = useState<RecordRow[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [facet, setFacet] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    setRows([]);
    setBusy(true);
    setError('');
    resultRows(block.id)
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
  }, [block.id, retry]);
  const facets = [
    ...new Map(
      rows
        .flatMap((r) =>
          r.relations.filter((e) =>
            [F.grade, F.arm, F.comparison].includes(e.typeId),
          ),
        )
        .map((e) => [e.toEntityId, e]),
    ).values(),
  ];
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = rows.filter(
    (r) =>
      (!facet || r.relations.some((e) => e.toEntityId === facet)) &&
      terms.every((t) =>
        `${r.name} ${r.description}`.toLowerCase().includes(t),
      ),
  );
  return (
    <section>
      <h2>{block.name}</h2>
      {block.description && <p>{block.description}</p>}
      <Text value={field(block, F.markdown)} />
      {busy && <p role="status">Loading results…</p>}
      {error && (
        <p role="alert">
          {error}{' '}
          <button onClick={() => setRetry((r) => r + 1)}>Try again</button>
        </p>
      )}
      {rows.length > 0 && (
        <>
          <div className="atlas-controls">
            <label className="atlas-search">
              Search results
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {facets.length > 0 && (
              <label>
                Filter
                <select
                  value={facet}
                  onChange={(e) => setFacet(e.target.value)}
                >
                  <option value="">All results</option>
                  {facets.map((f) => (
                    <option key={f.toEntityId} value={f.toEntityId}>
                      {f.toEntity?.name || 'Unnamed dimension'}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <p>{visible.length} results</p>
          <CollectionPlot rows={visible} />
          {visible.map((r) => (
            <Result key={r.id} row={r} />
          ))}
        </>
      )}
      {!busy && !error && !rows.length && (
        <p>No collection results available.</p>
      )}
    </section>
  );
}
function Dataset({ id, tick }: { id: string; tick: number }) {
  const [blocks, setBlocks] = useState<RecordRow[]>([]),
    [selected, setSelected] = useState(''),
    [busy, setBusy] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setBusy(true);
    setError('');
    setBlocks([]);
    datasetBlocks(id)
      .then((b) => {
        if (!current) return;
        setBlocks(b);
        setSelected((old) =>
          b.some((x) => x.id === old)
            ? old
            : b.find((x) => !field(x, F.markdown))?.id || '',
        );
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
  }, [id, tick]);
  const tables = blocks.filter((b) => !field(b, F.markdown)),
    notes = blocks.filter((b) => field(b, F.markdown));
  return (
    <>
      {busy && <p role="status">Loading dataset…</p>}
      {error && <p role="alert">{error}</p>}
      {notes.length > 0 && (
        <details className="dataset-notes">
          <summary>Methods & interpretation</summary>
          {notes.map((n) => (
            <Text key={n.id} value={field(n, F.markdown)} />
          ))}
        </details>
      )}
      {tables.length > 0 && (
        <label className="dataset-table-select">
          Results collection
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {tables.map((b) => (
              <option value={b.id} key={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {tables.find((b) => b.id === selected) && (
        <Collection
          key={`${selected}-${tick}`}
          block={tables.find((b) => b.id === selected)!}
        />
      )}{' '}
      {!busy && !error && !blocks.length && (
        <p>No readable content blocks are linked to this dataset.</p>
      )}
    </>
  );
}
export default function DatasetExplorer() {
  const [rows, setRows] = useState<Summary[]>([]),
    [selected, setSelected] = useState(''),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [tick, setTick] = useState(0);
  useRevalidation(() => setTick((t) => t + 1));
  useEffect(() => {
    let current = true;
    setBusy(true);
    setError('');
    datasetCatalog()
      .then((p) => {
        if (!current) return;
        setRows(p.rows);
        setSelected((id) =>
          p.rows.some((r: Summary) => r.id === id) ? id : p.rows[0]?.id || '',
        );
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
  }, [tick]);
  const chosen = rows.find((r) => r.id === selected);
  return (
    <div className="live-atlas dataset-explorer">
      <div className="page-heading">
        <div>
          <h1>Education dashboards</h1>
          <p>Explore datasets and their results.</p>
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
      {busy && <p role="status">Loading datasets…</p>}
      {error && <p role="alert">{error}</p>}
      <label className="dataset-table-select">
        Dataset
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {rows.map((r) => (
            <option value={r.id} key={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      {chosen && (
        <>
          <h2>{chosen.name}</h2>
          {chosen.description && <p>{chosen.description}</p>}
          <p>
            <Link id={chosen.id}>Open dataset</Link>
          </p>
          <Dataset key={chosen.id} id={chosen.id} tick={tick} />
        </>
      )}
    </div>
  );
}
