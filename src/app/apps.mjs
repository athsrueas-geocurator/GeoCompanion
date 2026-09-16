import { EDUCATION_SPACE, OUTREACH_SPACE } from '../config/geo.mjs';

// Every app declares a real starting data scope, never a bundled icon asset.
export const APPS = [
  {
    key: 'education',
    defaultSpace: EDUCATION_SPACE,
    href: '#/education/dashboards',
    title: 'Education',
    text: 'Evidence, dashboards & curation',
  },
  {
    key: 'outreach',
    defaultSpace: OUTREACH_SPACE,
    href: '#/outreach/directory',
    title: 'Indianapolis outreach',
    text: 'Services, schedules & map',
  },
  {
    key: 'people',
    defaultSpace: EDUCATION_SPACE,
    href: '#/people',
    title: 'People & contributions',
    text: 'Explore authorship connections',
  },
  {
    key: 'research-debates',
    defaultSpace: EDUCATION_SPACE,
    href: '#/research-debates',
    title: 'Research debates',
    text: 'Claims, arguments & sources',
  },
];
