import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referenceSpaces } from '../src/shared/geo/references.mjs';
const a = 'a'.repeat(32),
  b = 'b'.repeat(32),
  c = 'c'.repeat(32);
test('reference routing preserves valid current context, not a hardcoded Books preference', () => {
  assert.deepEqual(referenceSpaces([b, a], a), [a]);
  assert.deepEqual(referenceSpaces([b], a), [b]);
  assert.deepEqual(referenceSpaces([b, c], a), [b, c]);
});
test('missing membership does not fabricate a destination and malformed IDs are rejected', () => {
  assert.deepEqual(referenceSpaces([], a), []);
  assert.deepEqual(referenceSpaces(['javascript:bad', b, b], a), [b]);
});
