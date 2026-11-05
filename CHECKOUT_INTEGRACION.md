# Integración del checkout de Shopify

## Cambio aplicado

PondNest mantiene la selección, el carrito y el resumen dentro de React. Solo el último paso abre Shopify, usando exactamente `cart.checkoutUrl` recibido de la API; no se reconstruye la URL ni se utiliza el dominio principal como alternativa.

El flujo utiliza `cartCreate`, `cartLinesAdd`, `cartLinesUpdate` y `cartLinesRemove`. Antes de pagar, `prepareCheckout` consulta el carrito, ejecuta `cartBuyerIdentityUpdate` con España como país por defecto (conservando un destino de entrega explícito si existe) y vuelve a consultar el carrito para obtener una URL de checkout reciente y sus importes actualizados.

Todas las consultas y mutaciones del carrito solicitan `@inContext(country:ES,language:ES)`. Si han cambiado importes, descuentos, envío, cantidades o disponibilidad, se muestra el resumen actualizado y se requiere revisarlo antes de redirigir.

La validación compartida rechaza URLs de inicio, catálogo, productos, contraseña y protocolos no HTTPS. No elimina parámetros firmados ni modifica la URL devuelta por Shopify. Los identificadores reales de variantes continúan validándose en el servidor contra el catálogo publicado.

Los tokens privados permanecen en el servidor. Se transmite a Shopify la IP pública del comprador cuando está disponible en la conexión. En despliegues detrás de un proxy de confianza se puede configurar `SHOPIFY_TRUST_PROXY=true` para leer `X-Forwarded-For`; solo debe usarse si el alojamiento controla ese encabezado. En desarrollo local no se inventa una IP pública.

## Verificación real — 5 de noviembre de 2026

Se completó el recorrido en un navegador aislado: ficha R36S → añadir al carrito PondNest → resumen → checkout Shopify. No se visitó la portada ni el catálogo de Shopify durante esa redirección.

- Variante real: `gid://shopify/ProductVariant/55284237435213`, `128Gb-Arkos / Clear Purple`.
- Precio real de catálogo, carrito y checkout: **59,99 EUR** por una unidad.
- País del comprador: **ES**; país seleccionado en checkout: España.
- Se alcanzó el formulario de dirección y pago, con campos de tarjeta. No se introdujeron datos de tarjeta ni se pulsó el botón final de pago.
- Para comprobar la cotización se utilizó una dirección pública de prueba en Madrid, código postal 28013, sin nombre, correo ni datos personales. Shopify mostró la tarifa **Free Shipping**, importe de envío cero, y total de **59,99 EUR**. No implica disponibilidad universal ni verifica una tarifa anterior de 4 EUR.
- No apareció una barrera de contraseña en este recorrido. Una solicitud HTTP sin navegador recibió 403, pero el navegador llegó al checkout; ese 403 no demuestra un bloqueo comercial.
- El carrito temporal de la verificación final se vació. No se creó ningún pedido ni se efectuó ningún pago.

Captura y diagnóstico de la comprobación final en `artifacts/checkout-audit/`, excluidos de Git. La prueba real es opcional: `PONDNEST_LIVE_CHECKOUT=1 npx playwright test tests/browser/checkout-real.spec.js`. Para cotizar la dirección pública de prueba, añadir `PONDNEST_TEST_SHIPPING_ADDRESS=1`.

## Pendientes comerciales en Shopify

La redirección al checkout está verificada. Los siguientes ajustes no pueden resolverse cambiando React o una URL:

1. **Nombre de la tienda:** la API devuelve `My Store`, que aparece también en la cabecera del checkout. No es una prueba de que se haya abierto el catálogo. Para eliminar ese nombre debe configurarse el nombre comercial en Shopify.
2. **Enlace del logotipo:** la cabecera nativa del checkout sigue enlazando a la tienda online de Shopify. No se ha seguido ese enlace en la prueba ni se ha modificado el tema. Para impedir también ese acceso secundario hace falta configurar los retornos del canal headless o el redireccionamiento de la tienda online al dominio público definitivo de PondNest. No se ha publicado un tema ni se ha cambiado la contraseña.
3. **Idioma:** la solicitud pide español, pero Storefront devuelve `EN` y solo publica inglés. El checkout se muestra en `en-ES`. Hace falta habilitar/publicar español para el mercado correspondiente desde Shopify. No se ha activado ni publicado ningún idioma.
4. **Packs:** los tres bundles ya están publicados y sus precios reales son 75, 80 y 150 EUR. La matriz por componentes se documenta en [PACKS_SHOPIFY_ACTIVACION.md](PACKS_SHOPIFY_ACTIVACION.md). La publicación de prueba bloquea todos los checkouts por defecto, incluidos productos individuales; estado actual y hosting en [PUBLICACION.md](PUBLICACION.md).

La activación comercial de packs sigue requiriendo verificación final del checkout y de fulfillment en AutoDS. La auditoría solo puede afirmar lo que está publicado y accesible al token de Storefront; no inspecciona borradores ni reglas privadas de Admin.

Auditoría reproducible de solo lectura: `node scripts/check-checkout-config.mjs`. Resultado en `SHOPIFY_CHECKOUT_AUDIT.json`.

## Referencias

- [Consultar una URL reciente de checkout](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage).
- [Contexto del carrito y prevalencia de buyer identity](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context).
- [cartBuyerIdentityUpdate](https://shopify.dev/docs/api/storefront/latest/mutations/cartbuyeridentityupdate).
- [Idioma del checkout](https://help.shopify.com/en/manual/checkout-settings/checkout-language).
