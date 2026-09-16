import { useEffect, useRef, useState } from 'react';
import ForceGraph from 'force-graph';
import { usePreferences } from '../preferences/Preferences';
import { loadNodeImages, neighborhood, toForceData } from './force-data.mjs';
import type { GraphData } from './types';
export default function ForceApplet({
  graph,
  onSelect,
}: {
  graph: GraphData;
  onSelect: (id: string) => void;
}) {
  const { value } = usePreferences();
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<ForceGraph<any, any> | null>(null);
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [paused, setPaused] = useState(false),
    [motion, setMotion] = useState(true),
    [labels, setLabels] = useState(false),
    [spacing, setSpacing] = useState(90),
    [images, setImages] = useState(value.imageLoading === 'automatic'),
    [error, setError] = useState(''),
    [imageStatus, setImageStatus] = useState(''),
    [active, setActive] = useState('');
  const flags = useRef({ paused, motion, labels, images, reduced, spacing });
  flags.current = { paused, motion, labels, images, reduced, spacing };
  const selected = useRef(onSelect);
  selected.current = onSelect;
  const positions = useRef<any[]>([]),
    pictures = useRef(new Map<string, HTMLImageElement>()),
    highlight = useRef(neighborhood(graph, '')),
    latched = useRef('');
  const refresh = () => {
    const fg = engine.current;
    if (fg) {
      fg.nodeCanvasObject(fg.nodeCanvasObject());
      if (flags.current.paused && !document.hidden) {
        fg.resumeAnimation();
        requestAnimationFrame(() => {
          if (engine.current === fg && flags.current.paused)
            fg.pauseAnimation();
        });
      }
    }
  };
  function mark(id: string) {
    highlight.current = neighborhood(graph, id);
    setActive(id);
    refresh();
  }
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)'),
      change = () => setReduced(mq.matches);
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    let live = true;
    const pending: HTMLImageElement[] = [];
    pictures.current.clear();
    setImageStatus('');
    refresh();
    if (images) {
      setImageStatus('Loading node images…');
      loadNodeImages(graph)
        .then((urls) => {
          if (!live) return;
          const entries = Object.entries(urls) as [string, string][];
          let remaining = entries.length,
            loaded = 0;
          setImageStatus(
            entries.length
              ? 'Loading node images…'
              : 'No unambiguous node images found.',
          );
          for (const [id, url] of entries) {
            const img = new Image();
            pending.push(img);
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            const done = () => {
              if (!live) return;
              if (--remaining === 0)
                setImageStatus(
                  loaded
                    ? `${loaded} node images loaded`
                    : 'Images unavailable; showing initials.',
                );
            };
            img.onload = () => {
              if (live) {
                pictures.current.set(id, img);
                loaded++;
                refresh();
              }
              done();
            };
            img.onerror = done;
            img.src = url;
          }
        })
        .catch(() => {
          if (live) setImageStatus('Images unavailable; showing initials.');
        });
    }
    return () => {
      live = false;
      for (const img of pending) {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      }
    };
  }, [graph, images]);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    let fg: ForceGraph<any, any> | undefined;
    try {
      const style = getComputedStyle(el),
        text = style.getPropertyValue('--text').trim(),
        accent = style.getPropertyValue('--accent').trim(),
        line = style.getPropertyValue('--graph-line').trim(),
        surface = style.getPropertyValue('--surface').trim();
      const linked = (e: any) =>
        !highlight.current.nodes.size || highlight.current.edges.has(e.id);
      fg = new ForceGraph<any, any>(el)
        .width(el.clientWidth)
        .height(el.clientHeight)
        .backgroundColor(surface)
        .nodeId('id')
        .nodeVal(5)
        .nodeLabel(() => '')
        .linkLabel(() => '')
        .linkColor((e) => (linked(e) ? line : line + '25'))
        .linkWidth((e) => (highlight.current.edges.has(e.id) ? 2 : 0.6))
        .linkDirectionalArrowLength((e) => (linked(e) ? 4 : 0))
        .linkDirectionalArrowRelPos(0.86)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleColor(() => accent)
        .linkDirectionalParticleSpeed(0.003)
        .autoPauseRedraw(true)
        .onNodeHover((n) => {
          highlight.current = neighborhood(
            graph,
            n ? String(n.id) : latched.current,
          );
          setActive(n ? String(n.id) : latched.current);
          refresh();
          el.style.cursor = n ? 'pointer' : 'grab';
        })
        .onNodeClick((n) => {
          latched.current = String(n.id);
          highlight.current = neighborhood(graph, latched.current);
          setActive(latched.current);
          selected.current(latched.current);
          refresh();
        })
        .onBackgroundClick(() => {
          latched.current = '';
          highlight.current = neighborhood(graph, '');
          setActive('');
          refresh();
        })
        .onNodeDragEnd((n) => {
          n.fx = n.x;
          n.fy = n.y;
        });
      fg.nodeCanvasObjectMode(() => 'replace')
        .nodeCanvasObject((n, ctx, scale) => {
          const emphasized = highlight.current.nodes.has(n.id),
            dim = highlight.current.nodes.size && !emphasized,
            img = flags.current.images ? pictures.current.get(n.id) : null,
            r = img ? 9 : 5;
          ctx.save();
          ctx.globalAlpha = dim ? 0.18 : 1;
          if (emphasized) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 1.5 / scale;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = accent;
          ctx.fill();
          if (img) {
            ctx.save();
            ctx.clip();
            const crop = Math.min(img.naturalWidth, img.naturalHeight);
            ctx.drawImage(
              img,
              (img.naturalWidth - crop) / 2,
              (img.naturalHeight - crop) / 2,
              crop,
              crop,
              n.x - r,
              n.y - r,
              r * 2,
              r * 2,
            );
            ctx.restore();
          } else if (scale > 1.1) {
            ctx.fillStyle = surface;
            ctx.font = 'bold 4px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.label.slice(0, 2).toUpperCase(), n.x, n.y);
          }
          if (flags.current.labels || n.id === highlight.current.center) {
            const label =
                n.label.length > 55 ? n.label.slice(0, 52) + '…' : n.label,
              size = 12 / scale;
            ctx.font = `${size}px system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const w = ctx.measureText(label).width;
            ctx.fillStyle = surface;
            ctx.fillRect(
              n.x - w / 2 - 2 / scale,
              n.y + r + 3 / scale,
              w + 4 / scale,
              size + 4 / scale,
            );
            ctx.fillStyle = text;
            ctx.fillText(label, n.x, n.y + r + 5 / scale);
          }
          ctx.restore();
        })
        .nodePointerAreaPaint((n, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
          ctx.fill();
        });
      const graphEngineForForce = fg;
      fg.d3Force('containment', (alpha: number) => {
        for (const n of graphEngineForForce.graphData().nodes) {
          n.vx = (n.vx || 0) - (n.x || 0) * 0.002 * alpha;
          n.vy = (n.vy || 0) - (n.y || 0) * 0.002 * alpha;
        }
      });
      const moving = flags.current.motion && !flags.current.reduced;
      fg.d3AlphaDecay(moving ? 0 : 0.06)
        .cooldownTicks(moving ? Infinity : 120)
        .cooldownTime(moving ? Infinity : 4500)
        .warmupTicks(100);
      fg.graphData(toForceData(graph, positions.current));
      fg.d3Force('link')?.distance(flags.current.spacing);
      engine.current = fg;
      latched.current = '';
      highlight.current = neighborhood(graph, '');
      setActive('');
      const graphEngine = fg;
      const size = new ResizeObserver(() =>
        graphEngine.width(el.clientWidth).height(el.clientHeight),
      );
      size.observe(el);
      const timer = setTimeout(() => graphEngine.zoomToFit(0, 45), 700);
      const visibility = () => {
        if (document.hidden) graphEngine.pauseAnimation();
        else if (!flags.current.paused) graphEngine.resumeAnimation();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => {
        clearTimeout(timer);
        size.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        positions.current = graphEngine
          .graphData()
          .nodes.map((n) => ({ ...n }));
        graphEngine._destructor();
        engine.current = null;
      };
    } catch {
      fg?._destructor();
      setError(
        'The interactive graph could not start. Use the relationship list.',
      );
    }
  }, [graph]);
  useEffect(() => {
    const fg = engine.current;
    if (!fg) return;
    const moving = motion && !reduced;
    fg.linkDirectionalParticles((e) =>
      moving &&
      (!highlight.current.nodes.size || highlight.current.edges.has(e.id))
        ? 2
        : 0,
    )
      .d3AlphaDecay(moving ? 0 : 0.06)
      .cooldownTicks(moving ? Infinity : 120)
      .cooldownTime(moving ? Infinity : 4500);
    if (reduced) fg.warmupTicks(120).cooldownTicks(0);
    if (paused || document.hidden) fg.pauseAnimation();
    else fg.resumeAnimation().d3ReheatSimulation();
  }, [graph, motion, reduced, paused]);
  useEffect(() => {
    refresh();
  }, [labels, images]);
  useEffect(() => {
    engine.current?.d3Force('link')?.distance(spacing);
    engine.current?.d3ReheatSimulation();
  }, [spacing]);
  function png() {
    try {
      host.current?.querySelector('canvas')?.toBlob((blob) => {
        if (!blob) {
          setError('Image export unavailable.');
          return;
        }
        const url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = 'geo-network.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    } catch {
      setError('Image export unavailable. Try turning node images off.');
    }
  }
  const current = graph.nodes.find((n) => n.id === active);
  return (
    <div className="force-stage">
      <div
        ref={host}
        className="force-canvas"
        aria-label="Interactive network; use Highlight node or the relationship list for keyboard exploration"
      />
      <div className="force-toolbar">
        <button
          onClick={() => engine.current?.zoomToFit(reduced ? 0 : 250, 45)}
        >
          Fit
        </button>
        <button aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <details className="force-options">
          <summary>View controls</summary>
          <div className="force-options-body">
            <label>
              Highlight node
              <select
                value={active}
                onChange={(e) => {
                  latched.current = e.target.value;
                  mark(e.target.value);
                  selected.current(e.target.value);
                }}
              >
                <option value="">None</option>
                {graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label.slice(0, 90)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={motion && !reduced}
                disabled={reduced}
                onChange={(e) => setMotion(e.target.checked)}
              />{' '}
              Continuous motion
            </label>
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
              />{' '}
              All labels
            </label>
            <label>
              <input
                type="checkbox"
                checked={images}
                onChange={(e) => setImages(e.target.checked)}
              />{' '}
              Node images
            </label>
            {reduced && <p>Motion follows your reduced-motion preference.</p>}
            {imageStatus && <p role="status">{imageStatus}</p>}
            <label>
              Spacing
              <input
                type="range"
                min="40"
                max="220"
                value={spacing}
                onChange={(e) => setSpacing(+e.target.value)}
              />
            </label>
            <button
              onClick={() => {
                engine.current?.d3ReheatSimulation();
                setPaused(false);
              }}
            >
              Reheat
            </button>
            <button
              onClick={() => {
                engine.current?.graphData().nodes.forEach((n) => {
                  n.fx = undefined;
                  n.fy = undefined;
                });
                engine.current?.d3ReheatSimulation();
                setPaused(false);
              }}
            >
              Release pins
            </button>
            <button onClick={png}>Export PNG</button>
          </div>
        </details>
      </div>
      <div className="force-caption" aria-live="polite">
        {error ||
          current?.label ||
          'Hover or tap to highlight neighbors. Drag to pin. Scroll or pinch to zoom.'}
      </div>
    </div>
  );
}
