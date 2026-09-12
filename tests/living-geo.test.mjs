import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReader } from '../src/shared/geo/client.mjs';
import { parseEdges, orderedEdges } from '../src/shared/geo/collections.mjs';
import {
  parseRecords,
  QUESTION,
} from '../src/apps/education/question-data.mjs';
import { EDUCATION_SPACE as space } from '../src/config/geo.mjs';
const id = 'a'.repeat(32),
  target = 'b'.repeat(32),
  type = 'c'.repeat(32);
const response = (value) => ({ ok: true, json: async () => ({ data: value }) });
test('shared reads coalesce, expire, and replace removed members', async () => {
  let calls = 0,
    time = 0,
    value = [id, target];
  const client = createReader(
    'https://example.test',
    async () => {
      calls++;
      return response([...value]);
    },
    () => time,
  );
  const [a, b] = await Promise.all([
    client.read('q', {}, (d) => d),
    client.read('q', {}, (d) => d),
  ]);
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
  value = [target];
  await client.read('q', {}, (d) => d);
  assert.equal(calls, 1);
  time = 120001;
  assert.deepEqual(await client.read('q', {}, (d) => d), [target]);
  assert.equal(calls, 2);
});
test('late response cannot overwrite a refreshed cache', async () => {
  let resolve;
  let calls = 0;
  const client = createReader('https://example.test', async () =>
    ++calls === 1 ? await new Promise((r) => (resolve = r)) : response('new'),
  );
  const old = client.read('q', {}, (d) => d);
  client.invalidate();
  assert.equal(await client.read('q', {}, (d) => d), 'new');
  resolve(response('old'));
  await old;
  assert.equal(await client.read('q', {}, (d) => d), 'new');
  assert.equal(calls, 2);
});
test('request queue bounds concurrency and failures do not poison cache', async () => {
  let active = 0,
    max = 0;
  const client = createReader('https://example.test', async () => {
    active++;
    max = Math.max(max, active);
    await new Promise((r) => setTimeout(r, 4));
    active--;
    return response(1);
  });
  await Promise.all(
    Array.from({ length: 15 }, (_, i) => client.read('q', { i }, (d) => d)),
  );
  assert.equal(max, 4);
  let count = 0;
  const bad = createReader('https://example.test', async () =>
    response(++count),
  );
  await assert.rejects(
    bad.read('q', {}, () => {
      throw Error('bad');
    }),
  );
  assert.equal(await bad.read('q', {}, (d) => d), 2);
});
test('collection order uses positions; wrong-space and wrong-direction edges rejected', () => {
  const edge = {
    id,
    spaceId: space,
    fromEntityId: target,
    typeId: type,
    toEntityId: id,
    position: 'a1',
  };
  const payload = (e) => ({
    relationsConnection: { nodes: e, pageInfo: { hasNextPage: false } },
  });
  const parsed = parseEdges(
    payload([edge, { ...edge, id: target, position: 'a0' }]),
    space,
    target,
    type,
  );
  assert.deepEqual(
    orderedEdges(parsed.edges).map((e) => e.id),
    [target, id],
  );
  assert.throws(() =>
    parseEdges(payload([{ ...edge, spaceId: id }]), space, target, type),
  );
  assert.throws(() =>
    parseEdges(payload([{ ...edge, fromEntityId: id }]), space, target, type),
  );
});
test('renamed questions retain identity; changed types and conflicting text are unavailable', () => {
  const name = 'a126ca530c8e48d5b88882c734c38935';
  const e = {
    id,
    values: {
      nodes: [{ propertyId: name, spaceId: space, text: 'Edited question?' }],
      pageInfo: { hasNextPage: false },
    },
    relations: {
      nodes: [{ toEntityId: QUESTION, spaceId: space }],
      pageInfo: { hasNextPage: false },
    },
  };
  const parse = () =>
    parseRecords(
      { entitiesConnection: { nodes: [e], pageInfo: { hasNextPage: false } } },
      [id],
      QUESTION,
    )[0];
  assert.equal(parse().name, 'Edited question?');
  assert.equal(parse().id, id);
  e.values.nodes.push({
    propertyId: name,
    spaceId: space,
    text: 'Conflicting question?',
  });
  assert.equal(parse().unavailable, true);
  e.values.nodes.pop();
  e.relations.nodes[0].toEntityId = type;
  assert.equal(parse().unavailable, true);
});
