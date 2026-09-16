import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import GraphErrorBoundary from './GraphErrorBoundary';
import FlowView from './FlowView';
import { filterGraph, exportGraph } from './model.mjs';
import { usePreferences } from '../preferences/Preferences';
import type { GraphData } from './types';
import './graph.css';
const ForceApplet = lazy(() => import('./ForceApplet'));
function save(text: string, format: string) {
  const url = URL.createObjectURL(
    new Blob([text], {
      type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `geo-relationships.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function GraphWorkbench({
  graph,
  initialFocus = '',
}: {
  graph: GraphData;
  initialFocus?: string;
}) {
  const { value } = usePreferences();
  const [focus, setFocus] = useState(
      graph.nodes.some((n) => n.id === initialFocus)
        ? initialFocus
        : graph.nodes[0]?.id || '',
    ),
    [neighborhood, setNeighborhood] = useState(true),
    [relation, setRelation] = useState(''),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState(''),
    [open, setOpen] = useState(false),
    [drawer, setDrawer] = useState(false),
    [fullError, setFullError] = useState(''),
    [fullscreen, setFullscreen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    fullTarget = useRef<HTMLDivElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  const filters = useMemo(
    () => ({ focus, neighborhood, relation, search }),
    [focus, neighborhood, relation, search],
  );
  const visible = useMemo(
    () => filterGraph(graph, filters) as GraphData,
    [graph, filters],
  );
  useEffect(() => {
    if (!value.forceGraph) setOpen(false);
  }, [value.forceGraph]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      if (document.fullscreenElement === fullTarget.current)
        void document.exitFullscreen().catch(() => {});
      dialog.current.close();
      opener.current?.focus();
    }
  }, [open]);
  useEffect(() => {
    const change = () => {
      setFullscreen(document.fullscreenElement === fullTarget.current);
      setFullError('');
    };
    document.addEventListener('fullscreenchange', change);
    return () => {
      document.removeEventListener('fullscreenchange', change);
      if (
        document.fullscreenElement === fullTarget.current &&
        document.fullscreenElement
      )
        void document.exitFullscreen().catch(() => {});
    };
  }, []);
  const node = visible.nodes.find((n) => n.id === selected);
  const kinds = [
    ...new Map(graph.edges.map((e) => [e.type, e.label])).entries(),
  ];
  const controls = (suffix: string) => (
    <div className="graph-tools">
      <label>
        Focus{' '}
        <select
          value={focus}
          onChange={(e) => {
            setFocus(e.target.value);
            setSelected(e.target.value);
          }}
        >
          {graph.nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label.slice(0, 90)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Relationship{' '}
        <select value={relation} onChange={(e) => setRelation(e.target.value)}>
          <option value="">All relationships</option>
          {kinds.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Find nodes{' '}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter names…"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={neighborhood}
          onChange={(e) => setNeighborhood(e.target.checked)}
        />{' '}
        Focus and neighbors
      </label>
      <button
        onClick={() => {
          setSearch('');
          setRelation('');
          setNeighborhood(false);
        }}
      >
        Show loaded network
      </button>
      <button
        onClick={() => save(exportGraph(visible, 'json', filters), 'json')}
      >
        Export JSON{suffix}
      </button>
      <button onClick={() => save(exportGraph(visible, 'csv', filters), 'csv')}>
        Export CSV{suffix}
      </button>
    </div>
  );
  const details = (
    <div className="graph-inspector" aria-live="polite">
      {node ? (
        <>
          <strong>{node.label}</strong>{' '}
          <button
            onClick={() => {
              setFocus(node.id);
              setNeighborhood(true);
            }}
          >
            Isolate connections
          </button>{' '}
          <a
            href={
              node.geoUrl ||
              `https://www.geobrowser.io/space/${node.space}/${node.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on Geo ↗
          </a>
        </>
      ) : (
        <span>Select a node to inspect its connections.</span>
      )}
    </div>
  );
  const list = (
    <details className="graph-list">
      <summary>Relationships ({visible.edges.length})</summary>
      <ul>
        {visible.edges.map((e) => (
          <li key={e.id}>
            <button onClick={() => setSelected(e.source)}>
              {visible.nodes.find((n) => n.id === e.source)?.label}
            </button>
            <span> → {e.label} → </span>
            <button onClick={() => setSelected(e.target)}>
              {visible.nodes.find((n) => n.id === e.target)?.label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
  return (
    <section className="graph-workbench" aria-label="Relationship explorer">
      {controls('')}
      <p>
        {visible.nodes.length} nodes · {visible.edges.length} relationships
        {visible.partial ? ' · Partial network' : ''}
      </p>
      {visible.nodes.length ? (
        <FlowView graph={visible} onSelect={setSelected} />
      ) : (
        <p>No nodes match these filters.</p>
      )}
      {details}
      {list}
      {value.forceGraph ? (
        <button
          ref={opener}
          onClick={() => {
            setNeighborhood(false);
            setSearch('');
            setRelation('');
            setOpen(true);
          }}
        >
          Open force-graph explorer ↗
        </button>
      ) : (
        <a href="#/preferences">Enable force-graph explorer in Preferences</a>
      )}
      <dialog
        ref={dialog}
        className="graph-dialog"
        aria-labelledby="force-title"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        {open && value.forceGraph && (
          <div ref={fullTarget} className="graph-fullscreen-content">
            <div className="graph-dialog-heading">
              <h2 id="force-title">Network explorer</h2>
              <span className="force-count">
                {visible.nodes.length} nodes · {visible.edges.length} links
                {visible.partial ? ' · Partial' : ''}
              </span>
              <button
                aria-expanded={drawer}
                onClick={() => setDrawer((v) => !v)}
              >
                Filters & data
              </button>
              <button
                onClick={async () => {
                  try {
                    setFullError('');
                    if (document.fullscreenElement === fullTarget.current)
                      await document.exitFullscreen();
                    else await fullTarget.current?.requestFullscreen();
                  } catch {
                    setFullError(
                      'Fullscreen is unavailable. The expanded explorer is still usable.',
                    );
                  }
                }}
              >
                {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
              <button onClick={() => setOpen(false)}>Close explorer</button>
            </div>
            {fullError && (
              <p className="force-fullscreen-notice" role="status">
                {fullError}
              </p>
            )}
            {drawer && (
              <aside
                className="force-data-drawer"
                aria-label="Network filters and data"
              >
                {controls('')}
                {details}
                {list}
              </aside>
            )}
            <GraphErrorBoundary>
              <Suspense
                fallback={<p role="status">Loading interactive explorer…</p>}
              >
                <ForceApplet graph={visible} onSelect={setSelected} />
              </Suspense>
            </GraphErrorBoundary>
          </div>
        )}
      </dialog>
    </section>
  );
}
