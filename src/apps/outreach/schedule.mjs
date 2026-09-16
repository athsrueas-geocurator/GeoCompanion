const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
// Deliberately narrow: unsupported rules remain unavailable, never approximated.
export function weeklyHours(raw) {
  if (typeof raw !== 'string') return null;
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length !== 3) return null;
  const start =
    /^DTSTART;TZID=America\/Indiana\/Indianapolis:(\d{8})T([0-2]\d)([0-5]\d)00$/.exec(
      lines[0],
    );
  const end =
    /^DTEND;TZID=America\/Indiana\/Indianapolis:(\d{8})T([0-2]\d)([0-5]\d)00$/.exec(
      lines[1],
    );
  const rule =
    /^RRULE:FREQ=WEEKLY;BYDAY=((?:MO|TU|WE|TH|FR|SA|SU)(?:,(?:MO|TU|WE|TH|FR|SA|SU))*)$/.exec(
      lines[2],
    );
  if (
    !start ||
    !end ||
    !rule ||
    start[1] !== end[1] ||
    +start[2] > 23 ||
    +end[2] > 23
  )
    return null;
  const iso = `${start[1].slice(0, 4)}-${start[1].slice(4, 6)}-${start[1].slice(6, 8)}`;
  const date = new Date(iso + 'T12:00:00Z');
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== iso
  )
    return null;
  const from = +start[2] * 60 + +start[3],
    to = +end[2] * 60 + +end[3];
  if (to <= from) return null;
  const days = [
    ...new Set(rule[1].split(',').map((x) => DAYS.indexOf(x))),
  ].sort((a, b) => a - b);
  if (!days.includes((date.getUTCDay() + 6) % 7)) return null;
  const format = (n) =>
    `${Math.floor(n / 60) % 12 || 12}:${String(n % 60).padStart(2, '0')} ${n < 720 ? 'AM' : 'PM'}`;
  return {
    days,
    from,
    to,
    startDate: iso,
    label: `${format(from)}–${format(to)}`,
  };
}
