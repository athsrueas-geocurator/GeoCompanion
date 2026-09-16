import test from 'node:test';
import assert from 'node:assert/strict';
import { filterGraph, exportGraph } from '../src/shared/graph/model.mjs';
import {
  parseGraph,
  resolveGraphLabels,
  ROLES,
} from '../src/apps/graphs/graph-data.mjs';
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

test('unnamed space endpoints resolve through their own page without rewriting edge identity', async () => {
  const space = 'a'.repeat(32),
    identity = 'b'.repeat(32),
    page = 'c'.repeat(32);
  const input = {
    relationsConnection: {
      nodes: [
        {
          id: 'd'.repeat(32),
          spaceId: space,
          typeId: ROLES.authors,
          type: { id: ROLES.authors, name: 'Authors' },
          fromEntity: { id: 'e'.repeat(32), name: 'A claim' },
          toEntity: { id: identity, name: null },
        },
      ],
      pageInfo: { hasNextPage: false },
    },
  };
  const parsed = parseGraph(input, space, [ROLES.authors]);
  const reader = {
    read: async (_q, vars, parse) => {
      assert.deepEqual(vars.ids, [identity]);
      return parse({
        spaces: [
          { id: identity, type: 'PERSONAL', page: { id: page, name: 'Kevin' } },
        ],
      });
    },
  };
  const resolved = await resolveGraphLabels(parsed, reader);
  assert.equal(resolved.nodes[1].label, 'Kevin');
  assert.equal(resolved.nodes[1].id, identity);
  assert.equal(resolved.nodes[1].labelEntityId, page);
  assert.equal(resolved.nodes[1].labelSource, 'space-page');
  assert.equal(resolved.edges[0].target, identity);
  assert.match(resolved.nodes[1].geoUrl, new RegExp(`${identity}/${page}$`));
  assert.equal(parsed.nodes[1].labelSource, 'identifier');
  assert.equal(
    JSON.parse(exportGraph(resolved, 'json')).nodes[1].labelEntityId,
    page,
  );
  const absent = await resolveGraphLabels(parsed, {
    read: async (_q, _v, parse) => parse({ spaces: [] }),
  });
  assert.match(absent.nodes[1].label, /Unnamed entity/);
  assert.equal(absent.edges.length, 1);
  await assert.rejects(
    resolveGraphLabels(parsed, {
      read: async (_q, _v, parse) =>
        parse({ spaces: [{ id: space, page: { id: page, name: 'Wrong' } }] }),
    }),
    /identity/,
  );
  await assert.rejects(
    resolveGraphLabels(parsed, {
      read: async () => {
        throw Error('Offline');
      },
    }),
    /Offline/,
  );
});

test('endpoint label enrichment batches exact IDs and avoids requests for already named nodes', async () => {
  const nodes = Array.from({ length: 45 }, (_, i) => ({
    id: (i + 1).toString(16).padStart(32, '0'),
    label: 'Unnamed',
    labelSource: 'identifier',
  }));
  const sizes = [];
  const reader = {
    read: async (_q, v, parse) => {
      sizes.push(v.ids.length);
      return parse({ spaces: [] });
    },
  };
  await resolveGraphLabels({ nodes, edges: [] }, reader);
  assert.deepEqual(sizes, [20, 20, 5]);
  await resolveGraphLabels(
    {
      nodes: [{ id: 'a'.repeat(32), label: 'Known', labelSource: 'entity' }],
      edges: [],
    },
    reader,
  );
  assert.equal(sizes.length, 3);
});
