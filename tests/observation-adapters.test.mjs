import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  meanPanels,
  pairedObserved,
  economicScenarios,
  compatibleEffects,
  modeledEconomicResults,
  reportedEstimates,
} from '../src/apps/education/observation-adapters.mjs';
import { F } from '../src/apps/education/dataset-data.mjs';
const row = (fields) => ({ id: 'a'.repeat(32), fields, relations: [] });
const value = (id, value, numeric = true) => ({ id, value, numeric });
test('mean panels preserve typed zero means and reported context', () => {
  const result = meanPanels([
    row([
      value(F.actualMean, 0),
      value(F.estimatedCounterfactual, 4.5),
      value(F.unit, 'points', false),
      value(F.outcome, 'Reading', false),
      value(F.followup, 'Spring', false),
    ]),
  ]);
  assert.deepEqual(result, [
    {
      id: 'a'.repeat(32),
      actual: 0,
      estimated: 4.5,
      unit: 'points',
      measure: 'Reading',
      followup: 'Spring',
    },
  ]);
});
test('a published model status excludes generic values from observed-effect views', () => {
  const model = row([
    value(F.netFinancialGain, 15456),
    value(F.unit, '2018 USD per participant; net financial gain', false),
    value(F.observationKind, 'Source-reported model', false),
    value('97e14050fc49467bb3aaf4d7eccbbb69', 2018),
  ]);
  model.name = 'Source model result';
  assert.equal(compatibleEffects([model]).length, 0);
  assert.equal(reportedEstimates([model]).length, 0);
  assert.deepEqual(modeledEconomicResults([model]), [
    {
      id: 'a'.repeat(32),
      name: 'Source model result',
      value: 15456,
      unit: '2018 USD per participant; net financial gain',
      priceYear: 2018,
      sourceTable: null,
    },
  ]);
});
test('corrected tutoring learning effects cannot enter benefit-cost scenarios', () => {
  const rows = [
    { id: '9b94180ac02b464a9bd1a2c873d75e97', value: 0.37 },
    { id: '25f0ec3189e4427cbdb294d2016b692d', value: 0.288 },
  ].map(({ id, value }) => ({
    id,
    name: 'Tutoring pooled learning effect',
    fields: [
      { id: F.effect, value, numeric: true },
      { id: F.unit, value: 'standard deviations', numeric: false },
    ],
    relations: [],
    unavailable: false,
  }));
  assert.equal(economicScenarios(rows).length, 0);
  assert.deepEqual(reportedEstimates(rows).map((row) => row.id), rows.map((row) => row.id));
});
test('mean panels accept the decimal strings returned by Geo GraphQL', () => {
  const result = meanPanels([
    row([
      value(F.actualMean, '0'),
      value(F.estimatedCounterfactual, '4.5'),
      value(F.unit, 'points', false),
      value(F.outcome, 'Reading', false),
    ]),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].actual, 0);
  assert.equal(result[0].estimated, 4.5);
});
test('mean panels reject missing, text-like, and incompatible context', () => {
  const complete = [
    value(F.actualMean, 1),
    value(F.estimatedCounterfactual, 2),
    value(F.unit, 'points', false),
    value(F.outcome, 'Measure', false),
  ];
  assert.equal(meanPanels([row(complete)]).length, 1);
  assert.equal(
    meanPanels([row(complete.filter((x) => x.id !== F.actualMean))]).length,
    0,
  );
  assert.equal(
    meanPanels([
      row([
        ...complete.slice(0, 2),
        value(F.unit, 2),
        value(F.outcome, 'Measure', false),
      ]),
    ]).length,
    0,
  );
  assert.equal(
    meanPanels([row([...complete.slice(0, 3), value(F.outcome, 7)])]).length,
    0,
  );
});
test('Perry adapters require two distinct typed arms and preserve economic assumptions', () => {
  const fields = [
    value(F.observedProportion, 0),
    value(F.outcome, 'Graduation', false),
    value(F.followup, 'Age 27', false),
    value(F.unit, 'fraction', false),
  ];
  const one = row(fields);
  one.relations = [
    { typeId: F.studyArm, toEntityId: 'control' },
    { typeId: F.population, toEntityId: 'female' },
  ];
  const two = row(fields);
  two.id = 'b'.repeat(32);
  two.fields = [value(F.observedProportion, 0.84), ...fields.slice(1)];
  two.relations = [
    { typeId: F.studyArm, toEntityId: 'treatment' },
    { typeId: F.population, toEntityId: 'female' },
  ];
  assert.equal(pairedObserved([one, two]).length, 1);
  two.relations[0].toEntityId = 'control';
  assert.equal(pairedObserved([one, two]).length, 0);
  const model = row([
    value(F.benefitCostRatio, 2.4),
    value(F.discountRate, 0.03),
    value(F.deadweightLoss, 0.5),
    value(F.followup, 'Through age 40', false),
  ]);
  model.name = 'Published societal scenario';
  model.relations = [
    {
      typeId: F.economicPerspective,
      toEntityId: 'societal',
      toEntity: { name: 'Societal perspective' },
    },
  ];
  assert.deepEqual(economicScenarios([model])[0], {
    id: 'a'.repeat(32),
    kind: 'Benefit-cost ratio',
    name: 'Published societal scenario',
    value: 2.4,
    perspective: 'Societal perspective',
    horizon: 'Through age 40',
    discountRate: 0.03,
    deadweightLoss: 0.5,
    valuation: null,
  });
});
