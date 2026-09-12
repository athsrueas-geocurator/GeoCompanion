export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function validateEntities(payload) {
  if (payload?.errors?.length)
    throw new Error('Geo could not complete this query. Please retry later.');
  const rows = payload?.data?.entities;
  if (
    !Array.isArray(rows) ||
    !rows.every(
      (e) =>
        typeof e?.id === 'string' &&
        /^[a-f0-9-]{32,36}$/i.test(e.id) &&
        (e.name === null || typeof e.name === 'string') &&
        (e.description === null || typeof e.description === 'string') &&
        Array.isArray(e.types) &&
        e.types.every(
          (t) =>
            typeof t?.id === 'string' &&
            (t.name === null || typeof t.name === 'string'),
        ),
    )
  )
    throw new Error('Geo returned an unexpected data format.');
  return rows;
}
