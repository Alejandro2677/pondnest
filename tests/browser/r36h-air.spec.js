import { test, expect } from '../fixtures/preview-page.js';
import configuration from '../../config/product-variants.json' with { type: 'json' };
import manifest from '../../src/data/product-images.generated.json' with { type: 'json' };

for (const width of [375, 1440]) test(`R36H Air content, controls and purchase at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.url().includes('/_optimized/') && response.status() >= 400) failures.push(response.url()); });
  await page.goto('/productos/r36h');
  await expect(page.locator('h1')).toHaveText('R36H Air · Consola retro portátil');
  await expect(page).toHaveTitle(/R36H Air/);
  await expect(page.locator('.air-subtitle')).toHaveText('Una nueva forma de disfrutar tus juegos retro.');
  await expect(page.locator('.detail-price')).toContainText('20,00');
  await expect(page.locator('.variant-options button')).toHaveCount(3);
  await expect(page.locator('.variant-capacities button')).toHaveCount(2);
  for (const variant of configuration.products.r36h.variants) {
    await page.locator('.variant-options').getByRole('button', { name: variant.color, exact: true }).click();
    await page.locator('.variant-capacities').getByRole('button', { name: variant.capacity, exact: true }).click();
    await expect(page.locator('.variant-selector')).toHaveAttribute('data-variant-id', variant.id);
    const image = manifest.products.r36h.find(i => i.source === variant.primaryImage);
    await expect(page.locator('.gallery-main img')).toHaveAttribute('src', '/' + image.src);
    await expect.poll(() => page.locator('.gallery-main img').evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('.air-feature-grid .air-card')).toHaveCount(6);
  await page.locator('.air-section-nav a[href="#air-controls"]').click();
  await expect(page.locator('#air-controls-title')).toBeInViewport();
  await expect(page.locator('#air-battery')).toContainText('Hasta 8 horas según el fabricante. La duración real depende del uso.');
  await expect(page.locator('#air-battery')).toContainText('no ha sido comprobada por PondNest');
  await expect(page.locator('.air-spec-panel').first()).toContainText('640 × 480');
  await expect(page.locator('.air-spec-panel').first()).not.toContainText('0,38');
  await expect(page.locator('.air-spec-panel').last()).toContainText('0,38 kg');
  await expect(page.locator('.air-spec-panel').last()).toContainText('19 × 12 × 6 cm');
  const controls = page.locator('.air-control-cards details');
  await expect(controls).toHaveCount(10);
  for (const control of await controls.all()) {
    await control.locator('summary').click();
    await expect(control.locator('p')).toBeVisible();
    await control.locator('summary').click();
  }
  for (const img of await page.locator('.air-photo img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(await img.getAttribute('src')).toMatch(/^\/productos\/r36h\/.*\.webp$/);
  }
  await page.locator('#air-faq summary').filter({ hasText: '¿Cómo se carga?' }).click();
  await expect(page.locator('#air-faq')).toContainText('potencia');
  await page.locator('#air-controls-title').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: `test-results/r36h-air-controls-${width}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.air-purchase-bar a').click();
  await expect(page.locator('#air-purchase')).toBeInViewport();
  await page.getByRole('button', { name: 'Añadir al carrito ↗' }).click();
  await expect(page).toHaveURL(/\/carrito$/);
  await expect(page.locator('.cart-line')).toContainText('R36H');
  expect(failures).toEqual([]);
  await page.goto('/productos/r36s');
  await expect(page.locator('h1')).toHaveText('R36S Retro · Consola portátil');
  await expect(page.locator('.air-details')).toHaveCount(0);
  await expect(page.locator('.variant-options button')).toHaveCount(13);
});
