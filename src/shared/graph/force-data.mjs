import { geoReader } from '../geo/client.mjs';
import { iconUrl } from '../branding/space-icons.mjs';
// force-graph mutates node positions and replaces link endpoint IDs with objects.
// Keep that mutable representation separate from canonical data and exports.
export function toForceData(graph, previous = []) {
  const ids = new Set(graph.nodes.map((n) => n.id));
  if (
    ids.size !== graph.nodes.length ||
    graph.edges.some((e) => !ids.has(e.source) || !ids.has(e.target))
  )
    throw Error('The graph has duplicate or unresolved nodes.');
  const positions = new Map(previous.map((n) => [n.id, n]));
  return {
    nodes: graph.nodes.map((n) => {
      const old = positions.get(n.id);
      return {
        ...n,
        ...(old ? { x: old.x, y: old.y, fx: old.fx, fy: old.fy } : {}),
      };
    }),
    links: graph.edges.map((e) => ({ ...e })),
  };
}
export function neighborhood(graph, id) {
  const nodes = new Set(id ? [id] : []),
    edges = new Set();
  if (id)
    for (const e of graph.edges)
      if (e.source === id || e.target === id) {
        nodes.add(e.source);
        nodes.add(e.target);
        edges.add(e.id);
      }
  return { nodes, edges, center: id };
}
export const NODE_IMAGES = `query NodeImages($ids:[UUID!]!){entities(filter:{id:{in:$ids}}){id relations(first:10,filter:{typeId:{is:"1155befffad549b7a2e0da4777b8792c"}}){nodes{spaceId toEntity{values(first:10,filter:{propertyId:{is:"8a743832c0944a62b6650c3cc2f9c7bc"}}){nodes{spaceId text}pageInfo{hasNextPage}}}}pageInfo{hasNextPage}}}}`;
export function parseNodeImages(data, ids, scope) {
  if (!Array.isArray(data?.entities)) throw Error('Node images unavailable.');
  const out = {};
  for (const n of data.entities) {
    if (!ids.includes(n.id)) throw Error('Unexpected image identity.');
    const r = n.relations;
    if (!Array.isArray(r?.nodes) || r.pageInfo?.hasNextPage) continue;
    const candidates = [];
    for (const rel of r.nodes) {
      const v = rel.toEntity?.values;
      if (!Array.isArray(v?.nodes) || v.pageInfo?.hasNextPage) continue;
      const urls = [
        ...new Set(
          v.nodes
            .filter((x) => x.spaceId === rel.spaceId)
            .map((x) => iconUrl(x.text))
            .filter(Boolean),
        ),
      ];
      if (urls.length === 1)
        candidates.push({ space: rel.spaceId, url: urls[0] });
    }
    const preferred = candidates.filter((x) => x.space === scope);
    const urls = [
      ...new Set((preferred.length ? preferred : candidates).map((x) => x.url)),
    ];
    if (urls.length === 1) out[n.id] = urls[0];
  }
  return out;
}
export async function loadNodeImages(graph) {
  const out = {};
  for (
    let offset = 0;
    offset < Math.min(graph.nodes.length, 80);
    offset += 20
  ) {
    const ids = graph.nodes.slice(offset, offset + 20).map((n) => n.id);
    Object.assign(
      out,
      await geoReader.read(
        NODE_IMAGES,
        { ids },
        (d) => parseNodeImages(d, ids, graph.scope),
        `node-images-1:${graph.scope}`,
      ),
    );
  }
  return out;
}
