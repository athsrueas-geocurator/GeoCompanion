import { datasetBlocks, datasetRecords } from './dataset-data.mjs';
import { blockKind } from './block-capabilities.mjs';
import { completeEdges, REL } from '../../shared/geo/collections.mjs';
import { SPACE } from './atlas-live.mjs';

export const DOSSIER_PAGE = 'f5f24e11c0f84e1998f9a1917bb92d6b';
export const DOSSIER = {
  key: 'dd27323ae8ec45ac9b88183474b446a2',
  category: 'cfcd9d7759214660b39efd65a9b87e20',
  methods: 'd52352a2f5c24b60afbf944845cc9652',
  outcomes: '2216591c1538469a8dbaaf68af90acf8',
  period: '925aead9dd25487fadeb68ac3a551826',
  subject: 'dff07b43941827db7840d1708a774bf5',
};
export function dossierRow(record) {
  const text = (id) => {
    const values = [
      ...new Set(record.fields.filter((f) => f.id === id).map((f) => f.value)),
    ];
    if (values.length > 1 || values.some((v) => typeof v !== 'string'))
      throw Error('Conflicting source-record fields.');
    return values[0] ?? '';
  };
  const key = text(DOSSIER.key);
  const kind = /^initiative-\d+$/.test(key)
    ? 'initiative'
    : /^src-\d+$/.test(key)
      ? 'source'
      : 'unknown';
  const subjects = [
    ...new Map(
      record.relations
        .filter((r) => r.typeId === DOSSIER.subject)
        .map((r) => [
          r.toEntityId,
          { id: r.toEntityId, name: r.toEntity?.name || 'Open subject' },
        ]),
    ).values(),
  ];
  const methods = text(DOSSIER.methods);
  return {
    id: record.id,
    key,
    kind,
    subjects,
    category: text(DOSSIER.category),
    methods:
      kind === 'initiative'
        ? methods.split('; ').filter(Boolean)
        : methods
          ? [methods]
          : [],
    outcomes: text(DOSSIER.outcomes).split('; ').filter(Boolean),
    period: text(DOSSIER.period),
  };
}
export async function loadDossier() {
  const blocks = await datasetBlocks(DOSSIER_PAGE);
  const ids = new Set();
  for (const block of blocks.filter((b) => blockKind(b) === 'collection')) {
    for (const edge of await completeEdges(SPACE, block.id, REL.item))
      ids.add(edge.toEntityId);
  }
  const records = await datasetRecords([...ids]);
  if (records.length !== ids.size)
    throw Error('Some source records could not be loaded. Try again.');
  return records.map(dossierRow);
}
export function facetCounts(rows, field) {
  const counts = new Map();
  for (const row of rows)
    for (const label of new Set(
      Array.isArray(row[field]) ? row[field] : row[field] ? [row[field]] : [],
    ))
      counts.set(label, (counts.get(label) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
