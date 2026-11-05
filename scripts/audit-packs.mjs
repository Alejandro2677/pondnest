import { loadEnv } from 'vite';
import { writeFile } from 'node:fs/promises';
import { mapPacks } from '../server/packs.js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const domain = env.SHOPIFY_STORE_DOMAIN;
if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(domain || '') || !env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) throw Error('Missing private Storefront configuration.');
async function query(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${env.SHOPIFY_API_VERSION || '2026-10'}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Shopify-Storefront-Private-Token': env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN },
    body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(30000),
  });
  const body = await response.json();
  if (!response.ok || body.errors?.length) throw Error(JSON.stringify(body.errors || response.status));
  return body.data;
}
const variants = `id title sku availableForSale requiresComponents selectedOptions{name value} price{amount currencyCode}
  components(first:30){nodes{quantity productVariant{id title sku availableForSale image{url altText} product{id handle title featuredImage{url altText}}}} pageInfo{hasNextPage}}`;
const products = [];
let after = null;
do {
  const data = await query(`query($after:String) @inContext(country:ES,language:ES){products(first:25,after:$after){nodes{id handle title options{name values} variants(first:100){nodes{${variants}} pageInfo{hasNextPage endCursor}}} pageInfo{hasNextPage endCursor}}}`, { after });
  products.push(...data.products.nodes);
  after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
} while (after);
for (const product of products) {
  let page = product.variants.pageInfo;
  while (page.hasNextPage) {
    const data = await query(`query($id:ID!,$after:String) @inContext(country:ES,language:ES){node(id:$id){... on Product{variants(first:100,after:$after){nodes{${variants}} pageInfo{hasNextPage endCursor}}}}}`, { id: product.id, after: page.endCursor });
    product.variants.nodes.push(...data.node.variants.nodes);
    page = data.node.variants.pageInfo;
  }
  product.variants = product.variants.nodes;
}
const report = { checkedAt: new Date().toISOString(), country: 'ES', languageRequested: 'ES', catalogScanComplete: true,
  productCount: products.length, bundleProducts: products.filter(p => p.variants.some(v => v.requiresComponents)),
  individualProducts: products.filter(p => !p.variants.some(v => v.requiresComponents)),
  fulfillmentVerified: false, checkoutVerified: false, commercialActivation: false,
};
report.pondnestMapping = mapPacks(products.map(p => ({...p,variants:p.variants.map(v => ({...v,available:v.availableForSale,componentsComplete:!v.components.pageInfo.hasNextPage,components:v.components.nodes}))})));
if (products.some(p => p.variants.some(v => v.components.pageInfo.hasNextPage))) throw Error('Incomplete component scan; cannot verify bundle composition.');
await writeFile('SHOPIFY_PACKS_AUDIT.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ productCount: products.length, bundles: report.bundleProducts.map(p => ({id:p.id,handle:p.handle,title:p.title,options:p.options,variants:p.variants.length,available:p.variants.filter(v=>v.availableForSale).length,prices:[...new Set(p.variants.map(v=>`${v.price.amount} ${v.price.currencyCode}`))],sample:p.variants[0]})) }, null, 2));
