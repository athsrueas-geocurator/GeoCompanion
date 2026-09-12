import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  P,
  parsePage,
  modeFilter,
  filterRows,
  mergeRows,
} from '../src/apps/education/atlas-live.mjs';
const id = 'a'.repeat(32),
  source = 'b'.repeat(32);
const payload = () => ({
  data: {
    entitiesConnection: {
      nodes: [
        {
          id,
          name: 'Resolved name',
          description: 'Wrong-space description',
          values: {
            nodes: [
              { propertyId: P.name, text: 'Scoped name' },
              { propertyId: P.population, text: 'Adults' },
            ],
            pageInfo: { hasNextPage: false },
          },
          relations: {
            nodes: [
              {
                typeId: P.source,
                toEntityId: source,
                toEntity: { name: 'Paper' },
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  },
});
test('atlas uses scoped description without inferring evidence ratings', () => {
  const r = parsePage(payload()).rows[0];
  assert.equal(r.name, 'Scoped name');
  assert.equal(r.description, '');
  assert.equal(r.population, 'Adults');
  assert.deepEqual(r.sources, [{ id: source, name: 'Paper' }]);
  assert.equal(r.evidenceStrength, undefined);
});
test('atlas rejects incomplete nested data, conflicting values and GraphQL errors', () => {
  const p = payload();
  p.data.entitiesConnection.nodes[0].relations.pageInfo.hasNextPage = true;
  assert.throws(() => parsePage(p));
  const q = payload();
  q.data.entitiesConnection.nodes[0].values.nodes.push({
    propertyId: P.name,
    text: 'Conflict',
  });
  assert.throws(() => parsePage(q));
  assert.throws(() => parsePage({ errors: [{}] }));
});
test('atlas preserves pagination and merges IDs, filters structured facets', () => {
  const p = payload();
  p.data.entitiesConnection.pageInfo = { hasNextPage: true, endCursor: 'next' };
  const page = parsePage(p);
  assert.equal(page.next, 'next');
  assert.equal(mergeRows(page.rows, page.rows).length, 1);
  assert.equal(filterRows(page.rows, 'Adults').length, 1);
  assert.equal(filterRows(page.rows, '', 'unpublished-topic').length, 0);
});
test('questions use scoped nonfactual property, evidence uses exact identifier', () => {
  assert.equal(modeFilter('questions').values.some.boolean.is, false);
  assert.equal(modeFilter('evidence', id).relations.some.toEntityId.is, id);
  assert.throws(() => modeFilter('evidence', 'bad'));
});
