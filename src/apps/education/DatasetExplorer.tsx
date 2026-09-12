import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import {
  datasetCatalog,
  datasetBlocks,
  resultPage,
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
import GeoReference from '../../shared/geo/GeoReference';
import { resultFacets, selectedFacet } from './result-facets.mjs';
import { blockKind } from './block-capabilities.mjs';
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
type Summary = {
  id: string;
  name: string;
  description: string;
  unavailable?: boolean;
};
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
                .map((r) => (
                  <li key={r.id}>
                    {r.type.name}:{' '}
                    <GeoReference
                      id={r.toEntityId}
                      name={r.toEntity?.name || 'Open reference'}
                      spaces={r.toEntity?.spaceIds || []}
                      context={EDUCATION_SPACE}
                    />
                  </li>
                ))}
            </ul>
          </details>
        </>
      )}
    </article>
  );
}
function Collection({ block }: { block: RecordRow }) {
  const [page, setPage] = useState<
    Awaited<ReturnType<typeof resultPage>>['page'] | null
  >(null);
  const generation = useRef(0);
  const [rows, setRows] = useState<RecordRow[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [facet, setFacet] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const request = ++generation.current;
    setRows([]);
    setPage(null);
    setBusy(true);
    setError('');
    resultPage(block.id)
      .then((r) => {
        if (request === generation.current) {
          setRows(r.rows);
          setPage(r.page);
        }
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
  }, [block.id, retry]);
  async function more() {
    const request = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const r = await resultPage(block.id, page);
      if (request === generation.current) {
        setRows(r.rows);
        setPage(r.page);
      }
    } catch (e) {
      if (request === generation.current)
        setError(e instanceof Error ? e.message : 'Results unavailable.');
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }
  const facets = resultFacets(rows);
  const activeFacet = selectedFacet(facets, facet);
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = rows.filter(
    (r) =>
      (!activeFacet || activeFacet.members.includes(r.id)) &&
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
                  value={activeFacet?.key || ''}
                  onChange={(e) => setFacet(e.target.value)}
                >
                  <option value="">All results</option>
                  {facets.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.options.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.name} ({option.members.length})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            )}
          </div>
          <p>
            {visible.length} results{page?.next ? ' · More available' : ''}
          </p>
          {!page?.next && <CollectionPlot rows={visible} />}
          {visible.map((r) => (
            <Result key={r.id} row={r} />
          ))}
        </>
      )}
      {page?.next && (
        <button disabled={busy} onClick={() => void more()}>
          Load more results
        </button>
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
      .then((b: RecordRow[]) => {
        if (!current) return;
        setBlocks(b);
        setSelected((old) =>
          b.some((x) => x.id === old)
            ? old
            : b.find((x) => blockKind(x) === 'collection')?.id || '',
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
  const tables = blocks.filter((b) => blockKind(b) === 'collection'),
    notes = blocks.filter((b) => blockKind(b) === 'text'),
    other = blocks.filter((b) =>
      ['unsupported', 'unavailable'].includes(blockKind(b)),
    );
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
      {other.length > 0 && (
        <section aria-label="More dataset content">
          <h3>More content</h3>
          <ul>
            {other.map((b) => (
              <li key={b.id}>
                <Link id={b.id}>{b.name}</Link>
                {b.unavailable && <span> — Could not load this entry.</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
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
          {chosen.unavailable ? (
            <p role="alert">
              This linked dataset could not be read. Open it on Geo or try
              refreshing.
            </p>
          ) : (
            <Dataset key={chosen.id} id={chosen.id} tick={tick} />
          )}
        </>
      )}
    </div>
  );
}
