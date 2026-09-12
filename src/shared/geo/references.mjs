import { geoReader } from './client.mjs';
import { validId } from './collections.mjs';
export function referenceSpaces(spaces, context) {
  const ids = [...new Set((spaces || []).filter(validId))];
  return ids.includes(context) ? [context] : ids;
}
export async function referenceChoices(id, spaces, context) {
  if (!validId(id)) throw Error('This reference is unavailable.');
  let ids = referenceSpaces(spaces, context);
  if (!ids.length) {
    const membership = await geoReader.read(
      'query ReferenceMembership($id:UUID!){entity(id:$id){id spaceIds}}',
      { id },
      (d) => (d.entity?.id === id ? d.entity.spaceIds || [] : []),
      'references-1',
    );
    ids = referenceSpaces(membership, context);
  }
  if (!ids.length) return [];
  if (ids.length > 100)
    throw Error('Open this reference through its collection.');
  const found = await geoReader.read(
    'query ReferenceSpaces($ids:[UUID!]!){spaces(first:100,filter:{id:{in:$ids}}){id page{id name}}}',
    { ids },
    (d) => {
      if (!Array.isArray(d.spaces))
        throw Error('Reference destinations could not be read.');
      return d.spaces
        .filter((s) => ids.includes(s.id))
        .map((s) => ({ id: s.id, name: s.page?.name || 'Unnamed space' }));
    },
    'references-1',
  );
  return found.map((s) => ({
    ...s,
    url: `https://www.geobrowser.io/space/${s.id}/${id}`,
  }));
}
