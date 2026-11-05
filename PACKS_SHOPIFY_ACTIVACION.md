# Packs Shopify: conexión de prueba y activación pendiente

Consulta real del 5 de noviembre de 2026, mercado ES. No se han realizado compras, creado pedidos ni enviado datos de clientes. Se conservan el diseño y la animación 3D.

| Pack | Producto Shopify real | Handle Shopify | Precio remoto | Variantes nativas | Combinaciones identificadas en PondNest |
| --- | --- | --- | --- | --- | --- |
| Esencial | `gid://shopify/Product/11014143639885` | `esencial` | 75 EUR | 13 | 1 |
| Protección Total | `gid://shopify/Product/11014144229709` | `protection-total` | 80 EUR | 104 | 4 |
| Colección Completa | `gid://shopify/Product/11014144852301` | `coleccion-completa` | 150 EUR | 104 | 6 |

Los IDs de variantes padre y su composición están en `SHOPIFY_PACKS_AUDIT.json`, en `bundleProducts` y `pondnestMapping`. El servidor resuelve cada selección por los IDs exactos de sus componentes y cantidades. Solo se ofrecen combinaciones publicadas, disponibles, completas y con precio EUR coincidente con el previsto. Los precios mostrados se consultan a Shopify; las cifras locales rechazan discrepancias, no imponen importes.

Solo la R36S morada transparente tiene correspondencia visual/comercial identificada en la configuración local. Su variante remota es `128Gb-Arkos / Clear Purple`; se ha actualizado su descripción y capacidad. No se han deducido otras correspondencias de colores.

## Decisiones incorporadas

- Colección Completa conserva los colores vinculados entre R36H y funda, por indicación del usuario. Cambiar uno actualiza ambos, manteniendo la capacidad. El verde no se ofrece porque no existe una R36H verde correspondiente.
- Protección Total conserva su funda distinta, por indicación del usuario: componente `gid://shopify/Product/11011941564749`. Sus cuatro colores utilizan IDs propios verificados. La foto real de Shopify está en `public/productos/protector-pack/referencia.webp`: es una referencia general multicolor; el proveedor no facilita fotos diferentes por variante. El configurador explica la diferencia.

Shopify documenta un máximo de 3 opciones y 100 variantes para Shopify Bundles. Esta tienda devuelve realmente 104 variantes en dos packs y admite las referencias ensayadas. Se ha corregido la paginación del adaptador, que antes rechazaba productos con más de 100 variantes. Esto no certifica una excepción al límite documentado: conviene deseleccionar en Shopify las referencias que PondNest no vende y reducir la matriz a las combinaciones verificadas. La elección independiente original exigiría cuatro opciones en Colección Completa; los colores vinculados autorizados usan las tres existentes. No se han modificado productos ni opciones en Shopify.

## Carrito real de prueba

`getPacks` entrega la matriz verificada. `addPack(cartId, packId, selection)` vuelve a consultarla en el servidor y añade exclusivamente una variante padre con `cartLinesAdd`. No añade componentes separados ni descuentos locales. Shopify devuelve el desglose mediante `ComponentizableCartLine.lineComponents`. Se comprueban composición, cantidades y precio de la respuesta. El carrito muestra una sola línea facturable, con sus componentes informativos, y permite modificar/eliminar el conjunto.

Se conserva únicamente el ID del carrito remoto en el navegador. Los packs de demostración antiguos permanecen separados y bloquean el pago; no se convierten automáticamente en compras.

`config/packs.json` mantiene **false** en `enabled`, `fulfillmentVerified` y `checkoutVerified`. `previewEnabled` permite probar el carrito real. Cuando contiene packs pendientes, el servidor oculta `checkoutUrl`, comunica el motivo y rechaza `prepareCheckout`; la interfaz también bloquea el pago. Los avisos de demostración permanecen. Esto no es una activación comercial.

## Evidencia y comandos

- `npm run shopify:audit:packs`: consulta de solo lectura, paginada, de los 7 productos publicados y las 221 variantes de packs; falla si el desglose queda incompleto.
- `npm run shopify:test:packs`: seis carritos desechables, sin pedidos ni pagos. Valida una referencia seleccionable y la última variante paginada de cada pack: padre, componentes, cantidades, precios, subtotal y total actualizado. Para referencias identificadas prueba cantidad 2. Vacía cada carrito y no guarda enlaces privados de checkout.
- `SHOPIFY_PACK_CART_TESTS.json`: importes devueltos y alcance exacto. Los 75/80/150 EUR coinciden con el **carrito sin envío seleccionado**. No certifican el total final tras dirección, transporte, impuestos y descuentos en la página de checkout.
- Pruebas unitarias: correspondencias, funda específica, precios divergentes, disponibilidad, composición, cantidades, duplicados ambiguos, bloqueo de AutoDS y paginación a 104 variantes.
- Pruebas de navegador: panel móvil/escritorio, colores vinculados sin perder capacidad, precio remoto, fotos, confirmación explícita, una línea por pack, cantidades, persistencia y cierre sin perder carrito.

## Pendiente para vender

La Storefront API no demuestra que Shopify Payments esté en modo de prueba ni audita la configuración de AutoDS. La búsqueda de plugins no encontró una conexión de AutoDS disponible en esta sesión. Que AutoDS gestione pedidos individuales no verifica estos bundles.

Se necesita evidencia de que AutoDS recibe cada componente nativo con SKU, variante, cantidad, ubicación de fulfillment y seguimiento correctos. Su documentación pública describe restricciones para bundles que se expanden en el carrito del proveedor; no confirma el comportamiento de esta integración concreta con Shopify Bundles. Hace falta verificar la cuenta o disponer de confirmación específica de soporte. No se ha contactado a soporte ni enviado mensajes por el usuario.

Después debe comprobarse el checkout en un entorno con modo de prueba confirmado, sin pago real: misma variante, componentes, dirección de prueba, transporte, impuestos y total final. Solo con ambas verificaciones documentadas procede habilitar las tres condiciones comerciales. Cambiar únicamente `enabled` no elimina los otros bloqueos.

Fuentes oficiales:

- [Shopify Bundles: límites y componentes](https://help.shopify.com/en/manual/products/bundles/shopify-bundles).
- [ProductVariant y componentes](https://shopify.dev/docs/api/storefront/latest/objects/ProductVariant).
- [ComponentizableCartLine](https://shopify.dev/docs/api/storefront/latest/objects/ComponentizableCartLine).
- [AutoDS: “Bundle or quantity mismatch”](https://help.autods.com/en/articles/12700443-automate-your-orders-with-fulfilled-by-autods-fba).
