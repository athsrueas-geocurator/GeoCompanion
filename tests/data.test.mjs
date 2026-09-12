import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateDataset,
  validateEntities,
  filterInitiatives,
  safeUrl,
  evidence,
} from '../src/apps/education/data.mjs';
const data = JSON.parse(
  readFileSync(
    new URL('../public/data/education.json', import.meta.url),
    'utf8',
  ).replace(/^\uFEFF/, ''),
);
test('snapshot validates and all displayed references resolve', () => {
  validateDataset(data);
  const sources = new Set(data.sources.map((s) => s.id));
  for (const i of data.initiatives) {
    assert.ok(i.sourceIds.every((s) => sources.has(s)));
    assert.ok(evidence.some((e) => e.id === i.evidenceStrength));
  }
});
test('filters intersect and token search matches across useful fields', () => {
  const result = filterInitiatives(data.initiatives, 'tutoring');
  assert.ok(result.length > 0);
  assert.ok(
    filterInitiatives(data.initiatives, 'impossible-search-xyz').length === 0,
  );
  const item = result[0];
  assert.ok(
    filterInitiatives(result, '', item.category, item.evidenceStrength).every(
      (i) =>
        i.category === item.category &&
        i.evidenceStrength === item.evidenceStrength,
    ),
  );
});
test('unsafe remote links are not navigable', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl('data:text/html,hello'), null);
  assert.equal(safeUrl('https://example.com'), 'https://example.com/');
});
test('Geo errors and malformed entity payloads do not become empty success', () => {
  assert.throws(() => validateEntities({ errors: [{ message: 'no' }] }));
  assert.throws(() => validateEntities({ data: { entities: [{ id: 42 }] } }));
  assert.deepEqual(validateEntities({ data: { entities: [] } }), []);
});
