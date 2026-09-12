// Integration checks against wrangler dev only; never generate production telemetry.
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const base = 'http://127.0.0.1:8787';
const origin = 'http://127.0.0.1:5173';
const headers = { Origin: origin, 'Content-Type': 'application/json' };
assert.equal((await fetch(base + '/rooms', { method: 'POST' })).status, 403);
const created = await fetch(base + '/rooms', { method: 'POST', headers });
assert.equal(created.status, 201);
const { id } = await created.json();
function connect(room) {
  return new WebSocket(base.replace('http', 'ws') + '/rooms/' + room, {
    origin,
  });
}
function message(socket, type) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Timed out: ' + type)), 5000);
    function handler(bytes) {
      const data = JSON.parse(bytes.toString());
      if (data.type === type) {
        clearTimeout(timer);
        socket.off('message', handler);
        resolve(data);
      }
    }
    socket.on('message', handler);
  });
}
const one = connect(id);
await message(one, 'ready');
const two = connect(id);
await message(two, 'ready');
const third = connect(id);
await new Promise((resolve, reject) => {
  third.once('unexpected-response', (_req, r) => {
    try {
      assert.equal(r.statusCode, 409);
      r.resume();
      third.terminate();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
  third.on('error', () => {});
});
const received = message(two, 'selection');
one.send(
  JSON.stringify({
    route: 'education/map',
    entity: 'a'.repeat(32),
    space: 'b'.repeat(32),
    privateText: 'must not forward',
  }),
);
assert.deepEqual((await received).selection, {
  route: 'education/map',
  entity: 'a'.repeat(32),
  space: 'b'.repeat(32),
});
const closed = new Promise((resolve) =>
  one.once('close', (code) => {
    assert.equal(code, 1008);
    resolve();
  }),
);
one.send('{}');
await closed;
two.close();
const accepted = await fetch(base + '/events', {
  method: 'POST',
  headers,
  body: JSON.stringify(
    Array(10).fill({
      route: 'outreach/map',
      action: 'select',
      privateText: 'discard',
    }),
  ),
});
assert.equal(accepted.status, 200);
const insights = await (await fetch(base + '/insights', { headers })).json();
assert.ok(
  insights.rows.some((row) => row.route === 'outreach/map' && row.events >= 10),
);
assert.equal(JSON.stringify(insights).includes('privateText'), false);
console.log(
  'Local runtime passed: CORS, two participants, full-room rejection, selection relay, private-field stripping, invalid-message closure, D1 aggregates.',
);
