import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, validateEntities } from '../src/apps/education/data.mjs';
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
