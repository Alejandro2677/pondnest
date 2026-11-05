import { test, expect } from '@playwright/test';
import { mkdir, writeFile, unlink } from 'node:fs/promises';

test('real R36S checkout diagnostic without order or payment', async ({ page, baseURL }) => {
  test.skip(process.env.PONDNEST_LIVE_CHECKOUT !== '1', 'Opt-in: uses a temporary real Shopify cart, never places an order.');
  test.setTimeout(90000);
  const report = { checkedAt: new Date().toISOString(), requests: [] };
  let cartId;
  async function call(operation, ...args) {
    const response = await fetch(`${baseURL}/api/commerce`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ operation, args }), signal: AbortSignal.timeout(20000) });
    const body = await response.json();
    if (!response.ok) throw Error(body.error || 'Commerce API failed');
    return body.result;
  }
  const routeType = pathname => /^\/(?:[a-z-]+\/)?cart\/c\//.test(pathname) ? 'cart/c' : /\/checkouts?\//.test(pathname) ? 'checkouts' : pathname;
  page.on('response', response => {
    if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) {
      const url = new URL(response.url());
      report.requests.push({ host: url.hostname, route: routeType(url.pathname), status: response.status() });
    }
  });
  try {
    const products = await call('getProducts');
    const r36s = products.find(p => p.handle === 'r36s');
    const variant = r36s?.variants.find(v => v.available && v.mapped && v.visualId === 'r36s-01');
    expect(Boolean(variant)).toBe(true);
    report.variantId = variant.id;
    report.catalogPrice = variant.price;
    await page.goto('/productos/r36s');
    await page.getByRole('button', { name: 'Añadir al carrito ↗', exact: true }).click();
    await expect(page).toHaveURL(/\/carrito$/);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pondnest:server-cart:v1')));
    cartId = saved.id;
    await mkdir('tmp', { recursive: true });
    await writeFile('tmp/checkout-test-cart.json', JSON.stringify({ id: cartId }));
    const cart = await call('getCart', cartId);
    expect(cart.lines[0].variantId).toBe(variant.id);
    expect(cart.lines[0].price).toEqual(variant.price);
    report.cartPrice = cart.lines[0].price;
    await page.locator('.order-summary').getByRole('button', { name: 'Continuar al pago' }).click();
    await expect(page).toHaveURL(/\/resumen-pedido$/);
    let preparedBody;
    await page.route('**/api/commerce', async route => {
      if (route.request().postDataJSON()?.operation !== 'prepareCheckout') return route.continue();
      const response = await route.fetch();
      preparedBody = await response.json();
      await route.fulfill({ response });
    });
    await page.locator('.order-summary').getByRole('button', { name: 'Continuar al pago' }).click();
    await expect.poll(() => Boolean(preparedBody)).toBe(true);
    if (preparedBody.error) throw Error(preparedBody.error);
    report.buyerCountry = preparedBody.result.buyerCountry;
    report.shopifyTotal = preparedBody.result.cost.totalAmount;
    report.checkoutUrlSource = 'fresh Shopify cart.checkoutUrl, unchanged';
    await page.waitForURL(url => !['localhost', '127.0.0.1'].includes(url.hostname), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('domcontentloaded');
    // Checkout hydrates asynchronously; wait for its payment section before inspecting.
    try { await page.getByRole('heading', { name: /^(Payment|Pago)$/i }).waitFor({ state: 'visible', timeout: 25000 }); } catch { /* Record a genuine external blocker below. */ }
    const addressField = page.getByRole('combobox', { name: 'Address', exact: true }).or(page.getByRole('textbox', { name: 'Address', exact: true }));
    if (process.env.PONDNEST_TEST_SHIPPING_ADDRESS === '1' && await addressField.count()) {
      try {
      // Public test destination only. No contact details, card data, or order submission.
      await addressField.fill('Calle Mayor 1', { timeout: 5000 });
      await page.getByRole('textbox', { name: 'Postal code', exact: true }).fill('28013', { timeout: 5000 });
      await page.getByRole('textbox', { name: 'City', exact: true }).fill('Madrid', { timeout: 5000 });
      const province = page.getByRole('combobox', { name: 'Province', exact: true });
      const madrid = await province.locator('option').filter({ hasText: /Madrid/ }).getAttribute('value');
      if (madrid) await province.selectOption(madrid);
      await page.getByRole('textbox', { name: 'City', exact: true }).press('Tab');
      report.shippingTestDestination = 'Public test address, Madrid 28013, Spain; no personal contact data';
      try { await expect.poll(async () => /(?:Free Shipping|Standard|Est[aá]ndar|no shipping|cannot be shipped|no se puede enviar)/i.test(await page.locator('body').innerText()), { timeout: 20000 }).toBe(true); } catch { report.shippingQuotePending = true; }
      } catch { report.shippingQuotePending = true; }
    }
    const final = new URL(page.url());
    report.finalHost = final.hostname;
    report.finalRoute = routeType(final.pathname);
    report.pageTitle = await page.title();
    report.pageLanguage = await page.locator('html').getAttribute('lang');
    const text = await page.locator('body').innerText();
    report.visibleText = text.slice(0, 2500);
    report.passwordBlocked = /\/password(?:\/|$)/.test(final.pathname) || /enter (?:store|using) password|introduce.*contrase[ñn]a/i.test(text);
    report.defaultCatalog = final.pathname === '/' || /\/collections(?:\/|$)/.test(final.pathname);
    report.paymentFormVisible = await page.locator('input[autocomplete="cc-number"], iframe[title*="card number" i], iframe[title*="número de tarjeta" i]').count() > 0 || /(?:credit card|tarjeta de cr[eé]dito|pago|payment)/i.test(text) && /(?:shipping address|direcci[oó]n de env[ií]o|delivery|entrega)/i.test(text);
    report.productVisible = /R36S/i.test(text);
    report.shippingInformationVisible = /(?:env[ií]o|shipping|entrega|delivery)/i.test(text);
    report.priceVisible = /59[,.]99/.test(text);
    const shippingStart = text.search(/Shipping method|Método de envío/i);
    report.shippingText = shippingStart >= 0 ? text.slice(shippingStart).split(/\n(?:Payment|Pago)\n/i)[0].trim().slice(0, 1000) : null;
    if (/Free Shipping|Standard|Est[aá]ndar/i.test(report.shippingText || '')) report.shippingQuotePending = false;
    report.status = report.paymentFormVisible && report.productVisible ? 'checkout-form-reached' : report.passwordBlocked ? 'password-blocked' : 'external-checkout-blocked-or-unavailable';
    await mkdir('artifacts/checkout-audit', { recursive: true });
    await page.screenshot({ path: 'artifacts/checkout-audit/shopify-checkout.png', fullPage: true });
    expect(report.defaultCatalog).toBe(false);
  } finally {
    if (cartId) {
      const current = await call('getCart', cartId);
      for (const line of current?.lines || []) await call('updateCart', cartId, line.id, 0);
      report.temporaryCartEmptied = true;
      await unlink('tmp/checkout-test-cart.json').catch(() => {});
    }
    await mkdir('artifacts/checkout-audit', { recursive: true });
    await writeFile('artifacts/checkout-audit/report.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, finalRoute: report.finalRoute, buyerCountry: report.buyerCountry, total: report.shopifyTotal, paymentFormVisible: report.paymentFormVisible, defaultCatalog: report.defaultCatalog, temporaryCartEmptied: report.temporaryCartEmptied }));
  }
});
