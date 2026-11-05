# Ficha R36S

El contenido público y sus estados están en `src/data/r36sProduct.js`. La identificación R36S y la presentación morada transparente están fijadas en el catálogo. Los 128 GB, ArkOS, pantalla de 3,5 pulgadas y material plástico son datos anunciados por el proveedor, no especificaciones verificadas físicamente por PondNest. No hay nuevas especificaciones de hardware comprobadas.

`config/internal/r36s-supplier.json` conserva proveedor, origen, marca indicada, comunicación y logística para revisión interna. No se importa al cliente ni se copia a `dist`. Las dimensiones de embalaje, el peso y la etiqueta Wired no se publican como especificaciones verificadas ni como prueba de conexiones.

No se ha recibido una imagen anotada de controles en esta solicitud. Se utiliza la fotografía local `morado` con cuatro puntos sobre cruceta, ABXY y ambos sticks. Start, Select, FN, encendido y volumen son botones informativos fuera de la imagen, sin ubicaciones ni atajos inventados. Para añadir posiciones verificadas, edita `controls` en `r36sProduct.js`, con coordenadas porcentuales `x`/`y` sobre la fotografía completa.

`config/r36s-library.json` prepara el catálogo real:

- `systems`: registros `{ id, name, compatibilityVerified }`. Solo se publican con `compatibilityVerified: true`.
- `games`: registros `{ id, name, includedVerified, rightsVerified }`. Solo se anuncian como incluidos tras verificar inclusión y derechos.
- `connections`: registros `{ id, name, verified }`. Solo se publican con `verified: true`.

Las portadas actuales son referencias visuales y no alimentan esas listas. No se anuncian cifras de juegos, sistemas, emuladores ni rendimiento sin verificar.

La ficha reutiliza `ReviewsSection` y `SupplierRating` sin alterar sus datos ni su filtrado. La puntuación 4,6/5 y las 20 valoraciones mantienen su origen en la plataforma del proveedor. La selección histórica de opiniones sigue oculta mientras su correspondencia con esta R36S esté pendiente de comprobar.

Los accesorios permanecen bajo «Accesorios en preparación», con ajuste pendiente explícito. No se anuncian como compatibilidad comprobada ni se activan promociones. Carrito, variantes, precios e integración Shopify mantienen su comportamiento anterior.
