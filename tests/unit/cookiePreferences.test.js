import test from "node:test";
import assert from "node:assert/strict";
import {
  makePreferences,
  decodePreferences,
  COOKIE_PREFERENCES_LIFETIME,
} from "../../src/services/cookiePreferences.js";
test("necessary-only choices never authorise external content", () => {
  const now = 1000000000000;
  for (const value of [false, undefined, "true", 1])
    assert.equal(
      decodePreferences(JSON.stringify(makePreferences(value, now)), now)
        .externalContent,
      false,
    );
  assert.equal(
    decodePreferences(JSON.stringify(makePreferences(true, now)), now)
      .externalContent,
    true,
  );
});
test("expired incompatible or malformed preferences fail closed", () => {
  const now = 1000000000000;
  const valid = makePreferences(true, now);
  for (const raw of [
    null,
    "broken",
    "{}",
    JSON.stringify({ ...valid, version: 0 }),
    JSON.stringify({ ...valid, necessary: false }),
    JSON.stringify({ ...valid, externalContent: "true" }),
    JSON.stringify({ ...valid, savedAt: now + 1 }),
    JSON.stringify({ ...valid, expiresAt: now }),
    JSON.stringify({
      ...valid,
      expiresAt: now + COOKIE_PREFERENCES_LIFETIME + 1,
    }),
  ])
    assert.equal(decodePreferences(raw, now), null);
  assert.equal(
    decodePreferences(JSON.stringify(valid), now + COOKIE_PREFERENCES_LIFETIME),
    null,
  );
});
