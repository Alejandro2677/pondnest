import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("empty video configuration stays demo with no third-party request", async ({
  page,
}) => {
  await page.route("**/src/data/tiktokVideos.js*", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: "export const tiktokVideos=[];",
    }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = [];
  page.on("request", (r) => {
    if (new URL(r.url()).hostname.includes("tiktok")) requests.push(r.url());
  });
  await page.goto("/");
  await page.locator("#videos").scrollIntoViewIfNeeded();
  await expect(page.locator("#videos .social-video-card")).toHaveCount(4);
  await expect(page.locator("#videos .social-demo-notice")).toContainText(
    "DEMOSTRACI\u00d3N",
  );
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  expect(requests).toEqual([]);
});
test("real review integration shows R36S dates images and excludes other product ratings", async ({
  page,
}) => {
  const reviews = [
    {
      id: "fixture1",
      author: "Test author",
      date: "2026-11-02",
      rating: 4,
      comment: "Isolated test opinion.",
      productHandle: "r36s",
      published: true,
      image: "/productos/r36hd-demo.webp",
      imageAlt: "Test photo",
    },
    {
      id: "fixture2",
      author: "Second test",
      date: "2026-10-31",
      rating: 5,
      comment: "Another isolated test.",
      productHandle: "r36h",
      published: true,
    },
  ];
  await page.route("**/src/data/reviews.js*", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `export const reviews=${JSON.stringify(reviews)};`,
    }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#resenas").scrollIntoViewIfNeeded();
  await expect(page.locator(".review-summary")).toContainText("4,0 / 5");
  await expect(page.locator(".review-summary")).toContainText("1 reseña publicada");
  await expect(page.locator("#resenas .review-card")).toHaveCount(1);
  await expect(page.locator("#resenas .supplier-rating")).toContainText("20 valoraciones");
  await expect(page.locator("#resenas time").first()).toHaveAttribute(
    "datetime",
    "2026-11-02",
  );
  await expect(page.getByRole("img", { name: "Test photo" })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .include("#resenas")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
});
