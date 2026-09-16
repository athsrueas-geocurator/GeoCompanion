import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import type { GraphData } from './types';
function Card({ data }: any) {
  return (
    <div className="graph-card">
      <Handle type="target" position={Position.Left} />
      <span className="graph-card-mark" aria-hidden="true">
        ◇
      </span>
      <span>{data.label}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { card: Card };
export default function FlowView({
  graph,
  onSelect,
}: {
  graph: GraphData;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => {
    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: 'LR', ranksep: 110, nodesep: 30 });
    g.setDefaultEdgeLabel(() => ({}));
    graph.nodes.forEach((n) => g.setNode(n.id, { width: 270, height: 120 }));
    graph.edges.forEach((e) => g.setEdge(e.source, e.target, {}, e.id));
    dagre.layout(g);
    return {
      nodes: graph.nodes.map((n) => ({
        id: n.id,
        type: 'card',
        position: { x: g.node(n.id).x - 135, y: g.node(n.id).y - 60 },
        data: { label: n.label },
        ariaLabel: n.label,
      })),
      edges: graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'smoothstep',
        style: {
          stroke:
            e.type === '4e6ec5d14292498a84e5f607ca1a08ce'
              ? 'var(--graph-opposes)'
              : 'var(--graph-line)',
          strokeDasharray:
            e.type === '4e6ec5d14292498a84e5f607ca1a08ce' ? '6 4' : undefined,
        },
        labelStyle: { fill: 'var(--text)' },
        labelBgStyle: { fill: 'var(--surface)' },
      })),
    };
  }, [graph]);
  return (
    <div className="graph-flow">
      <ReactFlow
        key={graph.nodes.map((n) => n.id).join(',')}
        nodes={layout.nodes}
        edges={layout.edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.12}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        deleteKeyCode={null}
        onNodeClick={(_, n) => onSelect(n.id)}
        onNodeDoubleClick={(_, n) => onSelect(n.id)}
        onSelectionChange={({ nodes }) => {
          if (nodes[0]) onSelect(nodes[0].id);
        }}
        colorMode="system"
        ariaLabelConfig={{
          'node.a11yDescription.default':
            'Press Enter to select. Use the relationship list to explore connections.',
        }}
      >
        <Background color="var(--line)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
