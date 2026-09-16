export function filterGraph(
  graph,
  {
    search = '',
    relation = '',
    focus = '',
    neighborhood = true,
    limit = 80,
  } = {},
) {
  let edges = graph.edges.filter((e) => !relation || e.type === relation);
  let nodes = graph.nodes;
  if (focus && neighborhood) {
    const ids = new Set([focus]);
    for (const e of edges)
      if (e.source === focus || e.target === focus) {
        ids.add(e.source);
        ids.add(e.target);
      }
    nodes = nodes.filter((n) => ids.has(n.id));
  }
  if (search.trim()) {
    const ids = new Set(
      nodes
        .filter((n) =>
          n.label.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .map((n) => n.id),
    );
    nodes = nodes.filter((n) => ids.has(n.id));
  }
  const total = nodes.length;
  // Keep connected neighborhoods together instead of arbitrary API insertion order.
  const allowed = new Set(nodes.map((n) => n.id)),
    adjacent = new Map();
  for (const e of edges)
    if (allowed.has(e.source) && allowed.has(e.target)) {
      for (const [a, b] of [
        [e.source, e.target],
        [e.target, e.source],
      ]) {
        if (!adjacent.has(a)) adjacent.set(a, new Set());
        adjacent.get(a).add(b);
      }
    }
  const seeds = [...nodes].sort(
    (a, b) =>
      (adjacent.get(b.id)?.size || 0) - (adjacent.get(a.id)?.size || 0) ||
      a.id.localeCompare(b.id),
  );
  if (allowed.has(focus)) seeds.unshift(nodes.find((n) => n.id === focus));
  const ordered = [],
    seen = new Set(),
    byId = new Map(nodes.map((n) => [n.id, n]));
  const cap = [80, 250, 500, 1000].includes(Number(limit)) ? Number(limit) : 80;
  for (const seed of seeds) {
    const queue = [seed.id];
    for (let i = 0; i < queue.length && ordered.length < cap; i++) {
      const id = queue[i];
      if (seen.has(id)) continue;
      seen.add(id);
      ordered.push(byId.get(id));
      for (const n of adjacent.get(id) || []) if (!seen.has(n)) queue.push(n);
    }
    if (ordered.length >= cap) break;
  }
  nodes = ordered;
  const ids = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  return {
    nodes,
    edges,
    partial: !!graph.partial || total > nodes.length,
    scope: graph.scope,
  };
}
const cell = (value) => {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
export function exportGraph(graph, format, filters = {}) {
  // Export semantic data only; never simulation objects, private preferences or inferred edges.
  const nodes = graph.nodes.map(
    ({ id, label, space, labelSource, labelEntityId }) => ({
      id,
      label,
      space,
      labelSource,
      labelEntityId,
    }),
  );
  const edges = graph.edges.map(
    ({ id, source, target, label, type, space }) => ({
      id,
      source,
      target,
      label,
      type,
      space,
    }),
  );
  if (format === 'csv')
    return [
      [
        'relation_id',
        'source_id',
        'source_label',
        'relationship',
        'target_id',
        'target_label',
        'space_id',
        'partial',
      ],
      ...edges.map((e) => [
        e.id,
        e.source,
        nodes.find((n) => n.id === e.source)?.label,
        e.label,
        e.target,
        nodes.find((n) => n.id === e.target)?.label,
        e.space,
        !!graph.partial,
      ]),
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n');
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      scope: graph.scope,
      partial: !!graph.partial,
      filters,
      nodes,
      edges,
    },
    null,
    2,
  );
}
