import { loadEnv } from 'vite';
import { writeFile } from 'node:fs/promises';
import configuration from '../config/product-variants.json' with { type: 'json' };
import { createCommerce } from '../server/shopify.js';
import { mapCatalog } from '../server/catalog.js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) {
  console.error('Falta SHOPIFY_STORE_DOMAIN o SHOPIFY_STOREFRONT_PRIVATE_TOKEN en .env.local.');
  process.exit(1);
}
const remote = await createCommerce(env).getProducts();
const products = mapCatalog(remote);
const configuredIds = Object.values(configuration.products).flatMap(p => p.variants.map(v => v.shopifyVariantId));
const report = {
  checkedAt: new Date().toISOString(),
  local: products.map(p => ({ handle: p.handle, variants: p.variants.map(v => ({ visualId: v.visualId, title: v.title, shopifyVariantId: v.mapped ? v.id : null, available: v.available, issue: v.mappingIssue })) })),
  storefront: remote.map(p => ({ handle: p.handle, variants: p.variants.map(v => ({ id: v.id, title: v.title, available: v.available, price: v.price, linked: configuredIds.includes(v.id) })) })),
};
await writeFile('SHOPIFY_AUDIT.json', JSON.stringify(report, null, 2) + '\n');
const missing = products.flatMap(p => p.variants).filter(v => !v.mapped).length;
console.log(`Auditoría: ${missing} opciones sin vínculo verificado. Detalles en SHOPIFY_AUDIT.json.`);
if (missing) process.exitCode = 1;
