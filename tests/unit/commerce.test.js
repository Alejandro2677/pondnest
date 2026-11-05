import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import configuration from '../../config/product-variants.json' with { type: 'json' };
import { createCommerce, cartSnapshot, checkoutAddress } from '../../src/services/commerce.js';
import { createCommerce as shopify } from '../../server/shopify.js';
import { mapCatalog, localizeCart } from '../../server/catalog.js';
import { commerceHandler } from '../../server/api.js';
const env = { SHOPIFY_STORE_DOMAIN: 'fixture.myshopify.com', SHOPIFY_STOREFRONT_PRIVATE_TOKEN: 'private-fixture', SHOPIFY_API_VERSION: '2026-10' };
const price = { amount: '12.50', currencyCode: 'EUR' };
const gid = n => `gid://shopify/ProductVariant/${n}`;

test('all 24 options fail closed without a verified remote catalog; local content is preserved', () => {
  const products = mapCatalog([]);
  assert.equal(products.length, 4);
  assert.equal(products.flatMap(p => p.variants).length, 24);
  assert.ok(products.every(p => p.image && p.description && p.variants.every(v => !v.available && !v.mapped)));
});

test('server authenticates privately and cart unit price comes from cart cost', async () => {
  let headers;
  const service = shopify(env, async (_, options) => {
    headers = options.headers;
    return { ok: true, json: async () => ({ data: { cart: { id: 'gid://shopify/Cart/test', checkoutUrl: 'https://fixture.myshopify.com/checkouts/test', cost: { subtotalAmount: price }, lines: { nodes: [{ id: 'l', quantity: 1, cost: { amountPerQuantity: price, totalAmount: price }, merchandise: { id: gid(1), title: 'Variant', availableForSale: true, price: { ...price, amount: '999' }, product: { handle: 'x', title: 'X' } } }] } } } }) };
  });
  assert.deepEqual((await service.getCart('gid://shopify/Cart/test')).lines[0].price, price);
  assert.equal(headers['Shopify-Storefront-Private-Token'], env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN);
  assert.equal(headers['X-Shopify-Storefront-Access-Token'], undefined);
});

test('HTTP API exercises one variant of every product and a mixed Shopify cart by exact GID', async () => {
  const originals = Object.values(configuration.products).map(p => p.variants[0].shopifyVariantId);
  const entries = Object.entries(configuration.products);
  entries.forEach(([,p],i) => { p.variants[0].shopifyVariantId = gid(i + 1); });
  const remote = entries.map(([handle,p],i) => ({ handle, title: 'REMOTE NAME', description: 'REMOTE TEXT', productType: '', images: { nodes: [] }, variants: { nodes: [{ id: gid(i+1), title: 'REMOTE OPTION', availableForSale: true, price }], pageInfo: {} } }));
  let lines = [];
  const id = 'gid://shopify/Cart/fixture?key=fixture';
  const cart = () => ({ id, checkoutUrl: 'https://fixture.myshopify.com/checkouts/fixture', cost: { subtotalAmount: { ...price, amount: String(lines.reduce((n,l) => n+l.quantity*12.5,0)) } }, lines: { nodes: lines.map(l => ({ id: l.merchandiseId, quantity: l.quantity, cost: { amountPerQuantity: price, totalAmount: { ...price, amount: String(l.quantity*12.5) } }, merchandise: { id: l.merchandiseId, title: 'REMOTE OPTION', availableForSale: true, price, product: { handle: 'remote-handle', title: 'REMOTE NAME' } } })) } });
  const request = async (_, options) => {
    const { query, variables } = JSON.parse(options.body);
    let data;
    if (query.includes('products(first:')) data = { products: { nodes: remote, pageInfo: {} } };
    else if (query.includes('cartLinesAdd')) { lines.push(...variables.lines); data = { cartLinesAdd: { cart: cart(), userErrors: [], warnings: [] } }; }
    else if (query.includes('cartCreate')) data = { cartCreate: { cart: cart(), userErrors: [], warnings: [] } };
    else data = { cart: cart() };
    return { ok: true, json: async () => ({ data }) };
  };
  const server = http.createServer(commerceHandler(env, request));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const service = createCommerce({}, (url, opts) => fetch(`http://127.0.0.1:${server.address().port}${url}`, opts));
    const products = await service.getProducts();
    assert.ok(products.every(p => p.name !== 'REMOTE NAME' && p.variants[0].mapped));
    assert.equal((await service.createCart()).id, id);
    for (let i=0;i<4;i++) await service.addToCart(id, gid(i+1), i+1);
    const result = await service.getCart(id);
    assert.deepEqual(result.lines.map(l => [l.variantId,l.quantity]), [1,2,3,4].map(n => [gid(n),n]));
    assert.equal(result.subtotal.amount, '125');
    assert.ok(result.lines.every(l => l.mapped && l.image && l.name !== 'REMOTE NAME' && l.price.amount === '12.50'));
    assert.equal(result.checkoutUrl, null);
    assert.equal(result.summary.checkoutConnected, false);
    assert.throws(() => checkoutAddress(result), /desactivados/);
    assert.notEqual(cartSnapshot(result), cartSnapshot({ ...result, subtotal: { ...price, amount: '200' } }));
    await assert.rejects(service.addToCart(id, gid(9999), 1), /vínculo/);
    await assert.rejects(service.addToCart(id, gid(1), 0), /Cantidad/);
    assert.throws(() => checkoutAddress({ ...result, checkoutBlockedReason:undefined, lines: [{ ...result.lines[0], mapped: false }] }), /Revisa/);
    const unknown = localizeCart({ ...result, lines: [{ ...result.lines[0], variantId: gid(999) }] }, products);
    assert.equal(unknown.lines[0].available, false);
  } finally {
    await new Promise(resolve => server.close(resolve));
    entries.forEach(([,p],i) => { p.variants[0].shopifyVariantId = originals[i]; });
  }
});
