import configuration from '../config/product-variants.json' with { type: 'json' };
import { demoProducts } from '../src/data/products.js';
import { variantGallery } from '../src/data/productVariants.js';

export function mapCatalog(remote) {
  const all = remote.flatMap(p => p.variants.map(v => ({ ...v, handle: p.handle })));
  const ids = Object.values(configuration.products).flatMap(p => p.variants.map(v => v.shopifyVariantId).filter(Boolean));
  return demoProducts.map(local => ({
    ...local, demo: false,
    variants: configuration.products[local.handle].variants.map(visual => {
      const real = all.find(v => v.id === visual.shopifyVariantId);
      const mapped = /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(visual.shopifyVariantId || '') && ids.filter(id => id === visual.shopifyVariantId).length === 1 && Boolean(real);
      return { id: mapped ? real.id : `unlinked:${visual.id}`, visualId: visual.id, title: visual.name,
        available: mapped && real.available, mapped,
        price: mapped ? real.price : null,
        mappingIssue: mapped ? null : 'Pendiente de vincular o verificar el ID de variante de Shopify' };
    }),
  })).map(p => ({ ...p, price: p.variants.find(v => v.available)?.price || null }));
}

export function localizeCart(cart, products) {
  if (!cart) return null;
  if (cart.lines.length >= 250) throw Error('El carrito supera el límite admitido. Reduce los artículos antes de continuar.');
  return { ...cart, lines: cart.lines.map(line => {
    if (line.realPack) return line;
    const p = products.find(p => p.variants.some(v => v.id === line.variantId));
    const v = p?.variants.find(v => v.id === line.variantId);
    const visual = configuration.products[p?.handle]?.variants.find(c => c.id === v?.visualId);
    return { ...line, name: p?.name || line.name, handle: p?.handle || line.handle,
      image: p ? variantGallery(p, visual).image : null, variant: v?.title || line.variant,
      available: Boolean(v?.available && line.available), mapped: Boolean(v?.mapped) };
  }) };
}
