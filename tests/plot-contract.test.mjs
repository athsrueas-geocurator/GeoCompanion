import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canPlot } from '../src/apps/education/plot-contract.mjs';
import { F } from '../src/apps/education/dataset-data.mjs';
function row() {
  return {
    unavailable: false,
    studyIds: ['s'],
    fields: [
      { id: F.effect, value: 0, numeric: true },
      { id: F.se, value: 1.21, numeric: true },
      { id: F.unit, value: 'percentile points' },
      { id: F.estimand, value: 'initial assignment' },
    ],
    relations: [
      { typeId: F.grade, toEntityId: 'grade' },
      { typeId: F.arm, toEntityId: 'arm' },
      { typeId: F.comparison, toEntityId: 'control' },
    ],
  };
}
test('zero effect can plot; renamed dimensions do not change eligibility', () => {
  const r = row();
  assert.equal(canPlot([r]), true);
  r.relations[0].name = 'Renamed grade';
  assert.equal(canPlot([r]), true);
});
test('edited units and missing uncertainty disable chart without altering records', () => {
  const r = row();
  r.fields.find((f) => f.id === F.unit).value = 'SD';
  assert.equal(canPlot([r]), false);
  r.fields = r.fields.filter((f) => f.id !== F.se);
  assert.equal(canPlot([r]), false);
  assert.equal(r.fields.find((f) => f.id === F.effect).value, 0);
});
test('different studies, comparators, or estimands cannot share this plot', () => {
  for (const change of [
    (r) => (r.studyIds = ['other']),
    (r) =>
      (r.relations.find((e) => e.typeId === F.comparison).toEntityId = 'other'),
    (r) => (r.fields.find((f) => f.id === F.estimand).value = 'other'),
  ]) {
    const r = row();
    change(r);
    assert.equal(canPlot([row(), r]), false);
  }
  assert.equal(canPlot([]), false);
  const bad = row();
  bad.unavailable = true;
  assert.equal(canPlot([bad]), false);
});
