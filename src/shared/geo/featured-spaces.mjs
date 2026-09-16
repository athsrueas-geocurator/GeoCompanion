import { geoReader } from './client.mjs';

// Geo's Featured flag is a Root-scoped Tags relation on a topic, not a Space boolean.
export const FEATURED_ROOT = 'a19c345ab9866679b001d7d2138d88a1';
export const FEATURED_TAG = 'ec3086a54ddf43d8aaefd6cc6e1b0556';
export const TAG_PROPERTY = '257090341ba5406f94e4d4af90042fba';
export const FEATURED_QUERY = `query FeaturedSpaces($after:Cursor){
  relationsConnection(first:50,after:$after,filter:{spaceId:{is:"${FEATURED_ROOT}"},typeId:{is:"${TAG_PROPERTY}"},toEntityId:{is:"${FEATURED_TAG}"}}){
    nodes{id spaceId typeId toEntityId fromEntity{id name spacesByTopicIdConnection(first:20){nodes{id page{name}}pageInfo{hasNextPage}}}}
    pageInfo{hasNextPage endCursor}
  }
}`;
const uuid = (value) =>
  typeof value === 'string' && /^[a-f0-9]{32}$/.test(value);
export function parseFeaturedPage(data) {
  const connection = data?.relationsConnection;
  if (
    !Array.isArray(connection?.nodes) ||
    typeof connection.pageInfo?.hasNextPage !== 'boolean' ||
    (connection.pageInfo.hasNextPage &&
      (typeof connection.pageInfo.endCursor !== 'string' ||
        !connection.pageInfo.endCursor))
  )
    throw Error('Featured spaces could not be loaded completely.');
  const spaces = new Map();
  for (const relation of connection.nodes) {
    if (
      !uuid(relation.id) ||
      relation.spaceId !== FEATURED_ROOT ||
      relation.typeId !== TAG_PROPERTY ||
      relation.toEntityId !== FEATURED_TAG ||
      !uuid(relation.fromEntity?.id)
    )
      throw Error('Featured space attribution could not be verified.');
    const topic = relation.fromEntity,
      claims = topic.spacesByTopicIdConnection;
    if (!Array.isArray(claims?.nodes) || claims.pageInfo?.hasNextPage !== false)
      throw Error('Featured topic has an incomplete space list.');
    // The same tag also marks articles; only topics with claiming spaces become pins.
    for (const space of claims.nodes) {
      const name = space.page?.name || topic.name;
      if (!uuid(space.id) || typeof name !== 'string' || !name.trim())
        throw Error('A featured space is missing its name or identity.');
      if (space.id !== FEATURED_ROOT)
        spaces.set(space.id, { id: space.id, name: name.trim() });
    }
  }
  return {
    spaces: [...spaces.values()],
    next: connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null,
  };
}
export async function loadFeaturedSpaces(reader = geoReader) {
  const spaces = new Map(),
    seen = new Set();
  let after = null;
  for (let page = 0; page < 10; page++) {
    const result = await reader.read(
      FEATURED_QUERY,
      { after },
      parseFeaturedPage,
      'featured-spaces-1',
    );
    for (const space of result.spaces) spaces.set(space.id, space);
    if (!result.next)
      return [...spaces.values()].sort(
        (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
      );
    if (seen.has(result.next))
      throw Error('Featured spaces did not finish loading.');
    seen.add(result.next);
    after = result.next;
  }
  throw Error('Featured spaces exceeded the discovery limit.');
}
