import { parseProfileId } from './preference-storage.mjs';
const ENDPOINT = 'https://api-testnet.geobrowser.io/graphql';
const cache = new Map();
export const PROFILE_TTL = 5 * 60 * 1000;
async function query(document, variables, signal) {
  const key = JSON.stringify([document, variables]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < PROFILE_TTL) return hit.data;
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: document, variables }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  });
  if (!r.ok)
    throw new Error(
      r.status === 429
        ? 'Geo is busy. Wait a moment before searching again.'
        : `Geo is unavailable (HTTP ${r.status}).`,
    );
  const json = await r.json();
  if (json.errors?.length || !json.data)
    throw new Error('Geo could not complete this search. Try again.');
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (cache.size >= 50) cache.delete(cache.keys().next().value);
  cache.set(key, { time: Date.now(), data: json.data });
  return json.data;
}
export const PROFILES_QUERY = `query FollowedProfiles($ids: [UUID!]!) { spaces(first: 40, filter: {id: {in: $ids}, type: {is: PERSONAL}}) { id type page {id name} } }`;
export async function resolveProfiles(ids, signal) {
  if (!ids.length) return [];
  const data = await query(
    PROFILES_QUERY,
    { ids: [...new Set(ids)].sort() },
    signal,
  );
  if (!Array.isArray(data.spaces))
    throw new Error('Geo returned an unreadable profile list.');
  return data.spaces
    .filter(
      (s) =>
        ids.includes(s.id) &&
        s.type === 'PERSONAL' &&
        s.page?.id &&
        typeof s.page.name === 'string' &&
        s.page.name.trim(),
    )
    .map((s) => ({
      id: s.id,
      name: s.page.name.slice(0, 160),
      pageId: s.page.id,
    }));
}
export async function searchProfiles(input, signal) {
  const term = input.trim();
  if (term.length < 2) return { rows: [], more: false };
  if (term.startsWith('https:') || /^[a-f0-9]{32}$/i.test(term)) {
    const id = parseProfileId(term);
    return { rows: await resolveProfiles([id], signal), more: false };
  }
  if (/^[a-f0-9]{8,31}$/i.test(term))
    return {
      rows: [],
      more: false,
      hint: 'Enter the complete 32-character profile space ID.',
    };
  const data = await query(
    `query SearchProfiles($name: String!) { entitiesConnection(typeId: "362c1dbddc6444bba3c4652f38a642d7", first: 8, filter: {name: {includesInsensitive: $name}}) { nodes { id name spaceIds } pageInfo {hasNextPage} } }`,
    { name: term.slice(0, 160) },
    signal,
  );
  const result = data.entitiesConnection;
  if (
    !Array.isArray(result?.nodes) ||
    typeof result.pageInfo?.hasNextPage !== 'boolean' ||
    result.nodes.some((n) => !n.id || !Array.isArray(n.spaceIds))
  )
    throw new Error('Geo returned an unreadable search result.');
  const ids = [...new Set(result.nodes.flatMap((n) => n.spaceIds))];
  const rows = await resolveProfiles(ids.slice(0, 40), signal);
  return {
    rows: rows.filter(
      (p) =>
        result.nodes.some((n) => n.id === p.pageId) &&
        p.name.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
    ),
    more: result.pageInfo.hasNextPage || ids.length > 40,
  };
}
