import { geoReader } from '../geo/client.mjs';
const valid = (id) => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);
export const DETAILS_QUERY = `query GraphEntityDetails($id:UUID!,$space:UUID!){entity(id:$id){id values(first:32,filter:{spaceId:{is:$space}}){nodes{spaceId propertyId property{id name} text decimal integer boolean float date datetime time unit}pageInfo{hasNextPage}} relations(first:20,filter:{spaceId:{is:$space}}){nodes{id spaceId typeId type{id name}toEntity{id name}}pageInfo{hasNextPage}}}}`;
export function parseDetails(data, id, space) {
  const e = data?.entity;
  if (!e || e.id !== id) throw Error('Entity details are unavailable.');
  for (const c of [e.values, e.relations])
    if (
      !Array.isArray(c?.nodes) ||
      typeof c.pageInfo?.hasNextPage !== 'boolean'
    )
      throw Error('Entity details could not be read.');
  const fields = [];
  for (const v of e.values.nodes) {
    if (
      v.spaceId !== space ||
      !valid(v.propertyId) ||
      v.property?.id !== v.propertyId
    )
      throw Error('Property attribution could not be verified.');
    const value =
      v.decimal ??
      v.integer ??
      v.float ??
      v.boolean ??
      v.date ??
      v.datetime ??
      v.time ??
      v.text;
    if (value === null || value === undefined) continue;
    const label = v.property.name?.trim() || `Property · ${v.propertyId}`;
    // Keep contact values out of the outreach-oriented reader's derived displays.
    if (
      /email|phone|contact|wallet|address/i.test(label) ||
      /\S+@\S+\.\S+/.test(String(value))
    )
      continue;
    fields.push({
      id: v.propertyId,
      label,
      value:
        typeof value === 'boolean'
          ? value
            ? 'Yes'
            : 'No'
          : String(value) + (v.unit ? ` ${v.unit}` : ''),
    });
  }
  const relations = e.relations.nodes.map((r) => {
    if (
      r.spaceId !== space ||
      !valid(r.id) ||
      !valid(r.toEntity?.id) ||
      r.type?.id !== r.typeId
    )
      throw Error('Relationship attribution could not be verified.');
    return {
      id: r.id,
      label: r.type.name?.trim() || `Relationship · ${r.typeId}`,
      value: r.toEntity.name?.trim() || `Entity · ${r.toEntity.id}`,
    };
  });
  return {
    fields,
    relations,
    partial: e.values.pageInfo.hasNextPage || e.relations.pageInfo.hasNextPage,
  };
}
export function loadDetails(id, space) {
  if (!valid(id) || !valid(space)) throw Error('Invalid entity reference.');
  return geoReader.read(
    DETAILS_QUERY,
    { id, space },
    (d) => parseDetails(d, id, space),
    'graph-details-1',
  );
}
