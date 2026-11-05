import { test, expect } from '@playwright/test';
import sharp from 'sharp';

test.use({ deviceScaleFactor: 2 });

async function verifyLogo(page, image) {
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  const state = await image.evaluate(i => ({ src: i.currentSrc, width: i.getBoundingClientRect().width, height: i.getBoundingClientRect().height, dpr: devicePixelRatio }));
  const response = await page.request.get(state.src);
  expect(response.ok()).toBe(true);
  const metadata = await sharp(await response.body()).metadata();
  expect(Math.abs(state.width / state.height - metadata.width / metadata.height)).toBeLessThan(.01);
  expect(metadata.width).toBeGreaterThanOrEqual(Math.floor(state.width * state.dpr));
  await expect(image).toHaveCSS('object-fit', 'contain');
}

for (const width of [375, 1440]) test(`Original PondNest identity renders sharply at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const failures = [];
  page.on('response', r => { if (r.url().includes('/logo/exports/') && r.status() >= 400) failures.push(r.url()); });
  await page.goto('/productos');
  const header = page.locator('.site-header .brand-logo');
  await verifyLogo(page, header);
  await expect(header).toHaveAttribute('src', /pondnest-horizontal\.webp$/);
  await page.locator('.site-header').screenshot({ path: `test-results/brand-header-${width}.png` });
  const footer = page.locator('.footer .brand-logo');
  await verifyLogo(page, footer);
  await expect(footer).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('.brand-mark')).toHaveCount(0);
  await expect(page.locator('.footer')).not.toContainText('Logo oficial pendiente');
  await page.locator('.footer').screenshot({ path: `test-results/brand-footer-${width}.png` });
  for (const link of await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').all()) {
    const response = await page.request.get(await link.getAttribute('href'));
    expect(response.ok()).toBe(true);
    expect((await response.body()).length).toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(failures).toEqual([]);
});

test('loading screen uses the original principal logo', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/*.glb', async route => { await gate; await route.abort(); });
  try {
    await page.goto('/');
    const logo = page.locator('.loading .brand-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /pondnest-principal\.webp$/);
    await verifyLogo(page, logo);
    await page.screenshot({ path: 'test-results/brand-loading.png' });
  } finally { release(); }
  await expect(page.locator('.loading')).toHaveCount(0);
  await expect(page.locator('.site-header .brand-logo')).toBeVisible();
});
