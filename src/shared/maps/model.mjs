export function groupPoints(features) {
  const groups = new Map();
  for (const f of features) {
    if (
      !Array.isArray(f.point) ||
      f.point.length !== 2 ||
      !f.point.every(Number.isFinite) ||
      Math.abs(f.point[0]) > 90 ||
      Math.abs(f.point[1]) > 180
    )
      continue;
    const key = f.point.join(',');
    const group = groups.get(key) ?? [];
    if (!group.some((x) => x.id === f.id)) group.push(f);
    groups.set(key, group);
  }
  return [...groups.values()];
}
