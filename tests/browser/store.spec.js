import { test, expect } from "@playwright/test";

for (const width of [320, 375, 430, 768, 1440]) {
  test(`responsive and navigation ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const models = [];
    page.on("request", (r) => {
      if (r.url().endsWith(".glb")) models.push(r.url());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "El retro",
    );
    await expect(page.locator(".loading")).toHaveCount(0);
    await expect(page.locator(".product-card")).toHaveCount(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    for (const image of await page.locator(".product-card img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      await expect(image).not.toHaveJSProperty("naturalWidth", 0);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: "Comprar ahora" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "R36S",
    );
    await page.getByLabel("Cantidad", { exact: true }).fill("2");
    await page.getByRole("button", { name: "Añadir al carrito demo" }).click();
    await expect(page).toHaveURL(/carrito/);
    await expect(
      page.getByRole("button", { name: "Compra no disponible" }),
    ).toBeDisabled();
    await expect(page.locator("output")).toHaveText("2");
    await page.getByRole("button", { name: "Aumentar cantidad" }).click();
    await expect(page.locator("output")).toHaveText("3");
    await page.reload();
    await expect(page.locator("output")).toHaveText("3");
    await page.getByRole("button", { name: "Reducir cantidad" }).click();
    await expect(page.locator("output")).toHaveText("2");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/cart-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Quitar", exact: true }).click();
    await expect(
      page.getByText("Todavía no has añadido productos."),
    ).toBeVisible();
    expect(models).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("3D loads, chapters reverse and shop remains available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".loading")).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".scene-status")).toHaveCount(0);
  await page.waitForTimeout(800); // Allow WebGL's first frame to reach the capture.
  await page.screenshot({ path: "test-results/3d-front.png" });
  for (const [p, label] of [
    [0.24, "Una mirada"],
    [0.42, "Conecta"],
    [0.5, "El control"],
    [0.97, "Tu próxima"],
    [0.02, "El retro"],
  ]) {
    await page.evaluate((p) => {
      const section = document.querySelector(".experience");
      window.scrollTo({
        top: (section.offsetHeight - innerHeight) * p,
        behavior: "instant",
      });
    }, p);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(label);
    await expect(page.locator(".hero-copy")).toHaveCSS("opacity", "1");
    await page.waitForTimeout(350); // Wait for the short ScrollTrigger scrub to settle.
    await page.screenshot({ path: `test-results/3d-stage-${p}.png` });
  }
  await page.getByRole("link", { name: "Saltar introducción" }).click();
  await expect(page.locator("#productos")).toBeInViewport();
  expect(errors).toEqual([]);
});

test("3D mobile is available", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".loading")).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/3d-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("failed GLB has a static fallback", async ({ page }) => {
  await page.route("**/*.glb", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByText("3D no disponible. Puedes seguir explorando la tienda."),
  ).toBeVisible();
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.getByRole("link", { name: "Comprar ahora" }).click();
  await expect(
    page.getByRole("button", { name: "Añadir al carrito demo" }),
  ).toBeEnabled();
});

test("all routes, gallery, FAQ, mobile menu and 404", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/productos");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Información" })
    .click();
  await expect(page.getByRole("navigation")).toBeHidden();
  await page
    .locator("summary")
    .filter({ hasText: "¿Qué juegos incluye?" })
    .click();
  await expect(
    page.getByText("No hay una lista de títulos", { exact: false }),
  ).toBeVisible();
  for (const handle of [
    "r36s",
    "r36h",
    "funda-silicona",
    "estuche-transporte",
  ]) {
    await page.goto(`/productos/${handle}`);
    await expect(
      page.getByRole("button", { name: "Añadir al carrito demo" }),
    ).toBeEnabled();
  }
  await page.goto("/productos/r36s");
  await page.getByRole("button", { name: "Ver imagen 2" }).click();
  await expect(
    page.getByRole("button", { name: "Ver imagen 2" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const slug of [
    "envios",
    "devoluciones",
    "contacto",
    "aviso-legal",
    "privacidad",
    "cookies",
  ]) {
    await page.goto(`/${slug}`);
    await expect(
      page.getByText("Contenido pendiente de aprobación comercial."),
    ).toBeVisible();
  }
  await page.goto("/no-existe");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Por aquí",
  );
});

test("direct catalog and empty cart", async ({ page }) => {
  // Live configuration is tested through the service contract in unit tests.
  await page.goto("/productos");
  await expect(page.locator(".product-card")).toHaveCount(4);
  await page.goto("/carrito");
  await expect(
    page.getByText("Todavía no has añadido productos."),
  ).toBeVisible();
});

test("tablet navigation and short-screen 3D remain usable", async ({
  page,
}) => {
  for (const size of [
    { width: 768, height: 900 },
    { width: 320, height: 667 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await expect(page.locator(".loading")).toHaveCount(0, { timeout: 30000 });
    await expect(page.locator("canvas")).toBeVisible();
    await page.waitForTimeout(800);
    if (size.width === 768)
      await expect(page.getByRole("navigation")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Saltar introducción" }),
    ).toBeInViewport();
    await page.screenshot({
      path: `test-results/3d-${size.width}x${size.height}.png`,
    });
  }
});
