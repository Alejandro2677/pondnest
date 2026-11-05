import { loadEnv } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createCommerce } from '../server/shopify.js';
import { cents } from '../src/services/orderSummary.js';
import { localizePackCart } from '../server/packs.js';

// Creates disposable carts only. Never creates orders, enters customer data or submits payments.
const env = {...loadEnv('development',process.cwd(),''),...process.env};
if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) throw Error('Missing Storefront configuration.');
const audit = JSON.parse(await readFile('SHOPIFY_PACKS_AUDIT.json','utf8'));
if (Date.now() - Date.parse(audit.checkedAt) > 15 * 60 * 1000) throw Error('Run the pack audit again before testing.');
const service = createCommerce(env);
const results = [];
for (const pack of audit.pondnestMapping) {
  const product = audit.bundleProducts.find(p => p.id === pack.productId);
  if (!product) continue;
  const candidates = [pack.variants[0]?.id || product.variants[0].id, product.variants.at(-1).id];
  for (const variantId of [...new Set(candidates)]) {
    const variant = product.variants.find(v => v.id === variantId);
    const empty = await service.createCart();
    let active = empty;
    try {
      active = await service.addToCart(empty.id,variantId,1);
      assert.equal(active.lines.length,1,'Shopify must return one grouped parent, not independent billable components.');
      assert.equal(active.lines[0].variantId,variantId);
      assert.equal(cents(active.subtotal),cents(variant.price));
      const fresh = await service.prepareCheckout(active.id);
      assert.equal(cents(fresh.subtotal),cents(variant.price));
      assert.equal(cents(fresh.cost.totalAmount),cents(variant.price));
      assert.equal(fresh.lines[0].components.length,variant.components.nodes.length);
      const expected = variant.components.nodes.map(c=>`${c.productVariant.id}:${c.quantity}`).sort();
      assert.deepEqual(fresh.lines[0].components.map(c=>`${c.variantId}:${c.quantity}`).sort(),expected);
      const mapped = localizePackCart(fresh,audit.pondnestMapping);
      if (pack.variants.some(v=>v.id===variantId)) {
        assert.equal(mapped.lines[0].mapped,true);
        assert.equal(mapped.checkoutUrl,null,'Unverified AutoDS fulfillment must block checkout in PondNest.');
        const doubled = await service.updateCart(active.id,active.lines[0].id,2);
        active = doubled;
        assert.equal(cents(doubled.subtotal),2*cents(variant.price));
        assert.equal(localizePackCart(doubled,audit.pondnestMapping).lines[0].mapped,true);
      }
      results.push({packId:pack.id,variantId,componentCount:fresh.lines[0].components.length,price:variant.price,cartSubtotal:fresh.subtotal,cartTotal:fresh.cost.totalAmount,
        groupedParent:true,componentIdsAndQuantitiesMatch:true,freshCheckoutUrlReturned:Boolean(fresh.checkoutUrl),
        checkoutPageInspected:false,paymentTestModeVerified:false,orderCreated:false,paymentSubmitted:false});
    } finally {
      for (const line of active.lines) await service.updateCart(active.id,line.id,0);
    }
  }
}
const report = {checkedAt:new Date().toISOString(),scope:'Disposable Storefront carts only; no checkout-page or payment verification.',results,fulfillmentVerified:false,commercialActivation:false};
await writeFile('SHOPIFY_PACK_CART_TESTS.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
