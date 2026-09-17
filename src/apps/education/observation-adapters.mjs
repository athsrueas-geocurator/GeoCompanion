import { field, F } from './dataset-data.mjs';

// IDs are the published typed properties used by the Reading First/Perry contracts.
export function isNumeric(value) {
  return (
    (typeof value === 'number' ||
      (typeof value === 'string' && value.trim() !== '')) &&
    Number.isFinite(Number(value))
  );
}
export function meanPanels(rows) {
  return rows.flatMap((row) => {
    const actual = field(row, F.actualMean),
      estimated = field(row, F.estimatedCounterfactual);
    const unit = field(row, F.unit),
      measure = field(row, F.outcome),
      followup = field(row, F.followup);
    if (
      ![actual, estimated].every(isNumeric) ||
      typeof unit !== 'string' ||
      typeof measure !== 'string'
    )
      return [];
    return [
      {
        id: row.id,
        measure,
        unit,
        followup: typeof followup === 'string' ? followup : 'Not stated',
        actual: Number(actual),
        estimated: Number(estimated),
      },
    ];
  });
}
function relation(row, type) {
  return row.relations.filter((r) => r.typeId === type);
}
export function pairedObserved(rows) {
  const candidates = rows.flatMap((row) => {
    const value =
      field(row, F.observedProportion) ?? field(row, F.observedMonetaryMean);
    const measure = field(row, F.outcome),
      followup = field(row, F.followup),
      unit = field(row, F.unit);
    const arm = relation(row, F.studyArm),
      population = relation(row, F.population);
    if (
      !isNumeric(value) ||
      typeof measure !== 'string' ||
      typeof followup !== 'string' ||
      typeof unit !== 'string' ||
      arm.length !== 1 ||
      population.length !== 1
    )
      return [];
    return [
      {
        row,
        value: Number(value),
        measure,
        followup,
        unit,
        arm: arm[0],
        population: population[0],
      },
    ];
  });
  const groups = new Map();
  for (const item of candidates) {
    const key = JSON.stringify([
      item.measure,
      item.followup,
      item.unit,
      item.population.toEntityId,
    ]);
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  return [...groups.values()].filter(
    (group) =>
      group.length === 2 &&
      new Set(group.map((x) => x.arm.toEntityId)).size === 2,
  );
}
export function economicScenarios(rows) {
  return rows.flatMap((row) => {
    const ratio = field(row, F.benefitCostRatio),
      irr = field(row, F.internalReturn);
    const value = isNumeric(ratio)
      ? Number(ratio)
      : isNumeric(irr)
        ? Number(irr)
        : null;
    if (value === null) return [];
    return [
      {
        id: row.id,
        kind: isNumeric(ratio)
          ? 'Benefit-cost ratio'
          : 'Internal rate of return',
        name: row.name,
        perspective:
          relation(row, F.economicPerspective)[0]?.toEntity?.name ||
          'Not stated',
        horizon:
          typeof field(row, F.followup) === 'string'
            ? field(row, F.followup)
            : 'Not stated',
        value,
        discountRate: field(row, F.discountRate),
        deadweightLoss: field(row, F.deadweightLoss),
        valuation: field(row, F.murderValuation),
      },
    ];
  });
}
function isSourceReportedModel(row) {
  return field(row, F.observationKind) === 'Source-reported model';
}
// This is deliberately narrower than a title or unit-text heuristic. The
// publisher adds the controlled field only after source review, so generic
// numeric estimates stay out unless Geo explicitly classifies them as models.
export function modeledEconomicResults(rows) {
  return rows.flatMap((row) => {
    const value = field(row, F.netFinancialGain),
      unit = field(row, F.unit);
    if (
      !isSourceReportedModel(row) ||
      !isNumeric(value) ||
      typeof unit !== 'string'
    )
      return [];
    return [
      {
        id: row.id,
        name: row.name,
        value: Number(value),
        unit,
        priceYear: field(row, '97e14050fc49467bb3aaf4d7eccbbb69'),
        sourceTable: field(row, '84dacbddca6a44079edb5e11a4c66b40'),
      },
    ];
  });
}
export function compatibleEffects(rows) {
  return rows.flatMap((row) => {
    const value = field(row, F.effect),
      unit = field(row, F.unit),
      measure = field(row, F.outcome),
      followup = field(row, F.followup);
    const grades = relation(row, F.grade);
    if (
      isSourceReportedModel(row) ||
      !isNumeric(value) ||
      typeof unit !== 'string' ||
      typeof measure !== 'string' ||
      grades.length > 1
    )
      return [];
    return [
      {
        id: row.id,
        value: Number(value),
        unit,
        measure,
        followup: typeof followup === 'string' ? followup : 'Not stated',
        grade: grades[0]?.toEntity?.name || 'Not grade-specific',
        se: field(row, F.se),
      },
    ];
  });
}

// Individual estimates remain readable even without a comparable outcome dimension.
export function reportedEstimates(rows) {
  const plotted = new Set(compatibleEffects(rows).map((r) => r.id));
  return rows.flatMap((row) => {
    const f = row.fields.find((f) => f.id === F.effect);
    const unit = field(row, F.unit);
    if (
      row.unavailable ||
      isSourceReportedModel(row) ||
      plotted.has(row.id) ||
      !f?.numeric ||
      !isNumeric(f.value) ||
      typeof unit !== 'string'
    )
      return [];
    return [
      {
        id: row.id,
        name: row.name,
        value: Number(f.value),
        unit,
        estimand: field(row, F.estimand),
        sourceTable: field(row, '84dacbddca6a44079edb5e11a4c66b40'),
        p:
          row.fields.find(
            (f) => f.id === 'ba5f8fe9d1cd9a6094338d2f37b74a5e' && f.numeric,
          )?.value ?? null,
      },
    ];
  });
}
