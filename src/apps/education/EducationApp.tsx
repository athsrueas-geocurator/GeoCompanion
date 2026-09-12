import Brand from '../../shared/branding/Brand';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  evidence,
  filterInitiatives,
  safeUrl,
  validateDataset,
} from './data.mjs';
const Connections = lazy(() => import('./ConnectionExplorer'));
import {
  EDUCATION_SPACE,
  SOURCE_COMMIT,
  SOURCE_REPO,
} from '../../config/public-config';
import '../../app/style.css';
import Debates from './DebateBoard';
import EducationDashboard from './EducationDashboard';
const Curation = lazy(() => import('./Curation'));
import { PreferencesLink } from '../../shared/preferences/Preferences';

const LocationMap = lazy(() => import('./LocationMap'));
type Initiative = {
  slug: string;
  name: string;
  category: string;
  years: string;
  evidenceStrength: string;
  oneLineFinding: string;
  sourceIds: string[];
  methodTags: string[];
  targetPopulation: string;
  theoryOfAction: string;
  outputsMeasured: string;
  normalizationIssues: string;
  evaluationDesigns: string;
  relatedDichotomySlugs: string[];
};
type Source = {
  id: string;
  title: string;
  authors: string;
  year: string;
  url: string;
  caveat: string;
  finding: string;
};
type Comparison = {
  slug: string;
  title: string;
  betterQuestion: string;
  whatEvidenceSuggests: string;
  sourceIds: string[];
  keyInitiativeSlugs: string[];
};
type Dataset = {
  initiatives: Initiative[];
  sources: Source[];
  comparisons: Comparison[];
};
function Link({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const url = safeUrl(href);
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  ) : (
    <span>{children}</span>
  );
}
function Badge({ id }: { id: string }) {
  const e = evidence.find((e) => e.id === id);
  return (
    <span
      className="badge"
      style={{ '--ink': e?.color } as React.CSSProperties}
    >
      {e?.label ?? 'Unclassified'}
    </span>
  );
}
function Message({
  children,
  retry,
}: {
  children: React.ReactNode;
  retry?: () => void;
}) {
  return (
    <div className="message" role="status">
      <p>{children}</p>
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}
export default function EducationApp({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: string) => void;
}) {
  const [data, setData] = useState<Dataset | null>(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState(''),
    [category, setCategory] = useState(''),
    [strength, setStrength] = useState(''),
    [view, setView] = useState('map');
  const [selected, setSelected] = useState<Initiative | null>(null),
    [pins, setPins] = useState<string[]>([]),
    [compare, setCompare] = useState(false);
  useEffect(() => {
    if (data || !['atlas', 'questions'].includes(tab)) return;
    const c = new AbortController();
    setError('');
    fetch('/data/education.json', { signal: c.signal })
      .then((r) => {
        if (!r.ok)
          throw new Error('The reference dataset could not be loaded.');
        return r.json();
      })
      .then((d) => setData(validateDataset(d)))
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [attempt, tab]);
  const all = data?.initiatives ?? [];
  const filtered = filterInitiatives(
    all,
    search,
    category,
    strength,
  ) as Initiative[];
  const categories = [...new Set(all.map((i) => i.category))].sort();
  const togglePin = (slug: string) =>
    setPins((p) =>
      p.includes(slug)
        ? p.filter((s) => s !== slug)
        : p.length < 3
          ? [...p, slug]
          : p,
    );
  const reset = () => {
    setSearch('');
    setCategory('');
    setStrength('');
  };
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <header>
        <Brand />
        <div className="header-actions">
          <PreferencesLink />
          <a className="geo-link" href="#/">
            All apps
          </a>
        </div>
      </header>
      <div className="shell">
        <aside className="sidebar">
          <div className="side-label">WORKSPACE</div>
          <div className="space-name">
            <span className="space-icon">E</span>
            <div>
              Education<span>Evidence & initiatives</span>
            </div>
          </div>
          <nav aria-label="Workspace">
            {[
              {
                label: 'Explore',
                items: [
                  ['dashboards', '▥', 'Education dashboards'],
                  ['curation', '✎', 'Curation'],
                  ['debates', '◌', 'Debates & signals'],
                  ['map', '◎', 'Location map'],
                ],
              },
              {
                label: 'Reference',
                items: [
                  ['questions', '⇄', 'Questions & evidence'],
                  ['atlas', '◉', 'Evidence atlas'],
                ],
              },
              { label: 'Discover', items: [['live', '⌘', 'Connections']] },
            ].map((group) => (
              <div className="nav-group" key={group.label}>
                <div className="nav-group-label">{group.label}</div>
                {group.items.map(([id, icon, label]) => (
                  <button
                    key={id}
                    className={tab === id ? 'active' : ''}
                    aria-current={tab === id ? 'page' : undefined}
                    onClick={() => setTab(id)}
                  >
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="side-bottom">
            <div className="side-label">BUILT FOR CURIOSITY</div>
            <p>
              Follow a finding.
              <br />
              Check the evidence.
              <br />
              See what’s missing.
            </p>
            <small>Independent companion to Geo</small>
          </div>
        </aside>
        <main id="main" tabIndex={-1}>
          <div className="breadcrumb">
            Education <span>/</span>{' '}
            {tab === 'map'
              ? 'Location map'
              : tab === 'dashboards'
                ? 'Education dashboards'
                : tab === 'curation'
                  ? 'Curation'
                  : tab === 'debates'
                    ? 'Debates & signals'
                    : tab === 'atlas'
                      ? 'Evidence atlas'
                      : tab === 'live'
                        ? 'Connections'
                        : 'Questions & evidence'}
          </div>
          {tab === 'map' ? (
            <Suspense fallback={<p>Loading map…</p>}>
              <LocationMap />
            </Suspense>
          ) : tab === 'dashboards' ? (
            <EducationDashboard openAtlas={() => setTab('atlas')} />
          ) : tab === 'curation' ? (
            <Suspense fallback={<p>Loading curation…</p>}>
              <Curation />
            </Suspense>
          ) : tab === 'debates' ? (
            <Debates openEvidence={() => setTab('atlas')} />
          ) : tab === 'live' ? (
            <Suspense fallback={<p>Loading connections…</p>}>
              <Connections />
            </Suspense>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">THE EDUCATION EVIDENCE DOSSIER</div>
                  <h1>
                    {tab === 'atlas'
                      ? 'A clearer view of the evidence.'
                      : 'Better questions. Stronger context.'}
                  </h1>
                  <p>
                    {tab === 'atlas'
                      ? 'Explore initiatives, trace their sources, and compare what we know.'
                      : 'Look beyond a binary debate. Follow the evidence and its limitations.'}
                  </p>
                </div>
                <span className="edition">01 / EDUCATION</span>
              </div>

              {error ? (
                <Message retry={() => setAttempt((a) => a + 1)}>
                  {error}
                </Message>
              ) : !data ? (
                <Message>Loading education evidence…</Message>
              ) : tab === 'questions' ? (
                <div className="questions">
                  {data.comparisons.map((c, n) => (
                    <article key={c.slug}>
                      <span className="number">
                        {String(n + 1).padStart(2, '0')}
                      </span>
                      <h2>{c.title}</h2>
                      <p className="question">{c.betterQuestion}</p>
                      <p>{c.whatEvidenceSuggests}</p>
                      <div className="linked-items">
                        {c.keyInitiativeSlugs
                          .map((s) => all.find((i) => i.slug === s))
                          .filter((i): i is Initiative => !!i)
                          .map((i) => (
                            <button key={i.slug} onClick={() => setSelected(i)}>
                              {i.name} ↗
                            </button>
                          ))}
                      </div>
                      <span className="muted">
                        {c.sourceIds.length} referenced sources · Curated
                        interpretation
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <>
                  <div className="stats">
                    <div>
                      <strong>{all.length}</strong>
                      <span>Initiatives to explore</span>
                    </div>
                    <div>
                      <strong>{data.sources.length}</strong>
                      <span>Referenced sources</span>
                    </div>
                    <div>
                      <strong>{categories.length}</strong>
                      <span>Intervention categories</span>
                    </div>
                    <div>
                      <strong>{data.comparisons.length}</strong>
                      <span>Questions with context</span>
                    </div>
                  </div>
                  <section className="explorer">
                    <div className="section-title">
                      <div>
                        <h2>Where does the evidence sit?</h2>
                        <p>
                          Each dot is an initiative. Select one to follow its
                          evidence.
                        </p>
                      </div>
                      <div className="segmented" aria-label="Visualization">
                        <button
                          aria-pressed={view === 'map'}
                          onClick={() => setView('map')}
                        >
                          Dot map
                        </button>
                        <button
                          aria-pressed={view === 'list'}
                          onClick={() => setView('list')}
                        >
                          List
                        </button>
                      </div>
                    </div>
                    <div className="filters">
                      <label className="search">
                        <span aria-hidden="true">⌕</span>
                        <input
                          aria-label="Search initiatives"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search initiatives, findings, methods…"
                        />
                      </label>
                      <select
                        aria-label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        aria-label="Evidence strength"
                        value={strength}
                        onChange={(e) => setStrength(e.target.value)}
                      >
                        <option value="">All evidence</option>
                        {evidence.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="results-meta">
                      <span aria-live="polite">
                        {filtered.length} of {all.length} initiatives
                      </span>
                      {(search || category || strength) && (
                        <button className="text-button" onClick={reset}>
                          Clear filters
                        </button>
                      )}
                      <span className="muted">
                        Evidence labels are curated assessments, not effect
                        sizes.
                      </span>
                    </div>
                    {!filtered.length ? (
                      <Message retry={reset}>
                        No initiatives match these filters.
                      </Message>
                    ) : view === 'map' ? (
                      <div className="map-scroll">
                        <div className="evidence-map">
                          <div className="matrix-header">
                            <span>INTERVENTION CATEGORY</span>
                            {evidence.map((e) => (
                              <span key={e.id}>
                                <i style={{ background: e.color }} />
                                {e.label}
                              </span>
                            ))}
                          </div>
                          {categories
                            .filter((c) =>
                              filtered.some((i) => i.category === c),
                            )
                            .map((c) => (
                              <div className="matrix-row" key={c}>
                                <button
                                  className="category-label"
                                  onClick={() =>
                                    setCategory(category === c ? '' : c)
                                  }
                                >
                                  {c}
                                  <small>
                                    {
                                      filtered.filter((i) => i.category === c)
                                        .length
                                    }
                                  </small>
                                </button>
                                {evidence.map((e) => (
                                  <div className="dot-cell" key={e.id}>
                                    {filtered
                                      .filter(
                                        (i) =>
                                          i.category === c &&
                                          i.evidenceStrength === e.id,
                                      )
                                      .map((i) => (
                                        <button
                                          className={`dot ${pins.includes(i.slug) ? 'pinned' : ''}`}
                                          style={{ background: e.color }}
                                          key={i.slug}
                                          title={i.name}
                                          aria-label={`Explore ${i.name}`}
                                          onClick={() => setSelected(i)}
                                        />
                                      ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="initiative-list">
                        {filtered.map((i) => (
                          <button key={i.slug} onClick={() => setSelected(i)}>
                            <div>
                              <small>{i.category}</small>
                              <h3>{i.name}</h3>
                              <p>{i.oneLineFinding}</p>
                            </div>
                            <Badge id={i.evidenceStrength} />
                            <span>↗</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="map-footer">
                      <span>● One initiative</span>
                      <span>
                        Categories and evidence labels come from the source
                        dossier. No ranking implied.
                      </span>
                    </div>
                  </section>
                  <section className="next-question">
                    <span className="eyebrow">GO A LEVEL DEEPER</span>
                    <h2>What would change your mind?</h2>
                    <p>
                      Explore the questions behind the initiatives, with sources
                      and competing interpretations in view.
                    </p>
                    <button onClick={() => setTab('questions')}>
                      Explore {data.comparisons.length} questions <span>→</span>
                    </button>
                  </section>
                </>
              )}
            </>
          )}
          <footer>
            <span>Geo Companion / Education</span>
          </footer>
        </main>
      </div>
      {!!pins.length && (
        <div className="compare-bar">
          <span>{pins.length} of 3 initiatives selected</span>
          <button onClick={() => setCompare(true)}>
            Compare initiatives →
          </button>
          <button className="text-button" onClick={() => setPins([])}>
            Clear
          </button>
        </div>
      )}
      {selected && data && (
        <Dialog title={selected.name} onClose={() => setSelected(null)}>
          <div className="detail-meta">
            {selected.category} · {selected.years}
          </div>
          <Badge id={selected.evidenceStrength} />
          <h3>What the dossier finds</h3>
          <p className="finding">{selected.oneLineFinding}</p>
          <div className="caveat">
            <h3>Keep in mind</h3>
            <p>
              {selected.normalizationIssues ||
                'No limitation supplied. Check the original studies.'}
            </p>
          </div>
          <dl>
            {[
              ['Target population', selected.targetPopulation],
              ['Theory of action', selected.theoryOfAction],
              ['Outcomes measured', selected.outputsMeasured],
              ['Evaluation design', selected.evaluationDesigns],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || 'Not supplied'}</dd>
              </div>
            ))}
          </dl>
          <div className="tags">
            {selected.methodTags.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <button
            className="primary"
            disabled={!pins.includes(selected.slug) && pins.length >= 3}
            onClick={() => togglePin(selected.slug)}
          >
            {pins.includes(selected.slug)
              ? 'Remove from comparison'
              : pins.length >= 3
                ? 'Comparison full (3)'
                : 'Add to comparison'}
          </button>
          <h3>Follow the sources · {selected.sourceIds.length}</h3>
          {selected.sourceIds.map((id) => {
            const s = data.sources.find((s) => s.id === id);
            return s ? (
              <article className="source-card" key={id}>
                <Link href={s.url}>{s.title}</Link>
                <small>
                  {s.authors}
                  {s.year && ` · ${s.year}`}
                </small>
                <p>{s.caveat}</p>
              </article>
            ) : (
              <p key={id}>Source {id} unavailable.</p>
            );
          })}
          <Link
            href={`${SOURCE_REPO}/blob/${SOURCE_COMMIT}/content/initiatives.json`}
          >
            View original dataset
          </Link>
        </Dialog>
      )}
      {compare && (
        <Dialog
          title="Compare initiatives"
          onClose={() => setCompare(false)}
          wide
        >
          <p className="muted">
            Compare context and evidence; these labels do not measure relative
            effectiveness.
          </p>
          <div className="comparison-grid">
            {all
              .filter((i) => pins.includes(i.slug))
              .map((i) => (
                <article key={i.slug}>
                  <h2>{i.name}</h2>
                  <Badge id={i.evidenceStrength} />
                  <h3>Finding</h3>
                  <p>{i.oneLineFinding}</p>
                  <h3>Population</h3>
                  <p>{i.targetPopulation}</p>
                  <h3>Limitations</h3>
                  <p>{i.normalizationIssues}</p>
                  <h3>Source overlap</h3>
                  <p>
                    {
                      i.sourceIds.filter((s) =>
                        all.some(
                          (j) =>
                            j.slug !== i.slug &&
                            pins.includes(j.slug) &&
                            j.sourceIds.includes(s),
                        ),
                      ).length
                    }{' '}
                    shared references with other selections
                  </p>
                  <button
                    onClick={() => {
                      setCompare(false);
                      setSelected(i);
                    }}
                  >
                    Inspect sources ↗
                  </button>
                </article>
              ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
      prior?.focus();
    };
  }, []);
  return (
    <dialog
      className={wide ? 'wide' : ''}
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-heading">
        <span className="eyebrow">EVIDENCE INSPECTOR</span>
        <button autoFocus aria-label="Close details" onClick={onClose}>
          ×
        </button>
      </div>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}
