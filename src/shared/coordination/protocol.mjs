export const routes = [
  'education/dashboards',
  'education/curation',
  'education/debates',
  'education/map',
  'education/atlas',
  'education/questions',
  'education/live',
  'outreach/directory',
  'outreach/map',
  'outreach/weekly',
  'outreach/food',
  'outreach/coordination',
];
export const actions = ['view', 'select', 'empty'];
export function selection(value) {
  if (!value || !routes.includes(value.route)) return null;
  const result = { route: value.route };
  if (value.entity !== undefined) {
    if (
      !/^[a-f0-9]{32}$/.test(value.entity) ||
      !/^[a-f0-9]{32}$/.test(value.space)
    )
      return null;
    result.entity = value.entity;
    result.space = value.space;
  }
  return result;
}
export function events(value) {
  if (!Array.isArray(value) || !value.length || value.length > 20) return null;
  const result = [];
  for (const item of value) {
    if (!item || !routes.includes(item.route) || !actions.includes(item.action))
      return null;
    result.push({ route: item.route, action: item.action });
  }
  return result;
}
