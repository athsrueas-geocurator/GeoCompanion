// Verified against the native STAR blocks on Geo, September 12, 2026.
export const BLOCK = {
  types: '8f151ba4de204e3c9cb499ddf96f48f1',
  data: 'b8803a8665de412bbb357e0c84adf473',
  text: '76474f2f00894e77a0410b39fb17d0bf',
  source: '1f69cc9880d444abad493df6a7b15ee4',
  collection: '1295037a5d9c4d09b27c5502654b9177',
  markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33',
  image: 'ba4e41460010499da0a3caaa7f579d0e',
  imageUrl: '8a743832c0944a62b6650c3cc2f9c7bc',
};
export function blockKind(record) {
  if (record.unavailable) return 'unavailable';
  const targets = (type) =>
    new Set(
      record.relations
        .filter((r) => r.typeId === type)
        .map((r) => r.toEntityId),
    );
  const types = targets(BLOCK.types),
    sources = targets(BLOCK.source);
  if (types.has(BLOCK.data))
    return sources.size === 1 && sources.has(BLOCK.collection)
      ? 'collection'
      : 'unsupported';
  if (types.has(BLOCK.image)) return 'image';
  if (
    types.has(BLOCK.text) &&
    record.fields.some(
      (f) => f.id === BLOCK.markdown && typeof f.value === 'string',
    )
  )
    return 'text';
  return 'unsupported';
}

export function orderedBlockRecords(edges, records) {
  const byId = new Map(records.map((r) => [r.id, r]));
  return edges.map(
    (e) =>
      byId.get(e.toEntityId) || {
        id: e.toEntityId,
        name: 'Content unavailable',
        description: '',
        fields: [],
        relations: [],
        unavailable: true,
      },
  );
}
