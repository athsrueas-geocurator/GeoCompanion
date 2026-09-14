import Directory from './Directory';
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
        <h2>{view[1]}</h2>
        <Directory tab={tab} />
        <footer>
          <span>Geo Companion / Indianapolis Outreach</span>
        </footer>
      </main>
    </div>
  );
}
