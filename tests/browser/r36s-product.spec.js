import { test, expect } from "@playwright/test";
import { mainProduct } from "../../src/data/mainProduct.js";

for (const width of [375, 1440]) test(`R36S product and provider rating remain distinct at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/productos/r36s");
  await expect(page.locator("h1")).toHaveText("R36S");
  await expect(page).toHaveTitle(/R36S 128 GB con ArkOS/);
  await expect(page.locator("select")).toContainText(mainProduct.variantLabel);
  await expect(page.locator(".detail-copy")).toContainText("Sistema operativo ArkOS");
  await expect(page.locator(".supplier-rating")).toContainText("20 valoraciones");
  await expect(page.locator(".supplier-rating-fill").nth(4)).toHaveAttribute("style", "width: 60%;");
  await expect(page.locator(".supplier-rating-stars")).toHaveCSS("color", "rgb(245, 163, 90)");
  await expect(page.locator(".supplier-rating")).toContainText("Valoración en la plataforma del proveedor");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/r36s-detail-${width}.png`});
  await page.goto("/productos/r36h");
  await expect(page.locator("h1")).toHaveText("R36H");
  await expect(page.locator(".supplier-rating")).toHaveCount(0);
  await page.goto("/");
  await page.locator("#resenas").scrollIntoViewIfNeeded();
  await expect(page.locator("#resenas .supplier-rating")).toContainText("20 valoraciones");
  await expect(page.locator("#resenas .review-card")).toHaveCount(0);
  await expect(page.locator("#resenas .supplier-review-pending")).toBeVisible();
  await expect(page.locator("#resenas .review-summary")).toHaveCount(0);
  await page.screenshot({path:`test-results/r36s-rating-${width}.png`});
  await expect(page.locator("body")).not.toContainText(/Gamegaga|R36 HD/i);
});

test("legacy URL redirects and guide identifies the provider version as unverified", async ({page}) => {
  await page.goto("/productos/gamegaga-r36-hd");
  await expect(page).toHaveURL(/\/productos\/r36s$/);
  await page.getByRole("link",{name:/Necesitas ayuda para configurar/}).click();
  await expect(page.locator(".guide-device")).toContainText("R36S · 128 GB");
  await expect(page.locator(".guide-reference")).not.toContainText("Es otro modelo");
  await expect(page.locator(".guide-hotkeys")).toContainText("no combinaciones verificadas para la R36S");
});
