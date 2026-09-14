import { lazy, Suspense } from 'react';
import Brand from '../../shared/branding/Brand';
import SpaceIcon from '../../shared/branding/SpaceIcon';
import { PreferencesLink } from '../../shared/preferences/Preferences';
import { EDUCATION_SPACE } from '../../config/geo.mjs';
import DatasetExplorer from './DatasetExplorer';
import Debates from './DebateBoard';
import '../../app/style.css';
const Connections = lazy(() => import('./ConnectionExplorer'));
const Curation = lazy(() => import('./Curation'));
const LocationMap = lazy(() => import('./LocationMap'));
const LiveAtlas = lazy(() => import('./LiveAtlas'));
const Questions = lazy(() => import('./Questions'));
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
            <SpaceIcon spaceId={EDUCATION_SPACE} />
            <div>
              Education<span>Evidence & initiatives</span>
            </div>
          </div>
          <label className="mobile-workspace">
            Explore education
            <select
              aria-label="Education view"
              value={tab}
              onChange={(e) => setTab(e.target.value)}
            >
              {groups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(([id, , name]) => (
                    <option value={id} key={id}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
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
              <DatasetExplorer />
            ) : tab === 'curation' ? (
              <Curation />
            ) : tab === 'debates' ? (
              <Debates openEvidence={() => setTab('atlas')} />
            ) : tab === 'map' ? (
              <LocationMap />
            ) : tab === 'live' ? (
              <Connections />
            ) : tab === 'questions' ? (
              <Questions />
            ) : (
              <LiveAtlas />
            )}
          </Suspense>
        </main>
      </div>
    </>
  );
}
