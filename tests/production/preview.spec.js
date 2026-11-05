import {test,expect} from '@playwright/test';
for(const width of [375,1440]) {
  test(`production routes, images, responsive and 3D at ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto('/');await expect(page.locator('canvas')).toBeVisible({timeout:30000});await expect(page.locator('.loading')).toHaveCount(0,{timeout:30000});
    await expect(page.locator('.scene-status')).toHaveCount(0);
    await page.screenshot({path:`test-results/production-3d-${width}.png`});
    for(const route of ['/packs','/productos','/productos/r36s','/packs/esencial','/carrito','/faq','/guia-configuracion']) {
      const response=await page.goto(route);expect(response.status()).toBe(200);await page.reload();await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      for(const image of await page.locator('img:visible').all()) {await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);}
    }
    expect(errors).toEqual([]);
  });
  test(`production remote pack carts persist but cannot checkout at ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
    async function call(operation,...args){const response=await page.request.post('/api/commerce',{data:{operation,args}});const body=await response.json();if(!response.ok())throw Error(body.error);return body.result;}
    const catalog=await call('getPacks');expect(catalog.map(p=>p.price.amount)).toEqual(['75.0','80.0','150.0']);
    let active;
    try {
      for(const [index,amount] of [[0,'75,00'],[1,'80,00'],[2,'150,00']]) {
        await page.goto('/packs');await page.getByRole('button',{name:'Elegir pack'}).nth(index).click();await page.getByRole('dialog').getByRole('button',{name:'Añadir pack al carrito'}).click();
        await expect(page).toHaveURL(/carrito/);active=await page.evaluate(()=>JSON.parse(localStorage.getItem('pondnest:server-cart:v1')));
        await expect(page.locator('.cart-line')).toHaveCount(1);await expect(page.locator('.order-summary-total')).toContainText(amount);await expect(page.getByRole('button',{name:'Continuar al pago'})).toBeDisabled();
        const before=await call('getCart',active.id);expect(before.checkoutUrl).toBeNull();expect(before.lines[0].components.length).toBe(index+2);
        await page.reload();const after=await call('getCart',active.id);expect(after.lines.map(l=>[l.variantId,l.quantity])).toEqual(before.lines.map(l=>[l.variantId,l.quantity]));
        const checkout=await page.request.post('/api/commerce',{data:{operation:'prepareCheckout',args:[active.id]}});expect(checkout.status()).toBe(400);
        await page.getByRole('button',{name:'Quitar',exact:true}).click();await expect(page.locator('.cart-line')).toHaveCount(0);
      }
      await page.goto('/productos/r36s');await page.getByRole('button',{name:'Añadir al carrito ↗',exact:true}).click();await expect(page).toHaveURL(/carrito/);
      active=await page.evaluate(()=>JSON.parse(localStorage.getItem('pondnest:server-cart:v1')));await page.reload();await expect(page.locator('.cart-line')).toHaveCount(1);await expect(page.getByRole('button',{name:'Continuar al pago'})).toBeDisabled();expect((await call('getCart',active.id)).checkoutUrl).toBeNull();
    } finally {if(active?.id){const cart=await call('getCart',active.id);for(const line of cart?.lines||[])await call('updateCart',active.id,line.id,0);}}
  });
}
test('production health, HEAD, static misses and preview headers',async({request})=>{
  const health=await request.get('/healthz');expect(await health.json()).toEqual({status:'ok',checkoutEnabled:false});
  const head=await request.head('/models/gamegaga-r36hd-detailed.glb');expect(head.status()).toBe(200);expect(Number(head.headers()['content-length'])).toBeGreaterThan(4000000);
  const missing=await request.get('/missing.webp');expect(missing.status()).toBe(404);
  const html=await request.get('/packs/esencial');expect(html.headers()['x-robots-tag']).toBe('noindex, nofollow');expect(html.headers()['cache-control']).toBe('no-cache');
  expect((await request.get('/.env.local')).status()).toBe(404);
});
