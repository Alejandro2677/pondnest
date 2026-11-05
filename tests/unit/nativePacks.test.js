import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeFixture} from '../fixtures/native-packs.js';
import {mapPacks,resolvePack,localizePackCart,packCheckoutEnabled} from '../../server/packs.js';
import {createCommerce} from '../../server/shopify.js';
import http from 'node:http';
import {commerceHandler} from '../../server/api.js';
test('native bundles resolve exact components including the pack-specific protector',()=>{
  const {packs}=nativeFixture();assert.deepEqual(packs.map(p=>p.variants.length),[1,4,6]);
  assert.ok(packs[1].variants.every(v=>v.selection['funda-silicona'].startsWith('pack-protector-')));
  for(const pack of packs)for(const variant of pack.variants)assert.equal(resolvePack(packs,pack.id,variant.selection).variant.id,variant.id);
  assert.throws(()=>resolvePack(packs,packs[0].id,{}),/disponible/);
  assert.throws(()=>resolvePack(packs,packs[0].id,{...packs[0].variants[0].selection,extra:'x'}),/disponible/);
});
test('changed price, missing components, duplicate combinations and unavailable components fail closed',()=>{
  const {raw}=nativeFixture();const bundle=raw.find(p=>p.id&&p.handle==='esencial'),v=bundle.variants[0];
  v.price.amount='74';assert.equal(mapPacks(raw)[0].variants.length,0);
  v.price.amount='75';v.componentsComplete=false;assert.equal(mapPacks(raw)[0].variants.length,0);
  v.componentsComplete=true;v.components[0].quantity=2;assert.equal(mapPacks(raw)[0].variants.length,0);
  v.components[0].quantity=1;v.components[0].productVariant.availableForSale=false;assert.equal(mapPacks(raw)[0].variants.length,0);
  v.components[0].productVariant.availableForSale=true;bundle.variants.push({...v,id:'duplicate'});assert.equal(mapPacks(raw)[0].variants.length,0);
});
test('grouped cart validates quantities and blocks checkout until fulfillment verification',()=>{
  const {packs}=nativeFixture();const v=packs[2].variants[0];
  const line={variantId:v.id,quantity:2,price:v.price,available:true,components:v.components.map(c=>({...c,quantity:2}))};
  const c={checkoutUrl:'https://fixture.myshopify.com/checkouts/x',lines:[line],summary:{checkoutConnected:true}};
  const actual=localizePackCart(c,packs);assert.equal(actual.lines.length,1);assert.equal(actual.lines[0].mapped,true);assert.equal(actual.checkoutUrl,null);assert.equal(actual.summary.checkoutConnected,false);
  line.components[0].quantity=1;assert.equal(localizePackCart(c,packs).lines[0].mapped,false);
  assert.equal(packCheckoutEnabled({shopify:{enabled:true,fulfillmentVerified:false,checkoutVerified:true}}),false);
  assert.equal(packCheckoutEnabled({shopify:{enabled:true,fulfillmentVerified:true,checkoutVerified:true}}),true);
});
test('catalog reads all 104 variants across two pages',async()=>{
  let calls=0;const variant=n=>({id:`gid://shopify/ProductVariant/${n}`,title:String(n),price:{amount:'80',currencyCode:'EUR'}});
  const s=createCommerce({SHOPIFY_STORE_DOMAIN:'fixture.myshopify.com',SHOPIFY_STOREFRONT_PRIVATE_TOKEN:'fixture'},async(_,options)=>{
    const {query,variables}=JSON.parse(options.body);calls++;
    const data=query.includes('products(first:')?{products:{nodes:[{id:'gid://shopify/Product/1',handle:'pack',title:'Pack',images:{nodes:[]},variants:{nodes:Array.from({length:100},(_,i)=>variant(i)),pageInfo:{hasNextPage:true,endCursor:'100'}}}],pageInfo:{hasNextPage:false}}}:{node:{variants:{nodes:Array.from({length:4},(_,i)=>variant(i+100)),pageInfo:{hasNextPage:false}}}};
    if(calls===2)assert.equal(variables.after,'100');return {ok:true,json:async()=>({data})};
  });assert.equal((await s.getProducts())[0].variants.length,104);assert.equal(calls,2);
});
test('HTTP API adds one native parent, rejects component spoofing and blocks checkout pending AutoDS',async()=>{
  const fixture=nativeFixture();let lines=[];const additions=[];
  const cartId='gid://shopify/Cart/fixture';
  const graphCart=()=>({id:cartId,checkoutUrl:'https://fixture.myshopify.com/checkouts/fixture',cost:{subtotalAmount:{amount:lines.length?'150':'0',currencyCode:'EUR'}},lines:{nodes:lines}});
  const request=async(_,options)=>{
    const {query,variables}=JSON.parse(options.body);let data;
    if(query.includes('products(first:'))data={products:{nodes:fixture.raw.map(p=>({...p,title:p.handle,images:{nodes:[]},variants:{pageInfo:{hasNextPage:false},nodes:p.variants.map(v=>({...v,title:v.id,availableForSale:v.available,components:{nodes:v.components||[],pageInfo:{hasNextPage:false}}}))}})),pageInfo:{hasNextPage:false}}};
    else if(query.includes('cartLinesAdd')){
      additions.push(variables.lines);const input=variables.lines[0];const variant=fixture.packs.flatMap(p=>p.variants).find(v=>v.id===input.merchandiseId);
      lines=[{id:'parent-line',quantity:1,cost:{amountPerQuantity:variant.price,totalAmount:variant.price},merchandise:{id:variant.id,title:'Parent',availableForSale:true,product:{title:'Pack',handle:'native-pack'}},lineComponents:variant.components.map(c=>({quantity:1,merchandise:{id:c.variantId,title:c.variant,sku:c.sku,availableForSale:true,product:{title:c.name}}}))}];
      data={cartLinesAdd:{cart:graphCart(),userErrors:[],warnings:[]}};
    }else if(query.includes('cartBuyerIdentityUpdate'))data={cartBuyerIdentityUpdate:{cart:graphCart(),userErrors:[],warnings:[]}};
    else data={cart:graphCart()};
    return {ok:true,json:async()=>({data})};
  };
  const server=http.createServer(commerceHandler({SHOPIFY_STORE_DOMAIN:'fixture.myshopify.com',SHOPIFY_STOREFRONT_PRIVATE_TOKEN:'fixture'},request));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const call=async(operation,args)=>{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/commerce`,{method:'POST',body:JSON.stringify({operation,args})});return {status:response.status,...await response.json()};};
  try{
    const selection=fixture.packs[2].variants[0].selection;
    const added=await call('addPack',[cartId,'coleccion-completa',selection]);assert.equal(added.status,200);assert.equal(added.result.lines[0].realPack,true);assert.equal(added.result.lines[0].mapped,true);assert.equal(added.result.checkoutUrl,null);
    assert.deepEqual(additions,[[{merchandiseId:fixture.packs[2].variants[0].id,quantity:1}]]);
    assert.equal((await call('addToCart',[cartId,fixture.packs[2].variants[0].id,1])).status,400);
    assert.equal((await call('addPack',[cartId,'coleccion-completa',{...selection,'funda-silicona':'protector-green'}])).status,400);
    const checkout=await call('prepareCheckout',[cartId]);assert.equal(checkout.status,400);assert.match(checkout.error,/desactivados/);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
