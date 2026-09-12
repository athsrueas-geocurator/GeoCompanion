import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCK,
  blockKind,
  orderedBlockRecords,
} from '../src/apps/education/block-capabilities.mjs';
const rel = (typeId, toEntityId) => ({ typeId, toEntityId });
const record = (relations = [], fields = []) => ({
  id: 'a',
  relations,
  fields,
});
test('explicit collection classification does not depend on names or loaded members', () => {
  const r = record([
    rel(BLOCK.types, BLOCK.data),
    rel(BLOCK.source, BLOCK.collection),
  ]);
  assert.equal(blockKind(r), 'collection');
  assert.equal(blockKind({ ...r, name: 'Renamed table' }), 'collection');
  assert.equal(
    blockKind(record([rel(BLOCK.types, BLOCK.data)])),
    'unsupported',
  );
  assert.equal(
    blockKind({
      ...r,
      relations: [...r.relations, rel(BLOCK.source, 'query')],
    }),
    'unsupported',
  );
});
test('text and unfamiliar blocks never silently become result tables', () => {
  assert.equal(blockKind(record([rel(BLOCK.types, BLOCK.image)])), 'image');
  assert.equal(
    blockKind(
      record(
        [rel(BLOCK.types, BLOCK.text)],
        [{ id: BLOCK.markdown, value: '' }],
      ),
    ),
    'text',
  );
  assert.equal(blockKind(record([rel(BLOCK.types, 'image')])), 'unsupported');
  assert.equal(blockKind(record()), 'unsupported');
  assert.equal(blockKind({ ...record(), unavailable: true }), 'unavailable');
});
test('missing linked blocks keep their position as unavailable; refreshed membership removes them', () => {
  const edges = [{ toEntityId: 'missing' }, { toEntityId: 'a' }];
  const result = orderedBlockRecords(edges, [record()]);
  assert.deepEqual(
    result.map((r) => r.id),
    ['missing', 'a'],
  );
  assert.equal(result[0].unavailable, true);
  assert.deepEqual(
    orderedBlockRecords(edges.slice(1), [record()]).map((r) => r.id),
    ['a'],
  );
});
