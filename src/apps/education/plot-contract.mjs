import { estimate, field, F } from './dataset-data.mjs';
export function dimensionIds(row, property) {
  return row.relations
    .filter((e) => e.typeId === property)
    .map((e) => e.toEntityId)
    .sort()
    .join(',');
}
// Supported grade/arm percentile-rank contract; other collections remain readable.
export function canPlot(rows) {
  if (!rows.length) return false;
  if (
    !rows.every((r) => {
      const e = estimate(r);
      return (
        e &&
        e.unit === 'percentile points' &&
        r.studyIds?.length === 1 &&
        dimensionIds(r, F.grade) &&
        dimensionIds(r, F.arm) &&
        dimensionIds(r, F.comparison) &&
        field(r, F.estimand)
      );
    })
  )
    return false;
  return (
    new Set(
      rows.map((r) =>
        JSON.stringify([
          r.studyIds,
          dimensionIds(r, F.comparison),
          field(r, F.estimand),
        ]),
      ),
    ).size === 1
  );
}
