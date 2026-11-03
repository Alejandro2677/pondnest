import { test, expect } from "@playwright/test";

const names = [
  "Mario Kart: Super Circuit",
  "Super Mario Land 2",
  "The Legend of Zelda: The Minish Cap",
  "Tetris",
  "Pac-Man",
  "Pokémon Esmeralda",
];

for (const width of [375, 1440, 2560]) {
  test(`local game covers are complete and the loop has no gap ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() =>
      sessionStorage.setItem("pondnest:static", "1"),
    );
    await page.goto("/");
    await page.locator("#juegos").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Pausar movimiento" }).click();
    const rows = page.locator("#juegos .marquee");
    await expect(rows).toHaveCount(2);
    await expect(page.locator(".game-cover-missing")).toHaveCount(0);
    const unique = rows.first().locator('.game-card[aria-hidden="false"]');
    await expect(unique).toHaveCount(6);
    for (const [i, name] of names.entries()) {
      await expect(unique.nth(i).locator("strong")).toHaveText(name);
      const img = unique.nth(i).locator("img");
      await expect(img).toHaveJSProperty("complete", true);
      await expect(img).not.toHaveJSProperty("naturalWidth", 0);
      await expect(img).toHaveCSS("object-fit", "contain");
      const original = await img.getAttribute("src");
      expect(original).toMatch(/^\/juegos\//);
      const response = await page.request.get(original);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toMatch(/^image\//);
    }
    await page.getByRole("button", { name: "Reanudar movimiento" }).click();
    await page.mouse.move(0, 0);
    for (const [i, direction] of ["normal", "reverse"].entries()) {
      const track = rows.nth(i).locator(".marquee-track");
      await expect(track).toHaveCSS("animation-direction", direction);
      const geometry = await track.evaluate((node) => ({
        loop: node.scrollWidth / 2,
        viewport: node.parentElement.clientWidth,
        first: node.children[0].getBoundingClientRect().x,
        next: node.children[node.children.length / 2].getBoundingClientRect().x,
      }));
      expect(geometry.loop).toBeGreaterThanOrEqual(geometry.viewport);
      expect(geometry.next - geometry.first).toBeCloseTo(geometry.loop, 0);
      await rows.nth(i).hover();
      await expect(track).toHaveCSS("animation-play-state", "paused");
    }
    await page.getByRole("button", { name: "Pausar movimiento" }).click();
    for (const row of await rows.all())
      await expect(row.locator(".marquee-track")).toHaveCSS(
        "animation-play-state",
        "paused",
      );
    await expect(page.locator(".games-disclaimer")).toContainText(
      "No hemos confirmado",
    );
    await expect(page.locator(".games-disclaimer")).toContainText(
      "Derechos de uso",
    );
    const sizes = await rows
      .first()
      .locator(".game-card")
      .evaluateAll((nodes) =>
        nodes.map((node) => [node.offsetWidth, node.offsetHeight]),
      );
    expect(new Set(sizes.map(JSON.stringify)).size).toBe(1);
    await page.locator("#juegos").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/game-covers-${width}.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("reduced motion keeps six accessible covers per row without automatic motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#juegos").scrollIntoViewIfNeeded();
  for (const track of await page.locator("#juegos .marquee-track").all()) {
    await expect(track).toHaveCSS("animation-name", "none");
    const visible = await track
      .locator(".game-card")
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => getComputedStyle(node).display !== "none")
            .length,
      );
    expect(visible).toBe(6);
  }
  await expect(page.locator("canvas")).toHaveCount(0);
});
