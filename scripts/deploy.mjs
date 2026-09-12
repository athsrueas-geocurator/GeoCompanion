import { readFile, readdir, lstat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const required = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
const values = {};
for (const line of (await readFile(join(root, '.env'), 'utf8')).split(
  /\r?\n/,
)) {
  const match = line.match(
    /^\s*(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\s*=\s*(.*?)\s*$/,
  );
  if (match) values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
}
if (required.some((k) => !values[k]))
  throw new Error('Cloudflare deployment credentials are missing.');
if (!/^[a-f0-9]{32}$/i.test(values.CLOUDFLARE_ACCOUNT_ID))
  throw new Error('Invalid Cloudflare account identifier.');
async function inspect(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if ((await lstat(path)).isSymbolicLink())
      throw new Error('Refusing to upload a symbolic link.');
    if (
      item.name.startsWith('.') ||
      /^(node_modules|functions|_worker\.js)$/i.test(item.name)
    )
      throw new Error('Unexpected file in static output.');
    if (item.isDirectory()) await inspect(path);
    else {
      const bytes = await readFile(path);
      if (
        bytes.includes(Buffer.from(values.CLOUDFLARE_API_TOKEN)) ||
        /-----BEGIN .*PRIVATE KEY-----|PK_SW\s*=|CLOUDFLARE_API_TOKEN\s*=/.test(
          bytes.toString('utf8'),
        )
      )
        throw new Error('Credential guard rejected the upload.');
    }
  }
}
await readFile(join(output, 'index.html'));
await inspect(output);
// Explicitly load only deployment credentials into the child. The app's root .env is never uploaded.
const child = spawn(
  process.execPath,
  [
    join(root, 'node_modules/wrangler/bin/wrangler.js'),
    'pages',
    'deploy',
    output,
    '--project-name=geocompanion',
    '--branch=main',
    '--commit-dirty=true',
  ],
  {
    cwd: output,
    env: { ...process.env, ...values, WRANGLER_SEND_METRICS: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
// Buffer output so a token split across chunks cannot bypass redaction.
let outputText = '';
child.stdout.on('data', (chunk) => (outputText += chunk));
child.stderr.on('data', (chunk) => (outputText += chunk));
child.on('close', (code) => {
  process.stdout.write(
    outputText.split(values.CLOUDFLARE_API_TOKEN).join('[REDACTED]'),
  );
  process.exitCode = code ?? 1;
});
child.on('error', () => {
  console.error('Deployment tool could not start.');
  process.exitCode = 1;
});
