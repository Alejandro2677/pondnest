# Integración Shopify

Conexión Storefront real verificada para v7rhrj-hj.myshopify.com. Token guardado solo en .env.local (excluido de Git). No se incluye en los archivos publicados.

## Variantes

12 opciones vinculadas por GID: R36S morada transparente 128 GB ArkOS, las seis R36H, las cuatro fundas y el estuche negro.

Las otras 12 referencias R36S se conservan visibles con compra deshabilitada: su capacidad no está verificada en la web. Además, hay dos referencias visuales rojas transparentes y colores sin equivalencia inequívoca. No se han asignado por semejanza de foto o nombre.

Confirmar la capacidad y, cuando corresponda, el color exacto de las siguientes referencias y completar su shopifyVariantId en config/product-variants.json:

- r36s-02: Blanco
- r36s-03: Morado claro
- r36s-04: Azul
- r36s-05: Turquesa transparente
- r36s-06: Rojo
- r36s-07: Variante 07 · rojo transparente
- r36s-08: Amarillo
- r36s-09: Turquesa
- r36s-10: Rosa
- r36s-11: Azul petróleo transparente
- r36s-12: Naranja transparente
- r36s-13: Variante 13 · rojo transparente

Shopify también contiene R36H Green de 64 y 128 GB que no tienen una opción visual local. No se ha cambiado el diseño ni se han añadido fotos sin confirmar. La lista completa de IDs remotos y vínculos está en SHOPIFY_AUDIT.json.

## Flujo y pruebas

Pagar consulta el mismo carrito y abre /resumen-pedido dentro de la web. Continuar al pago vuelve a consultarlo: si cambian precio, moneda, disponibilidad, variantes o cantidades, actualiza el resumen y exige una nueva revisión. Solo después navega al checkoutUrl de ese carrito.

Pruebas unitarias: 21 correctas. Pruebas en navegador con Shopify simulado: dos correctas (cuatro productos, carrito mixto, cambios de precio y compra deshabilitada para opciones no vinculadas).

Prueba real: R36S Clear Purple 128 GB (1 x 59,99 EUR), R36H Purple 64 GB (1 x 60 EUR), funda Black (2 x 19 EUR), estuche Black/Bag (1 x 22 EUR). Subtotal Shopify: 179,99 EUR. Cuatro líneas y cinco unidades, comprobadas por GID. Capturas locales: tmp/real-summary.png y tmp/real-checkout.png.

La navegación al checkoutUrl devuelve respuesta HTTP 200, pero termina en la pantalla Opening soon con contraseña de Shopify. La comprobación visual de las líneas dentro del checkout real queda pendiente de acceso a la tienda. No se han realizado pagos ni creado pedidos.

## Ejecución

- Desarrollo: npm run dev.
- Producción: npm run build y npm start; configurar las variables de .env.example en el servidor.
- npm run shopify:audit regenera la auditoría sin secretos ni IDs de carritos; devuelve código 1 si quedan referencias sin verificar.
- GitHub Pages solo sirve archivos estáticos. Este flujo necesita el servidor Node o una API desplegada bajo el mismo origen mediante proxy. No publicar .env.local.

AutoDS sigue conectado a Shopify; no se ha integrado ni modificado en el frontend. Conviene rotar la credencial compartida en el chat y actualizar solo .env.local.
