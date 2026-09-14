import { meanPanels } from './observation-adapters.mjs';
type MeanPanel = { id: string; measure: string; unit: string; followup: string; actual: number; estimated: number };
export default function ObservationPanels({ rows }: { rows: any[] }) {
  const means = meanPanels(rows) as MeanPanel[];
  if (!means.length) return null;
  return <section className="observation-panel"><h3>Observed and estimated counterfactual means</h3><p>Values remain in their reported units; this does not turn means into causal effects.</p><div className="atlas-comparison-table" role="region" tabIndex={0}><table><thead><tr><th>Measure</th><th>Follow-up</th><th>Actual</th><th>Estimated counterfactual</th><th>Unit</th></tr></thead><tbody>{means.map((m) => <tr key={m.id}><th scope="row">{m.measure}</th><td>{m.followup}</td><td>{m.actual}</td><td>{m.estimated}</td><td>{m.unit}</td></tr>)}</tbody></table></div></section>;
}
