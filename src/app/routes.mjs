export const educationTabs = [
  'map',
  'dashboards',
  'curation',
  'debates',
  'atlas',
  'questions',
  'live',
];
export const outreachTabs = [
  'directory',
  'map',
  'weekly',
  'food',
  'coordination',
];
export function parseRoute(hash) {
  const raw = hash.replace(/^#/, '').split('?')[0];
  if (educationTabs.includes(raw)) return { app: 'education', tab: raw };
  const path = raw.replace(/^\//, '').replace(/\/$/, '');
  if (!path) return { app: 'home', tab: '' };
  if (path === 'preferences') return { app: 'preferences', tab: '' };
  const [app, tab, ...rest] = path.split('/');
  if (rest.length) return { app: 'missing', tab: '' };
  if (app === 'education' && (!tab || educationTabs.includes(tab)))
    return { app, tab: tab || 'dashboards' };
  if (app === 'outreach' && (!tab || outreachTabs.includes(tab)))
    return { app, tab: tab || 'directory' };
  return { app: 'missing', tab: '' };
}
