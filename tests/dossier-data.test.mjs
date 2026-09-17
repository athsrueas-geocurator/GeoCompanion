import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dossierRow,
  facetCounts,
  DOSSIER,
} from '../src/apps/education/dossier-data.mjs';

const record = (key, methods) => ({
  id: key,
  fields: [
    { id: DOSSIER.key, value: key },
    { id: DOSSIER.methods, value: methods },
  ],
  relations: [
    {
      typeId: DOSSIER.subject,
      toEntityId: 'shared',
      toEntity: { name: 'Shared source' },
    },
  ],
});
test('source aliases remain distinct annotations and source method labels stay verbatim', () => {
  const rows = [
    dossierRow(record('src-023', 'RCT; review')),
    dossierRow(record('src-088', 'Review')),
  ];
  assert.equal(rows.length, 2);
  assert.equal(
    new Set(rows.flatMap((r) => r.subjects.map((s) => s.id))).size,
    1,
  );
  assert.deepEqual(rows[0].methods, ['RCT; review']);
});
test('initiative methods split only the contracted delimiter; duplicates count once per row', () => {
  const row = dossierRow(record('initiative-1', 'RCT; Review; RCT'));
  assert.deepEqual(facetCounts([row], 'methods'), [
    ['RCT', 1],
    ['Review', 1],
  ]);
  assert.equal(row.category, '');
  assert.equal(row.period, '');
});
test('conflicting fields fail rather than selecting an arbitrary historical label', () => {
  const r = record('initiative-1', 'RCT');
  r.fields.push({ id: DOSSIER.methods, value: 'Review' });
  assert.throws(() => dossierRow(r), /Conflicting/);
});
