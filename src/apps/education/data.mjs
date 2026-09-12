export const evidence = [
  { id: 'strong-causal', label: 'Strong causal', color: '#267763' },
  {
    id: 'promising-causal-quasi',
    label: 'Promising causal / quasi',
    color: '#548ba1',
  },
  { id: 'mixed-conditional', label: 'Mixed / conditional', color: '#b07e35' },
  {
    id: 'limited-descriptive',
    label: 'Limited / descriptive',
    color: '#8c789f',
  },
  {
    id: 'not-outcome-intervention',
    label: 'Not an outcome intervention',
    color: '#80898b',
  },
];
export function filterInitiatives(
  items,
  search = '',
  category = '',
  strength = '',
) {
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(
    (i) =>
      (!category || i.category === category) &&
      (!strength || i.evidenceStrength === strength) &&
      words.every((w) =>
        [i.name, i.oneLineFinding, i.targetPopulation, ...i.methodTags]
          .join(' ')
          .toLowerCase()
          .includes(w),
      ),
  );
}
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function validateDataset(d) {
  if (
    !d ||
    !Array.isArray(d.initiatives) ||
    !Array.isArray(d.sources) ||
    !Array.isArray(d.comparisons)
  )
    throw new Error('The reference dataset has an unexpected format.');
  const strings = (o, keys) => keys.every((k) => typeof o?.[k] === 'string');
  const stringArray = (a) =>
    Array.isArray(a) && a.every((v) => typeof v === 'string');
  if (
    !d.initiatives.every(
      (i) =>
        strings(i, [
          'slug',
          'name',
          'category',
          'years',
          'oneLineFinding',
          'targetPopulation',
          'theoryOfAction',
          'normalizationIssues',
          'outputsMeasured',
          'evaluationDesigns',
        ]) &&
        evidence.some((e) => e.id === i.evidenceStrength) &&
        stringArray(i.sourceIds) &&
        stringArray(i.methodTags) &&
        stringArray(i.relatedDichotomySlugs),
    )
  )
    throw new Error('An initiative contains malformed data.');
  if (
    !d.sources.every((s) =>
      strings(s, [
        'id',
        'title',
        'url',
        'caveat',
        'finding',
        'authors',
        'year',
      ]),
    )
  )
    throw new Error('A source contains malformed data.');
  if (
    !d.comparisons.every(
      (c) =>
        strings(c, [
          'slug',
          'title',
          'betterQuestion',
          'whatEvidenceSuggests',
        ]) &&
        stringArray(c.sourceIds) &&
        stringArray(c.keyInitiativeSlugs),
    )
  )
    throw new Error('A comparison contains malformed data.');
  if (new Set(d.initiatives.map((i) => i.slug)).size !== d.initiatives.length)
    throw new Error('Duplicate initiative identifiers.');
  return d;
}
export function validateEntities(payload) {
  if (payload?.errors?.length)
    throw new Error('Geo could not complete this query. Please retry later.');
  const rows = payload?.data?.entities;
  if (
    !Array.isArray(rows) ||
    !rows.every(
      (e) =>
        typeof e?.id === 'string' &&
        /^[a-f0-9-]{32,36}$/i.test(e.id) &&
        (e.name === null || typeof e.name === 'string') &&
        (e.description === null || typeof e.description === 'string') &&
        Array.isArray(e.types) &&
        e.types.every(
          (t) =>
            typeof t?.id === 'string' &&
            (t.name === null || typeof t.name === 'string'),
        ),
    )
  )
    throw new Error('Geo returned an unexpected data format.');
  return rows;
}
