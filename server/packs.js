import configuration from '../config/packs.json' with { type: 'json' };
import visualConfiguration from '../config/product-variants.json' with { type: 'json' };
import { cents } from '../src/services/orderSummary.js';

export function packCheckoutEnabled(config = configuration) {
  return config.shopify.enabled === true && config.shopify.fulfillmentVerified === true && config.shopify.checkoutVerified === true;
}

// Resolve by actual component variant IDs and quantities, never by translated titles.
export function mapPacks(remote, config = configuration, visuals = visualConfiguration) {
  return config.packs.map(pack => {
    const options = Object.fromEntries(pack.handles.map(handle => [handle, pack.componentVariants?.[handle] || visuals.products[handle]?.variants || []]));
    const product = remote.find(p => p.id === pack.shopifyProductId);
    const variants = (product?.variants || []).flatMap(variant => {
      if (!variant.requiresComponents || !variant.componentsComplete || variant.components.length !== pack.handles.length) return [];
      const selection = {};
      for (const component of variant.components) {
        const matches = pack.handles.flatMap(handle => options[handle]
          .filter(v => v.shopifyVariantId === component.productVariant.id).map(v => ({handle, id:v.id})));
        if (matches.length !== 1 || component.quantity !== 1 || selection[matches[0].handle]) return [];
        selection[matches[0].handle] = matches[0].id;
      }
      if (pack.handles.some(handle => !selection[handle])) return [];
      return [{ id:variant.id, selection, price:variant.price,
        available: Boolean(variant.available && variant.components.every(c => c.productVariant.availableForSale)),
        components:variant.components.map(c => ({variantId:c.productVariant.id, quantity:c.quantity, sku:c.productVariant.sku, name:c.productVariant.product.title, variant:c.productVariant.title})),
      }];
    });
    const available = variants.filter(v => v.available && v.price?.currencyCode === 'EUR' && cents(v.price) === pack.priceCents);
    // Duplicate component combinations are ambiguous and must never be chosen arbitrarily.
    const keys = available.map(v => JSON.stringify(pack.handles.map(h => v.selection[h])));
    const purchasable = available.filter((v,i) => keys.filter(key => key === keys[i]).length === 1);
    return { id:pack.id, name:pack.name, productId:product?.id || null, shopifyHandle:product?.handle || null,
      linkedColors:pack.linkedColors || [], variants:purchasable,
      options, componentNote:pack.componentNote || null,
      price:product?.variants[0]?.price || null,
      checkoutEnabled:packCheckoutEnabled(config), previewEnabled:config.shopify.previewEnabled === true,
      issue:!product ? 'Pack no publicado en el canal Headless.' : !purchasable.length ? 'La composición, las variantes o el precio de Shopify no coinciden con el pack de PondNest.' : null,
    };
  });
}

export function resolvePack(catalog, packId, selection) {
  const pack = catalog.find(p => p.id === packId);
  if (!pack || !selection || typeof selection !== 'object' || Array.isArray(selection)) throw Error('Pack o selección no válidos.');
  const options = pack.variants.filter(v => Object.keys(v.selection).length === Object.keys(selection).length && Object.entries(v.selection).every(([h,id]) => selection[h] === id));
  if (options.length !== 1 || !options[0].available) throw Error('Esta combinación no está disponible en Shopify.');
  return { pack, variant:options[0] };
}

export function localizePackCart(cart, catalog) {
  if (!cart) return null;
  const lines = cart.lines.map(line => {
    const pack = catalog.find(p => p.variants.some(v => v.id === line.variantId));
    const variant = pack?.variants.find(v => v.id === line.variantId);
    if (!variant) return line;
    const componentKeys = list => list.map(c => `${c.variantId}:${c.quantity}`).sort().join('|');
    const expected = variant.components.map(c => ({...c,quantity:c.quantity * line.quantity}));
    const verified = componentKeys(line.components || []) === componentKeys(expected);
    const unitPriceMatches = line.price?.currencyCode === variant.price.currencyCode && cents(line.price) === cents(variant.price);
    return {...line, name:pack.name, handle:'packs', packId:pack.id, realPack:true,
      selection:variant.selection, available:verified && unitPriceMatches && variant.available && line.available,
      mapped:verified && unitPriceMatches, checkoutEligible:verified && unitPriceMatches && variant.available && line.available && (pack.checkoutEnabled || pack.testCheckoutEnabled)};
  });
  const blocked = lines.some(l => l.realPack && !l.checkoutEligible);
  const testCheckout = lines.some(l => l.realPack) && catalog.some(p => p.testCheckoutEnabled);
  return {...cart, lines, ...(testCheckout ? {checkoutTestNotice:'Sesión local de prueba. Antes de confirmar, comprueba que Shopify indica modo de prueba. No uses tarjetas reales ni tramites el pedido en AutoDS.'} : {}), ...(blocked ? {checkoutUrl:null, checkoutBlockedReason:'Los packs siguen en prueba: falta verificar el checkout y la gestión de componentes en AutoDS.', summary:{...cart.summary,checkoutConnected:false}} : {})};
}
