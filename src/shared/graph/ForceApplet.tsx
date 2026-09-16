import { useEffect, useRef, useState } from 'react';
import ForceGraph from 'force-graph';
import type { GraphData } from './types';
export default function ForceApplet({
  graph,
  onSelect,
}: {
  graph: GraphData;
  onSelect: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<ForceGraph<any, any> | null>(null);
  const [paused, setPaused] = useState(false),
    [labels, setLabels] = useState(true),
    [spacing, setSpacing] = useState(90),
    [error, setError] = useState('');
  const selected = useRef(onSelect);
  selected.current = onSelect;
  const flags = useRef({ labels, paused });
  flags.current = { labels, paused };
  const positions = useRef<any[]>([]);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    let fg: ForceGraph<any, any>;
    try {
      const styles = getComputedStyle(el),
        text = styles.getPropertyValue('--text').trim(),
        accent = styles.getPropertyValue('--accent').trim(),
        line = styles.getPropertyValue('--graph-line').trim();
      fg = new ForceGraph(el)
        .height(480)
        .width(el.clientWidth)
        .backgroundColor(styles.getPropertyValue('--surface').trim())
        .autoPauseRedraw(true)
        .cooldownTicks(120)
        .cooldownTime(4500)
        .nodeId('id')
        .nodeLabel(() => '')
        .linkLabel(() => '')
        .nodeVal(5)
        .nodeColor(() => accent)
        .linkColor(() => line)
        .linkDirectionalArrowLength(5)
        .linkDirectionalArrowRelPos(1)
        .onNodeClick((n) => selected.current(String(n.id)))
        .onNodeDragEnd((n) => {
          n.fx = n.x;
          n.fy = n.y;
        });
      fg.nodeCanvasObjectMode(() => 'after').nodeCanvasObject(
        (n, ctx, scale) => {
          if (!flags.current.labels) return;
          const label =
            n.label.length > 46 ? n.label.slice(0, 43) + '…' : n.label;
          const size = 12 / scale;
          ctx.font = `${size}px system-ui`;
          ctx.fillStyle = text;
          ctx.textAlign = 'center';
          ctx.fillText(label, n.x, n.y + 8 + size);
        },
      );
      const previous = positions.current;
      fg.graphData({
        nodes: graph.nodes.map((n) => {
          const old = previous.find((p) => p.id === n.id);
          return {
            ...n,
            ...(old ? { x: old.x, y: old.y, fx: old.fx, fy: old.fy } : {}),
          };
        }),
        links: graph.edges.map((e) => ({ ...e })),
      });
      fg.d3Force('link')?.distance(spacing);
      engine.current = fg;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        fg.warmupTicks(120).cooldownTicks(0);
      }
      const timer = setTimeout(() => fg.zoomToFit(0, 40), 500);
      const size = new ResizeObserver(() =>
        fg.width(el.clientWidth).height(el.clientHeight || 480),
      );
      size.observe(el);
      const visibility = () => {
        if (document.hidden) fg.pauseAnimation();
        else if (!flags.current.paused) fg.resumeAnimation();
      };
      document.addEventListener('visibilitychange', visibility);
      setPaused(false);
      return () => {
        clearTimeout(timer);
        size.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        positions.current = fg.graphData().nodes.map((n) => ({ ...n }));
        fg._destructor();
        engine.current = null;
      };
    } catch {
      setError(
        'The interactive graph could not start. Use the relationship list.',
      );
    }
  }, [graph]);
  useEffect(() => {
    engine.current?.nodeCanvasObjectMode(() => 'after');
  }, [labels]);
  useEffect(() => {
    engine.current?.d3Force('link')?.distance(spacing);
    engine.current?.d3ReheatSimulation();
  }, [spacing]);
  function png() {
    const canvas = host.current?.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = 'geo-network.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  return (
    <>
      <div className="graph-tools">
        <button onClick={() => engine.current?.zoomToFit(0, 35)}>
          Fit network
        </button>
        <button
          aria-pressed={paused}
          onClick={() => {
            if (paused) engine.current?.resumeAnimation();
            else engine.current?.pauseAnimation();
            setPaused(!paused);
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => {
            engine.current?.resumeAnimation().d3ReheatSimulation();
            setPaused(false);
          }}
        >
          Reheat layout
        </button>
        <button
          onClick={() => {
            engine.current?.graphData().nodes.forEach((n) => {
              n.fx = undefined;
              n.fy = undefined;
            });
            engine.current?.resumeAnimation().d3ReheatSimulation();
            setPaused(false);
          }}
        >
          Release pins
        </button>
        <label>
          <input
            type="checkbox"
            checked={labels}
            onChange={(e) => setLabels(e.target.checked)}
          />{' '}
          Labels
        </label>
        <label>
          Spacing{' '}
          <input
            type="range"
            min="40"
            max="220"
            value={spacing}
            onChange={(e) => setSpacing(+e.target.value)}
          />
        </label>
        <button onClick={png}>Export image</button>
      </div>
      <p>Drag to pin a node. Select a node to inspect it.</p>
      {error && <p role="alert">{error}</p>}
      <div
        ref={host}
        className="force-canvas"
        aria-label="Interactive network; equivalent relationships listed below"
      />
    </>
  );
}
