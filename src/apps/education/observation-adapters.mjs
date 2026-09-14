import { field, F } from './dataset-data.mjs';

// IDs are the published typed properties used by the Reading First/Perry contracts.
export function meanPanels(rows) {
  return rows.flatMap((row) => {
    const actual = field(row, F.actualMean), estimated = field(row, F.estimatedCounterfactual);
    const unit = field(row, F.unit), measure = field(row, F.outcome), followup = field(row, F.followup);
    if (![actual, estimated].every(Number.isFinite) || typeof unit !== 'string' || typeof measure !== 'string') return [];
    return [{ id: row.id, measure, unit, followup: typeof followup === 'string' ? followup : 'Not stated', actual: Number(actual), estimated: Number(estimated) }];
  });
}
function relation(row, type) { return row.relations.filter((r) => r.typeId === type); }
export function pairedObserved(rows) {
  const candidates = rows.flatMap((row) => {
    const value = field(row, F.observedProportion) ?? field(row, F.observedMonetaryMean);
    const measure = field(row, F.outcome), followup = field(row, F.followup), unit = field(row, F.unit);
    const arm = relation(row, F.studyArm), population = relation(row, F.population);
    if (!Number.isFinite(value) || typeof measure !== 'string' || typeof followup !== 'string' || typeof unit !== 'string' || arm.length !== 1 || population.length !== 1) return [];
    return [{ row, value: Number(value), measure, followup, unit, arm: arm[0], population: population[0] }];
  });
  const groups = new Map();
  for (const item of candidates) { const key = JSON.stringify([item.measure, item.followup, item.unit, item.population.toEntityId]); groups.set(key, [...(groups.get(key) || []), item]); }
  return [...groups.values()].filter((group) => group.length === 2 && new Set(group.map((x) => x.arm.toEntityId)).size === 2);
}
export function economicScenarios(rows) {
  return rows.flatMap((row) => {
    const ratio = field(row, F.benefitCostRatio), irr = field(row, F.internalReturn);
    const value = Number.isFinite(ratio) ? Number(ratio) : Number.isFinite(irr) ? Number(irr) : null;
    if (value === null) return [];
    return [{ id: row.id, kind: Number.isFinite(ratio) ? 'Benefit-cost ratio' : 'Internal rate of return', value, discountRate: field(row, F.discountRate), deadweightLoss: field(row, F.deadweightLoss), valuation: field(row, F.murderValuation) }];
  });
}
