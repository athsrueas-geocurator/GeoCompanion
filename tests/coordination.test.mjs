import test from 'node:test';
import assert from 'node:assert/strict';
import { selection, events } from '../src/shared/coordination/protocol.mjs';
import { parseRoute } from '../src/app/routes.mjs';
test('selection allows only app routes and public Geo identifiers', () => {
  assert.equal(selection({ route: 'https://evil.example' }), null);
  assert.equal(
    selection({ route: 'education/map', entity: 'bad', space: 'a'.repeat(32) }),
    null,
  );
  assert.deepEqual(
    selection({
      route: 'education/map',
      entity: 'b'.repeat(32),
      space: 'a'.repeat(32),
      search: 'private',
    }),
    { route: 'education/map', entity: 'b'.repeat(32), space: 'a'.repeat(32) },
  );
});
test('telemetry strips identifiers and rejects unbounded or arbitrary events', () => {
  assert.deepEqual(
    events([
      {
        route: 'education/map',
        action: 'select',
        entity: 'private',
        query: 'private',
      },
    ]),
    [{ route: 'education/map', action: 'select' }],
  );
  assert.equal(
    events(Array(21).fill({ route: 'education/map', action: 'view' })),
    null,
  );
  assert.equal(
    events([{ route: 'education/map', action: 'private search' }]),
    null,
  );
});
test('invitation and entity parameters preserve route matching', () => {
  assert.deepEqual(parseRoute('#/education/map?room=' + 'a'.repeat(32)), {
    app: 'education',
    tab: 'map',
  });
  assert.deepEqual(parseRoute('#/outreach/map?entity=' + 'b'.repeat(32)), {
    app: 'outreach',
    tab: 'map',
  });
});
