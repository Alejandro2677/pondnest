import { test, expect } from '../fixtures/preview-page.js';
import manifest from '../../src/data/product-images.generated.json' with { type: 'json' };

for (const width of [375, 1440]) test(`Protector product colors, content and cart at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().includes('/productos/protector/') && r.status() >= 400) errors.push(r.url()); });
  await page.goto('/productos/funda-silicona');
  await expect(page.locator('h1')).toHaveText('Funda protectora de silicona para R36S');
  await expect(page).toHaveTitle(/Funda protectora de silicona para R36S/);
  await expect(page.locator('.detail-copy')).toContainText('Protege tu consola de los pequeños accidentes del día a día sin renunciar a la comodidad al jugar.');
  await expect(page.locator('.variant-options button')).toHaveCount(4);
  await expect(page.locator('.variant-capacities, select')).toHaveCount(0);
  const main = page.locator('.gallery-main img');
  for (const [color, source, id] of [['Negro', 'negro', 'protector-black'], ['Blanco', 'blancop', 'protector-white'], ['Morado', 'lilap', 'protector-purple'], ['Verde', 'verdep', 'protector-green']]) {
    const option = page.locator('.variant-options').getByRole('button', { name: color, exact: true });
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.variant-selector')).toHaveAttribute('data-variant-id', id);
    await expect(page.locator('.variant-summary')).toHaveText('Selección: ' + color);
    const image = manifest.products['funda-silicona'].find(i => i.source === source);
    await expect(main).toHaveAttribute('src', '/' + image.src);
    await expect.poll(() => main.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
    await page.locator('.thumbnails button').nth(1).click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.variant-selector')).toHaveAttribute('data-variant-id', id);
    const bounds = await option.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator('.thumbnails button')).toHaveCount(9);
  for (const button of await page.locator('.thumbnails button').all()) {
    await button.click();
    await expect.poll(() => main.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  await page.locator('.gallery-main').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.protector-feature')).toHaveCount(4);
  await expect(page.locator('.protector-compatibility h2')).toHaveText('Compatible con R36S.');
  await expect(page.locator('.protector-package')).toContainText('1 funda protectora');
  await expect(page.locator('.protector-package')).toContainText('Consola no incluida');
  await page.locator('.protector-specifications summary').click();
  await expect(page.locator('.protector-spec-content')).toBeVisible();
  await expect(page.locator('.protector-spec-content')).toContainText('8,79 × 2,9 × 13,31 cm');
  await expect(page.locator('.protector-spec-content')).toContainText('TGS');
  await expect(page.locator('.protector-spec-content')).toContainText('R36S case');
  await expect(page.locator('.protector-shipping')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/200 g|150 g|impermeabilidad|MOQ|private mold/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/protector-product-${width}.png`, fullPage: true });
  await page.locator('.protector-purchase-bar a').click();
  await expect(page.locator('#protector-purchase')).toBeInViewport();
  await page.getByRole('button', { name: 'Añadir al carrito ↗' }).click();
  await expect(page).toHaveURL(/\/carrito$/);
  await expect(page.locator('.cart-line')).toContainText('Funda de silicona');
  await page.goto('/productos/r36s');
  const recommendation = page.locator('.protector-recommendation');
  await expect(recommendation).toContainText('Compra conjunta:');
  await expect(recommendation.getByRole('button', { name: 'A\u00f1adir consola y funda' })).toBeEnabled();
  await expect(page.locator('.variant-options button')).toHaveCount(13);
  const image = recommendation.locator('img');
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  await recommendation.screenshot({ path: `test-results/protector-recommendation-${width}.png` });
  await recommendation.getByRole('link', { name: 'Ver colores y detalles' }).click();
  await expect(page).toHaveURL(/\/productos\/funda-silicona$/);
  for (const handle of ['r36h', 'estuche-transporte']) {
    await page.goto('/productos/' + handle);
    await expect(page.locator('.protector-details, .protector-recommendation')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
