import { useEffect, useRef, useState } from 'react';
import Brand from '../../shared/branding/Brand';
import { PreferencesLink } from '../../shared/preferences/Preferences';
import GraphWorkbench from '../../shared/graph/GraphWorkbench';
import type { GraphData } from '../../shared/graph/types';
import { readGraph } from './graph-data.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { EDUCATION_SPACE, OUTREACH_SPACE } from '../../config/geo.mjs';
export default function GraphApp({ app }: { app: string }) {
  const [scope, setScope] = useState(''),
    [input, setInput] = useState(''),
    [graph, setGraph] = useState<GraphData | null>(null),
    [next, setNext] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0);
  const generation = useRef(0),
    lock = useRef(false),
    cursors = useRef(new Set<string>());
  const people = app === 'people';
  async function load(after: string | null = null) {
    if (lock.current) return;
    lock.current = true;
    const epoch = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const page = await readGraph(scope, app, after);
      if (epoch !== generation.current) return;
      if (page.next && (page.next === after || cursors.current.has(page.next)))
        throw Error('The relationship list did not advance.');
      if (page.next) cursors.current.add(page.next);
      setGraph((old) => ({
        scope,
        partial: page.partial,
        nodes: [
          ...new Map(
            [...(after ? old?.nodes || [] : []), ...page.nodes].map((n) => [
              n.id,
              n,
            ]),
          ).values(),
        ],
        edges: [
          ...new Map(
            [...(after ? old?.edges || [] : []), ...page.edges].map((e) => [
              e.id,
              e,
            ]),
          ).values(),
        ],
      }));
      setNext(page.next);
    } catch (e) {
      if (epoch === generation.current)
        setError(
          e instanceof Error ? e.message : 'Could not load relationships.',
        );
    } finally {
      if (epoch === generation.current) {
        setBusy(false);
        lock.current = false;
      }
    }
  }
  useEffect(() => {
    generation.current++;
    lock.current = false;
    cursors.current.clear();
    setGraph(null);
    setNext(null);
    if (scope) void load();
    return () => {
      generation.current++;
      lock.current = false;
    };
  }, [scope, app, revision]);
  return (
    <main className="graph-app">
      <header>
        <Brand />
        <div className="header-actions">
          <PreferencesLink />
          <a href="#/">All apps</a>
        </div>
      </header>
      <div className="eyebrow">
        {people ? 'PEOPLE & CONTRIBUTIONS' : 'RESEARCH DEBATES'}
      </div>
      <h1>{people ? 'People behind the work.' : 'Follow the argument.'}</h1>
      <p>
        {people
          ? 'Explore published authorship connections.'
          : 'Isolate claims, supporting and opposing arguments, and their sources.'}
      </p>
      <div className="graph-tools">
        <button
          onClick={() => {
            setInput(EDUCATION_SPACE);
            setScope(EDUCATION_SPACE);
          }}
        >
          Explore education
        </button>
        <button
          onClick={() => {
            setInput(OUTREACH_SPACE);
            setScope(OUTREACH_SPACE);
          }}
        >
          Explore Indianapolis outreach
        </button>
      </div>
      <form
        className="graph-scope"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[a-f0-9]{32}$/i.test(input.trim())) {
            setError('Enter a 32-character Geo space ID.');
            return;
          }
          setScope(input.trim().toLowerCase());
        }}
      >
        <label>
          Geo space ID
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={32}
          />
        </label>
        <button>Explore space</button>
        <button
          type="button"
          disabled={busy || !scope}
          onClick={() => {
            geoReader.invalidate();
            setRevision((r) => r + 1);
          }}
        >
          Refresh
        </button>
      </form>
      {people && (
        <p className="muted">
          Authorship does not imply endorsement. Editing history and reputation
          are not shown.
        </p>
      )}
      {busy && <p role="status">Loading relationships…</p>}
      {error && (
        <p role="alert">
          {error}{' '}
          <button disabled={busy} onClick={() => void load(next)}>
            Retry
          </button>
        </p>
      )}
      {graph?.nodes.length ? (
        <GraphWorkbench key={`${app}:${scope}:${revision}`} graph={graph} />
      ) : scope && !busy && !error ? (
        <p>
          No supported {people ? 'authorship' : 'argument or source'}{' '}
          relationships found in this scope.
        </p>
      ) : null}
      {next && graph && graph.edges.length < 200 && (
        <button disabled={busy} onClick={() => void load(next)}>
          Load more relationships
        </button>
      )}
      {next && graph && graph.edges.length >= 200 && (
        <p>
          Showing a partial network. Choose a narrower space to explore further.
        </p>
      )}
    </main>
  );
}
