import configuration from '../../config/packs.json' with { type: 'json' };
import taxConfig from '../../config/cart-summary.json' with { type: 'json' };
import { orderSummary } from './orderSummary.js';
import { productImages } from '../data/productImages.js';
import { getProductVariants, variantGallery } from '../data/productVariants.js';
export const packs = configuration.packs;
export const packProductName = handle => ({ r36s: 'Consola R36S', r36h: 'Consola R36H Air', 'funda-silicona': 'Funda protectora de silicona', 'estuche-transporte': 'Estuche de transporte negro' }[handle]);
// A visual reference alone never authorizes a purchasable combination.
export function packOptions(product) {
  if (!product) return [];
  return (getProductVariants(product, 'live')?.variants || []).filter(v => product.variants.some(real => real.id === v.shopifyVariantId && real.mapped && real.available));
}
export function defaultPackVariant(product) {
  const options = packOptions(product);
  return options.find(v => /morado/i.test(v.color || '') && v.capacity === '128 GB' && /arkos/i.test(v.name))
    || options.find(v => v.id === getProductVariants(product)?.defaultVariantId) || options[0];
}
export function packLine(packId, selection, products, quantity = 1) {
  const pack = packs.find(p => p.id === packId);
  if (!pack || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw Error('Pack o cantidad no válido.');
  const components = pack.handles.map(handle => {
    const product = products.find(p => p.handle === handle);
    const variant = packOptions(product).find(v => v.id === selection[handle]);
    if (!variant) throw Error('Una variante del pack ya no está disponible. Revisa tu selección.');
    return { handle, variantId: variant.id, name: packProductName(handle), variant: variant.name, image: variantGallery(productImages(product), variant).image, quantity: 1 };
  });
  const key = components.map(c => `${c.handle}:${c.variantId}`).join('|');
  const price = { amount: (pack.priceCents / 100).toFixed(2), currencyCode: 'EUR' };
  return { id: `demo-pack:${pack.id}:${key}`, packId: pack.id, demoPack: true, handle: 'packs', name: pack.name, variant: 'Pack completo · demostración', quantity, components, image: components[0].image, price, subtotal: { ...price, amount: (pack.priceCents * quantity / 100).toFixed(2) }, total: { ...price, amount: (pack.priceCents * quantity / 100).toFixed(2) }, available: true, mapped: false };
}
export function restorePacks(saved, products) {
  return (Array.isArray(saved) ? saved : []).flatMap(entry => {
    try { return [packLine(entry.packId, Object.fromEntries(entry.components.map(c => [c.handle, c.variantId])), products, entry.quantity)]; } catch { return []; }
  }).reduce((all, line) => {
    const previous = all.find(l => l.id === line.id);
    if (previous) {
      const merged = packLine(line.packId, Object.fromEntries(line.components.map(c => [c.handle, c.variantId])), products, Math.min(99, previous.quantity + line.quantity));
      return all.map(l => l.id === line.id ? merged : l);
    }
    return [...all, line];
  }, []);
}
export function withDemoPacks(cart, lines) {
  if (!lines.length) return cart;
  const combined = { ...cart, lines: [...cart.lines, ...lines], hasDemoPacks: true };
  // Live delivery quotes exclude demo bundles: shipping remains unconfirmed for this preview.
  combined.summary = { ...orderSummary({ lines: combined.lines, subtotal: cart.subtotal, discountAllocations: cart.discountAllocations }, taxConfig), checkoutConnected: false };
  return combined;
}
