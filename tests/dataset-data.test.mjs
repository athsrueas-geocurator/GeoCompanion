import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRecord,
  estimate,
  F,
} from '../src/apps/education/dataset-data.mjs';
import { EDUCATION_SPACE as space } from '../src/config/geo.mjs';
const id = 'a'.repeat(32);
function fixture() {
  return {
    id,
    name: 'Result',
    values: {
      nodes: [
        {
          propertyId: F.effect,
          spaceId: space,
          property: { name: 'Effect' },
          decimal: '5.36',
        },
        {
          propertyId: F.se,
          spaceId: space,
          property: { name: 'Standard error' },
          decimal: '1.21',
        },
        {
          propertyId: F.unit,
          spaceId: space,
          property: { name: 'Unit' },
          text: 'percentile points',
        },
      ],
      pageInfo: { hasNextPage: false },
    },
    relations: { nodes: [], pageInfo: { hasNextPage: false } },
  };
}
test('result values preserve typed units and numeric zero; missing is not zero', () => {
  const e = fixture();
  assert.deepEqual(estimate(parseRecord(e)), {
    value: 5.36,
    se: 1.21,
    unit: 'percentile points',
  });
  e.values.nodes[0].decimal = '0';
  assert.equal(estimate(parseRecord(e)).value, 0);
  e.values.nodes.shift();
  assert.equal(estimate(parseRecord(e)), null);
});
test('numeric-looking text, conflicting values and wrong-space assertions cannot become estimates', () => {
  const e = fixture();
  e.values.nodes[0].text = e.values.nodes[0].decimal;
  delete e.values.nodes[0].decimal;
  assert.equal(estimate(parseRecord(e)), null);
  const conflict = fixture();
  conflict.values.nodes.push({ ...conflict.values.nodes[0], decimal: '9' });
  assert.equal(parseRecord(conflict).unavailable, true);
  const wrong = fixture();
  wrong.values.nodes[0].spaceId = id;
  assert.equal(parseRecord(wrong).unavailable, true);
});
test('incomplete result is isolated and changed published labels are preserved', () => {
  const e = fixture();
  e.values.pageInfo.hasNextPage = true;
  assert.equal(parseRecord(e).unavailable, true);
  e.values.pageInfo.hasNextPage = false;
  e.values.nodes[0].property.name = 'Renamed field';
  assert.equal(parseRecord(e).fields[0].name, 'Renamed field');
});
