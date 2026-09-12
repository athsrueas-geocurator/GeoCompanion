import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(
  new URL('../src/app/theme.css', import.meta.url),
  'utf8',
);
const tokens = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
const light = tokens(css.split('@media')[0]);
const dark = {
  ...light,
  ...tokens(
    css.split('@media (prefers-color-scheme: dark)')[1].split('html {')[0],
  ),
};
function luminance(hex) {
  return hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
for (const [name, palette] of Object.entries({ light, dark })) {
  test(`${name} theme text, focus, controls and chart palette contrast`, () => {
    const check = (foreground, background, minimum) =>
      assert.ok(
        contrast(palette[foreground], palette[background]) >= minimum,
        `${name}: ${foreground} on ${background} must reach ${minimum}:1`,
      );
    for (const surface of ['page', 'surface', 'surface-soft']) {
      for (const text of ['text', 'muted', 'accent', 'blue'])
        check(text, surface, 4.5);
      for (const mark of ['focus', 'control-border']) check(mark, surface, 3);
    }
    for (const mark of ['chart-primary', 'chart-secondary', 'chart-axis'])
      check(mark, 'surface', 3);
    check('warning-text', 'warning-bg', 4.5);
    check('on-strong', 'strong', 4.5);
  });
}
