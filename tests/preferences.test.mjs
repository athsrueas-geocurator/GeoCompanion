import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyPreferences,
  parseProfileId,
  addProfile,
  removeProfile,
  readPreferences,
  writePreferences,
  PREFERENCES_KEY,
  validatePreferences,
} from '../src/shared/preferences/preference-storage.mjs';
const a = 'a'.repeat(32),
  b = 'b'.repeat(32);

test('image loading defaults to automatic and migrates old preferences without losing follows', () => {
  const old = {
    version: 1,
    textSize: 'large',
    profiles: [a],
    defaultProfileId: a,
  };
  const migrated = validatePreferences(old);
  assert.equal(migrated.imageLoading, 'automatic');
  assert.deepEqual(migrated.profiles, [a]);
  assert.equal(migrated.textSize, 'large');
  let saved;
  writePreferences(
    {
      setItem: (_k, v) => {
        saved = v;
      },
    },
    { ...migrated, imageLoading: 'ask' },
  );
  assert.equal(
    readPreferences({ getItem: () => saved }).value.imageLoading,
    'ask',
  );
  assert.equal(emptyPreferences().imageLoading, 'automatic');
  assert.throws(() => validatePreferences({ ...old, imageLoading: 'invalid' }));
});
test('identity input rejects lookalike domains and content links', () => {
  assert.equal(parseProfileId(`https://www.geobrowser.io/space/${a}`), a);
  assert.equal(parseProfileId(a.toUpperCase()), a);
  for (const url of [
    `https://www.geobrowser.io.evil.test/space/${a}`,
    `https://www.geobrowser.io/space/${a}/${b}`,
    'javascript:alert(1)',
  ])
    assert.throws(() => parseProfileId(url));
});
test('save only IDs, deduplicate and clear removed default', () => {
  let p = addProfile(emptyPreferences(), a);
  p = addProfile(p, b);
  assert.throws(() => addProfile(p, a));
  assert.deepEqual(p.profiles, [a, b]);
  assert.equal(removeProfile(p, a).defaultProfileId, null);
  let raw;
  assert.equal(
    writePreferences(
      {
        setItem: (k, v) => {
          assert.equal(k, PREFERENCES_KEY);
          raw = v;
        },
      },
      p,
    ),
    '',
  );
  assert.deepEqual(readPreferences({ getItem: () => raw }).value, p);
  assert.equal(raw.includes('name'), false);
});
test('corrupt and unavailable storage surface errors without crashing', () => {
  assert.ok(readPreferences({ getItem: () => '{bad' }).error);
  assert.ok(
    readPreferences({
      getItem: () => {
        throw Error();
      },
    }).error,
  );
  assert.ok(
    writePreferences(
      {
        setItem: () => {
          throw Error();
        },
      },
      emptyPreferences(),
    ),
  );
});
