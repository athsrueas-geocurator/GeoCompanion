import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edgeWindow } from '../src/shared/geo/collections.mjs';
test('large collection loads at most four new pages and resumes from its cursor', async () => {
  let calls = 0;
  const reader = async (_s, _i, _t, after) => {
    calls++;
    const n = Number(after || 0);
    return {
      edges: [{ id: String(n), position: String(n).padStart(3, '0') }],
      next: n < 6 ? String(n + 1) : null,
    };
  };
  const first = await edgeWindow('s', 'i', 't', null, reader);
  assert.equal(calls, 4);
  assert.equal(first.edges.length, 4);
  const next = await edgeWindow('s', 'i', 't', first, reader);
  assert.equal(calls, 7);
  assert.equal(next.edges.length, 7);
  assert.equal(next.next, null);
  await edgeWindow('s', 'i', 't', next, reader);
  assert.equal(calls, 7);
});
test('continuations reject changed context and repeated cursors; fresh read replaces members', async () => {
  const reader = async () => ({
    edges: [{ id: 'new', position: 'a' }],
    next: null,
  });
  const old = {
    space: 's',
    id: 'i',
    type: 't',
    edges: [{ id: 'old', position: 'b' }],
    next: 'next',
    cursors: ['next'],
  };
  await assert.rejects(edgeWindow('other', 'i', 't', old, reader), /changed/);
  await assert.rejects(
    edgeWindow('s', 'i', 't', old, async () => ({ edges: [], next: 'next' })),
    /repeated/,
  );
  const fresh = await edgeWindow('s', 'i', 't', null, reader);
  assert.deepEqual(
    fresh.edges.map((e) => e.id),
    ['new'],
  );
});
