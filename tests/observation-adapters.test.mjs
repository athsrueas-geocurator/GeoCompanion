import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meanPanels, pairedObserved, economicScenarios } from '../src/apps/education/observation-adapters.mjs';
import { F } from '../src/apps/education/dataset-data.mjs';
const row = (fields) => ({ id: 'a'.repeat(32), fields, relations: [] });
const value = (id, value, numeric = true) => ({ id, value, numeric });
test('mean panels preserve typed zero means and reported context', () => {
  const result = meanPanels([row([
    value(F.actualMean, 0), value(F.estimatedCounterfactual, 4.5),
    value(F.unit, 'points', false), value(F.outcome, 'Reading', false), value(F.followup, 'Spring', false),
  ])]);
  assert.deepEqual(result, [{ id: 'a'.repeat(32), actual: 0, estimated: 4.5, unit: 'points', measure: 'Reading', followup: 'Spring' }]);
});
test('mean panels reject missing, text-like, and incompatible context', () => {
  const complete = [value(F.actualMean, 1), value(F.estimatedCounterfactual, 2), value(F.unit, 'points', false), value(F.outcome, 'Measure', false)];
  assert.equal(meanPanels([row(complete)]).length, 1);
  assert.equal(meanPanels([row(complete.filter((x) => x.id !== F.actualMean))]).length, 0);
  assert.equal(meanPanels([row([...complete.slice(0, 2), value(F.unit, 2), value(F.outcome, 'Measure', false)])]).length, 0);
  assert.equal(meanPanels([row([...complete.slice(0, 3), value(F.outcome, 7)])]).length, 0);
});
test('Perry adapters require two distinct typed arms and preserve economic assumptions', () => {
  const fields = [value(F.observedProportion, 0), value(F.outcome, 'Graduation', false), value(F.followup, 'Age 27', false), value(F.unit, 'fraction', false)];
  const one = row(fields); one.relations = [{ typeId: F.studyArm, toEntityId: 'control' }, { typeId: F.population, toEntityId: 'female' }];
  const two = row(fields); two.id = 'b'.repeat(32); two.fields = [value(F.observedProportion, .84), ...fields.slice(1)]; two.relations = [{ typeId: F.studyArm, toEntityId: 'treatment' }, { typeId: F.population, toEntityId: 'female' }];
  assert.equal(pairedObserved([one, two]).length, 1);
  two.relations[0].toEntityId = 'control';
  assert.equal(pairedObserved([one, two]).length, 0);
  const model = row([value(F.benefitCostRatio, 2.4), value(F.discountRate, .03), value(F.deadweightLoss, .5)]);
  assert.deepEqual(economicScenarios([model])[0], { id: 'a'.repeat(32), kind: 'Benefit-cost ratio', value: 2.4, discountRate: .03, deadweightLoss: .5, valuation: null });
});
