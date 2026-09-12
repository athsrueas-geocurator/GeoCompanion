import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, educationTabs, outreachTabs } from '../src/app/routes.mjs';
test('root selects apps and legacy education links remain valid', () => {
  assert.equal(parseRoute('').app, 'home');
  assert.equal(parseRoute('#/').app, 'home');
  for (const tab of educationTabs)
    assert.deepEqual(parseRoute(`#${tab}`), { app: 'education', tab });
});
test('routes keep app views separate and reject unknown views', () => {
  for (const tab of educationTabs)
    assert.deepEqual(parseRoute(`#/education/${tab}`), {
      app: 'education',
      tab,
    });
  for (const tab of outreachTabs)
    assert.deepEqual(parseRoute(`#/outreach/${tab}`), { app: 'outreach', tab });
  for (const hash of [
    '#/outreach/curation',
    '#/education/food',
    '#/other',
    '#/outreach/food/extra',
  ])
    assert.equal(parseRoute(hash).app, 'missing');
});
