import {test,expect} from '@playwright/test';
import {nativeFixture} from '../fixtures/native-packs.js';
import {resolvePack,localizePackCart} from '../../server/packs.js';
import {orderSummary} from '../../src/services/orderSummary.js';
import summary from '../../config/cart-summary.json' with {type:'json'};
async function catalog(page,modify=p=>p) {
  const fixture=nativeFixture();fixture.packs=modify(fixture.packs);let lines=[];const calls=[];
  const id='gid://shopify/Cart/fixture';
  const cart=()=>{
    const c={id,checkoutUrl:'https://fixture.myshopify.com/checkouts/fixture',lines:lines.map(l=>({...l,components:l.baseComponents.map(c=>({...c,quantity:c.quantity*l.quantity})),total:{...l.price,amount:String(Number(l.price.amount)*l.quantity)}}))};
    c.subtotal={amount:String(c.lines.reduce((n,l)=>n+Number(l.total.amount),0)),currencyCode:'EUR'};
    c.summary={...orderSummary(c,summary),checkoutConnected:true};return localizePackCart(c,fixture.packs);
  };
  await page.route('**/api/commerce',async route=>{
    const {operation,args=[]}=route.request().postDataJSON();calls.push({operation,args});let result;
    if(operation==='getProducts')result=fixture.products;
    else if(operation==='getPacks')result=fixture.packs;
    else if(operation==='addPack'){
      const {pack,variant}=resolvePack(fixture.packs,args[1],args[2]);const existing=lines.find(l=>l.variantId===variant.id);
      if(existing)existing.quantity++;else lines.push({id:`line-${variant.id}`,variantId:variant.id,name:pack.name,quantity:1,price:variant.price,available:true,baseComponents:variant.components});result=cart();
    } else if(operation==='updateCart'){
      lines=lines.flatMap(l=>l.id!==args[1]?[l]:args[2]?[{...l,quantity:args[2]}]:[]);result=cart();
    } else if(['createCart','getCart'].includes(operation))result=cart();
    else return route.fulfill({status:400,json:{error:'Checkout blocked until AutoDS verification'}});
    return route.fulfill({json:{result}});
  });return calls;
}
for(const width of [375,1440])test(`native pack preview and grouped cart at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});const calls=await catalog(page);await page.goto('/packs');
  await expect(page.locator('.pack-card')).toHaveCount(3);await expect(page.locator('.pack-card select')).toHaveCount(0);
  await expect(page.locator('.pack-price')).toHaveText([/75,00/,/80,00/,/150,00/]);
  for(const img of await page.locator('.pack-photos img').all()){await img.scrollIntoViewIfNeeded();await expect(img).toHaveJSProperty('complete',true);await expect(img).not.toHaveJSProperty('naturalWidth',0);}
  await page.screenshot({path:`test-results/packs-native-${width}.png`,fullPage:true});
  const choose=page.getByRole('button',{name:'Elegir pack'}).last();await choose.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox',{name:'Color',exact:true}).selectOption('Blanco');await expect(dialog.getByRole('combobox',{name:'Funda protectora de silicona',exact:true})).toHaveValue('protector-white');
  await dialog.getByRole('combobox',{name:'Capacidad',exact:true}).selectOption('128 GB');
  await dialog.getByRole('combobox',{name:'Funda protectora de silicona',exact:true}).selectOption('protector-black');
  await expect(dialog.getByRole('combobox',{name:'Color',exact:true})).toHaveValue('Negro transparente');await expect(dialog.getByRole('combobox',{name:'Capacidad',exact:true})).toHaveValue('128 GB');
  await expect(dialog.getByRole('combobox',{name:'Funda protectora de silicona',exact:true}).locator('option[value="protector-green"]')).toHaveCount(0);
  await page.screenshot({path:`test-results/pack-native-panel-${width}.png`});
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(choose).toBeFocused();expect(calls.filter(c=>c.operation==='addPack')).toHaveLength(0);
  await choose.click();await page.getByRole('dialog').getByRole('button',{name:'Añadir pack al carrito'}).click();await expect(page).toHaveURL(/carrito/);
  await expect(page.locator('.cart-line')).toHaveCount(1);await expect(page.locator('.cart-pack-components li')).toHaveCount(4);await expect(page.locator('.order-summary-total')).toContainText('150,00');
  await expect(page.getByRole('button',{name:'Continuar al pago'})).toBeDisabled();
  await page.getByRole('button',{name:'Aumentar cantidad de Pack Colección Completa'}).click();await expect(page.locator('.order-summary-total')).toContainText('300,00');
  await page.reload();await expect(page.locator('.cart-line')).toHaveCount(1);await expect(page.locator('.order-summary-total')).toContainText('300,00');
  await page.goto('/packs');await page.getByRole('button',{name:'Elegir pack'}).first().click();await page.getByRole('button',{name:'Cerrar configurador'}).click();
  await page.goto('/carrito');await expect(page.locator('.order-summary-total')).toContainText('300,00');
  await page.getByRole('button',{name:'Quitar',exact:true}).click();await expect(page.locator('.cart-line')).toHaveCount(0);
  expect(calls.filter(c=>c.operation==='addPack')).toHaveLength(1);expect(calls.filter(c=>c.operation==='addToCart')).toHaveLength(0);
});
test('pack-specific protector uses actual options and unavailable bundle blocks confirmation',async({page})=>{
  await catalog(page,p=>p.map(x=>x.id==='esencial'?{...x,variants:[],issue:'Pack no disponible'}:x));await page.goto('/packs');
  await page.getByRole('button',{name:'Elegir pack'}).nth(1).click();await page.getByRole('combobox',{name:'Funda protectora de silicona',exact:true}).selectOption('pack-protector-green');
  await expect(page.getByRole('dialog')).toContainText('referencia distinta');await page.getByRole('button',{name:'Cerrar configurador'}).click();
  await page.getByRole('button',{name:'Elegir pack'}).first().click();await expect(page.getByRole('dialog').getByRole('button',{name:'Añadir pack al carrito'})).toBeDisabled();
});
test('packs lead both listings and details remain reachable',async({page})=>{
  await catalog(page);await page.emulateMedia({reducedMotion:'reduce'});
  for(const url of ['/','/productos']){await page.goto(url);await expect(page.locator('.packs-section')).toHaveCount(1);expect(await page.locator('.packs-section').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.product-card'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);}
  await page.goto('/productos/estuche-transporte');await expect(page.locator('.pack-suggestion-links a')).toHaveCount(3);await page.locator('.pack-suggestion-links a').first().click();await expect(page).toHaveURL(/packs\/esencial/);
});
