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
export default function GraphWorkbench({ graph }: { graph: GraphData }) {
  const { value } = usePreferences();
  const [focus, setFocus] = useState(graph.nodes[0]?.id || ''),
    [neighborhood, setNeighborhood] = useState(true),
    [relation, setRelation] = useState(''),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState(''),
    [open, setOpen] = useState(false),
    [fullError, setFullError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null),
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
      if (document.fullscreenElement === dialog.current)
        void document.exitFullscreen().catch(() => {});
      dialog.current.close();
      opener.current?.focus();
    }
  }, [open]);
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
            href={`https://www.geobrowser.io/space/${node.space}/${node.id}`}
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
        <button ref={opener} onClick={() => setOpen(true)}>
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
          <>
            <div className="graph-dialog-heading">
              <h2 id="force-title">Explore the network</h2>
              <button
                onClick={async () => {
                  try {
                    if (document.fullscreenElement)
                      await document.exitFullscreen();
                    else await dialog.current?.requestFullscreen();
                  } catch {
                    setFullError(
                      'Fullscreen is unavailable. The expanded explorer is still usable.',
                    );
                  }
                }}
              >
                Fullscreen
              </button>
              <button onClick={() => setOpen(false)}>Close explorer</button>
            </div>
            {fullError && <p role="status">{fullError}</p>}
            {controls('')}
            <p>
              {visible.nodes.length} nodes · {visible.edges.length}{' '}
              relationships{visible.partial ? ' · Partial network' : ''}
            </p>
            <GraphErrorBoundary>
              <Suspense
                fallback={<p role="status">Loading interactive explorer…</p>}
              >
                <ForceApplet graph={visible} onSelect={setSelected} />
              </Suspense>
            </GraphErrorBoundary>
            {details}
            {list}
          </>
        )}
      </dialog>
    </section>
  );
}
