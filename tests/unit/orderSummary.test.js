import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../../config/cart-summary.json' with { type: 'json' };
import { cents, orderSummary } from '../../src/services/orderSummary.js';
import { cartSnapshot } from '../../src/services/commerce.js';
const money = amount => ({ amount: String(amount), currencyCode: 'EUR' });
const line = (price = '121.00', quantity = 1, total = Number(price) * quantity, handle = 'console') => ({ id: handle, handle, quantity, price: money(price), subtotal: money(Number(price) * quantity), total: money(total) });
const cart = (lines = [line()], extras = {}) => ({ lines, subtotal: money(lines.reduce((n, l) => n + Number(l.subtotal.amount), 0)), ...extras });
const group = (shipping = '4.00', discount = '0.00', zip = '28001') => ({ deliveryAddress: { countryCodeV2: 'ES', zip }, selectedDeliveryOption: { estimatedCost: money(shipping) }, discountAllocations: [{ discountedAmount: money(discount) }] });

test('decimal amounts round half up without floating-point arithmetic', () => {
  assert.equal(cents('1.005'), 101); assert.equal(cents('0.29'), 29); assert.equal(cents(null), null);
});
test('one product includes 21% VAT; it is extracted, never added', () => {
  const s = orderSummary(cart(), config);
  assert.equal(s.total, 12100); assert.equal(s.tax, 2100); assert.equal(s.base, 10000);
  assert.equal(s.taxSource, 'provisional'); assert.equal(s.pendingShipping, true);
});
test('mixed products, quantities, variants and removals are recalculated', () => {
  for (const [lines, expected] of [[[line()], 12100], [[line(), line('12.10', 3, 36.3, 'bag')], 15730], [[line('242.00', 2)], 48400], [[], 0]]) {
    assert.equal(orderSummary(cart(lines), config).total, expected);
  }
});
test('real Shopify shipping promotion discounts shipping once', () => {
  const s = orderSummary(cart([line()], { deliveryGroups: [group('4', '4')], cost: { totalAmount: money('121') } }), config);
  assert.equal(s.shipping, 400); assert.equal(s.shippingDiscount, 400); assert.equal(s.netShipping, 0); assert.equal(s.total, 12100); assert.equal(s.savings, 400);
});
test('ordinary and partial discounted shipping; no invented strike-through on a zero rate', () => {
  assert.equal(orderSummary(cart([line()], { deliveryGroups: [group()] }), config).total, 12500);
  const partial = orderSummary(cart([line()], { deliveryGroups: [group('4', '1')] }), config);
  assert.equal(partial.total, 12400); assert.equal(partial.savings, 100);
  assert.equal(orderSummary(cart([line()], { deliveryGroups: [group('0', '0')] }), config).shippingDiscount, 0);
});
test('configuration promotion requires verified rate, address, eligibility and verified Shopify rule', () => {
  const c = structuredClone(config); c.shipping.realRateVerified = true;
  c.shipping.promotion = { enabled: true, shopifyVerified: true, minimumSubtotal: '100', startsAt: '2026-01-01', endsAt: '2027-01-01' };
  const input = cart([line()], { deliveryGroups: [{ deliveryAddress: { countryCodeV2: 'ES', zip: '28001' } }] });
  const now = Date.parse('2026-11-05');
  assert.equal(orderSummary(input, c, now).shippingDiscount, 400);
  c.shipping.promotion.enabled = false;
  assert.equal(orderSummary(input, c, now).shippingDiscount, 0);
  c.shipping.promotion.enabled = true; c.shipping.promotion.minimumSubtotal = '200';
  assert.equal(orderSummary(input, c, now).shippingDiscount, 0);
  c.shipping.promotion.minimumSubtotal = '0'; c.shipping.realRateVerified = false;
  assert.equal(orderSummary(input, c, now).shipping, null);
  c.shipping.realRateVerified = true;
  assert.equal(orderSummary(cart(), c, now).shipping, null);
  assert.equal(orderSummary(input, c, Date.parse('2027-02-01')).shippingDiscount, 0);
  c.shipping.promotion.shopifyVerified = false;
  assert.equal(orderSummary(input, c, now).shippingDiscount, 0);
});
test('line and cart discounts are not subtracted twice, taxes use discounted prices', () => {
  const s = orderSummary(cart([line('121', 2, 217.8)], { discountAllocations: [{ targetType: 'LINE_ITEM', discountedAmount: money('24.20') }], cost: { totalAmount: money('193.60') } }), config);
  assert.equal(s.subtotal, 24200); assert.equal(s.productDiscount, 4840); assert.equal(s.total, 19360); assert.equal(s.tax, 3360); assert.equal(s.base, 16000);
});
test('per-product tax rates, unknown destinations and non-IVA territories', () => {
  const c = structuredClone(config); c.tax.productRatesByCountry = { book: { ES: 400 } };
  const s = orderSummary(cart([line(), line('104', 1, 104, 'book')]), c);
  assert.equal(s.tax, 2500); assert.equal(s.base, 20000);
  for (const zip of ['35001', '38001', '51001', '52001']) assert.equal(orderSummary(cart([line()], { deliveryGroups: [group('4', '0', zip)] }), c).tax, null);
  assert.equal(orderSummary(cart([line()], { deliveryGroups: [{ deliveryAddress: { countryCodeV2: 'US', zip: '10001' } }] }), c).tax, null);
});
test('Shopify is authoritative, changes in total/shipping/taxes trigger another review', () => {
  const input = cart([line()], { deliveryGroups: [group()], cost: { totalAmount: money('126'), totalAmountEstimated: false, totalTaxAmount: money('22') }, checkoutUrl: 'https://fixture.myshopify.com/checkouts/test' });
  const c = structuredClone(config); c.tax.verified = true;
  const s = orderSummary(input, c);
  assert.equal(s.total, 12600); assert.equal(s.tax, 2200); assert.equal(s.base, 10400); assert.equal(s.taxSource, 'shopify');
  assert.notEqual(cartSnapshot({ ...input, summary: s }), cartSnapshot({ ...input, summary: { ...s, total: 12700 } }));
});
test('split shipments are summed and missing selection stays pending', () => {
  assert.equal(orderSummary(cart([line()], { deliveryGroups: [group(), group('3', '1')] }), config).netShipping, 600);
  assert.equal(orderSummary(cart([line()], { deliveryGroups: [group(), { deliveryAddress: { countryCodeV2: 'ES', zip: '28001' } }] }), config).pendingShipping, true);
});
