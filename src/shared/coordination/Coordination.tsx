import { useEffect, useRef, useState } from 'react';
import { selection, events } from './protocol.mjs';
import './coordination.css';
type Selection = { route: string; entity?: string; space?: string };
const consentKey = 'geocompanion.usage-consent.v1';
export function selectForSharing(entity: string, space: string) {
  window.dispatchEvent(
    new CustomEvent('companion-selection', { detail: { entity, space } }),
  );
}
export default function Coordination() {
  const [open, setOpen] = useState(false),
    [endpoint, setEndpoint] = useState(''),
    [status, setStatus] = useState(''),
    [room, setRoom] = useState(''),
    [connected, setConnected] = useState(false),
    [people, setPeople] = useState(0),
    [incoming, setIncoming] = useState<Selection | null>(null),
    [invite, setInvite] = useState(''),
    [insights, setInsights] = useState<
      { route: string; action: string; events: number }[]
    >([]);
  const [consent, setConsent] = useState(() => {
    try {
      return localStorage.getItem(consentKey) === 'yes';
    } catch {
      return false;
    }
  });
  const socket = useRef<WebSocket | null>(null),
    chosen = useRef<{ entity: string; space: string } | null>(null),
    queue = useRef<{ route: string; action: string }[]>([]),
    enabled = useRef(consent),
    api = useRef(''),
    lastSent = useRef(0);
  function route() {
    return location.hash.replace(/^#\/?/, '').split('?')[0];
  }
  useEffect(() => {
    fetch('/coordination.json')
      .then((r) => r.json())
      .then((v) => {
        if (
          typeof v.endpoint === 'string' &&
          (/^https:\/\/[a-z0-9.-]+$/.test(v.endpoint) ||
            v.endpoint === 'http://127.0.0.1:8787')
        ) {
          api.current = v.endpoint;
          setEndpoint(v.endpoint);
        }
      })
      .catch(() => {});
    function record(action: string) {
      const event = { route: route(), action };
      if (enabled.current && events([event]))
        queue.current = [...queue.current, event].slice(-20);
    }
    function navigate() {
      chosen.current = null;
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      const entity = params.get('entity'),
        space = params.get('space');
      if (entity && space && selection({ route: route(), entity, space }))
        chosen.current = { entity, space };
      record('view');
      const id = new URLSearchParams(location.hash.split('?')[1] || '').get(
        'room',
      );
      if (id && /^[a-f0-9]{32}$/.test(id)) {
        setInvite(id);
        setOpen(true);
      }
    }
    function selected(event: Event) {
      const value = (event as CustomEvent).detail;
      if (selection({ route: route(), ...value })) {
        chosen.current = value;
        record('select');
      }
    }
    navigate();
    function storageChanged(event: StorageEvent) {
      if (event.key === consentKey) {
        enabled.current = event.newValue === 'yes';
        setConsent(enabled.current);
        queue.current = [];
      }
    }
    window.addEventListener('storage', storageChanged);
    window.addEventListener('hashchange', navigate);
    window.addEventListener('companion-selection', selected);
    const timer = setInterval(() => {
      if (!enabled.current || !api.current || !queue.current.length) return;
      const batch = queue.current.splice(0, 20);
      fetch(api.current + '/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        credentials: 'omit',
      }).catch(() => {});
    }, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('companion-selection', selected);
      socket.current?.close();
    };
  }, []);
  function toggle(value: boolean) {
    try {
      localStorage.setItem(consentKey, value ? 'yes' : 'no');
      enabled.current = value;
      setConsent(value);
      queue.current = [];
    } catch {
      setStatus('Your browser could not save this preference.');
    }
  }
  function join(id: string) {
    if (!endpoint) return;
    socket.current?.close();
    setStatus('Connecting…');
    setIncoming(null);
    const ws = new WebSocket(endpoint.replace(/^http/, 'ws') + '/rooms/' + id);
    socket.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setRoom(id);
      setStatus('Connected. Invitations expire after one hour.');
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'selection') {
          const value = selection(data.selection);
          if (value) setIncoming(value);
        }
        if (data.type === 'presence') setPeople(data.count);
      } catch {}
    };
    ws.onerror = () =>
      setStatus(
        'Could not join. The room may be full, expired, or unavailable.',
      );
    ws.onclose = () => {
      if (socket.current === ws) {
        setConnected(false);
        setPeople(0);
        setStatus('Disconnected. You can start a new session.');
      }
    };
  }
  async function create() {
    try {
      const response = await fetch(endpoint + '/rooms', {
        method: 'POST',
        credentials: 'omit',
      });
      if (!response.ok) throw Error();
      const data = await response.json();
      join(data.id);
    } catch {
      setStatus('Sessions are unavailable. Try again later.');
    }
  }
  function share() {
    const value = selection({ route: route(), ...chosen.current });
    if (!value) {
      setStatus('Open an app screen to share it.');
      return;
    }
    if (Date.now() - lastSent.current < 1100) return;
    lastSent.current = Date.now();
    socket.current?.send(JSON.stringify(value));
    setStatus('Selection shared.');
  }
  async function copy() {
    try {
      const url = new URL(location.href);
      url.hash = '/' + (route() || 'education/dashboards') + '?room=' + room;
      await navigator.clipboard.writeText(url.href);
      setStatus(
        'Invitation copied. Anyone with this link can join the available seat.',
      );
    } catch {
      setStatus('Clipboard unavailable.');
    }
  }
  function apply() {
    if (!incoming) return;
    location.hash =
      '/' +
      incoming.route +
      (incoming.entity
        ? '?entity=' + incoming.entity + '&space=' + incoming.space
        : '');
    setIncoming(null);
  }
  async function loadInsights() {
    try {
      const r = await fetch(endpoint + '/insights', { credentials: 'omit' });
      if (!r.ok) throw Error();
      const data = await r.json();
      setInsights(data.rows);
      setStatus(
        data.rows.length
          ? 'Recent activity loaded.'
          : 'Not enough activity to show yet.',
      );
    } catch {
      setStatus('Activity is unavailable.');
    }
  }
  return (
    <aside className="coordination">
      <button
        className="coordination-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Explore together
      </button>
      {open && (
        <section className="coordination-panel" aria-label="Shared exploration">
          <h2>Explore together</h2>
          <p>
            Invite one person and share the view or map place you’re exploring.
          </p>
          {!endpoint ? (
            <p>Shared sessions are in preparation.</p>
          ) : (
            <>
              {!connected ? (
                <>
                  <button onClick={create}>Start a session</button>
                  {invite && (
                    <button onClick={() => join(invite)}>
                      Join invitation
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p>{people} of 2 people connected</p>
                  <input
                    aria-label="Invitation link"
                    readOnly
                    value={
                      location.origin +
                      '/#/' +
                      (route() || 'education/dashboards') +
                      '?room=' +
                      room
                    }
                  />
                  <button onClick={copy}>Copy invitation</button>
                  <button onClick={share}>Share this view</button>
                  <button
                    onClick={() => {
                      socket.current?.close();
                      setRoom('');
                      setIncoming(null);
                    }}
                  >
                    Leave
                  </button>
                </>
              )}
              {incoming && (
                <div className="shared-selection">
                  <p>Shared: {incoming.route.split('/').join(' · ')}</p>
                  <button onClick={apply}>Open shared view</button>
                  {incoming.entity && (
                    <a
                      href={
                        'https://www.geobrowser.io/space/' +
                        incoming.space +
                        '/' +
                        incoming.entity
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open entity on Geo ↗
                    </a>
                  )}
                </div>
              )}
            </>
          )}
          <hr />
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => toggle(e.target.checked)}
            />{' '}
            Share usage counts
          </label>
          <p className="coordination-note">
            Optional screen and selection counts. No names, search text,
            location, or followed profiles. Kept for about 30 days; turning this
            off stops new collection.
          </p>
          {endpoint && (
            <button onClick={loadInsights}>View community activity</button>
          )}
          {insights.length > 0 && (
            <>
              <p>Last 7 days · events, not people · groups of at least 10</p>
              <ul>
                {insights.map((row) => (
                  <li key={row.route + row.action}>
                    {row.route}: {row.action} — {row.events}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p role="status">{status}</p>
        </section>
      )}
    </aside>
  );
}
