export const SPACE = 'dac259bad48a11adf97fe36857d85206';
export const GEOGRAPHY = '84a679ce188f061ac9a92380bac2bab5';
export const KEY = 'geocompanion.education-locations.v1';
export const TTL = 3600000,
  RETENTION = 7 * 86400000;
const endpoint = 'https://api-testnet.geobrowser.io/graphql';
export const locationsQuery = `query Locations($after:Cursor){relationsConnection(first:100,after:$after,filter:{spaceId:{is:"${SPACE}"},typeId:{is:"95d770021faf4f7cb7deb21a7d48cda0"}}){nodes{fromEntity{id name} toEntity{id name}} pageInfo{hasNextPage endCursor}}}`;
export const pointsQuery = `query Points($ids:[UUID!]!){entitiesConnection(first:100,filter:{id:{in:$ids}}){nodes{id values(first:2,filter:{spaceId:{is:"${GEOGRAPHY}"},propertyId:{is:"7cfc4990e0684b7798aa834137d02953"}}){nodes{point} pageInfo{hasNextPage}}} pageInfo{hasNextPage}}}`;
export function parsePoint(value) {
  if (
    typeof value !== 'string' ||
    !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(value)
  )
    return null;
  const p = value.split(',').map(Number);
  return Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180 ? p : null;
}
export function groupLocations(edges) {
  const groups = new Map();
  for (const { fromEntity: f, toEntity: t } of edges) {
    if (!f?.id || !t?.id)
      throw Error('Geo returned an incomplete location relation.');
    if (!groups.has(t.id))
      groups.set(t.id, {
        id: t.id,
        name: t.name || 'Unnamed location',
        records: [],
      });
    const g = groups.get(t.id);
    if (!g.records.some((r) => r.id === f.id))
      g.records.push({ id: f.id, name: f.name || 'Unnamed record' });
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function readCache(storage, now = Date.now()) {
  try {
    const c = JSON.parse(storage.getItem(KEY));
    if (
      c?.version !== 1 ||
      !Number.isFinite(c.at) ||
      c.at > now ||
      now - c.at > RETENTION ||
      !Array.isArray(c.locations) ||
      c.locations.length > 100
    )
      return null;
    if (
      !c.locations.every(
        (g) =>
          /^[a-f0-9]{32}$/.test(g.id) &&
          typeof g.name === 'string' &&
          Array.isArray(g.records) &&
          g.records.every(
            (r) => /^[a-f0-9]{32}$/.test(r.id) && typeof r.name === 'string',
          ) &&
          (g.point === null ||
            (Array.isArray(g.point) &&
              g.point.length === 2 &&
              g.point.every(Number.isFinite) &&
              Math.abs(g.point[0]) <= 90 &&
              Math.abs(g.point[1]) <= 180)),
      )
    )
      return null;
    return c;
  } catch {
    return null;
  }
}
async function query(query, variables, signal) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!r.ok) throw Error(`Geo request failed (${r.status}).`);
  const d = await r.json();
  if (d.errors?.length || !d.data)
    throw Error('Geo could not complete the location query.');
  return d.data;
}
export async function fetchLocations(signal) {
  let after = null,
    edges = [],
    partial = false;
  const cursors = new Set();
  for (let n = 0; n < 10; n++) {
    const { relationsConnection: c } = await query(
      locationsQuery,
      { after },
      signal,
    );
    if (!c?.nodes || !c.pageInfo)
      throw Error('Malformed Geo location response.');
    edges.push(...c.nodes);
    partial = c.pageInfo.hasNextPage;
    if (!partial) break;
    after = c.pageInfo.endCursor;
    if (!after || cursors.has(after))
      throw Error('Geo returned an invalid pagination cursor.');
    cursors.add(after);
  }
  const all = groupLocations(edges),
    locations = all.slice(0, 100);
  partial = partial || all.length > 100;
  if (locations.length) {
    const { entitiesConnection: c } = await query(
      pointsQuery,
      { ids: locations.map((g) => g.id) },
      signal,
    );
    if (!c?.nodes || c.pageInfo?.hasNextPage)
      throw Error('Incomplete Geo coordinate response.');
    for (const g of locations) {
      const v = c.nodes.find((e) => e.id === g.id)?.values;
      g.point =
        v && !v.pageInfo.hasNextPage && v.nodes.length === 1
          ? parsePoint(v.nodes[0].point)
          : null;
    }
  }
  return { version: 1, at: Date.now(), locations, partial };
}
