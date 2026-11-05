import { createCommerce } from './shopify.js';
import { mapCatalog, localizeCart } from './catalog.js';
import { isIP } from 'node:net';
import { mapPacks, resolvePack, localizePackCart } from './packs.js';
import { localCheckoutTest } from './checkoutTest.js';

export function buyerIp(req, trustProxy = false) {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = trustProxy && typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress;
  const ip = raw?.replace(/^::ffff:/, '');
  // Local development has no public buyer address. Do not invent one.
  if (!isIP(ip || '') || ip === '::1' || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip) || /^(fc|fd|fe80):/i.test(ip)) return null;
  return ip;
}

export function commerceHandler(env, request = fetch) {
  const operations = new Set(['getProducts', 'getProduct', 'getPacks', 'addPack', 'getCart', 'createCart', 'addToCart', 'updateCart', 'prepareCheckout']);
  return async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/commerce') return next?.();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    try {
      const service = createCommerce(env, request, { buyerIp: buyerIp(req, env.SHOPIFY_TRUST_PROXY === 'true') });
      if (req.method !== 'POST') { res.statusCode = 405; return res.end('{}'); }
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) throw Error('Origen no permitido.');
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 16384) throw Error('Solicitud demasiado grande.'); }
      const { operation, args = [] } = JSON.parse(raw);
      if (!operations.has(operation) || !Array.isArray(args)) throw Error('Operación no válida.');
      if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) {
        if (operation === 'getProducts') return res.end(JSON.stringify({ result: mapCatalog([]) }));
        if (operation === 'getProduct') return res.end(JSON.stringify({ result: mapCatalog([]).find(p => p.handle === args[0]) || null }));
        if (operation === 'getPacks') return res.end(JSON.stringify({ result: mapPacks([]) }));
        throw Error('Falta configurar el dominio y el token privado de Storefront del canal Headless en el servidor.');
      }
      const remote = await service.getProducts();
      const products = mapCatalog(remote);
      const testCheckout = localCheckoutTest(env, req);
      const checkoutAllowed = env.PONDNEST_CHECKOUT_ENABLED === 'true' || testCheckout;
      const packs = mapPacks(remote).map(pack => ({...pack, testCheckoutEnabled:testCheckout}));
      let result;
      if (operation === 'getProducts') result = products;
      else if (operation === 'getProduct') result = products.find(p => p.handle === args[0]) || null;
      else if (operation === 'getPacks') result = packs;
      else {
        if (operation === 'prepareCheckout' && !checkoutAllowed) throw Error('Versión de prueba: los pagos y pedidos están desactivados.');
        if (operation !== 'createCart' && (typeof args[0] !== 'string' || !args[0].startsWith('gid://shopify/Cart/'))) throw Error('Carrito no válido.');
        if (operation === 'addToCart') {
          if (!products.some(p => p.variants.some(v => v.id === args[1] && v.available && v.mapped))) throw Error('Variante sin vínculo verificado o no disponible.');
        }
        if (['addToCart', 'updateCart'].includes(operation) && (!Number.isInteger(args[2]) || args[2] < (operation === 'addToCart' ? 1 : 0) || args[2] > 99)) throw Error('Cantidad no válida.');
        if (operation === 'addPack') {
          const {pack, variant} = resolvePack(packs, args[1], args[2]);
          if (!pack.previewEnabled && !pack.checkoutEnabled) throw Error('Los packs todavía no están habilitados.');
          // Exactly one parent. Shopify expands and prices its own components.
          result = await service.addToCart(args[0], variant.id, 1);
        } else result = await service[operation](...args);
        result = localizeCart(localizePackCart(result, packs), products);
        if (operation === 'addPack' && !result?.lines.some(line => line.realPack && line.packId === args[1] && line.mapped && Object.entries(args[2]).every(([h,id]) => line.selection[h] === id))) throw Error('Shopify no ha confirmado el pack con la composición y el precio seleccionados. Revisa el carrito antes de reintentar.');
        if (operation === 'prepareCheckout' && result?.checkoutBlockedReason) throw Error(result.checkoutBlockedReason);
        if (operation === 'prepareCheckout' && (!result?.lines.length || result.lines.some(l => !l.available || !l.mapped))) throw Error('Revisa las variantes y la disponibilidad del carrito antes de pagar.');
        if (result && !checkoutAllowed) result = {...result,checkoutUrl:null,checkoutBlockedReason:'Versión de prueba: los pagos y pedidos están desactivados.',summary:{...result.summary,checkoutConnected:false}};
      }
      res.end(JSON.stringify({ result }));
    } catch (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: error.message }));
    }
  };
}
