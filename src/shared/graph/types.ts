export type GraphNode = {
  id: string;
  label: string;
  space: string;
  labelSource?: string;
  labelEntityId?: string;
  geoUrl?: string;
};
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  space: string;
};
export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  partial: boolean;
  scope: string;
};
