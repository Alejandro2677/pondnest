import { test, expect } from '../fixtures/preview-page.js';

for (const width of [375, 1440]) test(`R36S detail sections and controls at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const failures = [];
  page.on('pageerror', e => failures.push(e.message));
  page.on('response', r => { if ((r.url().includes('/productos/') || r.url().includes('/juegos/')) && r.status() >= 400) failures.push(r.url()); });
  await page.goto('/productos/r36s');
  await expect(page.locator('h1')).toHaveText('R36S Retro · Consola portátil');
  await expect(page.locator('.r36s-subtitle')).toHaveText('Redescubre los videojuegos clásicos donde quieras.');
  await expect(page.locator('.variant-options button')).toHaveCount(13);
  await expect(page.locator('.variant-summary')).toContainText('Morado transparente');
  await expect(page.locator('.r36s-reference')).toContainText('128 GB');
  await expect(page.locator('.r36s-feature')).toHaveCount(6);
  await expect(page.locator('.detail-copy .supplier-rating')).toContainText('20 valoraciones');
  await expect(page.locator('.r36s-reviews .supplier-rating')).toContainText('4,6');
  await expect(page.locator('.r36s-reviews .supplier-rating')).toContainText('plataforma del proveedor');
  await expect(page.locator('.r36s-reviews .review-card')).toHaveCount(0);
  await page.locator('.r36s-section-nav a[href="#r36s-controls"]').click();
  await expect(page.locator('.r36s-control-point')).toHaveCount(4);
  const names = ['Cruceta', 'Botones ABXY', 'Stick izquierdo', 'Stick derecho', 'Start', 'Select', 'FN', 'Encendido', 'Volumen'];
  for (const name of names) {
    const button = page.locator('.r36s-control-option').filter({ hasText: name });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.r36s-control-explanation h3')).toHaveText(name);
    const bounds = await button.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  for (const button of await page.locator('.r36s-control-point').all()) {
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
  await page.screenshot({ path: `test-results/r36s-controls-${width}.png` });
  await page.locator('.r36s-specifications summary').click();
  await expect(page.locator('.r36s-specifications')).toContainText('3,5 pulgadas');
  await expect(page.locator('.r36s-specifications')).toContainText('Plástico');
  await expect(page.locator('.r36s-specifications')).toContainText('Anunciada por el proveedor');
  await expect(page.locator('main')).not.toContainText(/15[.\s]?000|21 sistemas|Shenzhen Thtb|Chongqing|10 × 5 × 3|0,34 kg|Wired|\bOEM\b/);
  await expect(page.locator('#r36s-games')).toContainText('no confirman juegos preinstalados');
  for (const image of await page.locator('.r36s-details img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  await page.locator('#r36s-faq summary').filter({ hasText: '¿Qué juegos y sistemas incluye?' }).click();
  await expect(page.locator('#r36s-faq')).toContainText('no confirman juegos preinstalados');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.r36s-purchase-bar a').click();
  await expect(page.locator('#r36s-purchase')).toBeInViewport();
  await page.getByRole('button', { name: 'Añadir al carrito ↗' }).click();
  await expect(page).toHaveURL(/\/carrito$/);
  await expect(page.locator('.cart-line')).toContainText('R36S');
  await page.goto('/productos/r36s');
  await page.getByRole('link', { name: 'Abrir guía ArkOS' }).click();
  await expect(page).toHaveURL(/\/guia-configuracion$/);
  for (const handle of ['r36h', 'funda-silicona', 'estuche-transporte']) {
    await page.goto('/productos/' + handle);
    await expect(page.locator('.r36s-details')).toHaveCount(0);
  }
  expect(failures).toEqual([]);
});
