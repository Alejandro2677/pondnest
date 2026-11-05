import packConfig from '../../config/packs.json' with {type:'json'};
import visualConfig from '../../config/product-variants.json' with {type:'json'};
import {mapPacks} from '../../server/packs.js';
import {mapCatalog} from '../../server/catalog.js';
// Synthetic parent IDs below exist only in test fixtures.
export function nativeFixture() {
  const individuals = Object.entries(visualConfig.products).map(([handle,p]) => ({handle,variants:p.variants.filter(v=>v.shopifyVariantId).map(v=>({id:v.shopifyVariantId,available:true,price:{amount:'20.00',currencyCode:'EUR'}}))}));
  let parent = 900000;
  const bundles = packConfig.packs.map(pack => {
    const choices = pack.handles.map(handle=>(pack.componentVariants?.[handle] || visualConfig.products[handle].variants).filter(v=>v.shopifyVariantId));
    const combinations = choices.reduce((all,options)=>all.flatMap(row=>options.map(option=>[...row,option])),[[]]);
    const variants = combinations.filter(row => {
      if (!pack.linkedColors) return true;
      const colors = pack.linkedColors.map(h=>row[pack.handles.indexOf(h)].color.replace(' transparente',''));
      return colors.every(color=>color===colors[0]);
    }).map(row=>({id:`gid://shopify/ProductVariant/${parent++}`,available:true,requiresComponents:true,componentsComplete:true,
      price:{amount:String(pack.priceCents/100),currencyCode:'EUR'},components:row.map((v,i)=>({quantity:1,productVariant:{id:v.shopifyVariantId,title:v.name,sku:`fixture-${v.id}`,availableForSale:true,product:{handle:pack.handles[i],title:pack.handles[i]}}}))}));
    return {id:pack.shopifyProductId,handle:pack.id,variants};
  });
  return {raw:[...individuals,...bundles],products:mapCatalog(individuals),packs:mapPacks(bundles)};
}
