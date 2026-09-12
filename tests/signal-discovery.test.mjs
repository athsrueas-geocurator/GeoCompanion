import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discoverSignals } from '../src/apps/education/signal-discovery.mjs';
test('response discovery preserves claims with no education keyword and follows cursor pages', async () => {
  const calls = [];
  const r = await discoverSignals(4, {
    discover: async (after) => {
      calls.push(after);
      return after
        ? {
            rows: [
              { id: 'b', name: 'Resources matter', description: 'A position' },
            ],
            next: null,
          }
        : {
            rows: [{ id: 'a', name: 'What counts?', description: '' }],
            next: 'p2',
          };
    },
  });
  assert.deepEqual(calls, [null, 'p2']);
  assert.deepEqual(
    r.claims.map((c) => c.name),
    ['What counts?', 'Resources matter'],
  );
  assert.equal(r.limited, false);
});
test('bounded response discovery signals more pages and rejects repeating cursors', async () => {
  const r = await discoverSignals(1, {
    discover: async () => ({ rows: [], next: 'more' }),
  });
  assert.equal(r.limited, true);
  await assert.rejects(
    discoverSignals(4, { discover: async () => ({ rows: [], next: 'same' }) }),
    /advance/,
  );
});
