export const COOKIE_PREFERENCES_KEY = "pondnest:cookie-preferences";
// Renew approval: external content now includes YouTube as well as TikTok.
export const COOKIE_PREFERENCES_VERSION = 2;
export const COOKIE_PREFERENCES_LIFETIME = 180 * 24 * 60 * 60 * 1000;

export function decodePreferences(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (
      value?.version !== COOKIE_PREFERENCES_VERSION ||
      value.necessary !== true ||
      typeof value.externalContent !== "boolean" ||
      !Number.isFinite(value.savedAt) ||
      !Number.isFinite(value.expiresAt) ||
      value.savedAt > now ||
      value.expiresAt <= now ||
      value.expiresAt <= value.savedAt ||
      value.expiresAt - value.savedAt > COOKIE_PREFERENCES_LIFETIME
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function makePreferences(externalContent, now = Date.now()) {
  return {
    version: COOKIE_PREFERENCES_VERSION,
    necessary: true,
    externalContent: externalContent === true,
    savedAt: now,
    expiresAt: now + COOKIE_PREFERENCES_LIFETIME,
  };
}

export function loadPreferences() {
  try {
    return decodePreferences(
      window.localStorage.getItem(COOKIE_PREFERENCES_KEY),
    );
  } catch {
    return null;
  }
}
