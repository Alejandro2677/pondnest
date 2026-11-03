import test from "node:test";
import assert from "node:assert/strict";
import { guideDevice, guideTopics, searchGuide } from "../../src/data/setupGuide.js";

test("guide search combines words, ignores accents and respects the category", () => {
  assert.equal(searchGuide("PERSONALIZACION")[0].id, "personalizacion");
  assert.equal(searchGuide("volumen silenciar")[0].id, "sonido");
  assert.deepEqual(searchGuide("silenciar", "partidas"), []);
  assert.deepEqual(searchGuide("notfound"), []);
  assert.equal(searchGuide("   ").length, 9);
});
test("guide does not claim physical verification without the supplier build", () => {
  assert.equal(guideDevice.os, "ArkOS");
  assert.equal(guideDevice.build, null);
  assert.equal(guideDevice.hardwareTested, false);
  for (const topic of guideTopics) for (const tutorial of topic.tutorials) {
    assert.ok(tutorial.steps.length >= 2);
    assert.equal(new URL(tutorial.source).protocol, "https:");
  }
});
