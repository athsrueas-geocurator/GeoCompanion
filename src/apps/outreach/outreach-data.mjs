import { weeklyHours } from './schedule.mjs';
import { OUTREACH_SPACE as SPACE } from '../../config/geo.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { completeEdges, REL } from '../../shared/geo/collections.mjs';

export const DIRECTORY = '0ae9cde5b3f347208e35b746a6b57799';
export const P = {
  name: 'a126ca530c8e48d5b88882c734c38935',
  description: '9b1f76ff9711404c861e59dc3fa7d037',
  url: '412ff593e9154012a43d4c27ec5c68b6',
  schedule: '3a907dcf5061409b99f0808a25cf6a2d',
  point: '52ea43b6fe4c4512a763e47986a26ef0',
  types: '8f151ba4de204e3c9cb499ddf96f48f1',
  service: '0e0ff96eb1b84385901f46151c09659f',
  stop: 'c86e21e4a16e49ccbc0606b25435efe1',
  provider: '261fad421cc744938acbaa4a4c74220c',
  location: '95d770021faf4f7cb7deb21a7d48cda0',
  source: '49c5d5e1679a4dbdbfd33f618f227c94',
};
// No arbitrary fields, contact properties, personal records or schedule inference.
export const QUERY = `query OutreachRecords($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,filter:{id:{in:$ids}}){nodes{id values(first:20,filter:{spaceId:{is:$space},propertyId:{in:["${P.name}","${P.description}","${P.url}","${P.point}","${P.schedule}"]}}){nodes{spaceId propertyId text point schedule}pageInfo{hasNextPage}} relations(first:50,filter:{spaceId:{is:$space},typeId:{in:["${P.types}","${P.provider}","${P.location}","${P.source}"]}}){nodes{spaceId typeId toEntityId}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
export function publicUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      !u.search &&
      !u.hash &&
      publicText(decodeURIComponent(u.pathname))
      ? u.href
      : null;
  } catch {
    return null;
  }
}
function publicText(value) {
  // Defence in depth for prose; dedicated contact fields are never queried.
  return typeof value === 'string' &&
    !/[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/i.test(
      value,
    )
    ? value
    : '';
}
export function parseRecord(e) {
  if (
    e.values?.pageInfo?.hasNextPage !== false ||
    e.relations?.pageInfo?.hasNextPage !== false ||
    !Array.isArray(e.values?.nodes) ||
    !Array.isArray(e.relations?.nodes)
  )
    throw Error('Service details are incomplete.');
  const fields = new Map();
  for (const v of e.values.nodes) {
    if (
      v.spaceId !== SPACE ||
      ![P.name, P.description, P.url, P.point, P.schedule].includes(
        v.propertyId,
      )
    )
      throw Error('Unexpected service field.');
    const value = v.schedule ?? v.point ?? v.text;
    if (fields.has(v.propertyId) && fields.get(v.propertyId) !== value)
      throw Error('Conflicting service details.');
    fields.set(v.propertyId, value);
  }
  if (
    e.relations.nodes.some(
      (r) =>
        r.spaceId !== SPACE ||
        ![P.types, P.provider, P.location, P.source].includes(r.typeId),
    )
  )
    throw Error('Unexpected service relationship.');
  const links = (type) => [
    ...new Set(
      e.relations.nodes
        .filter((r) => r.typeId === type)
        .map((r) => r.toEntityId),
    ),
  ];
  const raw = fields.get(P.point);
  const point = typeof raw === 'string' ? raw.split(',').map(Number) : [];
  const validPoint =
    point.length === 2 &&
    point.every(Number.isFinite) &&
    raw.split(',').every((x) => x.trim()) &&
    Math.abs(point[0]) <= 90 &&
    Math.abs(point[1]) <= 180;
  return {
    id: e.id,
    name: publicText(fields.get(P.name)) || 'Unnamed entry',
    description: publicText(fields.get(P.description)),
    url: publicUrl(fields.get(P.url)),
    point: validPoint && links(P.types).includes(P.stop) ? point : null,
    hours: weeklyHours(fields.get(P.schedule)),
    types: links(P.types),
    providers: links(P.provider),
    locations: links(P.location),
    sources: links(P.source),
  };
}
async function records(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    out.push(
      ...(await geoReader.read(
        QUERY,
        { space: SPACE, ids: batch },
        (d) => {
          const c = d.entitiesConnection;
          if (
            !Array.isArray(c?.nodes) ||
            c.pageInfo?.hasNextPage !== false ||
            c.nodes.some((e) => !batch.includes(e.id))
          )
            throw Error('Service records are unavailable.');
          return c.nodes.map(parseRecord);
        },
        'outreach-records-2',
      )),
    );
  }
  return out;
}
export async function loadDirectory(force = false) {
  if (force) geoReader.invalidate();
  const blocks = await completeEdges(SPACE, DIRECTORY, REL.blocks);
  const members = [];
  for (const b of blocks)
    members.push(...(await completeEdges(SPACE, b.toEntityId, REL.item)));
  const ids = [...new Set(members.map((e) => e.toEntityId))];
  if (ids.length > 1000)
    throw Error('The directory is too large to load completely.');
  const services = await records(ids);
  if (
    services.length !== ids.length ||
    services.some((s) => !s.types.includes(P.service))
  )
    throw Error('Some directory entries are unavailable.');
  const linkedIds = [
    ...new Set(
      services.flatMap((s) => [...s.providers, ...s.locations, ...s.sources]),
    ),
  ];
  const linked = new Map((await records(linkedIds)).map((r) => [r.id, r]));
  return services.map((s) => ({
    ...s,
    providers: s.providers.map((id) => linked.get(id)).filter(Boolean),
    locations: s.locations.map((id) => linked.get(id)).filter(Boolean),
    sources: s.sources.map((id) => linked.get(id)).filter(Boolean),
  }));
}
