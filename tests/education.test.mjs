import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudy, P } from '../src/apps/education/education-live.mjs';
const fixture = () => ({
  data: {
    entitiesConnection: {
      nodes: [
        {
          id: '7eeddeb79af54141b58e4cffe32d93a5',
          name: 'Estimate',
          values: {
            nodes: [
              { propertyId: P.effect, decimal: '0' },
              { propertyId: P.se, decimal: '1.21' },
              { propertyId: P.unit, text: 'percentile points' },
            ],
            pageInfo: { hasNextPage: false },
          },
          relations: {
            nodes: [
              {
                typeId: '98c0849922164db0822b5a78444c17b3',
                toEntityId: '32ef1b9c498b42c18725f72a93fd2917',
              },
              {
                typeId: 'a0109f6192b1414fa93fb756779643ed',
                toEntityId: '9c49d94122dc4f54b9311d20b9b10c33',
              },
              {
                typeId: '061dbc4816b0413b83ebe771ef3d9875',
                toEntityId: '4fcc10047b6648f9a9d3aa077e33aadf',
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        },
      ],
      pageInfo: { hasNextPage: false },
    },
  },
});
test('zero effect remains zero and missing sample size remains unknown', () => {
  const [row] = parseStudy(fixture());
  assert.equal(row.effect, 0);
  assert.equal(row.n, null);
  assert.equal(row.plot, true);
});
test('incompatible units and missing uncertainty stay in table but not plot', () => {
  const p = fixture();
  p.data.entitiesConnection.nodes[0].values.nodes[2].text = 'SD';
  assert.equal(parseStudy(p)[0].plot, false);
  p.data.entitiesConnection.nodes[0].values.nodes.splice(1, 1);
  assert.equal(parseStudy(p)[0].se, null);
});
test('partial and erroneous Geo responses cannot appear as complete evidence', () => {
  const p = fixture();
  p.data.entitiesConnection.pageInfo.hasNextPage = true;
  assert.throws(() => parseStudy(p));
  assert.throws(() => parseStudy({ errors: [{ message: 'unavailable' }] }));
  const q = fixture();
  q.data.entitiesConnection.nodes[0].relations.pageInfo.hasNextPage = true;
  assert.throws(() => parseStudy(q));
});
