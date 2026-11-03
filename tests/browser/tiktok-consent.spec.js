import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tiktokVideos } from "../../src/data/tiktokVideos.js";
import {
  COOKIE_PREFERENCES_KEY,
  makePreferences,
} from "../../src/services/cookiePreferences.js";

test.use({ storageState: { cookies: [], origins: [] } });

async function mockPlayers(page) {
  await page.route("https://www.tiktok.com/player/v1/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body style="background:#201528;color:#f5eafa;font:16px system-ui"><p>Official player test fixture</p><button id="play">Native Play</button><script>
      window.commands=[]; const emit=(type,value)=>parent.postMessage({'x-tiktok-player':true,type,value},'*');
      addEventListener('message',e=>{if(!e.data['x-tiktok-player'])return;const type=e.data.type;commands.push(type);if(type==='play')emit('onStateChange',1);if(type==='pause')emit('onStateChange',2)});
      document.querySelector('#play').onclick=()=>emit('onStateChange',1);
      setTimeout(()=>emit('onPlayerReady'),50);
      </script></body></html>`,
    }),
  );
}
async function start(page, width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockPlayers(page);
  await page.goto("/");
}
async function allow(page) {
  await page
    .getByRole("button", { name: "Aceptar contenido externo", exact: true })
    .click();
}
async function videoSection(page) {
  await page.locator("#videos").scrollIntoViewIfNeeded();
}

test("first visit makes no TikTok requests and necessary-only consent never authorises it", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.includes("tiktok"))
      requests.push(request.url());
  });
  await start(page);
  await videoSection(page);
  await expect(page.locator(".cookie-notice")).toBeVisible();
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await expect(page.locator("#videos .social-consent")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Cargar vídeo/ })).toHaveCount(
    0,
  );
  expect(requests).toEqual([]);
  await page
    .getByRole("button", { name: "Solo necesarias", exact: true })
    .click();
  await page.reload();
  await videoSection(page);
  await expect(page.locator(".cookie-notice")).toHaveCount(0);
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  expect(requests).toEqual([]);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    COOKIE_PREFERENCES_KEY,
  );
  expect(saved.necessary).toBe(true);
  expect(saved.externalContent).toBe(false);
});

for (const width of [375, 1024, 1440]) {
  test(`accepted external content loads automatically near the carousel and persists ${width}`, async ({
    page,
  }) => {
    await start(page, width);
    await allow(page);
    await expect(page.locator("#videos iframe")).toHaveCount(0); // Still far below the hero.
    await videoSection(page);
    await expect
      .poll(() => page.locator("#videos iframe").count())
      .toBeGreaterThan(0);
    if (width >= 1024)
      await expect(page.locator("#videos iframe")).toHaveCount(4);
    await expect(
      page.getByRole("button", { name: /Cargar vídeo/ }),
    ).toHaveCount(0);
    await expect(
      page.getByText("TikTok permitido durante esta visita", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Retirar permiso de TikTok" }),
    ).toHaveCount(0);
    for (const frame of await page.locator("#videos iframe").all()) {
      await expect(frame).toHaveAttribute("src", /autoplay=0.*force_muted=1/);
    }
    await page.screenshot({ path: `test-results/tiktok-auto-${width}.png` });
    await page.reload();
    await videoSection(page);
    await expect(page.locator(".cookie-notice")).toHaveCount(0);
    await expect
      .poll(() => page.locator("#videos iframe").count())
      .toBeGreaterThan(0);
    if (width >= 1024) {
      const sources = await page
        .locator("#videos iframe")
        .evaluateAll((nodes) => nodes.map((node) => node.src));
      for (const video of tiktokVideos)
        expect(
          sources.some((url) => url.includes(video.url.split("/").pop())),
        ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("footer preferences revoke permission, remove all players and survive reload", async ({
  page,
}) => {
  await start(page);
  await allow(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Preferencias de cookies", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("checkbox", { name: /Contenido externo/ }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: /Estrictamente necesarias/ }),
  ).toBeDisabled();
  await dialog.getByRole("checkbox", { name: /Contenido externo/ }).uncheck();
  await dialog.getByRole("button", { name: "Guardar preferencias" }).click();
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await page.reload();
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Preferencias de cookies", exact: true })
    .click();
  await dialog.getByRole("checkbox", { name: /Contenido externo/ }).check();
  await dialog.getByRole("button", { name: "Guardar preferencias" }).click();
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
});

test("revoking in another tab immediately unloads already visible players", async ({
  page,
  context,
}) => {
  await start(page);
  await allow(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  const preferences = await context.newPage();
  await preferences.goto("/cookies");
  await preferences
    .getByRole("button", { name: "Preferencias de cookies", exact: true })
    .click();
  await preferences
    .getByRole("dialog")
    .getByRole("button", { name: "Solo necesarias" })
    .click();
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await preferences.close();
});

test("expired consent is not reused and settings remain keyboard accessible", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    {
      key: COOKIE_PREFERENCES_KEY,
      value: makePreferences(true, Date.now() - 181 * 86400000),
    },
  );
  await start(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Configurar cookies" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("checkbox", { name: /Contenido externo/ }),
  ).not.toBeChecked();
  const result = await new AxeBuilder({ page })
    .include(".cookie-dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((item) => item.id)).toEqual([]);
  await page.screenshot({ path: "test-results/cookie-preferences.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("consent expiring during an open visit unloads the already loaded players", async ({
  page,
}) => {
  await start(page);
  await allow(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  await page.clock.install();
  await page.clock.setSystemTime(new Date(Date.now() + 181 * 86400000));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await expect(page.locator(".cookie-notice")).toBeVisible();
});

test("granting consent while the carousel is visible immediately loads it", async ({
  page,
}) => {
  await start(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(0);
  await allow(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  await expect(page.getByRole("button", { name: /Cargar vídeo/ })).toHaveCount(
    0,
  );
});

test("audio ownership and playback events silence the other players", async ({
  page,
}) => {
  await start(page);
  await allow(page);
  await videoSection(page);
  const cards = page.locator("#videos .social-video-card");
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  await cards
    .nth(0)
    .getByRole("button", { name: "Activar sonido", exact: true })
    .click();
  await expect(cards.nth(0).locator("iframe")).toHaveAttribute(
    "src",
    /force_muted=0/,
  );
  await cards
    .nth(1)
    .getByRole("button", { name: "Activar sonido", exact: true })
    .click();
  await expect(cards.nth(0).locator("iframe")).toHaveAttribute(
    "src",
    /force_muted=1/,
  );
  await expect(cards.nth(1).locator("iframe")).toHaveAttribute(
    "src",
    /force_muted=0/,
  );
  await expect(
    cards.nth(2).getByRole("button", { name: /Reproducir/ }),
  ).toBeEnabled();
  await cards
    .nth(2)
    .getByRole("button", { name: /Reproducir/ })
    .click();
  await expect(
    cards.nth(2).getByRole("button", { name: /Pausar/ }),
  ).toBeVisible();
  await expect(cards.nth(1).locator("iframe")).toHaveAttribute(
    "src",
    /force_muted=1/,
  );
  const first = page
    .frames()
    .find((frame) =>
      frame.url().includes(tiktokVideos[0].url.split("/").pop()),
    );
  expect(await first.evaluate(() => window.commands)).toContain("pause");
});

test("provider failures keep the original link without any load button", async ({
  page,
}) => {
  await start(page);
  await allow(page);
  await videoSection(page);
  await expect(page.locator("#videos iframe")).toHaveCount(4);
  await expect(
    page
      .locator("#videos .social-video-card")
      .first()
      .getByRole("button", { name: /Reproducir/ }),
  ).toBeEnabled();
  const frame = page
    .frames()
    .find((item) => item.url().includes(tiktokVideos[0].url.split("/").pop()));
  await frame.evaluate(() =>
    parent.postMessage(
      {
        "x-tiktok-player": true,
        type: "onPlayerError",
        value: { errorCode: 3001 },
      },
      "*",
    ),
  );
  await expect(
    page.getByText("Este vídeo no se puede reproducir aquí."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver original en TikTok" }),
  ).toHaveAttribute("href", tiktokVideos[0].url);
});
