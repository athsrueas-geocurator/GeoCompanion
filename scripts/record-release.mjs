import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReleases } from '../src/shared/preferences/releases.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prefix = process.argv[2];
if (!/^[a-f0-9]{8}(?:-[a-f0-9-]{27})?$/.test(prefix || ''))
  throw Error(
    'Pass the completed Cloudflare deployment ID or its eight-character prefix.',
  );
const env = await readFile(resolve(root, '.env'), 'utf8');
const values = {};
for (const line of env.split(/\r?\n/)) {
  const m = line.match(
    /^\s*(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\s*=\s*(.*?)\s*$/,
  );
  if (m) values[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
}
if (
  !values.CLOUDFLARE_API_TOKEN ||
  !/^[a-f0-9]{32}$/i.test(values.CLOUDFLARE_ACCOUNT_ID || '')
)
  throw Error('Deployment credentials unavailable.');
const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${values.CLOUDFLARE_ACCOUNT_ID}/pages/projects/geocompanion/deployments?per_page=100`,
  {
    headers: { Authorization: `Bearer ${values.CLOUDFLARE_API_TOKEN}` },
    signal: AbortSignal.timeout(25000),
  },
);
if (!response.ok) throw Error('Could not read Cloudflare deployment history.');
const payload = await response.json();
if (!payload.success || !Array.isArray(payload.result))
  throw Error('Invalid deployment history.');
const matches = payload.result.filter((d) => d.id.startsWith(prefix));
if (matches.length !== 1) throw Error('Deployment ID is missing or ambiguous.');
const d = matches[0];
if (
  d.environment !== 'production' ||
  d.latest_stage?.name !== 'deploy' ||
  d.latest_stage?.status !== 'success' ||
  !d.latest_stage.ended_on
)
  throw Error('Deployment has not completed successfully in production.');
const { version } = JSON.parse(
  await readFile(resolve(root, 'package.json'), 'utf8'),
);
const notes = JSON.parse(
  await readFile(resolve(root, 'release-notes.json'), 'utf8'),
);
const path = resolve(root, 'public/releases.json');
const existing = parseReleases(JSON.parse(await readFile(path, 'utf8')));
if (existing.some((r) => r.id === d.id)) {
  process.stdout.write('Deployment already recorded.\n');
  process.exit(0);
}
// A metadata-only upload must not shift the original feature-release time.
if (existing.some((r) => r.version === version))
  throw Error(
    'This version already has a release record. Bump the version for new features.',
  );
const entry = {
  id: d.id,
  version,
  deployedAt: d.latest_stage.ended_on,
  title: notes.title,
  changes: notes.changes,
};
const all = parseReleases([entry, ...existing]);
await writeFile(path, JSON.stringify(all, null, 2) + '\n');
process.stdout.write(
  `Recorded ${version} at ${entry.deployedAt}. Publish the updated release metadata.\n`,
);
