import { test, expect } from '@playwright/test';
import config from '../../config/cart-summary.json' with { type: 'json' };
import { orderSummary } from '../../src/services/orderSummary.js';
const money = amount => ({ amount: String(amount), currencyCode: 'EUR' });
const line = (id, price, quantity = 1) => ({ id, variantId: id, handle: id, name: id === 'console' ? 'Consola PondNest' : 'Estuche de transporte', variant: 'Morado · 64 GB', quantity, price: money(price), subtotal: money(price * quantity), total: money(price * quantity), available: true, mapped: true });
async function setup(page, { free = false, empty = false, discounted = false } = {}) {
  let lines = empty ? [] : [line('console', 121), line('bag', 12.1, 2)];
  let changed = false;
  const snapshot = () => {
    const original = lines.reduce((n, l) => n + Number(l.subtotal.amount), 0);
    const discount = discounted ? 12.1 : 0;
    const c = { id: 'gid://shopify/Cart/summary-fixture', checkoutUrl: 'https://fixture.myshopify.com/checkouts/test', lines, subtotal: money(original), cost: { totalAmount: money(original - discount + (free ? 0 : 4) + (changed ? 1 : 0)), totalAmountEstimated: true }, discountAllocations: discounted ? [{ targetType: 'LINE_ITEM', discountedAmount: money(discount) }] : [], deliveryGroups: [{ deliveryAddress: { countryCodeV2: 'ES', zip: '28001' }, selectedDeliveryOption: { estimatedCost: money(4) }, discountAllocations: free ? [{ discountedAmount: money(4) }] : [] }] };
    return { ...c, summary: orderSummary(c, config) };
  };
  await page.addInitScript(() => localStorage.setItem('pondnest:server-cart:v1', JSON.stringify({ id: 'gid://shopify/Cart/summary-fixture' })));
  await page.route('**/api/commerce', async route => {
    const { operation, args } = route.request().postDataJSON();
    if (operation === 'getProducts') return route.fulfill({ json: { result: [] } });
    if (operation === 'updateCart') lines = lines.flatMap(l => l.id !== args[1] ? [l] : args[2] ? [line(l.id, Number(l.price.amount), args[2])] : []);
    return route.fulfill({ json: { result: snapshot() } });
  });
  return () => { changed = true; };
}
for (const width of [375, 1440]) {
  test(`summary is readable and responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await setup(page, { free: true, discounted: true });
    await page.goto('/carrito');
    const summary = page.locator('.order-summary');
    await expect(summary).toContainText('Promoción de envío gratis aplicada');
    await expect(summary.locator('del')).toContainText('4,00');
    await expect(summary.locator('.order-summary-total')).toContainText('133,10');
    await expect(summary).toContainText('Desglose fiscal provisional');
    await expect(summary.getByRole('link', { name: 'Política de envíos' })).toHaveAttribute('href', '/envios');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await summary.screenshot({ path: `test-results/summary-${width}.png` });
    await page.getByRole('button', { name: 'Aumentar cantidad de Consola PondNest' }).click();
    await expect(summary.locator('.order-summary-total')).toContainText('254,10');
    await page.getByRole('button', { name: 'Quitar', exact: true }).first().click();
    await expect(summary.locator('.order-summary-products li')).toHaveCount(1);
  });
}
test('ordinary shipping, changed Shopify total requires review, empty cart', async ({ page }) => {
  const change = await setup(page);
  await page.goto('/resumen-pedido');
  const summary = page.locator('.order-summary');
  await expect(summary).toBeVisible();
  await expect(summary).not.toContainText('GRATIS');
  await expect(summary.locator('.order-summary-total')).toContainText('149,20');
  change();
  await summary.getByRole('button', { name: 'Continuar al pago' }).click();
  await expect(page.locator('p[role=status]')).toContainText('Revisa el resumen actualizado');
  await expect(summary.locator('.order-summary-total')).toContainText('150,20');
  await expect(page).toHaveURL(/resumen-pedido/);
  await page.getByRole('button', { name: 'Quitar', exact: true }).first().click();
  await page.getByRole('button', { name: 'Quitar', exact: true }).first().click();
  await expect(page.getByText('Todavía no has añadido productos.')).toBeVisible();
  await expect(summary).toHaveCount(0);
});
test('unknown shipping and tax do not invent costs or savings', async ({ page }) => {
  await setup(page);
  await page.route('**/api/commerce', async route => {
    if (route.request().postDataJSON().operation === 'getProducts') return route.fulfill({ json: { result: [] } });
    const c = { id: 'gid://shopify/Cart/summary-fixture', lines: [line('console', 121)], subtotal: money(121) };
    return route.fulfill({ json: { result: { ...c, summary: orderSummary(c, config) } } });
  });
  await page.goto('/carrito');
  await expect(page.locator('.order-summary')).toContainText('El envío está pendiente');
  await expect(page.locator('.order-summary')).not.toContainText('Pago seguro mediante Shopify');
  await expect(page.locator('.order-summary')).not.toContainText('GRATIS');
  await expect(page.getByRole('button', { name: 'Continuar al pago' })).toBeDisabled();
});
