import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { COOKIE_PREFERENCES_KEY, makePreferences } from "../../src/services/cookiePreferences.js";

test("ArkOS guide searches accents, filters categories and exposes documented steps", async ({ page }) => {
  await page.goto("/guia-configuracion");
  await expect(page.getByRole("heading", { name: /Domina tu/ })).toBeVisible();
  await expect(page.locator(".guide-results>section")).toHaveCount(9);
  await page.getByRole("searchbox").fill("silenciar");
  await expect(page.locator(".guide-tutorial")).toHaveCount(1);
  await page.locator(".guide-tutorial summary").click();
  await expect(page.locator(".guide-tutorial ol")).toContainText("System Volume");
  await page.getByRole("searchbox").fill("personalizacion");
  await expect(page.locator(".guide-tutorial")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
  await page.getByRole("button", { name: "Partidas", exact: false }).click();
  await expect(page.locator(".guide-results>section")).toHaveCount(1);
  await page.getByRole("searchbox").fill("nonexistenttutorial");
  await expect(page.getByRole("heading", { name: "No encontramos ese tutorial." })).toBeVisible();
  await page.getByRole("button", { name: "Ver todos los tutoriales" }).click();
  await expect(page.locator(".guide-results>section")).toHaveCount(9);
  await expect(page.locator(".guide-hotkeys")).toContainText("no combinaciones verificadas");
  await expect(page.locator(".guide-reference")).toContainText("R36S");
  const a11y = await new AxeBuilder({ page }).include(".setup-guide").analyze();
  expect(a11y.violations).toEqual([]);
});

test("YouTube stays consent gated, remembers approval and unloads on withdrawal", async ({ page }) => {
  let requests = 0;
  await page.route("https://www.youtube-nocookie.com/embed/**", route => {
    requests++;
    return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Player fixture</title><button>Play</button>" });
  });
  await page.goto("/guia-configuracion");
  await page.locator(".guide-reference").scrollIntoViewIfNeeded();
  await expect(page.locator(".guide-video iframe")).toHaveCount(0);
  expect(requests).toBe(0);
  await page.locator(".guide-video").getByRole("button", { name: "Preferencias de cookies" }).click();
  await page.getByRole("checkbox", { name: /Contenido externo/ }).check();
  await page.getByRole("button", { name: "Guardar preferencias" }).click();
  await expect(page.locator(".guide-video iframe")).toHaveCount(1);
  await expect(page.locator(".guide-video iframe")).toHaveAttribute("src", /autoplay=0/);
  await page.reload();
  await page.locator(".guide-reference").scrollIntoViewIfNeeded();
  await expect(page.locator(".guide-video iframe")).toHaveCount(1);
  await page.locator(".footer").getByRole("button", { name: "Preferencias de cookies" }).click();
  await page.getByRole("checkbox", { name: /Contenido externo/ }).uncheck();
  await page.getByRole("button", { name: "Guardar preferencias" }).click();
  await expect(page.locator(".guide-video iframe")).toHaveCount(0);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: COOKIE_PREFERENCES_KEY, value: { ...makePreferences(true), version: 1 } });
  await page.reload();
  await page.locator(".guide-reference").scrollIntoViewIfNeeded();
  await expect(page.locator(".guide-video iframe")).toHaveCount(0);
  await expect(page.locator(".cookie-notice")).toBeVisible();
});

for (const width of [375, 768, 1440]) test(`guide responsive navigation at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.goto("/faq");
  if (width === 375) await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.locator("#main-navigation").getByRole("link", { name: "Guía de configuración" }).click();
  await expect(page).toHaveURL(/guia-configuracion/);
  await expect(page.locator(".guide-categories")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".guide-tutorial summary").first().click();
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: `test-results/guide-${width}.png`, fullPage: true });
});
