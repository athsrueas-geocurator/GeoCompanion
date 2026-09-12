export const RELEASE_SEEN_KEY = 'geocompanion.releases.seen.v1';
export function parseReleases(data) {
  if (!Array.isArray(data) || data.length > 100)
    throw Error('Release notes unavailable.');
  const ids = new Set();
  for (const r of data) {
    if (
      !r ||
      typeof r.id !== 'string' ||
      !/^[a-f0-9-]{36}$/.test(r.id) ||
      ids.has(r.id) ||
      typeof r.version !== 'string' ||
      !/^\d+\.\d+\.\d+$/.test(r.version) ||
      typeof r.deployedAt !== 'string' ||
      !Number.isFinite(Date.parse(r.deployedAt)) ||
      typeof r.title !== 'string' ||
      r.title.length > 150 ||
      !Array.isArray(r.changes) ||
      r.changes.length > 12 ||
      r.changes.some((c) => typeof c !== 'string' || c.length > 500)
    )
      throw Error('Release notes unavailable.');
    ids.add(r.id);
  }
  return [...data].sort(
    (a, b) => Date.parse(b.deployedAt) - Date.parse(a.deployedAt),
  );
}
export function hasNewRelease(latest, seen) {
  return Boolean(
    latest &&
      seen &&
      Number.isFinite(Date.parse(seen.deployedAt)) &&
      Date.parse(latest.deployedAt) > Date.parse(seen.deployedAt),
  );
}
