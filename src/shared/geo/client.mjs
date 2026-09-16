import {
  storedRead,
  storeRead,
  clearLocalCache,
  cacheEnabled,
} from './local-cache.mjs';
const observers = new Set();
export function observeReads(fn) {
  observers.add(fn);
  return () => observers.delete(fn);
}
function report(event) {
  for (const fn of observers) fn(event);
}
import { GEO_ENDPOINT } from '../../config/geo.mjs';

// Public reads only. A subscriber leaving must not cancel another subscriber.
export function createReader(
  endpoint,
  fetcher = globalThis.fetch,
  now = Date.now,
) {
  const cache = new Map(),
    pending = new Map(),
    queue = [];
  let clearing = Promise.resolve();
  let active = 0,
    generation = 0,
    bytes = 0;
  async function schedule(fn) {
    if (active >= 4) await new Promise((resolve) => queue.push(resolve));
    else active++;
    try {
      return await fn();
    } finally {
      const next = queue.shift();
      if (next) next();
      else active--;
    }
  }
  function invalidate() {
    generation++;
    if (cacheEnabled()) clearing = clearLocalCache().catch(() => {});
    cache.clear();
    pending.clear();
    bytes = 0;
  }
  async function read(query, variables, parse, version = '1') {
    const key = JSON.stringify([endpoint, version, query, variables]);
    const old = cache.get(key);
    if (old && now() - old.at < 120000) {
      cache.delete(key);
      cache.set(key, old);
      if (cacheEnabled() && !/detail|profile|image/i.test(version)) {
        try {
          await storeRead(key, old.value, old.at);
        } catch {
          report({
            name: 'Local cache',
            status: 'Could not save memory entry',
            query,
          });
        }
      }
      return old.value;
    }
    if (pending.has(key)) return pending.get(key);
    const epoch = generation;
    const work = schedule(async () => {
      const name = query.match(/query\s+(\w+)/)?.[1] || 'Geo query';
      // Hover details and identity search remain ephemeral.
      const persistent =
        !/detail|profile|image/i.test(version) && cacheEnabled();
      if (persistent)
        try {
          await clearing;
          const saved = await storedRead(key);
          if (saved !== null && epoch === generation) {
            report({ name, status: 'Cached', query });
            return saved;
          }
        } catch {
          report({
            name,
            status: 'Local storage unavailable; using memory',
            query,
          });
        }
      report({ name, status: 'Querying', query });
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok)
        throw Error('Updates could not be loaded. Please try again.');
      const payload = await response.json();
      if (payload.errors?.length || !payload.data)
        throw Error('The collection could not be read. Please try again.');
      const value = parse(payload.data);
      if (persistent && epoch === generation)
        try {
          await storeRead(key, value);
        } catch {
          report({
            name,
            status: 'Could not save locally; using memory',
            query,
          });
        }
      report({ name, status: 'Received', query });
      const size = JSON.stringify(value).length * 2;
      if (epoch === generation && size <= 4 * 1024 * 1024) {
        if (cache.has(key)) {
          bytes -= cache.get(key).size;
          cache.delete(key);
        }
        while (cache.size >= 128 || bytes + size > 4 * 1024 * 1024) {
          const first = cache.keys().next().value;
          bytes -= cache.get(first).size;
          cache.delete(first);
        }
        cache.set(key, { value, size, at: now() });
        bytes += size;
      }
      return value;
    });
    pending.set(key, work);
    try {
      return await work;
    } finally {
      if (pending.get(key) === work) pending.delete(key);
    }
  }
  async function peek(query, variables, version = '1') {
    const key = JSON.stringify([endpoint, version, query, variables]);
    const old = cache.get(key);
    if (old && now() - old.at < 120000) return old.value;
    try {
      await clearing;
      return await storedRead(key);
    } catch {
      return null;
    }
  }
  return { read, invalidate, peek };
}
export const geoReader = createReader(GEO_ENDPOINT);
