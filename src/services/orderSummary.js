// Monetary calculations use integer minor units, with decimal parsing and half-up rounding.
export function cents(value) {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value?.amount ?? value ?? ''));
  if (!match) return null;
  const fraction = (match[2] || '').padEnd(3, '0');
  const result = BigInt(match[1]) * 100n + BigInt(fraction.slice(0, 2)) + (fraction[2] >= '5' ? 1n : 0n);
  return result <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(result) : null;
}
const roundRatio = (amount, numerator, denominator) => Number((BigInt(amount) * BigInt(numerator) + BigInt(denominator) / 2n) / BigInt(denominator));
const sum = values => values.some(v => v === null) ? null : values.reduce((a, b) => a + b, 0);
const allocations = (items, currency) => sum((items || []).map(d => d.discountedAmount?.currencyCode === currency ? cents(d.discountedAmount) : null));

export function orderSummary(cart, config, now = Date.now()) {
  const currency = cart.cost?.totalAmount?.currencyCode || cart.subtotal?.currencyCode || 'EUR';
  const amount = value => value?.currencyCode === currency ? cents(value) : null;
  const lines = cart.lines || [];
  const grossLines = lines.map(l => amount(l.subtotal) ?? (amount(l.price) === null ? null : amount(l.price) * l.quantity));
  const netLines = lines.map(l => amount(l.total));
  const subtotal = sum(grossLines);
  const lineNet = sum(netLines);
  const lineDiscount = subtotal !== null && lineNet !== null ? Math.max(0, subtotal - lineNet) : null;
  // Line discounts are already reflected in totalAmount; cart discounts are a separate layer.
  const cartDiscount = allocations((cart.discountAllocations || []).filter(d => d.targetType !== 'SHIPPING_LINE'), currency);
  const productDiscount = lineDiscount === null || cartDiscount === null ? null : lineDiscount + cartDiscount;
  const products = lineNet === null || cartDiscount === null ? null : Math.max(0, lineNet - cartDiscount);
  const groups = cart.deliveryGroups || [];
  const destinations = groups.map(g => g.deliveryAddress);
  const addressReady = groups.length > 0 && destinations.every(d => d?.countryCodeV2 && d?.zip);
  let shipping = null, shippingDiscount = 0, shippingSource = null;
  if (addressReady && groups.every(g => g.selectedDeliveryOption)) {
    shipping = sum(groups.map(g => amount(g.selectedDeliveryOption.estimatedCost)));
    shippingDiscount = allocations(groups.flatMap(g => g.discountAllocations || []), currency);
    shippingSource = 'shopify';
  } else if (!cart.cost?.totalAmount && addressReady && groups.length === 1 && config.shipping.realRateVerified && currency === config.shipping.currencyCode && destinations.every(d => config.shipping.countries.includes(d.countryCodeV2) && !config.shipping.excludedPostalPrefixes.some(p => d.zip.startsWith(p)))) {
    shipping = cents(config.shipping.standardAmount);
    const promo = config.shipping.promotion;
    const eligible = promo.enabled && promo.shopifyVerified && products !== null && products >= cents(promo.minimumSubtotal) && (!promo.startsAt || now >= Date.parse(promo.startsAt)) && (!promo.endsAt || now < Date.parse(promo.endsAt));
    shippingDiscount = eligible ? shipping : 0;
    shippingSource = 'configuration';
  }
  if (shipping !== null && shippingDiscount !== null) shippingDiscount = Math.min(shipping, shippingDiscount);
  const netShipping = shipping === null || shippingDiscount === null ? null : shipping - shippingDiscount;
  const shopifyTotal = amount(cart.cost?.totalAmount);
  const total = shopifyTotal ?? (products === null ? null : products + (netShipping ?? 0));
  const country = destinations[0]?.countryCodeV2 || config.tax.assumedCountry;
  const excludedTax = destinations.some(d => d.countryCodeV2 === 'ES' && /^(35|38|51|52)/.test(d.zip || ''));
  const sameCountry = destinations.every(d => d.countryCodeV2 === country);
  let tax = null, base = null, taxSource = null, taxRates = [];
  const reportedTax = amount(cart.cost?.totalTaxAmount);
  if (config.tax.pricesIncludeTax && config.tax.verified && reportedTax !== null && total !== null) {
    tax = reportedTax; base = total - tax; taxSource = 'shopify';
  } else if (config.tax.pricesIncludeTax && !excludedTax && sameCountry && products !== null && lineNet !== null && lineNet > 0) {
    const rates = lines.map(l => config.tax.productRatesByCountry[l.handle]?.[country] ?? config.tax.ratesByCountry[country]);
    if (rates.every(r => Number.isInteger(r) && r >= 0) && (netShipping === null || netShipping === 0 || country === 'ES')) {
      taxRates = [...new Set(rates)].sort((a, b) => a - b);
      // Distribute order discounts by cumulative rounding so every cent is assigned once.
      let cumulative = 0, assigned = 0;
      const taxes = netLines.map((net, i) => {
        cumulative += net;
        const next = roundRatio(products, cumulative, lineNet);
        const discounted = next - assigned; assigned = next;
        return roundRatio(discounted, rates[i], 10000 + rates[i]);
      });
      tax = sum(taxes);
      if (netShipping !== null) tax += roundRatio(netShipping, config.tax.shippingRateBps, 10000 + config.tax.shippingRateBps);
      base = products + (netShipping ?? 0) - tax;
      taxSource = 'provisional';
    }
  }
  return { currency, subtotal, productDiscount, shipping, shippingDiscount, netShipping, shippingSource,
    shippingLabel: groups.length === 1 ? groups[0].selectedDeliveryOption?.title : groups.length > 1 ? 'Gastos de envío' : null,
    total, savings: productDiscount === null || shippingDiscount === null ? null : productDiscount + shippingDiscount,
    tax, base, taxSource, taxRates, pricesIncludeTax: config.tax.pricesIncludeTax, assumedDestination: !addressReady,
    totalSource: shopifyTotal !== null ? 'shopify' : 'estimate',
    pendingShipping: netShipping === null, estimated: cart.cost?.totalAmountEstimated !== false || netShipping === null,
    checkoutConnected: Boolean(cart.checkoutUrl?.startsWith('https://')) };
}
