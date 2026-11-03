import { gsap } from "gsap";

export const createConsolePose = () => ({
  progress: 0,
  rotation: 0,
  opened: 0,
  controlsFocus: 0,
  backHighlight: 0,
});

// Every transform is sampled from one reversible timeline, never accumulated.
// The middle interval keeps the exploded console facing backwards long enough
// to inspect it. No autonomous playback or frame-based inertia is involved.
export function createConsoleSequence(pose, options = {}) {
  Object.assign(pose, createConsolePose());
  return gsap
    .timeline({ paused: true, defaults: { ease: "sine.inOut" }, ...options })
    .to(pose, { progress: 1, duration: 1, ease: "none" }, 0)
    .to(pose, { rotation: Math.PI, duration: 0.42 }, 0.04)
    .to(pose, { rotation: Math.PI * 2, duration: 0.42 }, 0.54)
    .to(pose, { opened: 1, duration: 0.24 }, 0.04)
    .to(pose, { opened: 0, duration: 0.26 }, 0.7)
    .to(pose, { controlsFocus: 1, duration: 0.12 }, 0.16)
    .to(pose, { controlsFocus: 0, duration: 0.26 }, 0.7)
    .to(pose, { backHighlight: 1, duration: 0.08 }, 0.38)
    .to(pose, { backHighlight: 0, duration: 0.08 }, 0.54);
}
