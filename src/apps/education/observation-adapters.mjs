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
