import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const values = {};
for (const line of (await readFile(resolve(root, '.env'), 'utf8')).split(
  /\r?\n/,
)) {
  const m = line.match(
    /^\s*(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\s*=\s*(.*?)\s*$/,
  );
  if (m) values[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
}
if (
  !values.CLOUDFLARE_API_TOKEN ||
  !/^[a-f0-9]{32}$/.test(values.CLOUDFLARE_ACCOUNT_ID)
)
  throw Error('Missing deployment credentials');
async function api(path, method = 'GET', body) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${values.CLOUDFLARE_ACCOUNT_ID}/${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${values.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  const data = await r.json();
  if (!r.ok || !data.success)
    throw Error(
      `Cloudflare ${method} ${path.split('/')[0]} failed (${r.status})`,
    );
  return data.result;
}
// No subscription changes, upgrades, or arbitrary account-wide mutations.
const subdomain = await api('workers/subdomain');
const databases = await api('d1/database');
let db = databases.find((d) => d.name === 'geocompanion-metrics');
if (!db)
  db = await api('d1/database', 'POST', { name: 'geocompanion-metrics' });
await api(`d1/database/${db.uuid}/query`, 'POST', {
  sql: await readFile(
    resolve(root, 'services/coordination/schema.sql'),
    'utf8',
  ),
});
const configPath = resolve(root, 'services/coordination/wrangler.jsonc');
const config = JSON.parse(
  (await readFile(configPath, 'utf8')).replace(/,\s*([}\]])/g, '$1'),
);
config.d1_databases[0].database_id = db.uuid;
config.vars.ALLOWED_ORIGINS =
  'https://geocompanion.dpdns.org,https://geocompanion.pages.dev';
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
await new Promise((resolveRun, reject) => {
  const child = spawn(
    process.execPath,
    [
      resolve(root, 'node_modules/wrangler/bin/wrangler.js'),
      'deploy',
      '--config',
      configPath,
    ],
    {
      cwd: root,
      env: { ...process.env, ...values, WRANGLER_SEND_METRICS: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let out = '';
  child.stdout.on('data', (b) => (out += b));
  child.stderr.on('data', (b) => (out += b));
  child.on('error', () => reject(Error('Wrangler could not start')));
  child.on('close', (code) => {
    process.stdout.write(
      out.split(values.CLOUDFLARE_API_TOKEN).join('[REDACTED]'),
    );
    code === 0 ? resolveRun() : reject(Error('Deployment failed'));
  });
});
const endpoint = `https://${config.name}.${subdomain.subdomain}.workers.dev`;
let healthy = false;
for (let attempt = 0; attempt < 3; attempt++) {
  const health = await fetch(endpoint + '/health', {
    headers: { Origin: 'https://geocompanion.dpdns.org' },
  });
  if (health.ok) {
    healthy = true;
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
if (!healthy)
  throw Error('Worker deployed but health check failed; frontend unchanged');
await writeFile(
  resolve(root, 'public/coordination.json'),
  JSON.stringify({ endpoint }) + '\n',
);
const headersPath = resolve(root, 'public/_headers');
let headers = await readFile(headersPath, 'utf8');
if (!headers.includes(endpoint))
  headers = headers.replace(
    'connect-src',
    `connect-src ${endpoint} ${endpoint.replace('https:', 'wss:')}`,
  );
await writeFile(headersPath, headers);
console.log(
  'Verified coordination endpoint: ' +
    endpoint +
    '; rebuild and deploy Pages to enable it.',
);
