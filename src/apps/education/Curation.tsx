import { useEffect, useRef, useState } from 'react';
import { selectForSharing } from '../../shared/coordination/Coordination';
import Markdown from 'react-markdown';
import { FollowedProfiles } from '../../shared/preferences/Preferences';
import { PROFILE, readPosts, readPost } from './curation-live.mjs';
import './curation.css';
import GeoReference from '../../shared/geo/GeoReference';
import useRevalidation from '../../shared/geo/useRevalidation';
type Post = Awaited<ReturnType<typeof readPost>>;
export default function Curation() {
  const [posts, setPosts] = useState<{ id: string; title: string }[]>([]),
    [next, setNext] = useState<string | null>(null),
    [selected, setSelected] = useState(() => {
      try {
        const id = localStorage.getItem('geocompanion.selected-post');
        return id && /^[a-f0-9]{32}$/.test(id) ? id : '';
      } catch {
        return '';
      }
    }),
    [post, setPost] = useState<Post | null>(null),
    [error, setError] = useState(''),
    [listError, setListError] = useState(''),
    [busy, setBusy] = useState(false),
    [listing, setListing] = useState(false),
    [revision, setRevision] = useState(0);
  useRevalidation(() => {
    setRevision((r) => r + 1);
    void list();
  }, 300000);
  useEffect(() => {
    if (selected) selectForSharing(selected, PROFILE);
    try {
      if (selected)
        localStorage.setItem('geocompanion.selected-post', selected);
      else localStorage.removeItem('geocompanion.selected-post');
    } catch {
      /* Reading remains available without local storage. */
    }
  }, [selected, post]);
  useEffect(() => {
    function readSelection() {
      const q = new URLSearchParams(location.hash.split('?')[1] || '');
      const id = q.get('entity');
      if (q.get('space') === PROFILE && id && /^[a-f0-9]{32}$/.test(id))
        setSelected(id);
    }
    readSelection();
    window.addEventListener('hashchange', readSelection);
    return () => window.removeEventListener('hashchange', readSelection);
  }, []);
  const forceNext = useRef(false),
    lastRefresh = useRef(0),
    listRequest = useRef<AbortController | null>(null);
  async function list(after: string | null = null, force = false) {
    listRequest.current?.abort();
    const c = new AbortController();
    listRequest.current = c;
    const timer = setTimeout(() => c.abort(), 20000);
    setListing(true);
    setListError('');
    try {
      const d = await readPosts(after, c.signal, force);
      if (c.signal.aborted) return;
      setPosts((previous) =>
        after
          ? [
              ...new Map(
                [...previous, ...d.posts].map((p) => [p.id, p]),
              ).values(),
            ]
          : d.posts,
      );
      setNext(d.next);
    } catch (e) {
      if (listRequest.current === c)
        setListError(e instanceof Error ? e.message : 'Post list unavailable.');
    } finally {
      clearTimeout(timer);
      if (listRequest.current === c) setListing(false);
    }
  }
  useEffect(() => {
    void list();
    return () => listRequest.current?.abort();
  }, []);
  useEffect(() => {
    let active = true;
    if (!selected) {
      setPost(null);
      setBusy(false);
      return;
    }
    const c = new AbortController(),
      timer = setTimeout(() => c.abort(), 20000);
    setBusy(true);
    setError('');
    setPost(null);
    const force = forceNext.current;
    forceNext.current = false;
    readPost(selected, c.signal, force)
      .then((d) => {
        if (active) setPost(d);
      })
      .catch((e) => {
        if (active)
          setError(
            c.signal.aborted ? 'Geo timed out. Try refreshing.' : e.message,
          );
      })
      .finally(() => {
        clearTimeout(timer);
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      c.abort();
      clearTimeout(timer);
    };
  }, [selected, revision]);
  function refresh() {
    if (Date.now() - lastRefresh.current < 10000) return;
    lastRefresh.current = Date.now();
    forceNext.current = true;
    setRevision((r) => r + 1);
    void list(null, true);
  }
  const source = `https://www.geobrowser.io/space/${PROFILE}/${selected}`;
  return (
    <section className="curation-reader">
      <div className="page-heading">
        <div>
          <div className="eyebrow">READING & REFLECTIONS</div>
          <h1>Curation</h1>
        </div>
        <button onClick={refresh} disabled={busy || listing}>
          Refresh
        </button>
      </div>
      <label className="curation-selector">
        Published posts
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Choose a post</option>
          {selected && !posts.some((p) => p.id === selected) && (
            <option value={selected}>Selected post</option>
          )}
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      {next && (
        <button disabled={listing} onClick={() => void list(next)}>
          Load more posts
        </button>
      )}
      {listError && (
        <p role="alert">
          {listError}{' '}
          <button onClick={() => void list()}>Retry post list</button>
        </p>
      )}
      {selected && (
        <p className="curation-source">
          <a href={source} target="_blank" rel="noopener noreferrer">
            Open this post on Geo ↗
          </a>
        </p>
      )}
      {busy && <p role="status">Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {post && (
        <article className="curation-prose">
          <h2>{post.title}</h2>
          {post.description && (
            <p className="curation-description">{post.description}</p>
          )}
          {!post.blocks.length && (
            <p>No content blocks are published on this post yet.</p>
          )}
          {post.blocks.map((block) => (
            <div key={block.id}>
              {block.markdown ? (
                <Markdown
                  skipHtml
                  urlTransform={(url) => (/^https?:\/\//i.test(url) ? url : '')}
                  components={{
                    h1: ({ children }) => <h3>{children}</h3>,
                    h2: ({ children }) => <h3>{children}</h3>,
                    a: ({ href, children }) =>
                      href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ) : (
                        <span>{children}</span>
                      ),
                    img: ({ src, alt }) =>
                      src ? (
                        <a href={src} target="_blank" rel="noopener noreferrer">
                          {alt || 'View image'} ↗
                        </a>
                      ) : (
                        <span>{alt}</span>
                      ),
                  }}
                >
                  {block.markdown}
                </Markdown>
              ) : (
                <p>
                  <a
                    href={`https://www.geobrowser.io/space/${PROFILE}/${block.entityId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View this content block on Geo ↗
                  </a>
                </p>
              )}
            </div>
          ))}
          {!!post.references.length && (
            <section className="curation-references">
              <h3>Related</h3>
              <ul>
                {post.references.map((r) => (
                  <li key={r.id}>
                    <span>{r.relation}: </span>
                    <GeoReference
                      id={r.targetId}
                      name={r.name}
                      spaces={r.spaces}
                      context={PROFILE}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
      <section className="explorer" style={{ padding: 28, marginTop: 20 }}>
        <FollowedProfiles />
      </section>
    </section>
  );
}
