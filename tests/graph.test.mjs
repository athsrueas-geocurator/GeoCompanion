import test from 'node:test';
import assert from 'node:assert/strict';
import { filterGraph, exportGraph } from '../src/shared/graph/model.mjs';
import { parseGraph, ROLES } from '../src/apps/graphs/graph-data.mjs';
import {
  emptyPreferences,
  validatePreferences,
} from '../src/shared/preferences/preference-storage.mjs';
const graph = {
  scope: 'scope',
  partial: true,
  nodes: [
    { id: 'a', label: '=Unsafe', space: 's', x: 5 },
    { id: 'b', label: 'Same name', space: 's' },
    { id: 'c', label: 'Same name', space: 's' },
  ],
  edges: [
    {
      id: '1',
      source: 'a',
      target: 'b',
      label: 'Authors',
      type: 'author',
      space: 's',
    },
    {
      id: '2',
      source: 'b',
      target: 'c',
      label: 'Sources',
      type: 'source',
      space: 's',
    },
  ],
};
test('focus preserves identities and directions without dangling edges', () => {
  const g = filterGraph(graph, { focus: 'a' });
  assert.deepEqual(
    g.nodes.map((n) => n.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    g.edges.map((e) => e.id),
    ['1'],
  );
  assert.equal(g.partial, true);
  assert.equal(
    filterGraph(graph, { relation: 'source', focus: 'a' }).edges.length,
    0,
  );
});
test('exports retain semantics and scope but exclude simulation; CSV neutralizes formulas', () => {
  const out = JSON.parse(exportGraph(graph, 'json'));
  assert.equal(out.nodes[0].x, undefined);
  assert.equal(out.partial, true);
  assert.equal(out.edges[0].source, 'a');
  assert.match(exportGraph(graph, 'csv'), /"'=Unsafe"/);
});
test('graph parser rejects scope mismatch and incomplete cursors', () => {
  const id = 'a'.repeat(32),
    space = 'b'.repeat(32);
  const e = {
    id,
    spaceId: space,
    typeId: ROLES.authors,
    type: { id: ROLES.authors, name: 'Authors' },
    fromEntity: { id, name: 'Paper' },
    toEntity: { id: 'c'.repeat(32), name: 'Author' },
  };
  const data = {
    relationsConnection: { nodes: [e], pageInfo: { hasNextPage: false } },
  };
  assert.equal(parseGraph(data, space, [ROLES.authors]).edges.length, 1);
  assert.throws(() => parseGraph(data, id, [ROLES.authors]));
  data.relationsConnection.pageInfo.hasNextPage = true;
  assert.throws(() => parseGraph(data, space, [ROLES.authors]));
});
test('force view is opt-in and old preferences migrate safely', () => {
  const old = emptyPreferences();
  delete old.forceGraph;
  assert.equal(validatePreferences(old).forceGraph, false);
  assert.equal(
    validatePreferences({ ...old, forceGraph: true }).forceGraph,
    true,
  );
  assert.throws(() => validatePreferences({ ...old, forceGraph: 'yes' }));
});
