import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePost,
  readPost,
} from '../src/apps/education/curation-live.mjs';
const START_POST = 'a'.repeat(32);
const connection = (nodes) => ({ nodes, pageInfo: { hasNextPage: false } });
const value = (propertyId, text) => ({ propertyId, text });
const entity = () => ({
  id: START_POST,
  values: connection([
    value('a126ca530c8e48d5b88882c734c38935', 'A user title'),
  ]),
  relations: connection([]),
});
const block = (id, position, markdown) => ({
  id,
  position,
  type: { id: 'beaba5cba67741a8b35377030613fc70' },
  toEntity: {
    id,
    values: connection([value('e3e363d1dd294ccb8e6ff3b76d99bc33', markdown)]),
  },
});
test('reader preserves live words and case-sensitive Geo ordering, including new blocks', () => {
  const e = entity();
  e.relations.nodes = [block('b', 'aZ', 'Second'), block('a', 'aA', '# First')];
  const p = normalizePost(e);
  assert.deepEqual(
    p.blocks.map((b) => b.markdown),
    ['# First', 'Second'],
  );
  e.relations.nodes.push(block('c', 'aa', 'New content'));
  assert.equal(normalizePost(e).blocks[2].markdown, 'New content');
});
test('incomplete or conflicting post content fails instead of silently dropping text', () => {
  const e = entity();
  e.relations.pageInfo.hasNextPage = true;
  assert.throws(() => normalizePost(e), /100-link/);
  e.relations.pageInfo.hasNextPage = false;
  e.values.nodes.push(value('a126ca530c8e48d5b88882c734c38935', 'Conflicting'));
  assert.throws(() => normalizePost(e), /conflicting/);
});
test('normal revisits use cache while explicit refresh fetches changed Geo content', async () => {
  const original = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => {
      count++;
      const e = entity();
      e.relations.nodes = [block('a', 'a0', `Revision ${count}`)];
      return { data: { entity: e } };
    },
  });
  try {
    const a = await readPost(START_POST);
    const b = await readPost(START_POST);
    assert.equal(count, 1);
    assert.equal(a.blocks[0].markdown, b.blocks[0].markdown);
    const c = await readPost(START_POST, undefined, true);
    assert.equal(count, 2);
    assert.equal(c.blocks[0].markdown, 'Revision 2');
  } finally {
    globalThis.fetch = original;
  }
});
