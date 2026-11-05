import configuration from '../../config/product-variants.json' with { type: 'json' };

// Live mode only admits explicitly mapped, purchasable variants from the real catalog.
// A visual demo reference never becomes a Shopify ID by inference.
export function getProductVariants(product, mode = 'demo') {
  const config = configuration.products[product.handle];
  if (!config) return null;
  const variants = config.variants.filter(v =>
    mode === 'demo' || (v.shopifyVariantId && product.variants?.some(real => real.id === v.shopifyVariantId && real.available)),
  );
  return { ...config, variants };
}

export function selectedProductVariant(config, id) {
  return config?.variants.find(v => v.id === id)
    || config?.variants.find(v => v.id === config.defaultVariantId)
    || config?.variants[0]
    || null;
}

export function variantImage(product, variant) {
  return product.imageDetails?.find(image => image.source === variant?.primaryImage);
}

export function variantGallery(product, variant) {
  if (!variant) return product;
  const sources = [variant.primaryImage, ...variant.additionalImages];
  const preferred = sources.map(source => product.imageDetails?.find(image => image.source === source)).filter(Boolean);
  if (!preferred.length) return product;
  const details = [...preferred, ...product.imageDetails.filter(image => !sources.includes(image.source))];
  return { ...product, image: details[0].src, imageDetails: details, gallery: details.map(image => image.src) };
}

export function optionVariant(config, selected, dimension, value) {
  // Match every other dimension exactly: never silently switch capacity or color.
  return config.variants.find(candidate => candidate[dimension] === value &&
    config.dimensions.filter(key => key !== dimension && key !== 'reference').every(key => candidate[key] === selected[key]));
}
