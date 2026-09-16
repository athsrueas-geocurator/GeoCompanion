export function filterGraph(
  graph,
  { search = '', relation = '', focus = '', neighborhood = true } = {},
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
  nodes = nodes.slice(0, 80);
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
  const nodes = graph.nodes.map(({ id, label, space }) => ({
    id,
    label,
    space,
  }));
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
