import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDetails } from '../src/shared/graph/entity-details.mjs';
const id = 'a'.repeat(32),
  space = 'b'.repeat(32),
  p = 'c'.repeat(32);
const data = () => ({
  entity: {
    id,
    values: {
      nodes: [
        {
          spaceId: space,
          propertyId: p,
          property: { id: p, name: 'Estimate' },
          decimal: '0',
          text: null,
        },
        {
          spaceId: space,
          propertyId: p,
          property: { id: p, name: 'Is factual' },
          boolean: false,
        },
      ],
      pageInfo: { hasNextPage: false },
    },
    relations: { nodes: [], pageInfo: { hasNextPage: false } },
  },
});
test('entity popup preserves zero, false and repeated property values', () => {
  const d = data();
  assert.deepEqual(
    parseDetails(d, id, space).fields.map((f) => f.value),
    ['0', 'No'],
  );
  d.entity.values.pageInfo.hasNextPage = true;
  assert.equal(parseDetails(d, id, space).partial, true);
});
test('popup rejects malformed and cross-space data, omits contact values', () => {
  const d = data();
  d.entity.values.nodes[0].spaceId = id;
  assert.throws(() => parseDetails(d, id, space));
  assert.throws(() => parseDetails({ entity: null }, id, space));
  const c = data();
  c.entity.values.nodes[0].property.name = 'Phone';
  assert.equal(parseDetails(c, id, space).fields.length, 1);
});
