import Brand from '../branding/Brand';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  PREFERENCES_KEY,
  emptyPreferences,
  readPreferences,
  writePreferences,
  addProfile,
  removeProfile,
} from './preference-storage.mjs';
import { searchProfiles, resolveProfiles } from './profile-search.mjs';
import './preferences.css';
type Profile = { id: string; name: string; pageId: string };
type Preferences = {
  version: number;
  textSize: string;
  imageLoading: string;
  profiles: string[];
  defaultProfileId: string | null;
};
type Store = {
  value: Preferences;
  error: string;
  update: (fn: (p: Preferences) => Preferences) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export function usePreferences() {
  return useContext(Context)!;
}
function load() {
  try {
    return readPreferences(localStorage);
  } catch {
    return {
      value: emptyPreferences(),
      error:
        'Saved preferences is unavailable. Preferences will last for this tab only.',
    };
  }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [value, setValue] = useState<Preferences>(initial.value);
  const [error, setError] = useState(initial.error);
  const current = useRef(value);
  const update = (fn: (p: Preferences) => Preferences) => {
    const next = fn(current.current);
    current.current = next;
    setValue(next);
    try {
      setError(writePreferences(localStorage, next));
    } catch {
      setError(
        'Saved preferences is unavailable. Changes will last for this tab only.',
      );
    }
  };
  const clear = () => {
    const next = emptyPreferences();
    current.current = next;
    setValue(next);
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      setError('');
    } catch {
      setError(
        'This tab was cleared, but saved preferences could not be removed from browser storage.',
      );
    }
  };
  useEffect(() => {
    document.documentElement.style.fontSize =
      value.textSize === 'large' ? '112.5%' : '';
  }, [value.textSize]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== PREFERENCES_KEY && e.key !== null) return;
      const next = load();
      current.current = next.value;
      setValue(next.value);
      setError(next.error);
    };
    addEventListener('storage', sync);
    return () => removeEventListener('storage', sync);
  }, []);
  return (
    <Context.Provider value={{ value, error, update, clear }}>
      {children}
    </Context.Provider>
  );
}
export function PreferencesLink() {
  return (
    <a className="geo-link" href="#/preferences">
      Preferences & follows
    </a>
  );
}
function useProfiles(ids: string[]) {
  const [rows, setRows] = useState<Profile[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  const key = ids.join(',');
  useEffect(() => {
    const c = new AbortController();
    setRows([]);
    setError('');
    if (!ids.length) {
      setBusy(false);
      return;
    }
    setBusy(true);
    resolveProfiles(ids, c.signal)
      .then((r) => {
        if (!c.signal.aborted) setRows(r);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [key, attempt]);
  return { rows, error, busy, retry: () => setAttempt((a) => a + 1) };
}
export function FollowedProfiles() {
  const { value } = usePreferences();
  const { rows, error, busy, retry } = useProfiles(value.profiles);
  return (
    <section className="followed">
      <h2>Your followed profiles</h2>
      {busy && <p role="status">Loading profiles…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={retry}>Try again</button>
        </p>
      )}
      <ul>
        {value.profiles.map((id) => (
          <li key={id}>
            <a
              href={`https://www.geobrowser.io/space/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {rows.find((p) => p.id === id)?.name ??
                `Profile ${id.slice(0, 8)}…`}{' '}
              ↗
            </a>
            {value.defaultProfileId === id && (
              <span className="pref-tag">Default</span>
            )}
          </li>
        ))}
      </ul>
      {!value.profiles.length && <p>No profiles followed yet.</p>}
      <a href="#/preferences">Manage follows</a>
    </section>
  );
}
export default function PreferencesPage() {
  const { value, error, update, clear } = usePreferences();
  const saved = useProfiles(value.profiles);
  const [input, setInput] = useState(''),
    [rows, setRows] = useState<Profile[]>([]),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [issue, setIssue] = useState(''),
    [hint, setHint] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setRows([]);
    setIssue('');
    setHint('');
    setMore(false);
    const term = input.trim();
    if (term.length < 2) {
      setBusy(false);
      return () => c.abort();
    }
    setBusy(true);
    const timer = setTimeout(() => {
      searchProfiles(term, c.signal)
        .then((r) => {
          if (!c.signal.aborted) {
            setRows(r.rows);
            setMore(r.more);
            setHint(r.hint ?? '');
          }
        })
        .catch((e) => {
          if (!c.signal.aborted) setIssue(e.message);
        })
        .finally(() => {
          if (!c.signal.aborted) setBusy(false);
        });
    }, 500);
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [input, attempt]);
  const name = (id: string) =>
    saved.rows.find((p) => p.id === id)?.name ?? `Profile ${id.slice(0, 8)}…`;
  return (
    <>
      <header>
        <Brand />
        <a className="geo-link" href="#/">
          All apps
        </a>
      </header>
      <main className="preferences-page">
        <h1>Preferences & follows</h1>
        <p className="app-intro">
          Manage your reading preferences and followed profiles.
        </p>
        {error && (
          <p role="alert" className="pref-warning">
            {error}
          </p>
        )}
        <section className="pref-section">
          <h2>Reading preferences</h2>
          <label>
            Text size
            <select
              value={value.textSize}
              onChange={(e) =>
                update((p) => ({ ...p, textSize: e.target.value }))
              }
            >
              <option value="standard">Standard</option>
              <option value="large">Larger</option>
            </select>
          </label>
          <label>
            Content images
            <select
              aria-describedby="image-loading-help"
              value={value.imageLoading}
              onChange={(e) =>
                update((p) => ({ ...p, imageLoading: e.target.value }))
              }
            >
              <option value="automatic">Load automatically</option>
              <option value="ask">Only when I choose</option>
            </select>
          </label>
          <p id="image-loading-help">
            Choose “Only when I choose” to save data. Each image will have a
            Show image button.
          </p>
        </section>
        <section className="pref-section">
          <h2>Search for a Geo user</h2>
          <label>
            Name, profile URL or complete space ID
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              placeholder="Start typing a name…"
              autoComplete="off"
            />
          </label>
          <div role="status">
            {busy
              ? 'Searching…'
              : hint ||
                (!input.trim()
                  ? 'Enter at least two characters.'
                  : input.trim().length < 2
                    ? 'Keep typing…'
                    : !rows.length && !issue
                      ? 'No matching personal profiles found.'
                      : '')}
          </div>
          {issue && (
            <p role="alert" className="pref-warning">
              {issue}{' '}
              <button onClick={() => setAttempt((a) => a + 1)}>
                Retry search
              </button>
            </p>
          )}
          <ul className="profile-list">
            {rows.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.id}</small>
                  <a
                    href={`https://www.geobrowser.io/space/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Geo ↗
                  </a>
                </div>
                <button
                  disabled={value.profiles.includes(p.id)}
                  onClick={() => {
                    try {
                      update((v) => addProfile(v, p.id));
                      setMessage(`Following ${p.name}.`);
                    } catch (e) {
                      setIssue((e as Error).message);
                    }
                  }}
                >
                  {value.profiles.includes(p.id) ? 'Following' : 'Follow'}
                </button>
              </li>
            ))}
          </ul>
          {more && (
            <p>
              Showing a limited set of matches. Type a more specific name to
              narrow the search.
            </p>
          )}
          <p role="status">{message}</p>
        </section>
        <section className="pref-section">
          <h2>Followed profiles · {value.profiles.length}</h2>
          {saved.busy && <p role="status">Loading profiles…</p>}
          {saved.error && (
            <p role="alert">
              {saved.error}{' '}
              <button onClick={saved.retry}>Retry profiles</button>
            </p>
          )}
          {!value.profiles.length ? (
            <p>No profiles followed yet.</p>
          ) : (
            <>
              <label>
                Default profile
                <select
                  value={value.defaultProfileId ?? ''}
                  onChange={(e) =>
                    update((p) => ({
                      ...p,
                      defaultProfileId: e.target.value || null,
                    }))
                  }
                >
                  <option value="">No default</option>
                  {value.profiles.map((id) => (
                    <option key={id} value={id}>
                      {name(id)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="pref-help">
                Marks your preferred profile in Curation. It does not replace
                the site editor’s collection.
              </p>
              <ul className="profile-list">
                {value.profiles.map((id) => (
                  <li key={id}>
                    <div>
                      <a
                        href={`https://www.geobrowser.io/space/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {name(id)} ↗
                      </a>
                      <small>{id}</small>
                      {!saved.busy &&
                        !saved.error &&
                        !saved.rows.some((p) => p.id === id) && (
                          <span>Profile currently unavailable.</span>
                        )}
                    </div>
                    <button
                      aria-label={`Remove ${name(id)}`}
                      onClick={() => {
                        update((v) => removeProfile(v, id));
                        setMessage('Profile removed.');
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="pref-section">
          <h2>Saved preferences</h2>
          <p>Preferences are saved on this device.</p>
          <button
            onClick={() => {
              clear();
              setMessage('Preferences and follows cleared.');
              setIssue('');
            }}
          >
            Clear preferences and follows
          </button>
          <p className="pref-help">
            Existing education drafts are left intact.
          </p>
        </section>
      </main>
    </>
  );
}
