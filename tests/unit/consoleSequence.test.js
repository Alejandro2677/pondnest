import test from "node:test";
import assert from "node:assert/strict";
import {
  createConsolePose,
  createConsoleSequence,
} from "../../src/animation/consoleSequence.js";

const sample = (pose) =>
  Object.fromEntries(
    Object.keys(createConsolePose()).map((key) => [key, pose[key]]),
  );
const near = (actual, expected) =>
  assert.ok(
    Math.abs(actual - expected) < 0.00001,
    `${actual} differs from ${expected}`,
  );

test("console starts assembled and ends assembled after exactly one full turn", () => {
  const pose = createConsolePose();
  const timeline = createConsoleSequence(pose);
  try {
    timeline.progress(0);
    assert.deepEqual(sample(pose), createConsolePose());
    timeline.progress(1);
    near(pose.rotation, Math.PI * 2);
    for (const key of ["opened", "controlsFocus", "backHighlight"])
      assert.equal(pose[key], 0);
  } finally {
    timeline.kill();
  }
});

test("rotation and explosion overlap and the rear is visible while exploded", () => {
  const pose = createConsolePose();
  const timeline = createConsoleSequence(pose);
  try {
    timeline.progress(0.18);
    assert.ok(pose.opened > 0);
    assert.ok(pose.rotation > 0 && pose.rotation < Math.PI);
    for (const progress of [0.46, 0.5, 0.54]) {
      timeline.progress(progress);
      near(pose.rotation, Math.PI);
      assert.equal(pose.opened, 1);
    }
    timeline.progress(0.82);
    assert.ok(pose.opened > 0 && pose.opened < 1);
    assert.ok(pose.rotation > Math.PI && pose.rotation < Math.PI * 2);
  } finally {
    timeline.kill();
  }
});

test("scroll history is reversible, with no residual displacement at the start", () => {
  const pose = createConsolePose();
  const timeline = createConsoleSequence(pose);
  try {
    const forwards = new Map();
    let lastRotation = 0;
    for (const p of [0, 0.1, 0.3, 0.5, 0.75, 0.9, 1]) {
      timeline.progress(p);
      assert.ok(pose.rotation >= lastRotation);
      lastRotation = pose.rotation;
      forwards.set(p, sample(pose));
    }
    for (const p of [0.9, 0.75, 0.5, 0.3, 0.1, 0]) {
      timeline.progress(p);
      const expected = forwards.get(p);
      for (const key of Object.keys(expected)) near(pose[key], expected[key]);
    }
    assert.deepEqual(sample(pose), createConsolePose());
  } finally {
    timeline.kill();
  }
});

test("paused sequence does not advance without scrolling", async () => {
  const pose = createConsolePose();
  const timeline = createConsoleSequence(pose);
  try {
    timeline.progress(0.3);
    const before = sample(pose);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.deepEqual(sample(pose), before);
  } finally {
    timeline.kill();
  }
});
