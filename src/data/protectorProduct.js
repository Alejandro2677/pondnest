// Supplier data supplied by the owner. Contradictory weight data is intentionally omitted.
export const protectorProduct = {
  title: 'Funda protectora de silicona para R36S',
  description: 'Protege tu consola de los pequeños accidentes del día a día sin renunciar a la comodidad al jugar.',
  contents: 'Consola no incluida. Se vende únicamente la funda protectora.',
  // Set to { summary, details } only after confirmed shipping information is available.
  shipping: null,
  highlights: [
    { icon: 'shield', title: 'Protección diaria', text: 'Su material flexible ayuda a proteger la carcasa frente a arañazos, rozaduras y pequeños golpes.' },
    { icon: 'fit', title: 'Diseñada para R36S', text: 'Funda con aberturas adaptadas a los controles y conexiones de la consola.' },
    { icon: 'vent', title: 'Ventilación', text: 'Incorpora aberturas para mantener despejadas las zonas de ventilación.' },
    { icon: 'flex', title: 'Fácil de colocar', text: 'Silicona flexible que permite instalar y retirar la funda cómodamente.' },
  ],
  specifications: [
    ['Producto', 'Funda protectora'],
    ['Modelo anunciado', 'R36S case'],
    ['Compatibilidad anunciada', 'R36S'],
    ['Material', 'Silicona'],
    ['Marca indicada', 'TGS'],
    ['Colores', 'Negro, blanco, morado y verde'],
    ['Dimensiones aproximadas', '8,79 × 2,9 × 13,31 cm'],
    ['Contenido del paquete', '1 funda protectora'],
  ],
};

export function canAddProtectorTogether({ demo, consoleProduct, consoleVariant, product, protectorVariant, reference }) {
  const priced = variant => Boolean(variant?.price && Number.isFinite(Number(variant.price.amount)) && Number(variant.price.amount) > 0);
  return Boolean(!demo && !consoleProduct?.demo && !product?.demo
    && reference?.shopifyVariantId && reference.shopifyVariantId === protectorVariant?.id
    && protectorVariant.available && consoleVariant?.available
    && consoleProduct?.variants.some(v => v.id === consoleVariant.id)
    && product?.variants.some(v => v.id === protectorVariant.id)
    && priced(consoleVariant) && priced(protectorVariant)
    && consoleVariant.price.currencyCode && consoleVariant.price.currencyCode === protectorVariant.price.currencyCode);
}
