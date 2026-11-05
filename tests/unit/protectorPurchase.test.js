import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAddProtectorTogether } from '../../src/data/protectorProduct.js';

test('joint purchase requires real mapping, purchasable variants and configured prices in the same currency', () => {
  const consoleVariant = { id: 'test-console-variant', available: true, price: { amount: '50', currencyCode: 'EUR' } };
  const protectorVariant = { id: 'test-protector-variant', available: true, price: { amount: '5', currencyCode: 'EUR' } };
  const ready = { demo: false, consoleProduct: { demo: false, variants: [consoleVariant] }, product: { demo: false, variants: [protectorVariant] }, consoleVariant, protectorVariant, reference: { shopifyVariantId: protectorVariant.id } };
  assert.equal(canAddProtectorTogether(ready), true);
  assert.equal(canAddProtectorTogether({ ...ready, demo: true }), false);
  assert.equal(canAddProtectorTogether({ ...ready, reference: { shopifyVariantId: null } }), false);
  assert.equal(canAddProtectorTogether({ ...ready, reference: { shopifyVariantId: 'different-variant' } }), false);
  assert.equal(canAddProtectorTogether({ ...ready, protectorVariant: { ...protectorVariant, available: false } }), false);
  assert.equal(canAddProtectorTogether({ ...ready, consoleVariant: { ...consoleVariant, price: null } }), false);
  assert.equal(canAddProtectorTogether({ ...ready, product: { demo: false, variants: [] } }), false);
  assert.equal(canAddProtectorTogether({ ...ready, protectorVariant: { ...protectorVariant, price: { amount: '5', currencyCode: 'USD' } } }), false);
});
