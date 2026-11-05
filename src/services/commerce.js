import { validateCheckoutUrl } from './checkout.js';
export const createCommerce = (_env = {}, request = globalThis.fetch) => {
  async function call(operation, ...args) {
    let response;
    try {
      response = await request('/api/commerce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ operation, args }), signal: AbortSignal.timeout(30000) });
    } catch { throw Error('No se ha podido conectar con la tienda. Inténtalo de nuevo.'); }
    let body;
    try { body = await response.json(); } catch { throw Error('El servidor de comercio no está disponible.'); }
    if (!response.ok || body.error) throw Error(body.error || 'La tienda no está disponible.');
    return body.result;
  }
  return {
    demo: false, storageKey: 'pondnest:server-cart:v1',
    getProducts: () => call('getProducts'),
    getPacks: () => call('getPacks'),
    addPack: (id, packId, selection) => call('addPack', id, packId, selection),
    getProduct: handle => call('getProduct', handle),
    getCart: id => call('getCart', id),
    prepareCheckout: id => call('prepareCheckout', id),
    createCart: () => call('createCart'),
    addToCart: (id, variantId, quantity) => call('addToCart', id, variantId, quantity),
    updateCart: (id, lineId, quantity) => call('updateCart', id, lineId, quantity),
  };
};
export const commerce = createCommerce();
export const money = value => value ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: value.currencyCode }).format(Number(value.amount)) : 'Precio por confirmar';
export const cartSnapshot = cart => JSON.stringify({ summary: cart.summary, subtotal: cart.subtotal, lines: cart.lines.map(l => ({ id: l.id, variantId: l.variantId, quantity: l.quantity, price: l.price, total: l.total, available: l.available, mapped: l.mapped })) });
export function checkoutAddress(cart) {
  if (cart?.checkoutBlockedReason || cart?.lines?.some(l => l.realPack && !l.checkoutEligible)) throw Error(cart.checkoutBlockedReason || 'Packs pendientes de verificar en AutoDS.');
  if (cart?.hasDemoPacks || cart?.lines?.some(l => l.demoPack)) throw Error('Los packs de demostración no admiten pagos.');
  if (!cart?.lines.length || cart.lines.some(l => !l.available || !l.mapped)) throw Error('Revisa las variantes y la disponibilidad del carrito antes de continuar.');
  return validateCheckoutUrl(cart.checkoutUrl);
}
