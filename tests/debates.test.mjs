import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeVotes,
  summarizeVotes,
  normalizeClaims,
  isEducationTitle,
  validEditorial,
} from '../src/apps/education/debates.mjs';
test('distinct vote kinds and missing tallies stay distinct', () => {
  const rows = normalizeVotes({
    data: {
      votesCounts: [
        {
          objectId: 'a',
          spaceId: 's',
          voteKind: 0,
          positive: '2',
          negative: '1',
        },
        {
          objectId: 'a',
          spaceId: 's',
          voteKind: 1,
          positive: '3',
          negative: '0',
        },
      ],
    },
  });
  assert.deepEqual(summarizeVotes(rows, 'a', 0), { positive: 2, negative: 1 });
  assert.deepEqual(summarizeVotes(rows, 'a', 1), { positive: 3, negative: 0 });
  assert.equal(summarizeVotes(rows, 'a', 2), null);
  assert.throws(() =>
    normalizeVotes({
      data: {
        votesCounts: [
          {
            objectId: 'a',
            spaceId: 's',
            voteKind: 0,
            positive: null,
            negative: 0,
          },
        ],
      },
    }),
  );
});
test('tag links deduplicate entities without losing contributing spaces', () => {
  const fromEntity = {
    id: 'a',
    name: 'Schools should test AI tools',
    description: null,
    relationsList: [],
  };
  const rows = normalizeClaims({
    data: {
      relations: [
        { spaceId: 'one', fromEntity },
        { spaceId: 'two', fromEntity },
      ],
    },
  });
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].spaces, ['one', 'two']);
  assert.equal(isEducationTitle('Abolish the Electoral College'), false);
});
test('editorial content is bounded and cannot insert duplicate picks', () => {
  const pick = { id: 'a'.repeat(32), note: 'My perspective' };
  assert.ok(
    validEditorial({ title: 'Reading list', intro: '', picks: [pick] }),
  );
  assert.ok(
    !validEditorial({ title: 'Reading list', intro: '', picks: [pick, pick] }),
  );
  assert.ok(
    !validEditorial({
      title: 'x',
      intro: '',
      picks: [{ id: 'javascript:alert(1)', note: '' }],
    }),
  );
});
