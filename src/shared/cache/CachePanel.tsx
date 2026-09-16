import { geoReader } from '../geo/client.mjs';
import { useEffect, useState, useRef } from 'react';
import {
  cacheEnabled,
  CACHE_SETTING,
  clearLocalCache,
} from '../geo/local-cache.mjs';
import './cache.css';
let opener: (() => void) | undefined;
export function CacheButton() {
  return <button onClick={() => opener?.()}>Cache data from Geo</button>;
}
export default function CachePanel() {
  const [open, setOpen] = useState(false),
    [enabled, setEnabled] = useState(cacheEnabled),
    [job, setJob] = useState<any>(null),
    [state, setState] = useState<any>(null),
    [error, setError] = useState(''),
    [starting, setStarting] = useState(false);
  const running = useRef(false),
    currentJob = useRef<any>(null),
    lastStart = useRef(0);
  useEffect(() => {
    opener = () => setOpen(true);
    return () => {
      opener = undefined;
    };
  }, []);
  async function toggle(next: boolean) {
    try {
      localStorage.setItem(CACHE_SETTING, String(next));
      setEnabled(next);
      if (!next) {
        currentJob.current?.stop();
      }
    } catch {
      setError('Could not update browser storage.');
    }
  }
  async function start() {
    if (!cacheEnabled() || running.current) return;
    running.current = true;
    lastStart.current = Date.now();
    geoReader.invalidate();
    setStarting(true);
    setError('');
    try {
      const { prepareJob } = await import('./warm.mjs');
      const j = await prepareJob(setState);
      currentJob.current = j;
      setJob(j);
      if (!cacheEnabled()) return;
      await j.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cache job failed.');
    } finally {
      running.current = false;
      setStarting(false);
    }
  }
  useEffect(() => {
    if (!enabled) return;
    void start();
    const revisit = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastStart.current >= 30 * 60 * 1000
      )
        void start();
    };
    document.addEventListener('visibilitychange', revisit);
    window.addEventListener('online', revisit);
    return () => {
      document.removeEventListener('visibilitychange', revisit);
      window.removeEventListener('online', revisit);
    };
  }, [enabled]);
  return (
    <>
      {!open && state && (
        <button className="cache-reopen" onClick={() => setOpen(true)}>
          {state.running ? 'Caching' : 'Cache results'} · {state.done}/
          {state.total}
        </button>
      )}
      {open && (
        <section
          className="cache-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Cache data from Geo"
        >
          <div className="cache-heading">
            <h2>Cache data from Geo</h2>
            <button onClick={() => setOpen(false)}>
              {state?.running ? 'Continue in background' : 'Close'}
            </button>
          </div>
          <label className="cache-option">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => void toggle(e.target.checked)}
            />{' '}
            Enable local data cache
          </label>
          <p>
            Keep data until you clear it. Update automatically when you revisit.
            Turning this off pauses updates and keeps saved data.
          </p>
          <p>
            Up to 16 MB; existing data is kept if storage fills. Your browser
            may remove site data. Images and map tiles are not downloaded.
          </p>
          <button
            disabled={!enabled || starting || state?.running}
            onClick={() => void start()}
          >
            {state ? 'Run again' : 'Start caching'}
          </button>
          {state?.running && <button onClick={() => job?.stop()}>Stop</button>}
          <button
            disabled={!!state?.running}
            onClick={() =>
              void clearLocalCache()
                .then(() => setError('Saved cache cleared.'))
                .catch(() => setError('Could not clear cache.'))
            }
          >
            Clear saved cache
          </button>
          {state && (
            <>
              <progress
                max={Math.max(1, state.total)}
                value={state.done}
                aria-label="Caching progress"
              />
              <p role="status">
                {state.label} · {state.done} / {state.total} tasks ·{' '}
                {state.entities} entity IDs discovered · {state.errors} errors
              </p>
              <details>
                <summary>Activity and queries</summary>
                <div className="cache-log">
                  {state.log.map((line: any, i: number) => (
                    <details key={i}>
                      <summary>{line.message}</summary>
                      {line.query && <pre>{line.query}</pre>}
                    </details>
                  ))}
                </div>
              </details>
            </>
          )}
          {error && <p role="status">{error}</p>}
        </section>
      )}
    </>
  );
}
