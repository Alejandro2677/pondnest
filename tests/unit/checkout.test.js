import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommerce } from '../../server/shopify.js';
import { validateCheckoutUrl } from '../../src/services/checkout.js';
import { buyerIp } from '../../server/api.js';
const env = { SHOPIFY_STORE_DOMAIN:'fixture.myshopify.com', SHOPIFY_STOREFRONT_PRIVATE_TOKEN:'private-fixture' };
const money = {amount:'59.99',currencyCode:'EUR'};
const rawCart = (country='ES', destination=null, checkoutUrl='https://fixture.myshopify.com/cart/c/returned-by-shopify?key=opaque') => ({id:'gid://shopify/Cart/test',checkoutUrl,buyerIdentity:{countryCode:country},cost:{subtotalAmount:money,totalAmount:money},deliveryGroups:{nodes:destination?[{deliveryAddress:{countryCodeV2:destination,zip:'12345'},discountAllocations:[]}]:[],pageInfo:{}},lines:{nodes:[{id:'l',quantity:1,cost:{amountPerQuantity:money,subtotalAmount:money,totalAmount:money},merchandise:{id:'gid://shopify/ProductVariant/1',availableForSale:true,title:'Purple',product:{handle:'r36s',title:'R36S'}}}]}});

test('checkout uses buyer identity ES, Spanish mutations, then a fresh unchanged URL from Shopify',async()=>{
  const calls=[];let country='US';
  const service=createCommerce(env,async(_,options)=>{
    const {query,variables}=JSON.parse(options.body);calls.push({query,variables,headers:options.headers});
    let data;
    if(query.includes('cartBuyerIdentityUpdate(')) {country=variables.buyerIdentity.countryCode;data={cartBuyerIdentityUpdate:{cart:rawCart(country),userErrors:[],warnings:[]}};}
    else data={cart:rawCart(country)};
    return {ok:true,json:async()=>({data})};
  },{buyerIp:'203.0.113.7'});
  const cart=await service.prepareCheckout('gid://shopify/Cart/test');
  assert.equal(calls.length,3);
  assert.match(calls[0].query,/cart\(id:/);
  assert.match(calls[1].query,/@inContext\(country:ES,language:ES\)/);
  assert.deepEqual(calls[1].variables.buyerIdentity,{countryCode:'ES'});
  assert.match(calls[2].query,/checkoutUrl/);
  assert.equal(cart.checkoutUrl,rawCart().checkoutUrl);
  assert.equal(cart.buyerCountry,'ES');
  assert.equal(calls[0].headers['Shopify-Storefront-Buyer-IP'],'203.0.113.7');
});
test('an explicit shipping destination is preserved when updating the buyer',async()=>{
  const calls=[];
  const service=createCommerce(env,async(_,options)=>{
    const {query,variables}=JSON.parse(options.body);calls.push(variables);
    return {ok:true,json:async()=>({data:query.includes('cartBuyerIdentityUpdate(')?{cartBuyerIdentityUpdate:{cart:rawCart('FR','FR'),userErrors:[],warnings:[]}}:{cart:rawCart('FR','FR')}})};
  });
  await service.prepareCheckout('gid://shopify/Cart/test');
  assert.equal(calls[1].buyerIdentity.countryCode,'FR');
});
test('all cart mutations use Spanish context; quantity zero removes lines',async()=>{
  const calls=[];
  const service=createCommerce(env,async(_,options)=>{
    const {query,variables}=JSON.parse(options.body);calls.push({query,variables});
    const operation=['cartCreate','cartLinesAdd','cartLinesUpdate','cartLinesRemove'].find(n=>query.includes(n+'('));
    return {ok:true,json:async()=>({data:{[operation]:{cart:rawCart(),userErrors:[],warnings:[]}}})};
  });
  await service.createCart();await service.addToCart('id','gid://shopify/ProductVariant/1',1);await service.updateCart('id','l',2);await service.updateCart('id','l',0);
  assert.ok(calls.every(c=>c.query.includes('@inContext(country:ES,language:ES)')));
  assert.equal(calls[0].variables.input.buyerIdentity.countryCode,'ES');
  assert.match(calls[3].query,/cartLinesRemove/);
});
test('store home, password, collections, malformed and non-HTTPS URLs are rejected without fallback',()=>{
  for(const url of ['https://fixture.myshopify.com/','https://fixture.myshopify.com/password','https://fixture.myshopify.com/collections/all','https://fixture.myshopify.com/products/r36s','http://fixture.myshopify.com/cart/c/x','https://a:b@fixture.myshopify.com/checkouts/x','not-a-url']) assert.throws(()=>validateCheckoutUrl(url),/checkout/);
  for(const url of ['https://fixture.myshopify.com/cart/c/abc?key=signed%2Bopaque','https://checkout.example.com/es/checkouts/abc','https://shop.app/checkout/123/abc']) assert.equal(validateCheckoutUrl(url),url);
});
test('proxy buyer IP requires explicit server trust; development loopback is omitted',()=>{
  const req={headers:{'x-forwarded-for':'203.0.113.8, 10.0.0.1'},socket:{remoteAddress:'::ffff:127.0.0.1'}};
  assert.equal(buyerIp(req),null);assert.equal(buyerIp(req,true),'203.0.113.8');
});
