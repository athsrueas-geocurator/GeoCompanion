const valid = (id) => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);
export function dominantSpace(contributions, fallback) {
  const spaces = new Map();
  for (const { space, id } of contributions) {
    if (!valid(space) || !valid(id)) continue;
    if (!spaces.has(space)) spaces.set(space, new Set());
    spaces.get(space).add(id);
  }
  return (
    [...spaces].sort(
      (a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]),
    )[0]?.[0] || fallback
  );
}
const prefix = 'geocompanion.app-space.';
export function rememberAppSpace(app, contributions, fallback) {
  const space = dominantSpace(contributions, fallback);
  try {
    sessionStorage.setItem(
      prefix + app,
      JSON.stringify({ space, at: Date.now() }),
    );
  } catch {
    /* Storage is optional. */
  }
  return space;
}
export function rememberedAppSpace(app, fallback) {
  try {
    const entry = JSON.parse(sessionStorage.getItem(prefix + app) || 'null');
    if (
      valid(entry?.space) &&
      Number.isFinite(entry.at) &&
      Date.now() - entry.at >= 0 &&
      Date.now() - entry.at < 86400000
    )
      return entry.space;
  } catch {
    /* Use the app's declared starting scope. */
  }
  return fallback;
}
export function graphContributions(graph) {
  // Attribution follows the asserting edge, not every global entity membership.
  return graph.edges.flatMap((e) => [
    { space: e.space, id: e.source },
    { space: e.space, id: e.target },
  ]);
}
