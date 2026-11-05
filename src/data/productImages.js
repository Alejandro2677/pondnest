import manifest from './product-images.generated.json' with { type: 'json' };

const base = import.meta.env?.BASE_URL ?? '/';
const warned = new Set();
export function productImages(product) {
  const local = manifest.products[product.handle];
  if (!local?.length) {
    if (import.meta.env?.DEV && local && !warned.has(product.handle)) {
      warned.add(product.handle);
      console.warn(`[PondNest] Sin fotografías locales para ${product.handle}. Se conserva la demostración. Ejecuta npm run optimize:images.`);
    }
    return product;
  }
  const images = local.map(i => ({ ...i, src: base + i.src, variants: i.variants.map(v => ({ ...v, src: base + v.src })) }));
  return { ...product, image: images[0].src, gallery: images.map(i => i.src), imageDetails: images, localImages: true };
}

export function responsiveImage(product, index = 0) {
  const image = product.imageDetails?.[index];
  if (!image) return {};
  return {
    width: image.width,
    height: image.height,
    srcSet: [...image.variants, image].map(v => `${v.src} ${v.width}w`).join(', '),
  };
}
