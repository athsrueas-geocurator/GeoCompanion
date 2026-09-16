import test from 'node:test';
import assert from 'node:assert/strict';
import {
  neighborhood,
  toForceData,
  parseNodeImages,
} from '../src/shared/graph/force-data.mjs';
const graph = {
  nodes: [
    { id: 'a', label: 'Same' },
    { id: 'b', label: 'Same' },
    { id: 'c', label: 'Other' },
  ],
  edges: [
    { id: 'ab', source: 'a', target: 'b', type: 'supports' },
    { id: 'cb', source: 'c', target: 'b', type: 'opposes' },
  ],
};
test('force input is isolated from simulation mutation and preserves distinct IDs and directions', () => {
  const copy = toForceData(graph, [{ id: 'a', x: 4, fx: 8 }]);
  copy.links[0].source = copy.nodes[0];
  copy.nodes[0].label = 'changed';
  assert.equal(graph.edges[0].source, 'a');
  assert.equal(graph.nodes[0].label, 'Same');
  assert.equal(copy.nodes[0].fx, 8);
  assert.throws(() => toForceData({ ...graph, nodes: graph.nodes.slice(1) }));
});
test('highlighting includes incoming and outgoing neighbors without inventing edges', () => {
  const h = neighborhood(graph, 'b');
  assert.deepEqual([...h.nodes].sort(), ['a', 'b', 'c']);
  assert.deepEqual([...h.edges].sort(), ['ab', 'cb']);
  assert.equal(neighborhood(graph, '').edges.size, 0);
  assert.deepEqual([...neighborhood(graph, 'a').nodes], ['a', 'b']);
});
test('node images retain assertion scope, reject external URLs and ambiguous images', () => {
  const uri = 'ipfs://b' + 'a'.repeat(30);
  const rel = (space, text) => ({
    spaceId: space,
    toEntity: {
      values: {
        nodes: [{ spaceId: space, text }],
        pageInfo: { hasNextPage: false },
      },
    },
  });
  const data = {
    entities: [
      {
        id: 'a',
        relations: { nodes: [rel('x', uri)], pageInfo: { hasNextPage: false } },
      },
    ],
  };
  assert.ok(parseNodeImages(data, ['a'], 'x').a);
  data.entities[0].relations.nodes.push(rel('y', 'ipfs://b' + 'b'.repeat(30)));
  assert.equal(parseNodeImages(data, ['a'], 'z').a, undefined);
  assert.ok(parseNodeImages(data, ['a'], 'x').a);
  data.entities[0].relations.nodes = [rel('x', 'https://example.org/tracker')];
  assert.equal(parseNodeImages(data, ['a'], 'x').a, undefined);
  assert.throws(() => parseNodeImages(data, ['b'], 'x'));
});
