import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { demoProducts } from '../../src/data/products.js';
import { getProductVariants, selectedProductVariant, variantGallery, variantImage, optionVariant } from '../../src/data/productVariants.js';

test('visual references have exact counts, unique IDs and real product-specific images', () => {
  const counts = { r36s: 13, r36h: 6, 'funda-silicona': 4, 'estuche-transporte': 1 };
  for (const product of demoProducts) {
    const config = getProductVariants(product);
    assert.equal(config.variants.length, counts[product.handle]);
    assert.equal(new Set(config.variants.map(v => v.id)).size, config.variants.length);
    for (const v of config.variants) {
      assert.equal(v.productId, product.handle);
      if (v.shopifyVariantId !== null) assert.match(v.shopifyVariantId, /^gid:\/\/shopify\/ProductVariant\/\d+$/);
      assert.equal(v.availability, 'unverified');
      const image = variantImage(product, v);
      assert.ok(image, v.primaryImage);
      assert.ok(fs.existsSync('public/' + image.src.slice(1)));
    }
  }
});

test('R36S defaults to purple and keeps all general photos without duplicating them', () => {
  const product = demoProducts.find(p => p.handle === 'r36s');
  const selected = selectedProductVariant(getProductVariants(product), 'invalid-id');
  assert.equal(selected.primaryImage, 'morado');
  const gallery = variantGallery(product, selected);
  assert.equal(gallery.imageDetails[0].source, 'morado');
  assert.ok(gallery.imageDetails.some(i => i.source === 'portada'));
  assert.equal(new Set(gallery.gallery).size, product.gallery.length);
});

test('R36H preserves the other dimension and rejects absent combinations', () => {
  const product = demoProducts.find(p => p.handle === 'r36h');
  const config = getProductVariants(product);
  const selected = selectedProductVariant(config);
  const larger = optionVariant(config, selected, 'capacity', '128 GB');
  assert.equal(larger.color, selected.color);
  const black = optionVariant(config, larger, 'color', 'Negro transparente');
  assert.equal(black.capacity, '128 GB');
  const limited = { ...config, variants: config.variants.filter(v => v.id !== black.id) };
  assert.equal(optionVariant(limited, larger, 'color', 'Negro transparente'), undefined);
});

test('live mode requires an explicit real Shopify mapping and available catalog entry', () => {
  const product = demoProducts.find(p => p.handle === 'r36h');
  assert.deepEqual(getProductVariants(product, 'live').variants, []);
});
