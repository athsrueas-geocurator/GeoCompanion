export const SPACE = 'dac259bad48a11adf97fe36857d85206';
export const ENDPOINT = 'https://api-testnet.geobrowser.io/graphql';
export const TYPES = {
  initiative: 'd272f19cef87485fb83e26fb68957395',
  study: '3ef269bc5f114691abc02dcbf398fd63',
  claim: '96f859efa1ca4b229372c86ad58b694b',
};
export const P = {
  name: 'a126ca530c8e48d5b88882c734c38935',
  description: '9b1f76ff9711404c861e59dc3fa7d037',
  url: '412ff593e9154012a43d4c27ec5c68b6',
  population: '7a1f6d017895206e84e1988c0c74621e',
  design: '8e46e3eff9dea2b55d32a5ca7de61938',
  factual: 'da4a6c1f9d4446f9832ff3b49a4400ef',
  related: 'dfa6aebe1ca94bf29faccc4cc7afb24c',
  source: '49c5d5e1679a4dbdbfd33f618f227c94',
  location: '95d770021faf4f7cb7deb21a7d48cda0',
  topic: '806d52bc27e94c9193c057978b093351',
  category: '06c899fb04334e679feb1fd56687c3d6',
};
export const QUERY = `query Atlas($space:UUID!,$type:UUID!,$filter:EntityFilter!,$after:Cursor){entitiesConnection(spaceId:$space,typeId:$type,first:50,after:$after,filter:$filter){nodes{id name description values(first:100,filter:{spaceId:{is:$space}}){nodes{propertyId text boolean}pageInfo{hasNextPage}} relations(first:100,filter:{spaceId:{is:$space}}){nodes{typeId toEntityId toEntity{id name spaceIds}}pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}`;
const cache = new Map();
const uuid = (x) => typeof x === 'string' && /^[a-f0-9]{32}$/.test(x);
export function parsePage(payload) {
  const page = payload?.data?.entitiesConnection;
  if (
    payload?.errors?.length ||
    !Array.isArray(page?.nodes) ||
    typeof page.pageInfo?.hasNextPage !== 'boolean' ||
    (page.pageInfo.hasNextPage && !page.pageInfo.endCursor)
  )
    throw Error('The collection could not be read. Try again.');
  const rows = page.nodes.map((e) => {
    if (
      !uuid(e.id) ||
      !Array.isArray(e.values?.nodes) ||
      !Array.isArray(e.relations?.nodes) ||
      e.values.pageInfo?.hasNextPage !== false ||
      e.relations.pageInfo?.hasNextPage !== false
    )
      throw Error('An entry could not be read completely. Try again.');
    const text = (p) => {
      const found = [
        ...new Set(
          e.values.nodes
            .filter((v) => v.propertyId === p && typeof v.text === 'string')
            .map((v) => v.text),
        ),
      ];
      if (found.length > 1)
        throw Error('An entry contains conflicting values.');
      return found[0] || '';
    };
    const links = (p) => [
      ...new Map(
        e.relations.nodes
          .filter((r) => r.typeId === p && uuid(r.toEntityId))
          .map((r) => [
            r.toEntityId,
            {
              id: r.toEntityId,
              name: r.toEntity?.name || 'Open entry',
              spaces: r.toEntity?.spaceIds || [],
            },
          ]),
      ).values(),
    ];
    return {
      id: e.id,
      spaces: [SPACE],
      name: text(P.name) || e.name || 'Untitled entry',
      description: text(P.description),
      url: text(P.url),
      population: text(P.population),
      design: text(P.design),
      sources: links(P.source),
      places: links(P.location),
      topics: links(P.topic),
      categories: links(P.category),
      related: links(P.related),
    };
  });
  return {
    rows,
    next: page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null,
  };
}
export function modeFilter(mode, id) {
  if (mode === 'questions')
    return {
      values: {
        some: {
          spaceId: { is: SPACE },
          propertyId: { is: P.factual },
          boolean: { is: false },
        },
      },
    };
  if (mode === 'evidence') {
    if (!uuid(id)) throw Error('Invalid selection.');
    return {
      relations: {
        some: {
          spaceId: { is: SPACE },
          typeId: { is: P.related },
          toEntityId: { is: id },
        },
      },
    };
  }
  return {};
}
/** @param {string} type @param {object} filter @param {string|null} after @param {AbortSignal|undefined} signal @param {boolean} force */
export async function loadPage(
  type,
  filter = {},
  after = null,
  signal = undefined,
  force = false,
) {
  const variables = { space: SPACE, type, filter, after };
  const key = JSON.stringify(variables),
    old = cache.get(key);
  if (!force && old && Date.now() - old.at < 300000) return old.page;
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables }),
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(25000)])
      : AbortSignal.timeout(25000),
  });
  if (!response.ok) throw Error('The collection is unavailable. Try again.');
  const page = parsePage(await response.json());
  if (after && page.next === after)
    throw Error('The next page is unavailable.');
  if (cache.size >= 30) cache.delete(cache.keys().next().value);
  cache.set(key, { at: Date.now(), page });
  return page;
}
export function mergeRows(previous, incoming) {
  return [
    ...new Map([...previous, ...incoming].map((r) => [r.id, r])).values(),
  ];
}
export function filterRows(
  rows,
  search = '',
  topic = '',
  place = '',
  category = '',
) {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter(
    (r) =>
      (!topic || r.topics.some((t) => t.id === topic)) &&
      (!place || r.places.some((t) => t.id === place)) &&
      (!category ||
        (category === 'unclassified'
          ? r.categories.length === 0
          : r.categories.some((t) => t.id === category))) &&
      terms.every((t) =>
        [
          r.name,
          r.description,
          r.population,
          r.design,
          ...r.topics.map((t) => t.name),
          ...r.categories.map((t) => t.name),
        ]
          .join(' ')
          .toLowerCase()
          .includes(t),
      ),
  );
}
