import {test as base,expect} from '@playwright/test';
import {nativeFixture} from './native-packs.js';
import {orderSummary} from '../../src/services/orderSummary.js';
import summary from '../../config/cart-summary.json' with {type:'json'};
export {expect};
// Existing product/navigation tests use a simulated Headless cart, never a supplier.
export const test=base.extend({page:async({page},use)=>{
  const {products,packs}=nativeFixture();let lines=[];
  const cart=()=>{
    const result={id:'gid://shopify/Cart/preview-fixture',lines:lines.map(line=>({...line,total:{...line.price,amount:String(Number(line.price.amount)*line.quantity)}})),checkoutUrl:null,checkoutBlockedReason:'Versión de prueba: los pagos y pedidos están desactivados.'};
    result.subtotal={amount:String(result.lines.reduce((n,l)=>n+Number(l.total.amount),0)),currencyCode:'EUR'};result.summary={...orderSummary(result,summary),checkoutConnected:false};return result;
  };
  await page.route('**/api/commerce',async route=>{
    const {operation,args=[]}=route.request().postDataJSON();let result;
    if(operation==='getProducts')result=products;
    else if(operation==='getPacks')result=packs;
    else if(['getCart','createCart'].includes(operation))result=cart();
    else if(operation==='addToCart'){
      const product=products.find(p=>p.variants.some(v=>v.id===args[1]));const variant=product?.variants.find(v=>v.id===args[1]);
      if(!variant?.available)return route.fulfill({status:400,json:{error:'Variante no disponible'}});
      const old=lines.find(l=>l.variantId===variant.id);
      if(old)old.quantity+=args[2];else lines.push({id:variant.id,variantId:variant.id,name:product.name,handle:product.handle,image:product.image,variant:variant.title,quantity:args[2],price:variant.price,available:true,mapped:true});result=cart();
    }else if(operation==='updateCart'){lines=lines.flatMap(l=>l.id!==args[1]?[l]:args[2]?[{...l,quantity:args[2]}]:[]);result=cart();}
    else return route.fulfill({status:400,json:{error:'Checkout desactivado en simulación'}});
    return route.fulfill({json:{result}});
  });await use(page);
}});
