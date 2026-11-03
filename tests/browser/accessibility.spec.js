import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("keyboard access and automated accessibility on core routes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/productos/r36s", "/carrito", "/faq"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});
test("no WebGL and slow download can always enter store", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await expect(page.locator(".scene-status")).toBeVisible();
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.getByRole("link", { name: "Comprar ahora" }).click();
  await expect(page.locator("h1")).toHaveText("R36S");
});
test("slow model allows skip immediately", async ({ page }) => {
  await page.route("**/*.glb", () => {});
  await page.goto("/");
  await expect(page.locator(".loading")).toBeVisible();
  await page
    .getByRole("button", { name: "Entrar a la tienda sin animación" })
    .click();
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.getByRole("link", { name: "Comprar ahora" }).click();
  await expect(page.locator("h1")).toHaveText("R36S");
});
