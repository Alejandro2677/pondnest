import { test, expect } from "@playwright/test";

// Inspect the actual Three scene through Fiber's dev store; no production
// globals, debug UI or telemetry are added to the storefront.
async function scenePose(page) {
  return page.evaluate(async () => {
    const fiberUrl = performance
      .getEntriesByType("resource")
      .map((resource) => resource.name)
      .find((url) => url.includes("/@react-three_fiber.js?v="));
    const { _roots } = await import(fiberUrl);
    const scene = _roots
      .get(document.querySelector("canvas"))
      .store.getState().scene;
    const root = scene.getObjectByName("pondnest-console");
    return {
      rotation: root.rotation.y,
      position: root.position.toArray(),
      parts: root.children.map((part) => ({
        name: part.name,
        position: part.position.toArray(),
        parent: part.parent.name,
      })),
      stickyTop: document
        .querySelector(".experience-sticky")
        .getBoundingClientRect().top,
    };
  });
}
async function seek(page, progress) {
  await page.evaluate((p) => {
    const section = document.querySelector(".experience");
    const sticky = section.querySelector(".experience-sticky");
    scrollTo({
      top: (section.offsetHeight - sticky.offsetHeight) * p,
      behavior: "instant",
    });
  }, progress);
  await page.waitForTimeout(400); // Only the bounded 0.25 s scrub may settle.
  return scenePose(page);
}
function assembled(pose) {
  for (const part of pose.parts)
    for (const value of part.position) expect(value).toBeCloseTo(0, 5);
}

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 375, height: 812 },
]) {
  test(`synchronized full rotation, slow scroll, reverse and stationary pose ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".loading")).toHaveCount(0, { timeout: 30000 });
    await expect(page.locator("canvas")).toBeVisible();
    const ratio = await page.evaluate(() => {
      const section = document.querySelector(".experience");
      return (
        (section.offsetHeight -
          section.querySelector(".experience-sticky").offsetHeight) /
        innerHeight
      );
    });
    expect(ratio).toBeCloseTo(viewport.width === 375 ? 4.55 : 7, 2);
    const initial = await seek(page, 0);
    assembled(initial);
    expect(initial.rotation).toBeCloseTo(0, 5);
    const early = await seek(page, 0.2);
    expect(early.rotation).toBeGreaterThan(0);
    expect(early.rotation).toBeLessThan(Math.PI);
    expect(
      early.parts.find((p) => p.name === "console-screen").position[2],
    ).toBeGreaterThan(0);
    expect(
      early.parts.find((p) => p.name === "console-controls").position[2],
    ).toBeGreaterThan(0);
    expect(early.parts.every((p) => p.parent === "pondnest-console")).toBe(
      true,
    );
    expect(early.stickyTop).toBeCloseTo(0, 1);
    await page.screenshot({
      path: `test-results/synchronized-exploded-${viewport.width}.png`,
    });
    const rear = await seek(page, 0.5);
    expect(rear.rotation).toBeCloseTo(Math.PI, 5);
    expect(
      rear.parts.find((p) => p.name === "console-back").position[2],
    ).toBeLessThan(0);
    await page.screenshot({
      path: `test-results/synchronized-rear-${viewport.width}.png`,
    });
    const closing = await seek(page, 0.83);
    expect(closing.rotation).toBeGreaterThan(Math.PI);
    expect(closing.rotation).toBeLessThan(Math.PI * 2);
    const final = await seek(page, 1);
    assembled(final);
    expect(final.rotation).toBeCloseTo(Math.PI * 2, 5);
    await page.screenshot({
      path: `test-results/synchronized-final-${viewport.width}.png`,
    });
    const backwards = await seek(page, 0.2);
    expect(backwards.parts).toEqual(early.parts);
    expect(backwards.rotation).toBeCloseTo(early.rotation, 5);
    await page.waitForTimeout(500);
    const stationary = await scenePose(page);
    expect(stationary.parts).toEqual(backwards.parts);
    expect(stationary.rotation).toEqual(backwards.rotation);
    const reset = await seek(page, 0);
    assembled(reset);
    expect(reset.rotation).toBeCloseTo(0, 5);
  });
}

test("resize refresh preserves the pose instead of accumulating offsets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".loading")).toHaveCount(0, { timeout: 30000 });
  await seek(page, 0.6);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  const rear = await seek(page, 0.5);
  expect(rear.rotation).toBeCloseTo(Math.PI, 5);
  const final = await seek(page, 1);
  assembled(final);
  expect(final.rotation).toBeCloseTo(Math.PI * 2, 5);
  const reset = await seek(page, 0);
  assembled(reset);
  expect(reset.rotation).toBeCloseTo(0, 5);
});
