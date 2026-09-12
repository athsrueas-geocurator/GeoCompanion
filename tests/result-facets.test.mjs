import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resultFacets,
  selectedFacet,
} from '../src/apps/education/result-facets.mjs';
const edge = (typeId, name = 'A concept') => ({
  typeId,
  toEntityId: 'concept',
  type: { name: typeId },
  toEntity: { name },
});
test('new relationship kinds become filters and preserve distinct roles for the same target', () => {
  const groups = resultFacets([
    { id: 'one', relations: [edge('new-outcome'), edge('new-outcome')] },
    { id: 'two', relations: [edge('new-comparator')] },
  ]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].options[0].members, ['one']);
  assert.notEqual(groups[0].options[0].key, groups[1].options[0].key);
});
test('renames preserve selection; removed links clear it without keeping old members', () => {
  const before = resultFacets([{ id: 'one', relations: [edge('outcome')] }]);
  const key = before[0].options[0].key;
  const after = resultFacets([
    { id: 'two', relations: [edge('outcome', 'Renamed')] },
  ]);
  assert.equal(selectedFacet(after, key).name, 'Renamed');
  assert.deepEqual(selectedFacet(after, key).members, ['two']);
  assert.equal(selectedFacet([], key), undefined);
});
test('unavailable rows and structural links are not result dimensions', () => {
  assert.deepEqual(
    resultFacets([
      { id: 'one', unavailable: true, relations: [edge('outcome')] },
      { id: 'two', relations: [edge('8f151ba4de204e3c9cb499ddf96f48f1')] },
    ]),
    [],
  );
});
