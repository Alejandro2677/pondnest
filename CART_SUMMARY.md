# Resumen del carrito

El servidor normaliza el carrito de Shopify y calcula `summary` usando enteros en céntimos. El navegador solo presenta el desglose; no determina el importe cobrado.

## Configuración

`config/cart-summary.json` contiene la configuración comercial provisional:

- `tax.pricesIncludeTax: true`: precios de consumo con IVA incluido. El IVA se extrae como bruto × tipo / (100 + tipo); nunca se suma otra vez.
- `tax.verified: false`: el desglose sigue siendo provisional. Solo cambiar tras verificar la configuración fiscal de Shopify. El importe fiscal devuelto por Shopify tiene prioridad cuando se verifica la configuración.
- `tax.ratesByCountry.ES: 2100`: 21 % en puntos básicos. `productRatesByCountry` admite excepciones por handle y país, por ejemplo `{ "libro": { "ES": 400 } }`.
- Sin dirección se indica la hipótesis provisional de territorio IVA español. Para Canarias, Ceuta, Melilla o países sin tipo configurado, se deja pendiente. El envío pendiente se excluye de la base y del IVA provisional.
- Envío estándar previsto: `4.00 EUR`, con `realRateVerified: false`. No se presenta como tarifa disponible hasta verificarla.
- Promoción preparada y desactivada: `promotion.enabled: false`. Incluye mínimo de compra tras descuentos, fechas opcionales y `shopifyVerified`. Estas condiciones deben coincidir con la regla comercial real en Shopify.

## Envío y promociones

Las opciones seleccionadas y descuentos de envío devueltos por Shopify tienen prioridad. Se suman todos los grupos de entrega; si falta dirección o selección, el envío queda pendiente.

Solo se muestra un precio tachado cuando existe una tarifa positiva real y Shopify devuelve un descuento que la reduce a cero. Una tarifa que ya es cero no genera un ahorro ficticio. Los descuentos parciales muestran la tarifa original y su descuento por separado.

La configuración local permite preparar estimaciones para un futuro proveedor sin total remoto. Cuando Shopify proporciona un total, la configuración local no le añade ni resta gastos ni promociones: hay que activar la tarifa y la promoción en Shopify. Activar un interruptor local no crea descuentos en el checkout.

## Revisión antes del pago

`cartSnapshot` incluye todo el desglose económico. Antes de redirigir al checkout se vuelve a consultar Shopify. Si cambia el total, los impuestos, los descuentos, el envío, la disponibilidad o las cantidades, se muestra el resumen actualizado y se exige otra pulsación. Los cambios posteriores de dirección y condiciones se reflejan en el checkout de Shopify antes de confirmar el pago.

Referencias: [CartCost](https://shopify.dev/docs/api/storefront/latest/objects/CartCost), [CartLineCost](https://shopify.dev/docs/api/storefront/latest/objects/CartLineCost), [CartDeliveryGroup](https://shopify.dev/docs/api/storefront/latest/objects/CartDeliveryGroup).

## Validación

- Pruebas unitarias de un artículo, varios, variantes, cantidades, descuentos, redondeo, IVA incluido, tipos distintos, territorios, envío normal, envío gratis, promociones condicionadas y grupos de entrega.
- Playwright: escritorio y móvil, cantidades, eliminación, carrito vacío, enlaces, costes pendientes y revisión de cambios del total remoto.
- Comprobación con la conexión Shopify real: carrito temporal con una variante, dos unidades y otra variante; total consistente al consultar de nuevo y URL HTTPS de checkout. Se vació únicamente ese carrito de prueba. No se creó ningún pedido ni se efectuó un pago.
- La tarifa y la promoción de envío no se han activado en la tienda. Falta una dirección de entrega para comprobar los impuestos y el envío definitivos del checkout; los estados con promoción y descuentos se verifican con respuestas simuladas explícitas en las pruebas.
