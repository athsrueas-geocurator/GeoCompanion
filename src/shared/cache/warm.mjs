import { createJob } from './job.mjs';

import { observeReads } from '../geo/client.mjs';

export async function prepareJob(onChange) {
  const job = createJob(onChange);

  job.add(
    'education',
    'Education: dataset catalog',
    async ({ add, discover }) => {
      const api = await import('../../apps/education/dataset-data.mjs');

      const { blockKind } = await import(
        '../../apps/education/block-capabilities.mjs'
      );

      const catalog = await api.datasetCatalog();
      discover(catalog.rows.map((r) => r.id));

      for (const row of catalog.rows)
        if (!row.unavailable)
          add(
            `dataset:${row.id}`,
            `Education: ${row.name}`,
            async ({ add, discover }) => {
              const blocks = await api.datasetBlocks(row.id);
              discover(blocks.map((b) => b.id));

              for (const b of blocks)
                if (blockKind(b) === 'collection')
                  add(
                    `results:${b.id}`,
                    `Results: ${row.name}`,
                    async ({ discover, log }) => {
                      const result = await api.resultPage(b.id);
                      discover(result.rows.map((r) => r.id));

                      if (result.page.next)
                        log(
                          `More results remain for ${row.name}; open its dashboard to continue.`,
                        );
                    },
                  );
            },
          );
    },
  );

  job.add(
    'outreach',
    'Indianapolis outreach: directory and locations',
    async () => {
      const { loadDirectory } = await import(
        '../../apps/outreach/outreach-data.mjs'
      );
      await loadDirectory();
    },
  );

  job.add('questions', 'Education: questions', async () => {
    const { loadQuestions } = await import(
      '../../apps/education/question-data.mjs'
    );
    await loadQuestions();
  });

  job.add('graphs', 'People and debates: discover spaces', async ({ add }) => {
    const { loadFeaturedSpaces } = await import('../geo/featured-spaces.mjs');

    const { APPS } = await import('../../app/apps.mjs');

    const spaces = [
      ...new Set([
        ...APPS.map((a) => a.defaultSpace),
        ...(await loadFeaturedSpaces()).map((s) => s.id),
      ]),
    ];

    const { readGraph } = await import('../../apps/graphs/graph-data.mjs');

    for (const space of spaces)
      for (const mode of ['people', 'research-debates', 'all']) {
        const seen = new Set();

        function page(after = null, index = 0) {
          add(
            `graph:${space}:${mode}:${index}`,
            `Graph: ${mode} · page ${index + 1}`,
            async ({ discover, log }) => {
              const g = await readGraph(space, mode, after);
              discover(g.nodes.map((n) => n.id));

              if (g.next) {
                if (seen.has(g.next)) throw Error('Repeated graph cursor');
                seen.add(g.next);
                if (index < 3) page(g.next, index + 1);
                else log('More graph pages available through Load more.');
              }
            },
          );
        }
        page();
      }
  });

  const start = job.start;

  job.start = async () => {
    const unsub = observeReads((e) =>
      job.log(`${e.status}: ${e.name}`, e.query),
    );
    try {
      await start();
    } finally {
      unsub();
    }
  };

  return job;
}
