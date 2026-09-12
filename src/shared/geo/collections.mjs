import { geoReader } from './client.mjs';
export const REL = {
  blocks: 'beaba5cba67741a8b35377030613fc70',
  item: 'a99f9ce12ffa4dac8c61f6310d46064a',
};
export const EDGE_QUERY = `query CollectionEdges($space:UUID!,$id:UUID!,$type:UUID!,$after:Cursor){relationsConnection(first:25,after:$after,filter:{spaceId:{is:$space},fromEntityId:{is:$id},typeId:{is:$type}}){nodes{id spaceId fromEntityId typeId position toEntityId toEntity{id name spaceIds}}pageInfo{hasNextPage endCursor}}}`;
export const validId = (id) =>
  typeof id === 'string' && /^[a-f0-9]{32}$/i.test(id);
export function parseEdges(data, space, id, type) {
  const c = data.relationsConnection;
  if (
    !Array.isArray(c?.nodes) ||
    typeof c.pageInfo?.hasNextPage !== 'boolean' ||
    (c.pageInfo.hasNextPage && !c.pageInfo.endCursor)
  )
    throw Error('Collection membership is incomplete.');
  const edges = c.nodes.map((e) => {
    if (
      !validId(e.id) ||
      e.spaceId !== space ||
      e.fromEntityId !== id ||
      e.typeId !== type ||
      !validId(e.toEntityId)
    )
      throw Error('Collection membership could not be verified.');
    return { ...e, position: typeof e.position === 'string' ? e.position : '' };
  });
  return { edges, next: c.pageInfo.hasNextPage ? c.pageInfo.endCursor : null };
}
export function orderedEdges(edges) {
  return [...new Map(edges.map((e) => [e.id, e])).values()].sort((a, b) =>
    a.position < b.position
      ? -1
      : a.position > b.position
        ? 1
        : a.id.localeCompare(b.id),
  );
}
export async function readEdges(space, id, type, after = null) {
  if (![space, id, type].every(validId))
    throw Error('Invalid collection selection.');
  return geoReader.read(
    EDGE_QUERY,
    { space, id, type, after },
    (d) => parseEdges(d, space, id, type),
    'collection-1',
  );
}
export async function completeEdges(space, id, type) {
  let after = null;
  const edges = [],
    seen = new Set();
  for (let page = 0; page < 40; page++) {
    const result = await readEdges(space, id, type, after);
    edges.push(...result.edges);
    if (!result.next) return orderedEdges(edges);
    if (seen.has(result.next)) throw Error('The collection cursor repeated.');
    seen.add(result.next);
    after = result.next;
  }
  throw Error(
    'This collection is too large to open completely. Open it on Geo.',
  );
}
