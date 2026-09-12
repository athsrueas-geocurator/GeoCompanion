import test from 'node:test';
import assert from 'node:assert/strict';
import {
  iconUrl,
  extractIcon,
  iconQuery,
} from '../src/shared/branding/space-icons.mjs';
const cid = 'QmU9UgXfZwvv5gwRUK5Je5xtyJWvAnrF1vQBAQ6vuWPja6';
test('icons accept immutable IPFS image references only', () => {
  assert.equal(
    iconUrl(`ipfs://${cid}`),
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  );
  for (const value of [
    'javascript:alert(1)',
    'https://evil.example/image',
    'ipfs://../secret',
    null,
  ])
    assert.equal(iconUrl(value), null);
  assert.throws(() => iconQuery('not-a-space'));
});
test('absent icons remain empty and ambiguous icons are rejected', () => {
  const data = (nodes) => ({
    data: {
      spaces: [
        { page: { relations: { nodes, pageInfo: { hasNextPage: false } } } },
      ],
    },
  });
  assert.equal(extractIcon(data([])), null);
  const image = {
    toEntity: {
      values: {
        nodes: [{ text: `ipfs://${cid}` }],
        pageInfo: { hasNextPage: false },
      },
    },
  };
  assert.equal(
    extractIcon(data([image])),
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  );
  assert.throws(() => extractIcon(data([image, image])));
  assert.throws(() => extractIcon({ errors: [{ message: 'unavailable' }] }));
});
