import { argumentReader, SPACE } from './argument-data.mjs';
export async function discoverSignals(pages = 4, reader = argumentReader) {
  let after = null;
  const rows = new Map(),
    seen = new Set();
  for (let i = 0; i < pages; i++) {
    const page = await reader.discover(after);
    for (const r of page.rows)
      rows.set(r.id, {
        id: r.id,
        name: r.name,
        description: r.description,
        spaces: [SPACE],
        sources: [],
        sourceLimit: false,
      });
    after = page.next;
    if (!after) break;
    if (seen.has(after)) throw Error('Claim discovery did not advance.');
    seen.add(after);
  }
  return { claims: [...rows.values()], limited: !!after };
}
