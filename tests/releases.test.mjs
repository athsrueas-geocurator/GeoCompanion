import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseReleases,
  hasNewRelease,
} from '../src/shared/preferences/releases.mjs';
const release = (id, date) => ({
  id,
  version: '0.2.0',
  deployedAt: date,
  title: 'Features',
  changes: ['An improvement'],
});
const old = release(
    '11111111-1111-1111-1111-111111111111',
    '2026-09-11T12:00:00Z',
  ),
  latest = release(
    '22222222-2222-2222-2222-222222222222',
    '2026-09-12T12:00:00Z',
  );
test('release dates order history and unread status without badges on a first visit or rollback', () => {
  assert.deepEqual(parseReleases([old, latest]), [latest, old]);
  assert.equal(hasNewRelease(latest, null), false);
  assert.equal(hasNewRelease(latest, old), true);
  assert.equal(hasNewRelease(latest, latest), false);
  assert.equal(hasNewRelease(old, latest), false);
});
test('malformed release history is not treated as new content', () => {
  assert.throws(() => parseReleases([old, old]));
  assert.throws(() => parseReleases([{ ...old, deployedAt: 'invalid' }]));
  assert.throws(() => parseReleases([{ ...old, changes: [{}] }]));
});
