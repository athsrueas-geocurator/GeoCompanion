import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFeaturedPage,
  loadFeaturedSpaces,
  FEATURED_ROOT,
  FEATURED_TAG,
  TAG_PROPERTY,
} from '../src/shared/geo/featured-spaces.mjs';
function fixture() {
  return {
    relationsConnection: {
      nodes: [
        {
          id: 'a'.repeat(32),
          spaceId: FEATURED_ROOT,
          typeId: TAG_PROPERTY,
          toEntityId: FEATURED_TAG,
          fromEntity: {
            id: 'b'.repeat(32),
            name: 'Topic',
            spacesByTopicIdConnection: {
              nodes: [
                { id: 'c'.repeat(32), page: { name: 'Live space name' } },
              ],
              pageInfo: { hasNextPage: false },
            },
          },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  };
}
test('featured flag is Root-attributed; tagged non-space content is excluded', () => {
  const data = fixture();
  assert.equal(parseFeaturedPage(data).spaces[0].name, 'Live space name');
  data.relationsConnection.nodes[0].fromEntity.spacesByTopicIdConnection.nodes =
    [];
  assert.deepEqual(parseFeaturedPage(data).spaces, []);
  data.relationsConnection.nodes[0].spaceId = 'd'.repeat(32);
  assert.throws(() => parseFeaturedPage(data));
});
test('featured discovery rejects truncated space lists and missing cursors', () => {
  const data = fixture();
  data.relationsConnection.nodes[0].fromEntity.spacesByTopicIdConnection.pageInfo.hasNextPage = true;
  assert.throws(() => parseFeaturedPage(data));
  const second = fixture();
  second.relationsConnection.pageInfo.hasNextPage = true;
  assert.throws(() => parseFeaturedPage(second));
});
test('featured discovery finishes pages, deduplicates IDs and rejects repeated cursors', async () => {
  let calls = 0;
  const reader = {
    read: async () => ({
      spaces: [{ id: 'c'.repeat(32), name: 'Live name' }],
      next: ++calls === 1 ? 'cursor' : null,
    }),
  };
  assert.equal((await loadFeaturedSpaces(reader)).length, 1);
  assert.equal(calls, 2);
  await assert.rejects(
    loadFeaturedSpaces({
      read: async () => ({ spaces: [], next: 'repeated' }),
    }),
  );
});
