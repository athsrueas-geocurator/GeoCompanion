export const VOTES_QUERY = `query EducationResponses($ids:[UUID!]!){
 votesCounts(first:501,filter:{objectId:{in:$ids},objectType:{is:0},voteKind:{in:[0,1,2]}}){objectId spaceId voteKind positive negative updatedAt}
}`;
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
