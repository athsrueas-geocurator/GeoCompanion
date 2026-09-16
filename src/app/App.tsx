import SpaceIcon from '../shared/branding/SpaceIcon';
import PreferenceInfo from '../shared/preferences/ReleaseNotes';
import Brand from '../shared/branding/Brand';
import { Mark } from '../shared/branding/Brand';
import React, { lazy, Suspense, useEffect, useState } from 'react';

import { parseRoute } from './routes.mjs';
import './style.css';
import './apps.css';
import PreferencesPage, {
  PreferencesLink,
} from '../shared/preferences/Preferences';
const EducationApp = lazy(() => import('../apps/education/EducationApp'));
const OutreachApp = lazy(() => import('../apps/outreach/OutreachApp'));
const GraphApp = lazy(() => import('../apps/graphs/GraphApp'));
function Header() {
  return (
    <header>
      <Brand />
      <div className="header-actions">
        <PreferencesLink />
        <a
          className="geo-link"
          href="https://www.geobrowser.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Geo ↗
        </a>
      </div>
    </header>
  );
}
function Home() {
  return (
    <>
      <Header />
      <main className="app-home" id="app-main" tabIndex={-1}>
        <div className="eyebrow">GEO COMPANION</div>
        <h1>Choose an app.</h1>
        <p className="app-intro">
          Explore a collection with the tools built for it.
        </p>
        <div className="app-grid">
          {[
            {
              id: 'dac259bad48a11adf97fe36857d85206',
              href: '#/education/dashboards',
              title: 'Education',
              text: 'Evidence, dashboards & curation',
            },
            {
              id: 'f24e3bbd26304474b7e0c2a0877f4bfe',
              href: '#/outreach/directory',
              title: 'Indianapolis outreach',
              text: 'Services, schedules & map',
            },
            {
              id: '',
              href: '#/people',
              title: 'People & contributions',
              text: 'Explore authorship connections',
            },
            {
              id: '',
              href: '#/research-debates',
              title: 'Research debates',
              text: 'Claims, arguments & sources',
            },
          ].map((app) => (
            <a className="app-card" href={app.href} key={app.href}>
              {app.id ? (
                <SpaceIcon spaceId={app.id} />
              ) : (
                <span className="space-icon" aria-hidden="true">
                  <Mark />
                </span>
              )}
              <span className="app-card-copy">
                <h2>{app.title}</h2>
                <p>{app.text}</p>
              </span>
              <span className="app-card-arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
        <footer>
          <span>Independent companion to Geo</span>
        </footer>
      </main>
    </>
  );
}

class Boundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="app-home">
        <h1>This app couldn’t load.</h1>
        <p>Please try again.</p>
        <button onClick={() => location.reload()}>Reload</button>{' '}
        <a href="#/">All apps</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [hash, setHash] = useState(location.hash);
  const route = parseRoute(hash);
  useEffect(() => {
    const update = () => setHash(location.hash);
    addEventListener('hashchange', update);
    return () => removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    document.title =
      route.app === 'home'
        ? 'Geo Companion — Choose an app'
        : route.app === 'preferences'
          ? `${route.tab === 'about' ? 'About' : route.tab === 'changes' ? 'Recent changes' : 'Preferences & follows'} — Geo Companion`
          : route.app === 'education'
            ? 'Education — Geo Companion'
            : route.app === 'outreach'
              ? 'Indianapolis Outreach — Geo Companion'
              : route.app === 'people'
                ? 'People & Contributions — Geo Companion'
                : route.app === 'research-debates'
                  ? 'Research Debates — Geo Companion'
                  : 'Page not found — Geo Companion';
    window.scrollTo(0, 0);
  }, [hash]);
  const navigate = (tab: string) => {
    location.hash = `/${route.app}/${tab}`;
  };
  return (
    <Boundary key={route.app}>
      <Suspense
        fallback={
          <main className="app-home" role="status">
            Loading app…
          </main>
        }
      >
        {route.app === 'home' ? (
          <Home />
        ) : route.app === 'preferences' ? (
          route.tab ? (
            <PreferenceInfo tab={route.tab} />
          ) : (
            <PreferencesPage />
          )
        ) : route.app === 'education' ? (
          <EducationApp tab={route.tab} setTab={navigate} />
        ) : route.app === 'outreach' ? (
          <OutreachApp tab={route.tab} />
        ) : ['people', 'research-debates'].includes(route.app) ? (
          <GraphApp app={route.app} />
        ) : (
          <>
            <Header />
            <main className="app-home">
              <h1>Page not found.</h1>
              <a href="#/">Choose an app</a>
            </main>
          </>
        )}
      </Suspense>
    </Boundary>
  );
}
