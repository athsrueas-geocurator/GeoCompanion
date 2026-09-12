import { SPACE, TYPES, P as ATLAS } from './atlas-live.mjs';
export { SPACE };
export const ENDPOINT = 'https://api-testnet.geobrowser.io/graphql';
export const P = {
  ...ATLAS,
  relatedClaims: '504e5776788844f6a77dba3ee811d8f0',
  supports: '1dc6a843458848198e7a6e672268f811',
  opposes: '4e6ec5d14292498a84e5f607ca1a08ce',
  locator: '84dacbddca6a44079edb5e11a4c66b40',
};
const VALUE_FIELDS = `values(first:20,filter:{spaceId:{is:$space},propertyId:{in:["${P.name}","${P.description}","${P.factual}","${P.locator}","${P.url}"]}}){nodes{propertyId spaceId text boolean}pageInfo{hasNextPage}}`;
export const DISCOVER = `query ArgumentDiscovery($space:UUID!,$after:Cursor){entitiesConnection(spaceId:$space,typeId:"${TYPES.claim}",first:25,after:$after,filter:{values:{some:{spaceId:{is:$space},propertyId:{is:"${P.factual}"},boolean:{is:false}}}}){nodes{id name ${VALUE_FIELDS} relations(first:51,filter:{spaceId:{is:$space},typeId:{is:"${P.topic}"}}){nodes{typeId spaceId toEntityId toEntity{id name}}pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}`;
export const NODE = `query ArgumentNode($space:UUID!,$id:UUID!,$after:Cursor){entity(id:$id){id name ${VALUE_FIELDS}} relationsConnection(first:25,after:$after,filter:{fromEntityId:{is:$id},spaceId:{is:$space},typeId:{in:["${P.supports}","${P.opposes}","${P.relatedClaims}","${P.source}"]}}){nodes{id fromEntityId toEntityId typeId spaceId toEntity{id name ${VALUE_FIELDS}}}pageInfo{hasNextPage endCursor}}}`;
const uuid = (id) => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);
function pageInfo(page) {
  if (
    !page ||
    typeof page.hasNextPage !== 'boolean' ||
    (page.hasNextPage && typeof page.endCursor !== 'string')
  )
    throw Error('The next page could not be read.');
  return page.hasNextPage ? page.endCursor : null;
}
export function parseEntity(entity, space = SPACE) {
  if (
    !entity ||
    !uuid(entity.id) ||
    !Array.isArray(entity.values?.nodes) ||
    entity.values.pageInfo?.hasNextPage !== false
  )
    throw Error('This entry could not be read completely.');
  const values = entity.values.nodes;
  if (values.some((v) => v.spaceId !== space))
    throw Error('The entry contains values from another collection.');
  const value = (property, field) => {
    const matches = [
      ...new Set(
        values
          .filter((v) => v.propertyId === property && v[field] != null)
          .map((v) => v[field]),
      ),
    ];
    if (matches.length > 1) throw Error('This entry has conflicting values.');
    return matches[0] ?? null;
  };
  const text = (p) => {
    const v = value(p, 'text');
    if (v !== null && typeof v !== 'string')
      throw Error('This entry contains unreadable text.');
    return v || '';
  };
  const factual = value(P.factual, 'boolean');
  if (factual !== null && typeof factual !== 'boolean')
    throw Error('The claim classification is unreadable.');
  return {
    id: entity.id,
    space,
    name:
      text(P.name) ||
      (typeof entity.name === 'string' ? entity.name : '') ||
      'Open entry',
    description: text(P.description),
    factual,
    locator: text(P.locator),
    url: text(P.url),
  };
}
export function parseDiscovery(payload, space = SPACE) {
  const page = payload?.data?.entitiesConnection;
  if (payload?.errors?.length || !Array.isArray(page?.nodes))
    throw Error('Education questions could not be loaded.');
  return {
    rows: page.nodes.map((entity) => {
      const row = parseEntity(entity, space);
      if (row.factual !== false)
        throw Error(
          'The question classification changed. Refresh the collection.',
        );
      if (
        !Array.isArray(entity.relations?.nodes) ||
        entity.relations.pageInfo?.hasNextPage !== false
      )
        throw Error('Topic links could not be read completely.');
      const topics = new Map();
      for (const r of entity.relations.nodes) {
        if (r.spaceId !== space || r.typeId !== P.topic || !uuid(r.toEntityId))
          throw Error('A topic link is invalid.');
        topics.set(r.toEntityId, {
          id: r.toEntityId,
          name:
            typeof r.toEntity?.name === 'string'
              ? r.toEntity.name
              : 'Unnamed topic',
        });
      }
      return { ...row, topics: [...topics.values()] };
    }),
    next: pageInfo(page.pageInfo),
  };
}
export function parseNode(payload, id, space = SPACE) {
  if (payload?.errors?.length) throw Error('Arguments could not be loaded.');
  const node = parseEntity(payload?.data?.entity, space);
  const page = payload?.data?.relationsConnection;
  if (node.id !== id || !Array.isArray(page?.nodes))
    throw Error('Arguments could not be read.');
  const roles = {
    [P.supports]: 'supports',
    [P.opposes]: 'opposes',
    [P.relatedClaims]: 'related',
    [P.source]: 'source',
  };
  const edges = page.nodes.map((r) => {
    if (
      !uuid(r.id) ||
      r.fromEntityId !== id ||
      r.spaceId !== space ||
      !roles[r.typeId] ||
      !uuid(r.toEntityId)
    )
      throw Error('An argument link has an invalid scope or direction.');
    const target = r.toEntity
      ? parseEntity(r.toEntity, space)
      : {
          id: r.toEntityId,
          space,
          name: 'Unavailable entry',
          description: '',
          factual: null,
          locator: '',
          url: '',
        };
    if (target.id !== r.toEntityId)
      throw Error('An argument target is invalid.');
    return { id: r.id, from: id, role: roles[r.typeId], target };
  });
  return { node, edges, next: pageInfo(page.pageInfo) };
}
export function groupArguments(edges) {
  const groups = { supports: [], opposes: [], related: [], source: [] };
  const seen = new Set();
  for (const edge of edges) {
    const key = `${edge.role}:${edge.target.space}:${edge.target.id}`;
    if (!seen.has(key)) {
      groups[edge.role].push(edge.target);
      seen.add(key);
    }
  }
  return groups;
}
export function createReader(fetcher = fetch, now = Date.now) {
  const cache = new Map(),
    pending = new Map();
  let generation = 0;
  async function request(query, variables) {
    const key = JSON.stringify([query, variables]),
      old = cache.get(key);
    if (old && now() - old.at < 300000) return old.value;
    if (pending.has(key)) return pending.get(key);
    const epoch = generation;
    const promise = (async () => {
      const response = await fetcher(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok)
        throw Error(
          response.status === 429
            ? 'Too many requests. Please try again shortly.'
            : 'Geo is unavailable. Please try again.',
        );
      const payload = await response.json();
      if (payload.errors?.length)
        throw Error('Geo could not complete this request.');
      // Validate before caching so malformed responses can be retried immediately.
      const value =
        query === DISCOVER
          ? parseDiscovery(payload, variables.space)
          : parseNode(payload, variables.id, variables.space);
      if (epoch === generation) {
        cache.delete(key);
        if (cache.size >= 64) cache.delete(cache.keys().next().value);
        cache.set(key, { at: now(), value });
      }
      return value;
    })();
    pending.set(key, promise);
    try {
      return await promise;
    } finally {
      if (pending.get(key) === promise) pending.delete(key);
    }
  }
  return {
    clear() {
      generation++;
      cache.clear();
      pending.clear();
    },
    /** @param {string|null} after */
    discover(after = null) {
      return request(DISCOVER, { space: SPACE, after });
    },
    async node(id, space = SPACE) {
      if (!uuid(id) || !uuid(space)) throw Error('Invalid selection.');
      let after = null,
        node,
        edges = [];
      const cursors = new Set();
      for (let i = 0; i < 20; i++) {
        const page = await request(NODE, { id, space, after });
        node = page.node;
        edges.push(...page.edges);
        if (!page.next) return { node, groups: groupArguments(edges) };
        if (cursors.has(page.next))
          throw Error('Argument pagination did not advance.');
        cursors.add(page.next);
        after = page.next;
      }
      throw Error(
        'This entry has too many links to display completely. Open it on Geo.',
      );
    },
  };
}
export const argumentReader = createReader();
