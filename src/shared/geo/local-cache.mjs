// Opt-in persistent cache of validated reader results. Never caches failed reads.
export const CACHE_SETTING = 'geocompanion.cache-enabled';
// Freshness interval only; saved records are never deleted because of age.
export const TTL = 30 * 60 * 1000;
const MAX_BYTES = 16 * 1024 * 1024;
let epoch = 0;
export function cacheEnabled() {
  try {
    return localStorage.getItem(CACHE_SETTING) === 'true';
  } catch {
    return false;
  }
}
function database() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('geocompanion-public-reads', 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore('reads', { keyPath: 'key' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(Error('Local cache is blocked by another tab.'));
  });
}
async function transact(mode, action) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('reads', mode);
      const request = action(tx.objectStore('reads'));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function clearLocalCache() {
  epoch++;
  await transact('readwrite', (s) => s.clear());
}
export async function storedRead(key, minAt = 0) {
  if (!cacheEnabled()) return null;
  const row = await transact('readonly', (s) => s.get(key));
  return row &&
    Date.now() - row.at < TTL &&
    row.at <= Date.now() &&
    row.at >= minAt
    ? row.value
    : null;
}
// Serialize maintenance to enforce the total storage budget across simultaneous readers.
let writes = Promise.resolve();
export function storeRead(key, value, at = Date.now()) {
  const generation = epoch;
  const work = writes
    .catch(() => {})
    .then(async () => {
      if (!cacheEnabled() || generation !== epoch) return;
      const size = JSON.stringify(value).length * 2 + key.length * 2;
      if (size > MAX_BYTES)
        throw Error('This record exceeds the local cache limit.');
      const all = await transact('readonly', (s) => s.getAll());
      const total =
        all.filter((r) => r.key !== key).reduce((n, r) => n + r.size, 0) + size;
      if (total > MAX_BYTES)
        throw Error('Local cache is full. Clear saved cache to make room.');
      if (!cacheEnabled() || generation !== epoch) return;
      await transact('readwrite', (s) => {
        return s.put({ key, value, size, at });
      });
    });
  writes = work;
  return work;
}
