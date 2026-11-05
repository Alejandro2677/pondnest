import { orderSummary } from '../../src/services/orderSummary.js';
import summaryConfig from '../../config/cart-summary.json' with { type: 'json' };
import { test, expect } from '@playwright/test';
import configuration from '../../config/product-variants.json' with { type: 'json' };
import { mapCatalog, localizeCart } from '../../server/catalog.js';
const entries = Object.entries(configuration.products);
entries.forEach(([,p],i) => { p.variants.find(v => v.id === p.defaultVariantId).shopifyVariantId = `gid://shopify/ProductVariant/${i+1}`; });
const price = { amount: '10.00', currencyCode: 'EUR' };
const products = mapCatalog(entries.map(([handle,p],i) => ({ handle, variants: [{ id: p.variants.find(v => v.id === p.defaultVariantId).shopifyVariantId, available: true, price }] })));

test('four products: Pagar opens local summary; changed prices require review; second action uses same Shopify checkout', async ({ page }) => {
  let lines = [];
  let changed = false;
  let checkoutVisits = 0;
  const cartId = 'gid://shopify/Cart/browser-fixture?key=fixture';
  const checkoutUrl = 'https://fixture.myshopify.com/checkouts/same-cart';
  const calls = [];
  function cart() {
    const amount = changed ? 11 : 10;
    const c = localizeCart({ id: cartId, checkoutUrl, subtotal: { ...price, amount: String(lines.reduce((n,l) => n+l.quantity*amount,0)) }, lines: lines.map(l => ({ ...l, price: { ...price, amount: String(amount) }, total: { ...price, amount: String(amount*l.quantity) }, available: true })) }, products);
    c.summary = { ...orderSummary(c, summaryConfig), checkoutConnected: true };
    return c;
  }
  await page.route('**/api/commerce', async route => {
    const { operation, args } = route.request().postDataJSON(); calls.push({ operation,args });
    let result;
    if (operation === 'getProducts') result = products;
    else if (operation === 'createCart') result = cart();
    else if (operation === 'addToCart') {
      expect(args[0]).toBe(cartId);
      lines.push({ id: `line-${lines.length}`, variantId: args[1], quantity: args[2] }); result = cart();
    } else if (['getCart', 'prepareCheckout'].includes(operation)) result = cart();
    else throw Error('Unexpected operation ' + operation);
    await route.fulfill({ json: { result } });
  });
  await page.route('https://fixture.myshopify.com/**', async route => { checkoutVisits++; await route.fulfill({ contentType: 'text/html', body: '<h1>Simulated Shopify checkout</h1>' }); });
  for (let i=0;i<4;i++) {
    await page.goto(`/productos/${entries[i][0]}`);
    await page.getByLabel('Cantidad', { exact: true }).fill(String(i+1));
    await page.getByRole('button', { name: 'Añadir al carrito ↗', exact: true }).click();
    await expect(page).toHaveURL(/\/carrito$/);
  }
  expect(lines.map(l => [l.variantId,l.quantity])).toEqual([1,2,3,4].map(n => [`gid://shopify/ProductVariant/${n}`,n]));
  await page.getByRole('button', { name: 'Continuar al pago', exact: true }).click();
  await expect(page).toHaveURL(/\/resumen-pedido$/);
  expect(checkoutVisits).toBe(0);
  await expect(page.locator('.cart-line')).toHaveCount(4);
  await expect(page.locator('.order-summary-total dd')).toHaveText('100,00 €');
  for (const p of products) await expect(page.locator('.cart-line').getByRole('heading', { name: p.name, exact: true })).toBeVisible();
  changed = true;
  await page.getByRole('button', { name: 'Continuar al pago', exact: true }).click();
  await expect(page).toHaveURL(/\/resumen-pedido$/);
  await expect(page.getByRole('status').filter({ hasText: 'Han cambiado' })).toBeVisible();
  await expect(page.locator('.order-summary-total dd')).toHaveText('110,00 €');
  expect(checkoutVisits).toBe(0);
  await page.getByRole('button', { name: 'Continuar al pago', exact: true }).click();
  await expect(page).toHaveURL(checkoutUrl);
  expect(checkoutVisits).toBe(1);
  expect(calls.filter(c => c.operation === 'getCart').every(c => c.args[0] === cartId)).toBe(true);
});

test('unmapped visual option cannot be purchased', async ({ page }) => {
  await page.route('**/api/commerce', route => route.fulfill({ json: { result: products } }));
  await page.goto('/productos/r36s');
  await page.getByRole('button', { name: 'Blanco', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pendiente de vincular con Shopify', exact: true })).toBeDisabled();
});
