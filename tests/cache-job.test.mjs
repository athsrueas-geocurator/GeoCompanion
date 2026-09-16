import test from 'node:test';
import assert from 'node:assert/strict';
import { createJob } from '../src/shared/cache/job.mjs';
import { filterGraph } from '../src/shared/graph/model.mjs';
import { mergeGraphs } from '../src/apps/graphs/graph-data.mjs';
test('cache job discovers work, deduplicates identities, and continues after failures', async () => {
  const states = [],
    j = createJob((s) => states.push(s));
  j.add('root', 'root', async ({ add, discover }) => {
    discover(['a', 'b', 'a']);
    add('child', 'child', async () => {
      throw Error('upstream');
    });
    add('child', 'duplicate', async () => assert.fail());
  });
  await j.start();
  assert.equal(j.getState().done, 2);
  assert.equal(j.getState().errors, 1);
  assert.equal(j.getState().entities, 2);
  assert.ok(states.some((s) => s.total === 2 && s.done === 0));
});
test('stop prevents subsequent tasks from starting', async () => {
  const j = createJob();
  j.add('a', 'a', async () => j.stop());
  j.add('b', 'b', async () => assert.fail());
  await j.start();
  assert.equal(j.getState().done, 1);
  assert.equal(j.getState().label, 'Stopped');
});
test('larger graph limits retain real connected neighborhoods and scoped edge identities', () => {
  const nodes = Array.from({ length: 300 }, (_, i) => ({
    id: String(i),
    label: String(i),
  }));
  const edges = nodes
    .slice(1)
    .map((n) => ({ id: 'e' + n.id, source: '0', target: n.id, type: 'topic' }));
  const g = { nodes, edges, scope: 's', partial: false };
  const wide = filterGraph(g, { neighborhood: false, limit: 500 });
  assert.equal(wide.nodes.length, 300);
  assert.equal(wide.edges.length, 299);
  assert.equal(wide.partial, false);
  const small = filterGraph(g, { neighborhood: false, limit: 80 });
  assert.equal(small.edges.length, 79);
  assert.equal(small.partial, true);
  assert.equal(mergeGraphs(g, g).edges.length, 299);
  assert.throws(() => mergeGraphs(g, { ...g, scope: 'other' }));
});
