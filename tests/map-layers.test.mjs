import test from 'node:test';
import assert from 'node:assert/strict';
import { groupPoints } from '../src/shared/maps/model.mjs';
test('coincident locations retain distinct identities and reject invalid geometry', () => {
  const a = { id: 'a', point: [39, -86] },
    b = { id: 'b', point: [39, -86] };
  assert.deepEqual(
    groupPoints([
      a,
      b,
      a,
      { id: 'c', point: null },
      { id: 'd', point: [91, 0] },
    ]),
    [[a, b]],
  );
});
test('refreshed membership does not keep removed overlapping locations', () => {
  const a = { id: 'a', point: [39, -86] },
    b = { id: 'b', point: [39, -86] };
  assert.equal(groupPoints([a, b])[0].length, 2);
  assert.deepEqual(groupPoints([b]), [[b]]);
  assert.deepEqual(groupPoints([]), []);
});
