import { SPACE } from './education-live.mjs';
import { PROFILE } from './curation-live.mjs';
// Bootstrap from actual screen adapters, not a separate catalog of space names.
export const ROOTS = [SPACE, PROFILE];
export const KINDS = {
  sources: '49c5d5e1679a4dbdbfd33f618f227c94',
  places: '95d770021faf4f7cb7deb21a7d48cda0',
  related: 'dfa6aebe1ca94bf29faccc4cc7afb24c',
};
export const QUERY = `query Connections($space:UUID!,$after:Cursor){relationsConnection(first:100,after:$after,filter:{spaceId:{is:$space},typeId:{in:${JSON.stringify(Object.values(KINDS))}}}){nodes{id spaceId type{id name}fromEntity{id name}toEntity{id name spaceIds}}pageInfo{hasNextPage endCursor}}}`;
const cache = new Map();
async function query(q, variables, signal, force = false) {
  const key = JSON.stringify([q, variables]),
    old = cache.get(key);
  if (!force && old && Date.now() - old.at < 300000) return old.data;
  const r = await fetch('https://api-testnet.geobrowser.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, variables }),
    signal,
  });
  if (!r.ok) throw Error('Connections could not be loaded. Please try again.');
  const result = await r.json();
  if (result.errors?.length || !result.data)
    throw Error('Connections could not be read. Please try again.');
  if (cache.size >= 40) cache.delete(cache.keys().next().value);
  cache.set(key, { at: Date.now(), data: result.data });
  return result.data;
}
export function groupConnections(edges) {
  const groups = new Map();
  for (const e of edges) {
    if (!e.fromEntity?.id || !e.toEntity?.id || !e.type?.id || !e.spaceId)
      throw Error('Incomplete connection.');
    if (!e.fromEntity.name || !e.toEntity.name) continue;
    const key = e.toEntity.id;
    if (!groups.has(key))
      groups.set(key, {
        id: key,
        name: e.toEntity.name,
        targetSpace: e.toEntity.spaceIds?.[0] || e.spaceId,
        spaces: new Set(),
        kinds: new Set(),
        links: [],
      });
    const g = groups.get(key);
    for (const s of [e.spaceId, ...(e.toEntity.spaceIds ?? [])])
      g.spaces.add(s);
    g.kinds.add(e.type.id);
    if (!g.links.some((l) => l.id === e.id))
      g.links.push({
        id: e.id,
        space: e.spaceId,
        relation: e.type.name || 'Related',
        sourceId: e.fromEntity.id,
        name: e.fromEntity.name,
      });
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      spaces: [...g.spaces],
      kinds: [...g.kinds],
      count: new Set(g.links.map((l) => l.sourceId)).size,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
export async function loadConnections(previous, signal, force = false) {
  const pending = ROOTS.filter((s) => !previous || previous.cursors[s]);
  const pages = await Promise.all(
    pending.map(async (space) => {
      const d = await query(
        QUERY,
        { space, after: previous?.cursors[space] ?? null },
        signal,
        force,
      );
      const c = d.relationsConnection;
      if (
        previous?.cursors[space] &&
        c?.pageInfo?.hasNextPage &&
        previous.cursors[space] === c.pageInfo.endCursor
      )
        throw Error('The next connections page is unavailable.');
      if (
        !Array.isArray(c?.nodes) ||
        !c.pageInfo ||
        (c.pageInfo.hasNextPage && !c.pageInfo.endCursor)
      )
        throw Error('Incomplete connection list.');
      return {
        space,
        edges: c.nodes,
        next: c.pageInfo.hasNextPage ? c.pageInfo.endCursor : null,
      };
    }),
  );
  const byId = new Map((previous?.edges ?? []).map((e) => [e.id, e]));
  const cursors = { ...previous?.cursors };
  for (const p of pages) {
    p.edges.forEach((e) => byId.set(e.id, e));
    cursors[p.space] = p.next;
  }
  const edges = [...byId.values()],
    groups = groupConnections(edges);
  const ids = [
    ...new Set([...ROOTS, ...groups.flatMap((g) => g.spaces)]),
  ].slice(0, 100);
  const data = await query(
    'query SpaceNames($ids:[UUID!]!){spaces(first:100,filter:{id:{in:$ids}}){id page{id name}}}',
    { ids },
    signal,
    force,
  );
  if (!Array.isArray(data.spaces))
    throw Error('Collection names could not be read.');
  return {
    edges,
    cursors,
    groups,
    spaces: data.spaces.map((s) => ({
      id: s.id,
      name: s.page?.name || `Collection ${s.id.slice(0, 8)}`,
    })),
    more: Object.values(cursors).some(Boolean),
  };
}
