import { test, expect } from '@playwright/test';
import configuration from '../../config/product-variants.json' with { type: 'json' };
import manifest from '../../src/data/product-images.generated.json' with { type: 'json' };

for (const width of [375, 1440]) test(`Visual variants at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const broken = [];
  page.on('response', r => { if (r.url().includes('/_optimized/') && r.status() >= 400) broken.push(r.url()); });
  for (const handle of ['r36s', 'r36h', 'funda-silicona']) {
    await page.goto('/productos/' + handle);
    const config = configuration.products[handle];
    const selector = page.locator('.variant-selector');
    const main = page.locator('.gallery-main img');
    const initial = config.variants.find(v => v.id === config.defaultVariantId);
    await expect(selector).toHaveAttribute('data-variant-id', initial.id);
    await expect(page.locator('.variant-options button')).toHaveCount(handle === 'r36s' ? 13 : handle === 'r36h' ? 3 : 4);
    for (const variant of config.variants) {
      await page.locator('.variant-options').getByRole('button', { name: handle === 'r36s' ? variant.name : variant.color, exact: true }).click();
      if (variant.capacity) await page.locator('.variant-capacities').getByRole('button', { name: variant.capacity, exact: true }).click();
      await expect(selector).toHaveAttribute('data-variant-id', variant.id);
      await expect(page.locator('.variant-summary')).toHaveText('Selección: ' + variant.name);
      const image = manifest.products[handle].find(i => i.source === variant.primaryImage);
      await expect(main).toHaveAttribute('src', '/' + image.src);
      await expect.poll(() => main.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
      await page.locator('.thumbnails button').nth(1).click();
      await expect(selector).toHaveAttribute('data-variant-id', variant.id);
      await expect(page.locator('.variant-options button[aria-pressed="true"]')).toHaveCount(1);
      await page.locator('.thumbnails button').first().click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.thumbnails button').first().click();
    await expect.poll(() => main.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: `test-results/variants-${handle}-${width}.png`, fullPage: true });
  }
  await page.goto('/productos/estuche-transporte');
  await expect(page.locator('.variant-selector')).toHaveCount(0);
  await expect(page.locator('select')).toHaveCount(0);
  await expect(page.locator('.thumbnails button')).toHaveCount(4);
  expect(broken).toEqual([]);
});
