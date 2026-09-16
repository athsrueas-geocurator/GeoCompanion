export const PREFERENCES_KEY = 'geocompanion.preferences.v1';
export const MAX_PROFILES = 25;
export function emptyPreferences() {
  return {
    version: 1,
    textSize: 'standard',
    imageLoading: 'automatic',
    forceGraph: false,
    profiles: [],
    defaultProfileId: null,
  };
}
export function parseProfileId(input) {
  const value = input.trim();
  if (/^[a-f0-9]{32}$/i.test(value)) return value.toLowerCase();
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Paste a Geo profile link or its 32-character space ID.');
  }
  if (
    url.protocol !== 'https:' ||
    !['www.geobrowser.io', 'geobrowser.io'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error('Use a profile link from https://www.geobrowser.io.');
  const match = url.pathname.match(/^\/space\/([a-f0-9]{32})\/?$/i);
  if (!match)
    throw new Error(
      'Use the profile’s space link, without a content ID after it.',
    );
  return match[1].toLowerCase();
}
export function validatePreferences(value) {
  if (
    !value ||
    value.version !== 1 ||
    !['standard', 'large'].includes(value.textSize) ||
    (value.imageLoading !== undefined &&
      !['automatic', 'ask'].includes(value.imageLoading)) ||
    (value.forceGraph !== undefined && typeof value.forceGraph !== 'boolean') ||
    !Array.isArray(value.profiles) ||
    value.profiles.length > MAX_PROFILES
  )
    throw new Error('Invalid saved preferences');
  const ids = new Set();
  const profiles = value.profiles.map((id) => {
    if (typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id) || ids.has(id))
      throw new Error('Invalid saved profile');
    ids.add(id);
    return id;
  });
  if (value.defaultProfileId !== null && !ids.has(value.defaultProfileId))
    throw new Error('Invalid default profile');
  return {
    version: 1,
    textSize: value.textSize,
    imageLoading: value.imageLoading ?? 'automatic',
    forceGraph: value.forceGraph ?? false,
    profiles,
    defaultProfileId: value.defaultProfileId,
  };
}
export function readPreferences(storage) {
  try {
    const raw = storage.getItem(PREFERENCES_KEY);
    return {
      value: raw ? validatePreferences(JSON.parse(raw)) : emptyPreferences(),
      error: '',
    };
  } catch {
    return {
      value: emptyPreferences(),
      error:
        'Saved preferences could not be read. Changes will use this tab until they can be saved.',
    };
  }
}
export function writePreferences(storage, value) {
  try {
    storage.setItem(
      PREFERENCES_KEY,
      JSON.stringify(validatePreferences(value)),
    );
    return '';
  } catch {
    return 'Changes are available in this tab, but this browser could not save them.';
  }
}
export function addProfile(value, profile) {
  if (value.profiles.includes(profile))
    throw new Error('You already follow this profile.');
  if (value.profiles.length >= MAX_PROFILES)
    throw new Error(
      `You can follow up to ${MAX_PROFILES} profiles in this browser.`,
    );
  return validatePreferences({
    ...value,
    profiles: [...value.profiles, profile],
    defaultProfileId: value.defaultProfileId ?? profile,
  });
}
export function removeProfile(value, id) {
  return {
    ...value,
    profiles: value.profiles.filter((p) => p !== id),
    defaultProfileId:
      value.defaultProfileId === id ? null : value.defaultProfileId,
  };
}
