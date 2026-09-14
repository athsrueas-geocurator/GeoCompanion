import test from 'node:test';
import assert from 'node:assert/strict';
import {
  P,
  parseRecord,
  publicUrl,
  loadDirectory,
  DIRECTORY,
} from '../src/apps/outreach/outreach-data.mjs';
import { geoReader } from '../src/shared/geo/client.mjs';
import { REL } from '../src/shared/geo/collections.mjs';
const space = 'f24e3bbd26304474b7e0c2a0877f4bfe';
const id = 'a'.repeat(32),
  block = 'b'.repeat(32);
function record(values = [], relations = []) {
  return {
    id,
    values: {
      nodes: values.map((v) => ({ spaceId: space, ...v })),
      pageInfo: { hasNextPage: false },
    },
    relations: {
      nodes: relations.map((r) => ({ spaceId: space, ...r })),
      pageInfo: { hasNextPage: false },
    },
  };
}
test('coordinates require public stop type and valid geometry', () => {
  const values = [{ propertyId: P.point, point: '39.7,-86.1' }];
  assert.equal(parseRecord(record(values)).point, null);
  const rel = [{ typeId: P.types, toEntityId: P.stop }];
  assert.deepEqual(parseRecord(record(values, rel)).point, [39.7, -86.1]);
  assert.equal(
    parseRecord(record([{ propertyId: P.point, point: '91,-86' }], rel)).point,
    null,
  );
  assert.equal(
    parseRecord(record([{ propertyId: P.point, point: ',-86' }], rel)).point,
    null,
  );
});
test('reject incomplete/conflicting/scoped and non-allowlisted details', () => {
  const a = record();
  a.values.pageInfo.hasNextPage = true;
  assert.throws(() => parseRecord(a));
  assert.throws(() =>
    parseRecord(record([{ propertyId: 'private-contact', text: 'secret' }])),
  );
  assert.throws(() =>
    parseRecord(
      record([
        { propertyId: P.name, text: 'A' },
        { propertyId: P.name, text: 'B' },
      ]),
    ),
  );
  const b = record([{ propertyId: P.name, text: 'A' }]);
  b.values.nodes[0].spaceId = 'wrong';
  assert.throws(() => parseRecord(b));
  assert.equal(
    parseRecord(
      record([{ propertyId: P.description, text: 'Email person@example.com' }]),
    ).description,
    '',
  );
});
test('public source links reject credentials, query strings and non-web schemes', () => {
  for (const u of [
    'mailto:a@b.test',
    'https://u:p@example.org',
    'https://example.org/?email=a',
    'javascript:alert(1)',
  ])
    assert.equal(publicUrl(u), null);
  assert.equal(
    publicUrl('https://example.org/services'),
    'https://example.org/services',
  );
});
test('directory follows memberships and removes services after fresh snapshot', async () => {
  const original = geoReader.read;
  let members = true;
  geoReader.read = async (query, v, parse) => {
    if (query.includes('CollectionEdges')) {
      const targets = v.id === DIRECTORY ? [block] : members ? [id] : [];
      return parse({
        relationsConnection: {
          nodes: targets.map((to, i) => ({
            id: String(i + 1).repeat(32),
            spaceId: space,
            fromEntityId: v.id,
            typeId: v.type,
            position: 'a0',
            toEntityId: to,
          })),
          pageInfo: { hasNextPage: false },
        },
      });
    }
    return parse({
      entitiesConnection: {
        nodes: [
          record(
            [{ propertyId: P.name, text: 'Test service' }],
            [{ typeId: P.types, toEntityId: P.service }],
          ),
        ],
        pageInfo: { hasNextPage: false },
      },
    });
  };
  try {
    assert.equal((await loadDirectory()).length, 1);
    members = false;
    assert.deepEqual(await loadDirectory(true), []);
  } finally {
    geoReader.read = original;
  }
});
