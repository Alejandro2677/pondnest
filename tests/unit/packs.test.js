import test from 'node:test';
import assert from 'node:assert/strict';
import configuration from '../../config/product-variants.json' with { type: 'json' };
import { demoProducts } from '../../src/data/products.js';
import { packs, packOptions, packLine, restorePacks, withDemoPacks } from '../../src/services/packs.js';
import { checkoutAddress } from '../../src/services/commerce.js';
const products = demoProducts.map(p => ({ ...p, variants: configuration.products[p.handle].variants.filter(v => v.shopifyVariantId).map(v => ({ id: v.shopifyVariantId, visualId: v.id, mapped: true, available: true })) }));
const selection = Object.fromEntries(products.map(p => [p.handle, packOptions(p)[0]?.id]));

test('packs have exact proposed prices and compositions, one billable line each', () => {
  assert.deepEqual(packs.map(p => [p.priceCents,p.handles.length]), [[7500,2],[8000,3],[15000,4]]);
  for (const pack of packs) {
    const line = packLine(pack.id, selection, products);
    assert.deepEqual(line.components.map(c => c.handle), pack.handles);
    const cart = withDemoPacks({ lines: [], subtotal: null }, [line]);
    assert.equal(cart.lines.length,1); assert.equal(cart.summary.total,pack.priceCents);
    assert.equal(cart.summary.productDiscount,0); assert.equal(cart.summary.pendingShipping,true);
    assert.equal(cart.summary.checkoutConnected,false); assert.equal(cart.summary.taxSource,'provisional');
    assert.equal(cart.summary.base + cart.summary.tax,pack.priceCents);
    assert.throws(() => checkoutAddress(cart), /packs de demostración/);
  }
});
test('unavailable, unverified and nonexistent variants cannot enter a pack', () => {
  const unavailable = products.map(p => ({ ...p, variants: p.variants.map(v => ({...v, available:false})) }));
  assert.equal(packOptions(unavailable[0]).length,0);
  assert.throws(() => packLine('esencial',selection,unavailable), /no está disponible/);
  assert.throws(() => packLine('esencial',{...selection,r36s:'invented'},products), /no está disponible/);
  const unmapped = products.map(p => ({...p, variants:p.variants.map(v=>({...v,mapped:false}))}));
  assert.throws(() => packLine('esencial',selection,unmapped), /no está disponible/);
});
test('restoration ignores stored prices, merges identical compositions and validates quantity', () => {
  const line = packLine('proteccion-total',selection,products,2);
  const saved = {...line,price:{amount:'0',currencyCode:'EUR'},total:{amount:'0',currencyCode:'EUR'}};
  const restored = restorePacks([saved,saved],products);
  assert.equal(restored.length,1); assert.equal(restored[0].quantity,4); assert.equal(restored[0].total.amount,'320.00');
  assert.deepEqual(restorePacks([{...line,quantity:-1}],products),[]);
  assert.throws(() => packLine('esencial',selection,products,100), /cantidad/);
});
test('mixed cart preserves real lines, counts packs once and never reuses incomplete shipping quote', () => {
  const real = { id:'real',quantity:1,price:{amount:'10.00',currencyCode:'EUR'},subtotal:{amount:'10.00',currencyCode:'EUR'},total:{amount:'10.00',currencyCode:'EUR'} };
  const cart = withDemoPacks({lines:[real],subtotal:real.total,summary:{total:1000,shipping:0,checkoutConnected:true}},[packLine('esencial',selection,products,2)]);
  assert.equal(cart.lines.length,2); assert.equal(cart.summary.total,16000);
  assert.equal(cart.summary.shipping,null); assert.equal(cart.summary.savings,0);
});
