// Ontology and response kinds verified against geobrowser/geogenesis on 2026-09-11.
export const DEBATE_TAG = '55c95b2626f8482cb9739ea99dfde438';
export const SOURCE_PROPERTY = '49c5d5e1679a4dbdbfd33f618f227c94';
export const TERMS = [
  'education',
  'school',
  'teacher',
  'student',
  'tutor',
  'university',
  'college',
  'curriculum',
  'homework',
];
export const DISCOVER_QUERY = `query EducationDebateClaims($filter:RelationFilter!){
 relations(first:101,condition:{toEntityId:"${DEBATE_TAG}"},filter:$filter){
  spaceId fromEntity{id name description relationsList(first:11,condition:{typeId:"${SOURCE_PROPERTY}"}){spaceId toEntity{id name}}}
 }
}`;
export const VOTES_QUERY = `query EducationResponses($ids:[UUID!]!){
 votesCounts(first:501,filter:{objectId:{in:$ids},objectType:{is:0},voteKind:{in:[0,1,2]}}){objectId spaceId voteKind positive negative updatedAt}
}`;
export function isEducationTitle(title) {
  return (
    typeof title === 'string' &&
    /educat|school|teacher|student|tutor|universit|college|curricul|homework/i.test(
      title,
    ) &&
    !/electoral college/i.test(title)
  );
}
export function normalizeClaims(payload) {
  if (payload?.errors?.length || !Array.isArray(payload?.data?.relations))
    throw new Error('Geo could not load the debate claims.');
  const found = new Map();
  for (const relation of payload.data.relations) {
    const e = relation?.fromEntity;
    if (!e) continue;
    if (
      typeof e.id !== 'string' ||
      typeof relation.spaceId !== 'string' ||
      (e.name !== null && typeof e.name !== 'string') ||
      !Array.isArray(e.relationsList)
    )
      throw new Error('Geo returned malformed debate data.');
    if (!isEducationTitle(e.name)) continue;
    if (!found.has(e.id))
      found.set(e.id, {
        id: e.id,
        name: e.name,
        description: e.description,
        spaces: [],
        sources: [],
        sourceLimit: e.relationsList.length >= 11,
      });
    const claim = found.get(e.id);
    if (!claim.spaces.includes(relation.spaceId))
      claim.spaces.push(relation.spaceId);
    for (const source of e.relationsList) {
      if (!source.toEntity) continue;
      if (
        typeof source.toEntity.id !== 'string' ||
        typeof source.spaceId !== 'string'
      )
        throw new Error('Geo returned a malformed source link.');
      if (
        !claim.sources.some(
          (s) => s.id === source.toEntity.id && s.space === source.spaceId,
        )
      )
        claim.sources.push({
          id: source.toEntity.id,
          name: source.toEntity.name ?? 'Unnamed source',
          space: source.spaceId,
        });
    }
  }
  return [...found.values()];
}
export function normalizeVotes(payload) {
  if (payload?.errors?.length || !Array.isArray(payload?.data?.votesCounts))
    throw new Error('Response counts are unavailable.');
  if (payload.data.votesCounts.length >= 501)
    throw new Error(
      'Response counts exceeded the prototype limit; partial totals are hidden.',
    );
  const rows = payload.data.votesCounts;
  const count = (v) =>
    (typeof v === 'string' || typeof v === 'number') &&
    /^\d+$/.test(String(v)) &&
    Number.isSafeInteger(Number(v));
  if (
    !rows.every(
      (v) =>
        typeof v.objectId === 'string' &&
        typeof v.spaceId === 'string' &&
        [0, 1, 2].includes(v.voteKind) &&
        count(v.positive) &&
        count(v.negative),
    )
  )
    throw new Error('Response counts have an unexpected format.');
  return rows.map((v) => ({
    ...v,
    positive: Number(v.positive),
    negative: Number(v.negative),
  }));
}
export function summarizeVotes(rows, id, kind) {
  const matching = rows.filter((v) => v.objectId === id && v.voteKind === kind);
  if (!matching.length) return null;
  return matching.reduce(
    (a, v) => ({
      positive: a.positive + v.positive,
      negative: a.negative + v.negative,
    }),
    { positive: 0, negative: 0 },
  );
}
export function validEditorial(value) {
  return (
    value &&
    typeof value.title === 'string' &&
    value.title.length <= 140 &&
    typeof value.intro === 'string' &&
    value.intro.length <= 1000 &&
    Array.isArray(value.picks) &&
    value.picks.length <= 12 &&
    new Set(value.picks.map((p) => p.id)).size === value.picks.length &&
    value.picks.every(
      (p) =>
        typeof p.id === 'string' &&
        /^[a-f0-9]{32}$/i.test(p.id) &&
        typeof p.note === 'string' &&
        p.note.length <= 1000,
    )
  );
}
