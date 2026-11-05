// Compatibility entry point; use the fully paginated pack audit as the source of truth.
import './audit-packs.mjs';
import { readFile, writeFile } from 'node:fs/promises';
const audit = JSON.parse(await readFile('SHOPIFY_PACKS_AUDIT.json','utf8'));
const report = {
  checkedAt:audit.checkedAt, requestedCountry:audit.country,
  catalogScanComplete:audit.catalogScanComplete,
  publishedBundleVariantCount:audit.bundleProducts.reduce((n,p)=>n+p.variants.length,0),
  packs:audit.pondnestMapping.map(p=>({name:p.name,productId:p.productId,shopifyBundlePrice:p.price,
    verifiedCombinations:p.variants.length,checkoutEnabled:p.checkoutEnabled,
    reason:p.issue || 'Carrito real en prueba; falta verificar checkout y fulfillment de componentes en AutoDS.'})),
};
await writeFile('SHOPIFY_CHECKOUT_AUDIT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
