import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createReader,
  parseNode,
  parseDiscovery,
  P,
  SPACE,
  NODE,
} from '../src/apps/education/argument-data.mjs';
const a = '1'.repeat(32),
  b = '2'.repeat(32),
  edgeId = '3'.repeat(32);
const entity = (id = a, factual = false) => ({
  id,
  name: 'Global title',
  values: {
    nodes: [
      { propertyId: P.name, spaceId: SPACE, text: 'Scoped title' },
      { propertyId: P.factual, spaceId: SPACE, boolean: factual },
    ],
    pageInfo: { hasNextPage: false },
  },
});
const payload = (next = null) => ({
  data: {
    entity: entity(),
    relationsConnection: {
      nodes: [
        {
          id: edgeId,
          fromEntityId: a,
          toEntityId: b,
          typeId: P.supports,
          spaceId: SPACE,
          toEntity: entity(b, true),
        },
      ],
      pageInfo: { hasNextPage: !!next, endCursor: next },
    },
  },
});
const response = (data) => ({ ok: true, json: async () => data });
test('preserves scoped text, factual classification and proposition-to-argument direction', () => {
  const result = parseNode(payload(), a);
  assert.equal(result.node.name, 'Scoped title');
  assert.equal(result.edges[0].role, 'supports');
  assert.equal(result.edges[0].target.factual, true);
  for (const field of ['spaceId', 'fromEntityId']) {
    const bad = payload();
    bad.data.relationsConnection.nodes[0][field] = '9'.repeat(32);
    assert.throws(() => parseNode(bad, a));
  }
});
test('rejects conflicting, cross-space or truncated facts and API errors', () => {
  const bad = payload();
  bad.data.entity.values.nodes.push({
    propertyId: P.name,
    spaceId: SPACE,
    text: 'Other',
  });
  assert.throws(() => parseNode(bad, a), /conflicting/);
  const wrong = payload();
  wrong.data.entity.values.nodes[0].spaceId = b;
  assert.throws(() => parseNode(wrong, a), /another collection/);
  const truncated = payload();
  truncated.data.entity.values.pageInfo.hasNextPage = true;
  assert.throws(() => parseNode(truncated, a), /completely/);
  assert.throws(() => parseNode({ errors: [{ message: 'bad' }] }, a));
});
test('discovery needs explicit nonfactual classification, not keywords or a debate tag', () => {
  const e = entity();
  e.relations = { nodes: [], pageInfo: { hasNextPage: false } };
  const p = {
    data: {
      entitiesConnection: { nodes: [e], pageInfo: { hasNextPage: false } },
    },
  };
  assert.equal(parseDiscovery(p).rows.length, 1);
  e.values.nodes[1].boolean = null;
  assert.throws(() => parseDiscovery(p), /classification/);
});
test('paginates edges and deduplicates targets per role without merging opposition or sources', async () => {
  let calls = 0;
  const reader = createReader(async (_url, options) => {
    const { variables, query } = JSON.parse(options.body);
    assert.equal(query, NODE);
    calls++;
    const p = payload(variables.after ? null : 'cursor1');
    if (variables.after) {
      p.data.relationsConnection.nodes.push({
        ...p.data.relationsConnection.nodes[0],
        id: '4'.repeat(32),
        typeId: P.opposes,
      });
    }
    return response(p);
  });
  const result = await reader.node(a);
  assert.equal(calls, 2);
  assert.equal(result.groups.supports.length, 1);
  assert.equal(result.groups.opposes.length, 1);
});
test('detects repeated cursors rather than returning incomplete arguments', async () => {
  const reader = createReader(async () => response(payload('loop')));
  await assert.rejects(reader.node(a), /did not advance/);
});
test('cache shares in-flight requests, expires after five minutes and supports refresh', async () => {
  let calls = 0,
    clock = 0;
  const reader = createReader(
    async () => {
      calls++;
      return response(payload());
    },
    () => clock,
  );
  await Promise.all([reader.node(a), reader.node(a)]);
  assert.equal(calls, 1);
  await reader.node(a);
  assert.equal(calls, 1);
  clock = 300000;
  await reader.node(a);
  assert.equal(calls, 2);
  reader.clear();
  await reader.node(a);
  assert.equal(calls, 3);
});
test('failed and malformed responses are not cached', async () => {
  let calls = 0;
  const reader = createReader(async () => {
    calls++;
    return response(
      calls === 1 ? { errors: [{}] } : calls === 2 ? { data: {} } : payload(),
    );
  });
  await assert.rejects(reader.node(a));
  await assert.rejects(reader.node(a));
  await reader.node(a);
  assert.equal(calls, 3);
});
test('missing target remains unavailable and never acquires fabricated content', () => {
  const p = payload();
  p.data.relationsConnection.nodes[0].toEntity = null;
  const target = parseNode(p, a).edges[0].target;
  assert.equal(target.name, 'Unavailable entry');
  assert.equal(target.factual, null);
  assert.equal(target.description, '');
});
