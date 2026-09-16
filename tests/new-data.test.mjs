import test from 'node:test';
import assert from 'node:assert/strict';
import { weeklyHours } from '../src/apps/outreach/schedule.mjs';
import { reportedEstimates } from '../src/apps/education/observation-adapters.mjs';
import { F } from '../src/apps/education/dataset-data.mjs';
const schedule =
  'DTSTART;TZID=America/Indiana/Indianapolis:20260914T093000\nDTEND;TZID=America/Indiana/Indianapolis:20260914T160000\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR';
test('published hours preserve days, local time and start date', () => {
  assert.deepEqual(weeklyHours(schedule), {
    days: [0, 2, 4],
    from: 570,
    to: 960,
    startDate: '2026-09-14',
    label: '9:30 AM–4:00 PM',
  });
});
test('unsupported or invalid recurrence is never approximated', () => {
  for (const s of [
    null,
    schedule + '\nEXDATE:20260914',
    schedule.replace('160000', '080000'),
    schedule.replace('BYDAY=MO,WE,FR', 'BYDAY=TU'),
    schedule.replaceAll('20260914', '20260230'),
    schedule.replace('FREQ=WEEKLY', 'FREQ=MONTHLY'),
  ])
    assert.equal(weeklyHours(s), null);
});
test('individual estimates retain estimand without inventing measure or uncertainty', () => {
  const row = {
    id: 'a',
    name: 'Published finding',
    fields: [
      { id: F.effect, value: '0', numeric: true },
      { id: F.unit, value: 'score points' },
      { id: F.estimand, value: 'ITT' },
    ],
    relations: [],
  };
  assert.equal(reportedEstimates([row])[0].value, 0);
  assert.equal(reportedEstimates([row])[0].estimand, 'ITT');
  assert.equal(reportedEstimates([row])[0].p, null);
  assert.deepEqual(reportedEstimates([{ ...row, unavailable: true }]), []);
  assert.deepEqual(
    reportedEstimates([
      { ...row, fields: row.fields.map((f) => ({ ...f, numeric: false })) },
    ]),
    [],
  );
});
