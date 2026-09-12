import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { parseReleases, hasNewRelease, RELEASE_SEEN_KEY } from './releases.mjs';
import Brand from '../branding/Brand';
import { version } from '../../../package.json';
type Release = {
  id: string;
  version: string;
  deployedAt: string;
  title: string;
  changes: string[];
};
type Seen = { deployedAt: string } | null;
const Context = createContext<{
  rows: Release[];
  error: string;
  busy: boolean;
  unread: boolean;
  markRead: () => void;
  refresh: () => void;
} | null>(null);
function storedSeen(): Seen {
  try {
    const v = JSON.parse(localStorage.getItem(RELEASE_SEEN_KEY) || 'null');
    return v && Number.isFinite(Date.parse(v.deployedAt)) ? v : null;
  } catch {
    return null;
  }
}
export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<Release[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true),
    [tick, setTick] = useState(0);
  const [seen, setSeen] = useState<Seen>(storedSeen);
  const seenRef = useRef(seen),
    lastFetch = useRef(0);
  function remember(value: Seen) {
    seenRef.current = value;
    setSeen(value);
    try {
      localStorage.setItem(RELEASE_SEEN_KEY, JSON.stringify(value));
    } catch {}
  }
  useEffect(() => {
    const c = new AbortController();
    setBusy(true);
    setError('');
    lastFetch.current = Date.now();
    fetch('/releases.json', {
      signal: AbortSignal.any([c.signal, AbortSignal.timeout(15000)]),
      cache: 'no-cache',
    })
      .then((r) => {
        if (!r.ok) throw Error('Release notes unavailable.');
        return r.json();
      })
      .then(parseReleases)
      .then((r: Release[]) => {
        if (c.signal.aborted) return;
        setRows(r);
        if (!seenRef.current && r[0]) remember({ deployedAt: r[0].deployedAt });
      })
      .catch(() => {
        if (!c.signal.aborted) setError('Could not load recent changes.');
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [tick]);
  useEffect(() => {
    const revisit = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastFetch.current > 120000
      )
        setTick((t) => t + 1);
    };
    const sync = (e: StorageEvent) => {
      if (e.key === RELEASE_SEEN_KEY || e.key === null) {
        const next = storedSeen();
        seenRef.current = next;
        setSeen(next);
      }
    };
    addEventListener('focus', revisit);
    document.addEventListener('visibilitychange', revisit);
    addEventListener('storage', sync);
    return () => {
      removeEventListener('focus', revisit);
      document.removeEventListener('visibilitychange', revisit);
      removeEventListener('storage', sync);
    };
  }, []);
  return (
    <Context.Provider
      value={{
        rows,
        error,
        busy,
        unread: hasNewRelease(rows[0], seen),
        markRead: () => {
          if (rows[0]) remember({ deployedAt: rows[0].deployedAt });
        },
        refresh: () => setTick((t) => t + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function ReleaseBubble() {
  const data = useContext(Context);
  return data?.unread ? (
    <span
      className="release-bubble"
      role="img"
      aria-label="New features available"
    />
  ) : null;
}
export function PreferencesNav({ tab = '' }: { tab?: string }) {
  return (
    <nav className="preferences-nav" aria-label="Preferences pages">
      <a href="#/preferences" aria-current={tab === '' ? 'page' : undefined}>
        Settings & follows
      </a>
      <a
        href="#/preferences/about"
        aria-current={tab === 'about' ? 'page' : undefined}
      >
        About
      </a>
      <a
        href="#/preferences/changes"
        aria-current={tab === 'changes' ? 'page' : undefined}
      >
        Recent changes <ReleaseBubble />
      </a>
    </nav>
  );
}
export default function PreferenceInfo({ tab }: { tab: string }) {
  const data = useContext(Context)!;
  const latest = data.rows[0]?.deployedAt;
  useEffect(() => {
    if (tab === 'changes' && latest) data.markRead();
  }, [tab, latest]);
  return (
    <>
      <header>
        <Brand />
        <a className="geo-link" href="#/">
          All apps
        </a>
      </header>
      <main className="preferences-page">
        <PreferencesNav tab={tab} />
        <h1>{tab === 'about' ? 'About Geo Companion' : 'Recent changes'}</h1>
        {tab === 'about' ? (
          <section className="pref-section">
            <p>
              Explore educational evidence, follow ideas and discover
              connections in Geo.
            </p>
            <p>
              Created by Thomas Freestone to make shared knowledge useful,
              efficient and accessible. Indianapolis outreach tools are also in
              development.
            </p>
            <p>Version {version}</p>
            <p>
              <a
                href="https://www.geobrowser.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore Geo ↗
              </a>{' '}
              ·{' '}
              <a
                href="https://github.com/athsrueas-geocurator/GeoCompanion"
                target="_blank"
                rel="noopener noreferrer"
              >
                Code & project guide ↗
              </a>
            </p>
          </section>
        ) : (
          <>
            {data.busy && <p role="status">Loading changes…</p>}
            {data.error && (
              <p role="alert">
                {data.error} <button onClick={data.refresh}>Try again</button>
              </p>
            )}
            {!data.busy && !data.error && !data.rows.length && (
              <p>No release notes yet.</p>
            )}
            {data.rows.map((r) => (
              <article className="pref-section release-note" key={r.id}>
                <p className="pref-help">
                  Version {r.version} · {r.id.slice(0, 8)}
                </p>
                <h2>{r.title}</h2>
                <time dateTime={r.deployedAt}>
                  {new Date(r.deployedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
                <ul>
                  {r.changes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </article>
            ))}
          </>
        )}
      </main>
    </>
  );
}
