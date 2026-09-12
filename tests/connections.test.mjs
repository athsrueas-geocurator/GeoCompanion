import test from 'node:test';
import assert from 'node:assert/strict';
import { groupConnections } from '../src/apps/education/connection-data.mjs';
const edge = (id, source, space = 'education') => ({
  id,
  spaceId: space,
  type: { id: 'sources', name: 'Sources' },
  fromEntity: { id: source, name: source },
  toEntity: { id: 'paper', name: 'Shared paper', spaceIds: ['books'] },
});
test('shared connections count unique source records, preserve assertions and discover spaces', () => {
  const g = groupConnections([
    edge('1', 'A'),
    edge('1', 'A'),
    edge('2', 'A', 'profile'),
    edge('3', 'B'),
  ])[0];
  assert.equal(g.count, 2);
  assert.equal(g.links.length, 3);
  assert.deepEqual(
    new Set(g.spaces),
    new Set(['education', 'profile', 'books']),
  );
  assert.equal(g.links[1].space, 'profile');
});
test('unnamed implementation records are omitted and malformed links fail', () => {
  const e = edge('1', 'A');
  e.fromEntity.name = null;
  assert.equal(groupConnections([e]).length, 0);
  assert.throws(() => groupConnections([{}]), /Incomplete/);
});
