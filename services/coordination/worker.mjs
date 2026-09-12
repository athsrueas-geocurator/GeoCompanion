import { DurableObject } from 'cloudflare:workers';
import { selection, events } from '../../src/shared/coordination/protocol.mjs';
const json = (body, status = 200) => Response.json(body, { status });
const hour = 3600000;
export default {
  async scheduled(_event, env) {
    await env.METRICS.prepare(
      "DELETE FROM events WHERE day < date('now','-30 days')",
    ).run();
  },
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGINS.split(',').includes(origin);
    if (!allowed) return json({ error: 'Origin not allowed' }, 403);
    let response;
    try {
      response = await handle(request, env);
    } catch {
      response = json({ error: 'Service unavailable. Try again later.' }, 503);
    }
    if (response.status === 101) return response;
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, headers });
  },
};
async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (url.pathname === '/health') return json({ ok: true });
  // Global daily prototype ceiling. No visitor identifier or IP is stored.
  const permit = await env.BUDGET.getByName('daily').fetch('https://budget/');
  if (!permit.ok) return json({ error: 'Daily prototype limit reached' }, 429);
  if (url.pathname === '/rooms' && request.method === 'POST') {
    const id = crypto.randomUUID().replaceAll('-', '');
    await env.ROOMS.getByName(id).fetch('https://room/create', {
      method: 'POST',
    });
    return json({ id, expiresAt: Date.now() + hour }, 201);
  }
  const room = url.pathname.match(/^\/rooms\/([a-f0-9]{32})$/);
  if (
    room &&
    request.method === 'GET' &&
    request.headers.get('Upgrade')?.toLowerCase() === 'websocket'
  )
    return env.ROOMS.getByName(room[1]).fetch(request);
  if (url.pathname === '/events' && request.method === 'POST') {
    let batch;
    try {
      batch = events(JSON.parse(await boundedBody(request)));
    } catch {
      return json({ error: 'Invalid events' }, 400);
    }
    if (!batch) return json({ error: 'Invalid events' }, 400);
    const day = new Date().toISOString().slice(0, 10);
    const counts = new Map();
    for (const event of batch) {
      const key = event.route + '|' + event.action;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    await env.METRICS.batch(
      [...counts].map(([key, count]) => {
        const [route, action] = key.split('|');
        return env.METRICS.prepare(
          'INSERT INTO events(day,route,action,count) VALUES(?,?,?,?) ON CONFLICT(day,route,action) DO UPDATE SET count=count+excluded.count',
        ).bind(day, route, action, count);
      }),
    );
    await env.METRICS.prepare(
      "DELETE FROM events WHERE day < date('now','-30 days')",
    ).run();
    return json({ accepted: batch.length });
  }
  if (url.pathname === '/insights' && request.method === 'GET') {
    const result = await env.METRICS.prepare(
      "SELECT route,action,SUM(count) AS events FROM events WHERE day >= date('now','-7 days') GROUP BY route,action HAVING SUM(count)>=10 ORDER BY events DESC LIMIT 36",
    ).all();
    return json({ period: 'last 7 days', rows: result.results });
  }
  return json({ error: 'Not found' }, 404);
}
async function boundedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  let text = '',
    size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw Error('Too large');
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}
export class Budget extends DurableObject {
  async fetch() {
    const day = new Date().toISOString().slice(0, 10);
    const permitted = await this.ctx.storage.transaction(async (tx) => {
      const saved = await tx.get('budget');
      const count = saved?.day === day ? saved.count : 0;
      if (count >= 1000) return false;
      await tx.put('budget', { day, count: count + 1 });
      return true;
    });
    return new Response(null, { status: permitted ? 204 : 429 });
  }
}
export class Room extends DurableObject {
  async fetch(request) {
    if (new URL(request.url).pathname === '/create') {
      const expiresAt = Date.now() + hour;
      await this.ctx.storage.put('expiresAt', expiresAt);
      await this.ctx.storage.setAlarm(expiresAt);
      return json({ ok: true });
    }
    const expiresAt = await this.ctx.storage.get('expiresAt');
    if (!expiresAt || expiresAt <= Date.now())
      return json({ error: 'Room expired or missing' }, 410);
    if (this.ctx.getWebSockets().length >= 2)
      return json({ error: 'Room is full' }, 409);
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ last: 0, count: 0 });
    server.send(JSON.stringify({ type: 'ready', expiresAt }));
    this.broadcast({
      type: 'presence',
      count: this.ctx.getWebSockets().length,
    });
    return new Response(null, { status: 101, webSocket: client });
  }
  broadcast(value, except) {
    for (const socket of this.ctx.getWebSockets())
      if (socket !== except) {
        try {
          socket.send(JSON.stringify(value));
        } catch {}
      }
  }
  async webSocketMessage(socket, message) {
    const state = socket.deserializeAttachment();
    if (
      typeof message !== 'string' ||
      new TextEncoder().encode(message).length > 1024
    ) {
      socket.close(1008, 'Invalid message');
      return;
    }
    if (Date.now() - state.last < 1000 || state.count >= 120) {
      socket.close(1008, 'Session message limit');
      return;
    }
    let value;
    try {
      value = selection(JSON.parse(message));
    } catch {}
    if (!value) {
      socket.close(1008, 'Invalid selection');
      return;
    }
    state.last = Date.now();
    state.count++;
    socket.serializeAttachment(state);
    this.broadcast({ type: 'selection', selection: value }, socket);
  }
  async webSocketClose(socket, code, reason) {
    socket.close([1005, 1006, 1015].includes(code) ? 1000 : code, reason);
    this.broadcast(
      {
        type: 'presence',
        count: this.ctx.getWebSockets().filter((s) => s !== socket).length,
      },
      socket,
    );
  }
  async alarm() {
    for (const socket of this.ctx.getWebSockets())
      socket.close(1000, 'Session expired');
    await this.ctx.storage.deleteAll();
  }
}
