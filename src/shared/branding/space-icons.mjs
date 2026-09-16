const AVATAR = '1155befffad549b7a2e0da4777b8792c',
  COVER = '34f535072e6b42c5a84443981a77cfa2',
  URL_PROPERTY = '8a743832c0944a62b6650c3cc2f9c7bc';
export function iconUrl(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(
    /^ipfs:\/\/((?:Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,120}))$/,
  );
  return match ? `https://gateway.pinata.cloud/ipfs/${match[1]}` : null;
}
export function iconQuery(spaceId) {
  if (!/^[a-f0-9]{32}$/.test(spaceId)) throw Error('Invalid space');
  const field = (alias, type) =>
    `${alias}:relations(first:2,filter:{spaceId:{is:"${spaceId}"},typeId:{is:"${type}"}}){nodes{toEntity{values(first:2,filter:{spaceId:{is:"${spaceId}"},propertyId:{is:"${URL_PROPERTY}"}}){nodes{text}pageInfo{hasNextPage}}}}pageInfo{hasNextPage}}`;
  return `{spaces(first:1,filter:{id:{is:"${spaceId}"}}){page{${field('relations', AVATAR)} ${field('cover', COVER)}}}}`;
}
export function extractIcon(payload) {
  if (payload.errors?.length) throw Error('Icon unavailable');
  const page = payload.data?.spaces?.[0]?.page;
  let relations = page?.relations;
  if (!relations || relations.pageInfo?.hasNextPage)
    throw Error('Incomplete icon');
  if (!relations.nodes.length) {
    relations = page.cover;
    if (!relations) return null;
    if (relations.pageInfo?.hasNextPage) throw Error('Incomplete cover');
    if (!relations.nodes.length) return null;
  }
  if (relations.nodes.length !== 1) throw Error('Conflicting icons');
  const values = relations.nodes[0].toEntity?.values;
  if (values?.pageInfo?.hasNextPage || values?.nodes?.length !== 1)
    throw Error('Invalid image');
  return iconUrl(values.nodes[0].text);
}
const cache = new Map();
export async function loadIcon(spaceId) {
  const previous = cache.get(spaceId);
  if (previous && Date.now() - previous.at < 300000) return previous.promise;
  const promise = fetch('https://api-testnet.geobrowser.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: iconQuery(spaceId) }),
    signal: AbortSignal.timeout(15000),
  })
    .then((r) => {
      if (!r.ok) throw Error('Icon unavailable');
      return r.json();
    })
    .then(extractIcon);
  cache.set(spaceId, { at: Date.now(), promise });
  return promise;
}
