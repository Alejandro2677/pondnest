import test from 'node:test';
import assert from 'node:assert/strict';
import {localCheckoutTest} from '../../server/checkoutTest.js';
import {nativeFixture} from '../fixtures/native-packs.js';
import {localizePackCart} from '../../server/packs.js';
test('test navigation requires loopback, development marker, both confirmations and an unexpired short session',()=>{
  const now=Date.now(),env={PONDNEST_LOCAL_TEST_SERVER:'true',PONDNEST_CHECKOUT_TEST_EXPIRES_AT:new Date(now+60000).toISOString(),PONDNEST_SHOPIFY_TEST_CONFIRMED:'true',PONDNEST_AUTODS_DISABLED_CONFIRMED:'true'};
  const req={headers:{host:'localhost:5173'},socket:{remoteAddress:'::1'}};
  assert.equal(localCheckoutTest(env,req,now),true);
  assert.equal(localCheckoutTest(env,{...req,socket:{remoteAddress:'192.168.1.2'}},now),false);
  assert.equal(localCheckoutTest(env,{...req,headers:{host:'example.com'}},now),false);
  assert.equal(localCheckoutTest({...env,PONDNEST_LOCAL_TEST_SERVER:''},req,now),false);
  assert.equal(localCheckoutTest({...env,PONDNEST_AUTODS_DISABLED_CONFIRMED:'false'},req,now),false);
  assert.equal(localCheckoutTest(env,req,now+60001),false);
});
test('test navigation retains composition and price validation without enabling commercial checkout',()=>{
  const {packs}=nativeFixture();const catalog=packs.map(p=>({...p,testCheckoutEnabled:true})),v=catalog[0].variants[0];
  const line={variantId:v.id,quantity:1,price:v.price,available:true,components:v.components};
  const cart={lines:[line],checkoutUrl:'https://fixture.myshopify.com/checkouts/test',summary:{checkoutConnected:true}};
  assert.equal(localizePackCart(cart,catalog).checkoutUrl,cart.checkoutUrl);
  assert.equal(packs[0].checkoutEnabled,false);
  line.components=[];assert.equal(localizePackCart(cart,catalog).checkoutUrl,null);
  line.components=v.components;line.price={...v.price,amount:'1'};assert.equal(localizePackCart(cart,catalog).checkoutUrl,null);
});
