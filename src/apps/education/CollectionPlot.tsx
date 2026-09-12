import { useEffect, useRef, useState } from 'react';
import { estimate, F } from './dataset-data.mjs';
import { canPlot, dimensionIds } from './plot-contract.mjs';
import './education.css';
// One published collection and one explicit comparison/estimand/unit only.
// The grade/arm contract is intentionally narrower than the generic reader.
export default function CollectionPlot({ rows }: { rows: any[] }) {
  const chart = useRef<SVGSVGElement>(null),
    [width, setWidth] = useState(660);
  const ids = dimensionIds;
  const plot = rows.map((r) => ({ r, e: estimate(r) }));
  const eligible = canPlot(rows);
  useEffect(() => {
    if (!chart.current) return;
    const o = new ResizeObserver(([e]) =>
      setWidth(Math.max(1, e.contentRect.width)),
    );
    o.observe(chart.current);
    return () => o.disconnect();
  }, [eligible, rows.length]);
  if (!eligible) return null;
  const lo = Math.min(0, ...plot.map((p) => p.e!.value - 1.96 * p.e!.se)),
    hi = Math.max(0, ...plot.map((p) => p.e!.value + 1.96 * p.e!.se));
  const span = hi - lo || 1,
    min = lo - span * 0.06,
    max = hi + span * 0.06,
    x = (v: number) => 20 + ((v - min) / (max - min)) * (width - 40);
  const arms = [...new Set(rows.map((r) => ids(r, F.arm)))];
  const label = (r: any, p: string) =>
    r.relations
      .filter((e: any) => e.typeId === p)
      .map((e: any) => e.toEntity?.name || 'Unnamed dimension')
      .join(' / ');
  return (
    <div className="forest-scroll">
      <div className="forest-chart">
        <div className="forest-labels">
          {rows.map((r) => (
            <span key={r.id}>
              {label(r, F.grade)}
              <small>{label(r, F.arm)}</small>
            </span>
          ))}
        </div>
        <svg
          ref={chart}
          style={{ height: rows.length * 80 + 45 }}
          viewBox={`0 0 ${width} ${rows.length * 80 + 45}`}
          role="img"
          aria-label="Effect estimates in percentile points with approximate uncertainty intervals"
        >
          <line
            x1={x(0)}
            x2={x(0)}
            y1="0"
            y2={rows.length * 80}
            stroke="var(--chart-axis)"
            strokeDasharray="4 4"
          />
          {[lo, (lo + hi) / 2, hi].map((n, i) => (
            <text
              key={i}
              x={x(n)}
              y={rows.length * 80 + 25}
              textAnchor="middle"
              fill="currentColor"
              fontSize="13"
            >
              {n.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </text>
          ))}
          {plot.map(({ r, e }, i) => (
            <g
              key={r.id}
              stroke={
                arms.indexOf(ids(r, F.arm)) % 2
                  ? 'var(--chart-secondary)'
                  : 'var(--chart-primary)'
              }
              fill={
                arms.indexOf(ids(r, F.arm)) % 2
                  ? 'var(--chart-secondary)'
                  : 'var(--chart-primary)'
              }
            >
              <title>
                {r.name}: {e!.value}, SE {e!.se}
              </title>
              <line
                x1={x(e!.value - 1.96 * e!.se)}
                x2={x(e!.value + 1.96 * e!.se)}
                y1={i * 80 + 38}
                y2={i * 80 + 38}
                strokeWidth="3"
              />
              <circle cx={x(e!.value)} cy={i * 80 + 38} r="5" />
            </g>
          ))}
        </svg>
      </div>
      <p>Percentile points. Intervals: estimate ± 1.96 × standard error.</p>
      <details>
        <summary>Interpreting this chart</summary>
        <p>
          These approximate intervals do not test differences between
          interventions. Results may share participants; do not sum their sample
          sizes. Review the dataset’s methods and each result’s context.
        </p>
      </details>
    </div>
  );
}
