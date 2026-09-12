import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePoint,
  groupLocations,
  readCache,
  fetchLocations,
  RETENTION,
} from '../src/apps/education/location-data.mjs';
test('coordinates reject missing, malformed and out of range values', () => {
  assert.deepEqual(parsePoint('42.24115,-83.61299'), [42.24115, -83.61299]);
  for (const p of [null, '', ',', '91,20', '42,-181', 'POINT(1 2)'])
    assert.equal(parsePoint(p), null);
});
test('location links deduplicate records, not independent study counts', () => {
  const edge = {
    fromEntity: { id: 'a', name: 'estimate' },
    toEntity: { id: 'b', name: 'city' },
  };
  assert.equal(groupLocations([edge, edge])[0].records.length, 1);
});
test('cache rejects future, expired and malformed snapshots', () => {
  const valid = { version: 1, at: 100, locations: [], partial: false };
  const storage = (d) => ({ getItem: () => JSON.stringify(d) });
  assert.ok(readCache(storage(valid), 1000));
  assert.equal(readCache(storage(valid), 99), null);
  assert.equal(readCache(storage(valid), RETENTION + 101), null);
  assert.equal(readCache(storage({ ...valid, locations: [{}] }), 1000), null);
});
test('adapter follows cursors and hides conflicting coordinates', async () => {
  const old = globalThis.fetch;
  const requests = [];
  let n = 0;
  globalThis.fetch = async (_url, o) => {
    requests.push(JSON.parse(o.body));
    n++;
    return {
      ok: true,
      json: async () => ({
        data:
          n < 3
            ? {
                relationsConnection: {
                  nodes: [
                    {
                      fromEntity: { id: 'a', name: 'record' },
                      toEntity: { id: 'b', name: 'place' },
                    },
                  ],
                  pageInfo: { hasNextPage: n === 1, endCursor: 'next' },
                },
              }
            : {
                entitiesConnection: {
                  nodes: [
                    {
                      id: 'b',
                      values: {
                        nodes: [{ point: '1,2' }, { point: '3,4' }],
                        pageInfo: { hasNextPage: false },
                      },
                    },
                  ],
                  pageInfo: { hasNextPage: false },
                },
              },
      }),
    };
  };
  try {
    const d = await fetchLocations();
    assert.equal(requests[1].variables.after, 'next');
    assert.equal(d.locations[0].records.length, 1);
    assert.equal(d.locations[0].point, null);
    assert.equal(d.partial, false);
  } finally {
    globalThis.fetch = old;
  }
});
