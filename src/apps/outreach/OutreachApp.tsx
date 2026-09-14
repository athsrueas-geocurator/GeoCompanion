import { lazy, Suspense } from 'react';
const OutreachMap = lazy(() => import('./OutreachMap'));
import Brand from '../../shared/branding/Brand';
import SpaceIcon from '../../shared/branding/SpaceIcon';
import { OUTREACH_SPACE } from '../../config/geo.mjs';
const views = [
  [
    'directory',
    'Service directory',
    'Find services by need, location and eligibility.',
  ],
  ['map', 'Service map', 'Find public service locations around Indianapolis.'],
  ['weekly', 'Weekly help schedule', 'See service times throughout the week.'],
  ['food', 'Food outreach', 'Find meal and grocery distribution schedules.'],
  [
    'coordination',
    'Provider coordination',
    'Explore specialties, referral contacts and coverage.',
  ],
];
import { PreferencesLink } from '../../shared/preferences/Preferences';
export default function OutreachApp({ tab }: { tab: string }) {
  const view = views.find((v) => v[0] === tab)!;
  return (
    <div className="outreach-app">
      <header>
        <Brand />
        <div className="header-actions">
          <PreferencesLink />
          <a className="geo-link" href="#/">
            All apps
          </a>
        </div>
      </header>
      <main className="outreach-main">
        <div className="eyebrow">INDIANAPOLIS & MARION COUNTY</div>
        <div className="outreach-workspace">
          <SpaceIcon spaceId={OUTREACH_SPACE} />
          <span>Outreach</span>
        </div>
        <h1>Outreach & resources</h1>
        <p className="app-intro">
          For outreach workers and community service providers.
        </p>
        <nav className="outreach-nav" aria-label="Outreach workspace">
          {views.map(([id, name]) => (
            <a
              key={id}
              href={`#/outreach/${id}`}
              aria-current={tab === id ? 'page' : undefined}
            >
              {name}
            </a>
          ))}
        </nav>
        <section className="outreach-empty" aria-labelledby="outreach-title">
          {tab !== 'map' && (
            <span className="app-status">Directory in preparation</span>
          )}
          <h2 id="outreach-title">{view[1]}</h2>
          {tab === 'map' ? (
            <>
              <p>No verified service locations to show yet.</p>
              <Suspense fallback={<p role="status">Loading map…</p>}>
                <OutreachMap />
              </Suspense>
            </>
          ) : (
            <>
              <p>{view[2]}</p>
              <div className="outreach-notice">
                <h3>Verified services aren’t available here yet.</h3>
                <p>
                  Provider contacts, eligibility, locations and schedules are
                  being prepared for review. This workspace cannot yet tell you
                  where help is available today.
                </p>
              </div>
            </>
          )}
        </section>
        <footer>
          <span>Geo Companion / Indianapolis Outreach</span>
        </footer>
      </main>
    </div>
  );
}
