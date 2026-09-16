import { geoReader } from '../../shared/geo/client.mjs';
export const ROLES = {
  authors: '91a9e2f6e51a48f7997661de8561b690',
  author: 'edb97803943444999c2cf0bc1fd8e067',
  source: '49c5d5e1679a4dbdbfd33f618f227c94',
  supports: '1dc6a843458848198e7a6e672268f811',
  opposes: '4e6ec5d14292498a84e5f607ca1a08ce',
  related: '504e5776788844f6a77dba3ee811d8f0',
};
export const GRAPH_QUERY = `query GraphSlice($space:UUID!,$kinds:[UUID!]!,$after:Cursor){relationsConnection(first:50,after:$after,filter:{spaceId:{is:$space},typeId:{in:$kinds}}){nodes{id spaceId typeId type{id name} fromEntity{id name} toEntity{id name}}pageInfo{hasNextPage endCursor}}}`;
const uuid = (id) => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);
const readable = (name) => typeof name === 'string' && !!name.trim();
export const GRAPH_SPACES_QUERY = `query GraphEndpointSpaces($ids:[UUID!]!){spaces(first:20,filter:{id:{in:$ids}}){id type page{id name}}}`;
export function parseGraph(data, space, kinds) {
  const p = data?.relationsConnection;
  if (
    !Array.isArray(p?.nodes) ||
    typeof p.pageInfo?.hasNextPage !== 'boolean' ||
    (p.pageInfo.hasNextPage &&
      (typeof p.pageInfo.endCursor !== 'string' || !p.pageInfo.endCursor))
  )
    throw Error('Relationships could not be read completely.');
  const nodes = new Map(),
    edges = [];
  for (const e of p.nodes) {
    if (
      !uuid(e.id) ||
      !uuid(e.typeId) ||
      e.spaceId !== space ||
      (kinds && !kinds.includes(e.typeId)) ||
      !uuid(e.fromEntity?.id) ||
      !uuid(e.toEntity?.id) ||
      e.type?.id !== e.typeId
    )
      throw Error('A relationship has an invalid scope or identity.');
    for (const n of [e.fromEntity, e.toEntity])
      nodes.set(n.id, {
        id: n.id,
        label: readable(n.name) ? n.name.trim() : `Unnamed entity · ${n.id}`,
        labelSource: readable(n.name) ? 'entity' : 'identifier',
        space,
      });
    edges.push({
      id: e.id,
      source: e.fromEntity.id,
      target: e.toEntity.id,
      type: e.typeId,
      label: readable(e.type.name)
        ? e.type.name.trim()
        : `Relationship · ${e.typeId}`,
      space,
    });
  }
  return {
    nodes: [...nodes.values()],
    edges,
    scope: space,
    partial: p.pageInfo.hasNextPage,
    next: p.pageInfo.hasNextPage ? p.pageInfo.endCursor : null,
  };
}
// A relation endpoint can be a Space identity whose separate page carries its name.
// Resolve by exact identity, never by a title fragment or a guessed person's name.
export async function resolveGraphLabels(graph, reader = geoReader) {
  const ids = graph.nodes
    .filter((n) => n.labelSource === 'identifier')
    .map((n) => n.id);
  const resolved = new Map();
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20);
    const spaces = await reader.read(
      GRAPH_SPACES_QUERY,
      { ids: batch },
      (d) => {
        if (!Array.isArray(d?.spaces))
          throw Error('Space names could not be read.');
        const seen = new Set();
        for (const s of d.spaces) {
          if (
            !batch.includes(s.id) ||
            seen.has(s.id) ||
            (s.page && !uuid(s.page.id))
          )
            throw Error('A space name has an invalid identity.');
          seen.add(s.id);
        }
        return d.spaces;
      },
      'graph-space-labels-1',
    );
    for (const s of spaces) {
      if (readable(s.page?.name)) resolved.set(s.id, s.page);
    }
  }
  return {
    ...graph,
    nodes: graph.nodes.map((n) => {
      const page = resolved.get(n.id);
      return page
        ? {
            ...n,
            label: page.name.trim(),
            labelSource: 'space-page',
            labelEntityId: page.id,
            geoUrl: `https://www.geobrowser.io/space/${n.id}/${page.id}`,
          }
        : n;
    }),
  };
}
/** @param {string} space @param {string} app @param {string|null} after */
export async function readGraph(space, app, after = null) {
  if (!uuid(space)) throw Error('Enter a 32-character Geo space ID.');
  const kinds =
    app === 'all'
      ? null
      : app === 'people'
        ? [ROLES.authors, ROLES.author]
        : [ROLES.supports, ROLES.opposes, ROLES.related, ROLES.source];
  const graph = await geoReader.read(
    kinds ? GRAPH_QUERY : BROAD_QUERY,
    kinds ? { space, kinds, after } : { space, after },
    (d) => parseGraph(d, space, kinds),
    'graph-slice-2',
  );
  return resolveGraphLabels(graph);
}

export const BROAD_QUERY = GRAPH_QUERY.replace(',$kinds:[UUID!]!', '').replace(
  ',typeId:{in:$kinds}',
  '',
);
export function mergeGraphs(a, b) {
  if (a && a.scope !== b.scope) throw Error('Cannot merge different scopes.');
  return {
    ...b,
    partial: !!a?.partial || b.partial,
    nodes: [
      ...new Map(
        [...(a?.nodes || []), ...b.nodes].map((n) => [n.id, n]),
      ).values(),
    ],
    edges: [
      ...new Map(
        [...(a?.edges || []), ...b.edges].map((e) => [e.id, e]),
      ).values(),
    ],
  };
}
/** @param {string} space @param {string} id @param {string} direction @param {string|null} after */
export async function expandGraph(space, id, direction, after = null) {
  if (
    !uuid(space) ||
    !uuid(id) ||
    !['incoming', 'outgoing'].includes(direction)
  )
    throw Error('Invalid graph expansion.');
  const field = direction === 'incoming' ? 'toEntityId' : 'fromEntityId';
  const query = BROAD_QUERY.replace(
    '$after:Cursor',
    '$id:UUID!,$after:Cursor',
  ).replace('spaceId:{is:$space}', `spaceId:{is:$space},${field}:{is:$id}`);
  const graph = await geoReader.read(
    query,
    { space, id, after },
    (d) => {
      const g = parseGraph(d, space, null);
      if (
        g.edges.some(
          (e) => (direction === 'incoming' ? e.target : e.source) !== id,
        )
      )
        throw Error('Invalid neighborhood.');
      return g;
    },
    'graph-neighbors-1',
  );
  return resolveGraphLabels(graph);
}

/** Reuse downloaded continuation pages without automatically extending the network crawl. */
export async function readGraphWindow(space, app) {
  let graph = await readGraph(space, app);
  const kinds =
    app === 'all'
      ? null
      : app === 'people'
        ? [ROLES.authors, ROLES.author]
        : [ROLES.supports, ROLES.opposes, ROLES.related, ROLES.source];
  const seen = new Set();
  for (let i = 0; i < 39 && graph.next; i++) {
    const after = graph.next;
    if (seen.has(after)) throw Error('Cached cursor repeated.');
    seen.add(after);
    const page = await geoReader.peek(
      kinds ? GRAPH_QUERY : BROAD_QUERY,
      kinds ? { space, kinds, after } : { space, after },
      'graph-slice-2',
    );
    if (!page) break;
    graph = {
      ...mergeGraphs(graph, page),
      partial: page.partial,
      next: page.next,
    };
  }
  return resolveGraphLabels(graph);
}
