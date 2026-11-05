// Accept only a checkout URL returned by Shopify. Never construct one from a shop domain.
export function validateCheckoutUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw Error('Shopify no ha devuelto una URL de checkout válida.'); }
  const path = url.pathname;
  const checkoutPath = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:cart\/c\/|checkouts?\/)[^/]+/i.test(path);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !checkoutPath || /\/(password|collections|products)(\/|$)/i.test(path)) {
    throw Error('Shopify no ha devuelto un checkout directo. No se abrirá su tienda ni su catálogo. Revisa la configuración del canal Headless.');
  }
  return value;
}
