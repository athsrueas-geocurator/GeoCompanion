import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dominantSpace,
  graphContributions,
} from '../src/shared/branding/app-space.mjs';
import { APPS } from '../src/app/apps.mjs';
const a = 'a'.repeat(32),
  b = 'b'.repeat(32),
  x = '1'.repeat(32),
  y = '2'.repeat(32);
test('dominance counts distinct IDs per asserting space, with deterministic ties and no name merging', () => {
  assert.equal(
    dominantSpace(
      [
        { space: b, id: x },
        { space: b, id: x },
        { space: a, id: x },
      ],
      b,
    ),
    a,
  );
  assert.equal(
    dominantSpace(
      [
        { space: b, id: x },
        { space: b, id: y },
        { space: a, id: x },
      ],
      a,
    ),
    b,
  );
  assert.equal(dominantSpace([{ space: 'invalid', id: x }], a), a);
  assert.equal(
    dominantSpace(
      graphContributions({
        edges: [
          { space: b, source: x, target: y },
          { space: a, source: x, target: x },
        ],
      }),
      a,
    ),
    b,
  );
});
test('every registered app supplies a valid starting data space', () => {
  assert.equal(new Set(APPS.map((a) => a.key)).size, APPS.length);
  for (const app of APPS) assert.match(app.defaultSpace, /^[a-f0-9]{32}$/);
});
