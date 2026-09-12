import test from 'node:test';
import assert from 'node:assert/strict';
import {
  searchProfiles,
  resolveProfiles,
} from '../src/shared/preferences/profile-search.mjs';
const id = 'c'.repeat(32),
  page = 'd'.repeat(32);
test('server name filtering, personal-space reconciliation and repeat-query cache', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push(body);
    return new Response(
      JSON.stringify({
        data: body.variables.name
          ? {
              entitiesConnection: {
                nodes: [{ id: page, name: 'Cache test user', spaceIds: [id] }],
                pageInfo: { hasNextPage: true },
              },
            }
          : {
              spaces: [
                {
                  id,
                  type: 'PERSONAL',
                  page: { id: page, name: 'Cache test user' },
                },
              ],
            },
      }),
    );
  });
  const first = await searchProfiles(
    'Cache test',
    new AbortController().signal,
  );
  assert.equal(first.rows[0].id, id);
  assert.equal(first.more, true);
  assert.equal(calls[0].variables.name, 'Cache test');
  assert.match(calls[0].query, /includesInsensitive: \$name/);
  assert.match(calls[1].query, /is: PERSONAL/);
  await searchProfiles('Cache test', new AbortController().signal);
  assert.equal(calls.length, 2);
});
test('GraphQL errors do not become empty successful profile results', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify({ errors: [{ message: 'unavailable' }] })),
  );
  await assert.rejects(
    resolveProfiles(['e'.repeat(32)], new AbortController().signal),
    /could not complete/,
  );
});
