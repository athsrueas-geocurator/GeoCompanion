import { useEffect, useRef, useState } from 'react';
import { GEO_ENDPOINT } from '../../config/public-config';
import {
  QUERY,
  VARIABLES,
  parseStudy,
  SPACE,
  STAR,
} from './education-live.mjs';
import './education.css';
type Row = {
  id: string;
  name: string;
  effect: number | null;
  se: number | null;
  n: number | null;
  unit: string | null;
  grade: string;
  arm: string;
  locator: string | null;
  followup: string | null;
  estimand: string | null;
  sources: string[];
  plot: boolean;
};
let cache: { rows: Row[]; time: number } | null = null;
export function GeoLink({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`https://www.geobrowser.io/space/${SPACE}/${id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} ↗
    </a>
  );
}
export default function EducationDashboard({
  openAtlas,
}: {
  openAtlas: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true),
    [tick, setTick] = useState(0),
    [time, setTime] = useState(0),
    [grade, setGrade] = useState(''),
    [arm, setArm] = useState(''),
    [cool, setCool] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setBusy(true);
    setCool(true);
    setError('');
    async function load() {
      try {
        let data = cache;
        if (!data || tick || Date.now() - data.time > 60000) {
          const r = await fetch(GEO_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: QUERY, variables: VARIABLES }),
            signal: AbortSignal.any([c.signal, AbortSignal.timeout(25000)]),
          });
          if (!r.ok)
            throw Error(
              `Geo is unavailable (HTTP ${r.status}). Please retry later.`,
            );
          data = {
            rows: parseStudy(await r.json()) as Row[],
            time: Date.now(),
          };
          cache = data;
        }
        if (!c.signal.aborted) {
          setRows(data.rows);
          setTime(data.time);
        }
      } catch (e) {
        if (!c.signal.aborted)
          setError(e instanceof Error ? e.message : 'Unable to read Geo.');
      } finally {
        if (!c.signal.aborted) {
          setBusy(false);
          timer = setTimeout(() => setCool(false), 10000);
        }
      }
    }
    void load();
    return () => {
      c.abort();
      clearTimeout(timer);
    };
  }, [tick]);
  const chartRef = useRef<SVGSVGElement>(null),
    [chartWidth, setChartWidth] = useState(660);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setChartWidth(Math.max(1, entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rows.length]);
  const visible = rows.filter(
      (r) => (!grade || r.grade === grade) && (!arm || r.arm === arm),
    ),
    plot = visible
      .filter((r) => r.plot)
      .sort(
        (a, b) =>
          ['K', '1', '2', '3'].indexOf(a.grade) -
            ['K', '1', '2', '3'].indexOf(b.grade) ||
          (a.arm === 'Small class' ? -1 : 1),
      );
  const lower = Math.min(-2, ...plot.map((r) => r.effect! - 1.96 * r.se!)),
    upper = Math.max(10, ...plot.map((r) => r.effect! + 1.96 * r.se!));
  const x = (n: number) =>
    30 + ((n - lower) / (upper - lower)) * (chartWidth - 60);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EDUCATION DATASETS</div>
          <h1>Compare the evidence.</h1>
          <p>Explore what changed, for whom, and with what uncertainty.</p>
        </div>
      </div>

      <section className="explorer study-panel">
        <div className="section-title">
          <div>
            <h2>Does smaller class size change achievement?</h2>
            <p>
              Tennessee Project STAR · K–3 · Random assignment within schools
            </p>
          </div>
          <button disabled={busy || cool} onClick={() => setTick((t) => t + 1)}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <p className="muted">
          Initial class assignment effects on average Stanford Achievement Test
          subject percentile rank, compared with regular classes without a
          full-time aide. Context: 1985–86 through 1988–89.
        </p>
        <div className="filters">
          <label>
            Grade
            <select
              aria-label="STAR grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">All grades</option>
              {['K', '1', '2', '3'].map((g) => (
                <option key={g} value={g}>
                  {g === 'K' ? 'Kindergarten' : `Grade ${g}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Intervention
            <select
              aria-label="STAR intervention"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
            >
              <option value="">Both interventions</option>
              <option>Small class</option>
              <option>Regular class + aide</option>
            </select>
          </label>
          <div className="study-legend">
            <span>● Small class</span>
            <span>◆ Regular class + aide</span>
          </div>
        </div>
        <div className="results-meta" role="status">
          <span>{visible.length} estimates · one study</span>
        </div>
        {error && (
          <p className="message" role="alert">
            {error}{' '}
            {rows.length ? 'Previously fetched estimates remain visible.' : ''}
          </p>
        )}
        {busy && !rows.length ? (
          <p role="status">Loading study estimates…</p>
        ) : !error && !visible.length ? (
          <p role="status">No estimates match this view.</p>
        ) : null}
        {!!plot.length && (
          <div className="forest-scroll">
            <div className="forest-chart">
              <div className="forest-labels">
                {plot.map((r) => (
                  <span key={r.id}>
                    {r.grade === 'K' ? 'Kindergarten' : `Grade ${r.grade}`}
                    <small>{r.arm}</small>
                  </span>
                ))}
              </div>
              <svg
                ref={chartRef}
                style={{ height: plot.length * 64 + 45 }}
                viewBox={`0 0 ${chartWidth} ${plot.length * 64 + 45}`}
                role="img"
                aria-label="STAR effects in percentile points. Dots are point estimates; lines are approximate 95 percent intervals. Exact values appear in the table below."
              >
                <line
                  x1={x(0)}
                  x2={x(0)}
                  y1="0"
                  y2={plot.length * 64}
                  stroke="#8691a0"
                  strokeDasharray="4 4"
                />
                {[0, 5, 10]
                  .filter((n) => n >= lower && n <= upper)
                  .map((n) => (
                    <text
                      key={n}
                      x={x(n)}
                      y={plot.length * 64 + 25}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="16"
                    >
                      {n}
                    </text>
                  ))}
                {plot.map((r, i) => (
                  <g
                    key={r.id}
                    stroke={r.arm === 'Small class' ? '#176b59' : '#535acb'}
                    fill={r.arm === 'Small class' ? '#176b59' : '#535acb'}
                  >
                    <title>
                      {r.name}: {r.effect} percentile points, SE {r.se}
                    </title>
                    <line
                      x1={x(r.effect! - 1.96 * r.se!)}
                      x2={x(r.effect! + 1.96 * r.se!)}
                      y1={i * 64 + 30}
                      y2={i * 64 + 30}
                      strokeWidth="3"
                    />
                    {r.arm === 'Small class' ? (
                      <circle cx={x(r.effect!)} cy={i * 64 + 30} r="6" />
                    ) : (
                      <path
                        d={`M ${x(r.effect!)} ${i * 64 + 23} l 7 7 -7 7 -7 -7 Z`}
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>
            <p className="forest-axis">Estimated effect (percentile points)</p>
          </div>
        )}
        <p className="muted">
          Percentile points, not percent improvement. Intervals are calculated
          here as effect ± 1.96 × published standard error. They are
          approximate, not a test of the difference between interventions. Grade
          cohorts overlap; do not sum their sample sizes.
        </p>
        <div className="study-table">
          <table>
            <caption>
              Estimates and source context · {visible.length} rows
            </caption>
            <thead>
              <tr>
                <th>Grade / intervention</th>
                <th>Effect / unit</th>
                <th>SE / N</th>
                <th>Follow-up & interpretation</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    <GeoLink id={r.id}>
                      {r.grade} · {r.arm}
                    </GeoLink>
                  </th>
                  <td>
                    {r.effect ?? 'Unknown'}
                    <small>{r.unit ?? 'Unit unknown'}</small>
                    {!r.plot && (
                      <small>
                        Excluded from plot: incomplete or incompatible measure,
                        uncertainty, or comparator.
                      </small>
                    )}
                  </td>
                  <td>
                    {r.se ?? 'Unknown'} / {r.n?.toLocaleString() ?? 'Unknown'}
                  </td>
                  <td>
                    {r.followup ?? 'Unknown'}
                    <small>{r.estimand ?? 'Estimand unknown'}</small>
                  </td>
                  <td>
                    {r.sources.map((id) => (
                      <GeoLink key={id} id={id}>
                        Publication
                      </GeoLink>
                    ))}
                    <small>{r.locator ?? 'Source locator unknown'}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="caveat">
          <h3>What does this tell us about affordability?</h3>
          <p>
            These estimates do not supply matched observed costs. Affordability
            and cost-effectiveness remain unknown here. STAR percentile points,
            tutoring standard deviations, and Perry economic scenarios cannot be
            ranked on a common axis without a justified comparison method.
          </p>
        </div>
      </section>
      <section className="dataset-strip" aria-label="Dataset collection">
        <article>
          <span className="eyebrow">INTERACTIVE</span>
          <h2>STAR / Class size</h2>
          <p>Compare two interventions across four grades.</p>
          <GeoLink id={STAR}>Full dataset</GeoLink>
        </article>
        <article>
          <span className="eyebrow">MORE STUDIES</span>
          <h2>Education datasets</h2>
          <p>
            Perry economic scenarios and observed outcomes, Saga tutoring, and
            Reading First.
          </p>
          <a
            href={`https://www.geobrowser.io/space/${SPACE}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse published studies ↗
          </a>
        </article>
        <article>
          <span className="eyebrow">REFERENCE</span>
          <h2>Initiative atlas</h2>
          <p>Explore the broader dossier and its source evidence.</p>
          <button onClick={openAtlas}>Open atlas →</button>
        </article>
      </section>
    </>
  );
}
