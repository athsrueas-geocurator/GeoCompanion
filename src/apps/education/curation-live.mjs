export const PROFILE = 'd00460c203779d21d96fcfc6102d7a72';
const NAME = 'a126ca530c8e48d5b88882c734c38935',
  DESCRIPTION = '9b1f76ff9711404c861e59dc3fa7d037',
  MARKDOWN = 'e3e363d1dd294ccb8e6ff3b76d99bc33',
  BLOCKS = 'beaba5cba67741a8b35377030613fc70',
  TYPES = '8f151ba4de204e3c9cb499ddf96f48f1';
const values = `values(first:20,filter:{spaceId:{is:"${PROFILE}"}}){nodes{propertyId text}pageInfo{hasNextPage}}`;
export const postListQuery = `query Posts($after:Cursor){entitiesConnection(first:20,after:$after,spaceId:"${PROFILE}",typeId:"f3d4461486b74d2583d89709c9d84f65"){nodes{id ${values}}pageInfo{hasNextPage endCursor}}}`;
export const postQuery = `query Post($id:UUID!){entity(id:$id){id ${values} relations(first:100,orderBy:POSITION_ASC,filter:{spaceId:{is:"${PROFILE}"}}){nodes{id position type{id name} toEntity{id name spaceIds ${values}}}pageInfo{hasNextPage}}}}`;
function text(entity, property) {
  const v = entity.values;
  if (!v?.nodes || v.pageInfo?.hasNextPage)
    throw Error('Geo returned incomplete text fields.');
  const matches = v.nodes.filter(
    (v) => v.propertyId === property && typeof v.text === 'string',
  );
  if (matches.length > 1) throw Error('Geo returned conflicting text fields.');
  return matches[0]?.text ?? '';
}
export function normalizePost(entity) {
  if (!entity?.id) throw Error('This Geo post is unavailable.');
  const title = text(entity, NAME);
  if (!title)
    throw Error('This post has no title in the selected profile space.');
  const c = entity.relations;
  if (!c?.nodes || c.pageInfo?.hasNextPage)
    throw Error(
      'This post exceeds the reader’s current 100-link limit. Open the complete post on Geo.',
    );
  const blocks = [],
    references = [];
  for (const r of c.nodes) {
    if (r.type.id === BLOCKS)
      blocks.push({
        id: r.id,
        entityId: r.toEntity.id,
        position: r.position,
        markdown: text(r.toEntity, MARKDOWN),
      });
    else if (r.type.id !== TYPES)
      references.push({
        id: r.id,
        relation: r.type.name || 'Reference',
        targetId: r.toEntity.id,
        name: r.toEntity.name || 'Unnamed reference',
        spaces: r.toEntity.spaceIds ?? [],
      });
  }
  blocks.sort((a, b) =>
    (a.position ?? '') < (b.position ?? '')
      ? -1
      : (a.position ?? '') > (b.position ?? '')
        ? 1
        : 0,
  );
  return {
    id: entity.id,
    title,
    description: text(entity, DESCRIPTION),
    blocks,
    references,
  };
}
const cache = new Map();
async function read(query, variables, signal, force) {
  const key = JSON.stringify([query, variables]),
    old = cache.get(key);
  if (!force && old && Date.now() - old.at < 300000) return old;
  const r = await fetch('https://api-testnet.geobrowser.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!r.ok) throw Error(`Geo is unavailable (${r.status}).`);
  const d = await r.json();
  if (d.errors?.length || !d.data)
    throw Error('Geo could not complete this read.');
  return { key, data: d.data, at: Date.now() };
}
function remember(r) {
  if (cache.size >= 30) cache.delete(cache.keys().next().value);
  cache.set(r.key, r);
}
export async function readPosts(after, signal, force = false) {
  const r = await read(postListQuery, { after }, signal, force),
    c = r.data.entitiesConnection;
  if (!c?.nodes || !c.pageInfo) throw Error('Malformed post list.');
  const posts = c.nodes.map((e) => ({
    id: e.id,
    title: text(e, NAME) || 'Untitled post',
  }));
  if (c.pageInfo.hasNextPage && !c.pageInfo.endCursor)
    throw Error('Geo did not return the next page cursor.');
  remember(r);
  return {
    posts,
    next: c.pageInfo.hasNextPage ? c.pageInfo.endCursor : null,
    at: r.at,
  };
}
export async function readPost(id, signal, force = false) {
  if (!/^[a-f0-9]{32}$/.test(id)) throw Error('Invalid Geo post ID.');
  const r = await read(postQuery, { id }, signal, force),
    post = normalizePost(r.data.entity);
  remember(r);
  return { ...post, at: r.at };
}
