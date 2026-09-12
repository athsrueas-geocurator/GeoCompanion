// Structural links do not describe a result dimension.
const structural = new Set([
  '8f151ba4de204e3c9cb499ddf96f48f1',
  'beaba5cba67741a8b35377030613fc70',
  'a99f9ce12ffa4dac8c61f6310d46064a',
]);
/** @returns {{id:string, name:string, options:{key:string, name:string, members:string[]}[]}[]} */
export function resultFacets(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (row.unavailable) continue;
    for (const edge of row.relations) {
      if (structural.has(edge.typeId) || !edge.toEntity?.name) continue;
      if (!groups.has(edge.typeId))
        groups.set(edge.typeId, {
          id: edge.typeId,
          name: edge.type?.name || 'Other links',
          options: new Map(),
        });
      const options = groups.get(edge.typeId).options;
      const key = JSON.stringify([edge.typeId, edge.toEntityId]);
      if (!options.has(key))
        options.set(key, { key, name: edge.toEntity.name, members: new Set() });
      options.get(key).members.add(row.id);
    }
  }
  return [...groups.values()].map((g) => ({
    ...g,
    options: [...g.options.values()].map((o) => ({
      key: o.key,
      name: o.name,
      members: [...o.members],
    })),
  }));
}

export function selectedFacet(groups, key) {
  return groups.flatMap((g) => g.options).find((o) => o.key === key);
}
