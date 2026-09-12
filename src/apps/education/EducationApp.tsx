import { lazy, Suspense } from 'react';
import Brand from '../../shared/branding/Brand';
import { PreferencesLink } from '../../shared/preferences/Preferences';
import EducationDashboard from './EducationDashboard';
import Debates from './DebateBoard';
import '../../app/style.css';
const Connections = lazy(() => import('./ConnectionExplorer'));
const Curation = lazy(() => import('./Curation'));
const LocationMap = lazy(() => import('./LocationMap'));
const LiveAtlas = lazy(() => import('./LiveAtlas'));
const groups = [
  {
    label: 'Explore',
    items: [
      ['dashboards', '▥', 'Education dashboards'],
      ['atlas', '◉', 'Evidence atlas'],
      ['questions', '⇄', 'Questions & evidence'],
      ['curation', '✎', 'Curation'],
      ['debates', '◌', 'Debates & signals'],
      ['map', '◎', 'Location map'],
    ],
  },
  { label: 'Discover', items: [['live', '⌘', 'Connections']] },
];
export default function EducationApp({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: string) => void;
}) {
  const label =
    groups.flatMap((g) => g.items).find((i) => i[0] === tab)?.[2] ||
    'Education';
  return (
    <>
      <a className="skip" href="#main">
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
            {groups.map((g) => (
              <div className="nav-group" key={g.label}>
                <div className="nav-group-label">{g.label}</div>
                {g.items.map(([id, icon, name]) => (
                  <button
                    key={id}
                    className={tab === id ? 'active' : ''}
                    aria-current={tab === id ? 'page' : undefined}
                    onClick={() => setTab(id)}
                  >
                    <span aria-hidden="true">{icon}</span>
                    {name}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <main id="main" tabIndex={-1}>
          <div className="breadcrumb">
            Education <span>/</span> {label}
          </div>
          <Suspense fallback={<p role="status">Loading…</p>}>
            {tab === 'dashboards' ? (
              <EducationDashboard openAtlas={() => setTab('atlas')} />
            ) : tab === 'curation' ? (
              <Curation />
            ) : tab === 'debates' ? (
              <Debates openEvidence={() => setTab('atlas')} />
            ) : tab === 'map' ? (
              <LocationMap />
            ) : tab === 'live' ? (
              <Connections />
            ) : (
              <LiveAtlas questions={tab === 'questions'} />
            )}
          </Suspense>
        </main>
      </div>
    </>
  );
}
