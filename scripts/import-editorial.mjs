throw new Error(
  'Static editorial publication is retired. Publish only user-selected wording on their Geo profile.',
);
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validEditorial } from '../src/apps/education/debates.mjs';
const input = process.argv[2];
if (!input) throw new Error('Supply the exported editorial JSON file path.');
const raw = await readFile(input, 'utf8');
if (raw.length > 50000) throw new Error('Editorial file is too large.');
let data;
try {
  data = JSON.parse(raw);
} catch {
  throw new Error('Editorial file is not valid JSON.');
}
if (!validEditorial(data))
  throw new Error('Editorial file contains invalid fields.');
const clean = {
  title: data.title,
  intro: data.intro,
  picks: data.picks.map(({ id, note }) => ({ id, note })),
};
await writeFile(
  fileURLToPath(new URL('../public/data/editorial.json', import.meta.url)),
  JSON.stringify(clean, null, 2) + '\n',
);
console.log(
  'Editorial selection imported locally. Build and deploy to publish it.',
);
