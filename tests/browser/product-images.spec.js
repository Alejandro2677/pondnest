import { test, expect } from '@playwright/test';
import manifest from '../../src/data/product-images.generated.json' with { type: 'json' };
import configuration from '../../config/product-variants.json' with { type: 'json' };

for (const width of [375, 1440]) {
  test(`Local product galleries work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const failures = [];
    page.on('response', response => { if (response.url().includes('/_optimized/') && response.status() >= 400) failures.push(response.url()); });
    for (const [handle, originals] of Object.entries(manifest.products)) {
      const config = configuration.products[handle];
      const initial = config.variants.find(v => v.id === config.defaultVariantId);
      const preferred = [initial.primaryImage, ...initial.additionalImages];
      const images = [...preferred.map(source => originals.find(i => i.source === source)), ...originals.filter(i => !preferred.includes(i.source))];
      await page.goto(`/productos/${handle}`);
      const main = page.locator('.gallery-main img');
      await expect(main).toHaveAttribute('src', '/' + images[0].src);
      await expect.poll(() => main.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(page.locator('.thumbnails button')).toHaveCount(images.length);
      for (let i = 0; i < images.length; i++) {
        await page.locator('.thumbnails button').nth(i).click();
        await expect.poll(() => main.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      }
      await page.locator('.thumbnails button').first().click();
      await page.locator('.gallery > .gallery-controls').getByRole('button', { name: 'Fotografía siguiente' }).click();
      await expect(main).toHaveAttribute('src', '/' + images[1].src);
      await page.locator('.thumbnails button').nth(2).click();
      await expect(main).toHaveAttribute('src', '/' + images[2].src);
      if (width === 375) {
        await page.locator('.gallery-main').evaluate(element => {
          element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [new Touch({ identifier: 1, target: element, clientX: 260, clientY: 100 })] }));
          element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: element, clientX: 80, clientY: 100 })] }));
        });
        await expect(main).toHaveAttribute('src', '/' + images[3].src);
      }
      await page.locator('.gallery-main').click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Zoom 2×' }).click();
      await expect(page.locator('.gallery-zoom-area')).toHaveClass(/is-zoomed/);
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.gallery-zoom-area')).not.toHaveClass(/is-zoomed/);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(page.locator('.gallery-main')).toBeFocused();
      await expect.poll(() => main.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/gallery-${handle}-${width}.png`, fullPage: true });
    }
    await page.goto('/productos');
    for (const [handle, images] of Object.entries(manifest.products)) {
      const img = page.locator(`.product-card[href="/productos/${handle}"] img`);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveAttribute('src', '/' + images[0].src);
      await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
    }
    expect(failures).toEqual([]);
  });
}
