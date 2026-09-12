import { useEffect, useRef, useState } from 'react';
import { GEO_ENDPOINT } from '../../config/public-config';
import {
  DISCOVER_QUERY,
  VOTES_QUERY,
  TERMS,
  normalizeClaims,
  normalizeVotes,
  summarizeVotes,
  validEditorial,
} from './debates.mjs';
import './debates.css';
import ArgumentExplorer from './ArgumentExplorer';
type Claim = {
  id: string;
  name: string;
  description: string | null;
  spaces: string[];
  sources: { id: string; name: string; space: string }[];
  sourceLimit: boolean;
};
type Vote = {
  objectId: string;
  spaceId: string;
  voteKind: number;
  positive: number;
  negative: number;
  updatedAt: string;
};
type Editorial = {
  title: string;
  intro: string;
  picks: { id: string; note: string }[];
};
const EMPTY: Editorial = {
  title: 'The editor’s reading list',
  intro: '',
  picks: [],
};
const KEY = 'geo-companion-editorial-draft-v1';
let cached: {
  claims: Claim[];
  votes: Vote[];
  voteError: string;
  limited: boolean;
  checked: number;
} | null = null;
async function request(query: string, variables: object, signal: AbortSignal) {
  let r;
  try {
    r = await fetch(GEO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
    });
  } catch {
    throw new Error('Geo did not respond in time. Please try again.');
  }
  if (r.status === 429)
    throw new Error(
      'Geo is rate limiting requests. Wait a minute and try again.',
    );
  if (!r.ok) throw new Error(`Geo is unavailable (HTTP ${r.status}).`);
  try {
    return await r.json();
  } catch {
    throw new Error('Geo returned unreadable data.');
  }
}
function Go({
  id,
  space,
  children,
}: {
  id: string;
  space: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`https://www.geobrowser.io/space/${encodeURIComponent(space)}/${encodeURIComponent(id)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} ↗
    </a>
  );
}
function PublicSignals({ openEvidence }: { openEvidence: () => void }) {
  const [claims, setClaims] = useState<Claim[]>([]),
    [votes, setVotes] = useState<Vote[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [voteError, setVoteError] = useState(''),
    [checked, setChecked] = useState(0),
    [limited, setLimited] = useState(false),
    [tick, setTick] = useState(0);
  const [search, setSearch] = useState(''),
    [sort, setSort] = useState('activity'),
    [selected, setSelected] = useState<string | null>(null);
  const [editor, setEditor] = useState(false),
    [published, setPublished] = useState<Editorial>(EMPTY),
    [draft, setDraft] = useState<Editorial>(EMPTY),
    [notice, setNotice] = useState(''),
    [publishError, setPublishError] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const draftLoaded = useRef(false);
  useEffect(() => {
    const c = new AbortController();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (validEditorial(parsed)) {
          setDraft(parsed);
          draftLoaded.current = true;
        }
      }
    } catch {
      setNotice(
        'Local draft storage is unavailable. You can still export your draft.',
      );
    }
    return () => c.abort();
  }, []);
  useEffect(() => {
    const c = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setError('');
    setBusy(true);
    setCooldown(true);
    async function load() {
      try {
        let value = cached;
        if (tick > 0 || !value || Date.now() - value.checked > 60000) {
          const payload = await request(
            DISCOVER_QUERY,
            {
              filter: {
                fromEntity: {
                  or: TERMS.map((t) => ({ name: { includesInsensitive: t } })),
                },
              },
            },
            c.signal,
          );
          const found = normalizeClaims(payload) as Claim[];
          let counts: Vote[] = [],
            countsError = '';
          if (found.length)
            try {
              counts = normalizeVotes(
                await request(
                  VOTES_QUERY,
                  { ids: found.map((c) => c.id) },
                  c.signal,
                ),
              ) as Vote[];
            } catch (e) {
              countsError =
                e instanceof Error ? e.message : 'Response counts unavailable.';
            }
          value = {
            claims: found,
            votes: counts,
            voteError: countsError,
            limited: payload.data.relations.length >= 101,
            checked: Date.now(),
          };
          cached = value;
        }
        if (!c.signal.aborted) {
          setClaims(value.claims);
          setVotes(value.votes);
          setVoteError(value.voteError);
          setLimited(value.limited);
          setChecked(value.checked);
        }
      } catch (e) {
        if (!c.signal.aborted)
          setError(e instanceof Error ? e.message : 'Unable to load debates.');
      } finally {
        if (!c.signal.aborted) {
          setBusy(false);
          timer = setTimeout(() => setCooldown(false), 10000);
        }
      }
    }
    void load();
    return () => {
      c.abort();
      clearTimeout(timer);
    };
  }, [tick]);
  const summary = (id: string, kind: number) =>
    summarizeVotes(votes, id, kind) as {
      positive: number;
      negative: number;
    } | null;
  const total = (id: string, kind: number) => {
    const s = summary(id, kind);
    return s ? s.positive + s.negative : 0;
  };
  const activity = (id: string) => total(id, 0) + total(id, 1) + total(id, 2);
  const visible = claims
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === 'activity'
        ? activity(b.id) - activity(a.id) || a.name.localeCompare(b.name)
        : sort === 'upvotes'
          ? (summary(b.id, 0)?.positive ?? -1) -
              (summary(a.id, 0)?.positive ?? -1) || a.name.localeCompare(b.name)
          : sort === 'split'
            ? split(b.id) - split(a.id) || a.name.localeCompare(b.name)
            : a.name.localeCompare(b.name),
    );
  function split(id: string) {
    const s = summary(id, 1);
    return s && s.positive + s.negative > 0
      ? Math.min(s.positive, s.negative) / (s.positive + s.negative)
      : -1;
  }
  const editing = editor ? draft : published;
  const active = claims.find((c) => c.id === selected);
  const update = (value: Editorial) => {
    setDraft(value);
    draftLoaded.current = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      setNotice('Draft saved in this browser. Not published.');
    } catch {
      setNotice('Draft is in memory only. Export it to keep your changes.');
    }
  };
  const togglePick = (id: string) =>
    update({
      ...draft,
      picks: draft.picks.some((p) => p.id === id)
        ? draft.picks.filter((p) => p.id !== id)
        : draft.picks.length < 12
          ? [...draft.picks, { id, note: '' }]
          : draft.picks,
    });
  function exportDraft() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geo-companion-editorial.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      'Draft exported. Give the file to the site maintainer to publish it.',
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EDUCATION · DEBATES & SIGNALS</div>
          <h1>
            Follow the conversation.
            <br />
            Look for the evidence.
          </h1>
          <p>
            Education debate claims, public responses, and an editor’s
            perspective.
          </p>
        </div>
        <button
          className={editor ? 'primary' : ''}
          aria-pressed={editor}
          onClick={() => setEditor(!editor)}
        >
          {editor ? 'Exit editor preview' : 'Editor preview'}
        </button>
      </div>
      <div className="view-actions">
        <button
          disabled={busy || cooldown}
          onClick={() => setTick((t) => t + 1)}
        >
          {busy ? 'Loading…' : 'Refresh signals'}
        </button>
      </div>
      {editor && (
        <section className="editor-panel">
          <div>
            <h2>Your editorial desk</h2>
            <p>
              Feature claims, set their order, and explain your perspective.
              This preview is stored only in your browser; it does not change
              what other visitors see.
            </p>
          </div>
          <label>
            Reading-list title
            <input
              maxLength={140}
              value={draft.title}
              onChange={(e) => update({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            Your introduction
            <textarea
              maxLength={1000}
              value={draft.intro}
              onChange={(e) => update({ ...draft, intro: e.target.value })}
              placeholder="What should readers pay attention to, and why?"
            />
          </label>
          <div className="editor-actions">
            <button className="primary" onClick={exportDraft}>
              Export local draft
            </button>
            <button onClick={() => update(published)}>Clear draft</button>
            <span role="status">
              {notice ||
                'Select “Feature this claim” below to start a reading list.'}
            </span>
          </div>
        </section>
      )}
      {publishError && (
        <p role="status" className="muted">
          {publishError}
        </p>
      )}
      {!!editing.picks.length && (
        <section className="editorial-selection">
          <div className="eyebrow">
            {editor ? 'LOCAL DRAFT · ' : ''}EDITOR’S PICKS — PERSONAL
            PERSPECTIVE
          </div>
          <h2>{editing.title}</h2>
          {editing.intro && <p>{editing.intro}</p>}
          <div className="pick-grid">
            {editing.picks.map((pick, index) => {
              const claim = claims.find((c) => c.id === pick.id);
              return (
                <article key={pick.id}>
                  <span className="pick-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>
                    {claim?.name ??
                      'Claim not returned in the current discovery results'}
                  </h3>
                  {pick.note && <p>{pick.note}</p>}
                  {claim && (
                    <Go id={claim.id} space={claim.spaces[0]}>
                      Consider this claim on Geo
                    </Go>
                  )}
                  {editor && (
                    <>
                      <label>
                        Editorial note
                        <textarea
                          maxLength={1000}
                          value={pick.note}
                          onChange={(e) =>
                            update({
                              ...draft,
                              picks: draft.picks.map((p) =>
                                p.id === pick.id
                                  ? { ...p, note: e.target.value }
                                  : p,
                              ),
                            })
                          }
                        />
                      </label>
                      <div className="editor-actions">
                        <button
                          disabled={index === 0}
                          onClick={() => {
                            const picks = [...draft.picks];
                            [picks[index - 1], picks[index]] = [
                              picks[index],
                              picks[index - 1],
                            ];
                            update({ ...draft, picks });
                          }}
                        >
                          Move up
                        </button>
                        <button onClick={() => togglePick(pick.id)}>
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
      <div className="stats">
        <div>
          <strong>{checked ? claims.length : '—'}</strong>
          <span>Education debate claims</span>
        </div>
        <div>
          <strong>
            {!checked || voteError
              ? '—'
              : votes
                  .filter((v) => v.voteKind === 0)
                  .reduce((n, v) => n + v.positive + v.negative, 0)}
          </strong>
          <span>Recorded curation responses</span>
        </div>
        <div>
          <strong>
            {!checked || voteError
              ? '—'
              : votes
                  .filter((v) => v.voteKind === 1)
                  .reduce((n, v) => n + v.positive + v.negative, 0)}
          </strong>
          <span>Recorded stance responses</span>
        </div>
        <div>
          <strong>—</strong>
          <span>Views / watch time unavailable</span>
        </div>
      </div>
      <section className="explorer">
        <div className="section-title">
          <div>
            <h2>What’s drawing a response?</h2>
            <p>Explore activity and disagreement, then inspect the context.</p>
          </div>
          <button onClick={openEvidence}>Open evidence atlas ↗</button>
        </div>
        <div className="filters">
          <label className="search">
            <input
              aria-label="Search education debate claims"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search education debates…"
            />
          </label>
          <select
            aria-label="Sort debate claims"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="activity">Most recorded responses</option>
            <option value="upvotes">Most curation upvotes</option>
            <option value="split">Most divided stances</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
        <div className="results-meta">
          <span>{visible.length} claims shown</span>
        </div>
        {error && (
          <div className="message" role="status">
            {error}{' '}
            {claims.length > 0 && 'Previously fetched results remain visible.'}
          </div>
        )}
        {voteError && (
          <div className="message" role="status">
            {voteError} Claims are available, but counts are hidden.
          </div>
        )}
        {busy && !claims.length && (
          <div className="message" role="status">
            Finding education conversations and their public responses…
          </div>
        )}
        {!busy && !error && !visible.length && (
          <div className="message" role="status">
            No debate claims match this view. Try another search or refresh
            later.
          </div>
        )}
        <div className="debate-list">
          {visible.map((c, index) => {
            const cur = summary(c.id, 0),
              stance = summary(c.id, 1);
            const stotal = stance ? stance.positive + stance.negative : 0;
            return (
              <article key={c.id}>
                <div className="debate-rank">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="debate-content">
                  <div className="debate-kicker">DEBATE CLAIM </div>
                  <h3>
                    <button
                      onClick={() =>
                        setSelected(selected === c.id ? null : c.id)
                      }
                    >
                      {c.name}
                    </button>
                  </h3>
                  <div className="debate-actions">
                    <Go id={c.id} space={c.spaces[0]}>
                      Join the conversation
                    </Go>
                    <button
                      className="text-button"
                      onClick={() =>
                        setSelected(selected === c.id ? null : c.id)
                      }
                    >
                      Inspect signals & sources
                    </button>
                    {editor && (
                      <button
                        disabled={
                          !draft.picks.some((p) => p.id === c.id) &&
                          draft.picks.length >= 12
                        }
                        onClick={() => togglePick(c.id)}
                      >
                        {draft.picks.some((p) => p.id === c.id)
                          ? 'Unfeature'
                          : 'Feature this claim'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="debate-signals">
                  <div className="curation-count">
                    ↑ {cur && !voteError ? cur.positive : '—'}{' '}
                    <small>curation upvotes</small>
                  </div>
                  {stance && !voteError && stotal > 0 ? (
                    <>
                      <div className="stance-label">
                        <span>{stance.positive} agree</span>
                        <span>{stance.negative} disagree</span>
                      </div>
                      <div className="stance-bar">
                        <span
                          style={{
                            width: `${(stance.positive / stotal) * 100}%`,
                          }}
                        />
                      </div>
                      <small>
                        {Math.round((stance.positive / stotal) * 100)}% agree ·{' '}
                        {stotal} recorded stances
                      </small>
                    </>
                  ) : (
                    <small>No stance tally returned</small>
                  )}
                </div>
                {active?.id === c.id && (
                  <div className="signal-details">
                    <div>
                      <h3>What these signals mean</h3>
                      <p>
                        Curation is upvote/downvote. Stance is agree/disagree.
                        Veracity is verify/dispute. Totals combine returned
                        space-specific tallies for this claim; they are not
                        unique people or representative polling. Missing tallies
                        are not zero.
                      </p>
                      <div className="tally-table">
                        {votes
                          .filter((v) => v.objectId === c.id)
                          .map((v) => (
                            <div key={`${v.spaceId}:${v.voteKind}`}>
                              <Go space={v.spaceId} id={c.id}>
                                {['Curation', 'Stance', 'Veracity'][v.voteKind]}{' '}
                                in {v.spaceId.slice(0, 7)}…
                              </Go>
                              <span>
                                {v.positive} positive / {v.negative} negative
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3>Sources</h3>
                      {c.sources.length ? (
                        <ul>
                          {c.sources.map((s) => (
                            <li key={`${s.id}:${s.space}`}>
                              <Go id={s.id} space={s.space}>
                                {s.name}
                              </Go>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No sources linked.</p>
                      )}
                      {c.sourceLimit && <p>More sources may be available.</p>}
                      <button onClick={openEvidence}>
                        Explore the reference evidence atlas
                      </button>
                      <p className="muted">Browse broader context.</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <details className="debate-method">
          <summary>About these counts</summary>
          <p>
            Responses measure activity, not views or unique people. This
            selection is not exhaustive.
          </p>
          {limited && <p>Only part of the available results is shown.</p>}
        </details>
      </section>
    </>
  );
}

export default function Debates({
  openEvidence,
}: {
  openEvidence: () => void;
}) {
  const [signals, setSignals] = useState(false);
  return (
    <>
      <div className="debate-mode" aria-label="Debate view">
        <button aria-pressed={!signals} onClick={() => setSignals(false)}>
          Research arguments
        </button>
        <button aria-pressed={signals} onClick={() => setSignals(true)}>
          Public conversations
        </button>
      </div>
      {signals ? (
        <PublicSignals openEvidence={openEvidence} />
      ) : (
        <ArgumentExplorer />
      )}
    </>
  );
}
