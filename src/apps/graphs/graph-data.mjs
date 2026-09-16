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
      e.spaceId !== space ||
      !kinds.includes(e.typeId) ||
      !uuid(e.fromEntity?.id) ||
      !uuid(e.toEntity?.id) ||
      e.type?.id !== e.typeId
    )
      throw Error('A relationship has an invalid scope or identity.');
    if (
      [e.fromEntity.name, e.toEntity.name, e.type.name].some(
        (name) => typeof name !== 'string' || !name.trim(),
      )
    )
      throw Error(
        'A relationship is missing a readable label. Refresh to try again.',
      );
    for (const n of [e.fromEntity, e.toEntity])
      nodes.set(n.id, { id: n.id, label: n.name, space });
    edges.push({
      id: e.id,
      source: e.fromEntity.id,
      target: e.toEntity.id,
      type: e.typeId,
      label: e.type.name,
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
/** @param {string} space @param {string} app @param {string|null} after */
export function readGraph(space, app, after = null) {
  if (!uuid(space)) throw Error('Enter a 32-character Geo space ID.');
  const kinds =
    app === 'people'
      ? [ROLES.authors, ROLES.author]
      : [ROLES.supports, ROLES.opposes, ROLES.related, ROLES.source];
  return geoReader.read(
    GRAPH_QUERY,
    { space, kinds, after },
    (d) => parseGraph(d, space, kinds),
    'graph-slice-1',
  );
}
