> Estado actual: consulta [PACKS_SHOPIFY_ACTIVACION.md](PACKS_SHOPIFY_ACTIVACION.md). El contenido siguiente describe la demostración anterior.

# Packs PondNest

## Implementación

- `config/packs.json`: composiciones y precios finales propuestos en céntimos: 7500, 8000 y 15000. Ninguno se anuncia como descuento confirmado.
- `src/services/packs.js`: validación de variantes contra catálogo real disponible, selección inicial, construcción y restauración de unidades completas. No se inventan GID ni se suman los componentes al precio del pack.
- `src/components/Packs.jsx`: sección reutilizada una vez en la home, `/packs`, detalles `/packs/:packId` y recomendaciones compactas por producto.
- Los packs se guardan por separado del carrito Shopify, en `pondnest:demo-packs:v1`. Se conserva la selección al recargar y se vuelve a validar contra el catálogo; los precios persistidos se descartan y se reconstruyen desde la configuración.
- Una combinación idéntica aumenta la cantidad del pack; una distinta mantiene su propio grupo. Solo se modifica la cantidad del conjunto o se elimina completo. No existen controles de precio o cantidad de componentes.
- Si el carrito contiene un pack, su resumen es una estimación de demostración y queda bloqueado el pago, incluso mezclado con artículos individuales. Los packs no ejecutan mutaciones de Shopify ni crean pedidos.

## Variantes

Se utilizan únicamente variantes con correspondencia real, verificadas y disponibles en la consulta del catálogo. No basta una fotografía o una referencia local. Los cambios de color de R36H conservan la capacidad, y viceversa; las combinaciones inexistentes quedan deshabilitadas.

La R36S morada se selecciona por defecto entre las referencias confirmadas. La configuración actual no confirma los 128 GB ni ArkOS para esa referencia, y se informa de ello. Cuando se confirme una referencia morada de 128 GB ArkOS en la configuración comercial, la selección inicial la priorizará.

Las fotos proceden del catálogo existente y cambian con la variante seleccionada. No se han generado imágenes.

## IVA y envío

Los precios propuestos incluyen el IVA cuando corresponda. Se reutiliza el resumen fiscal provisional: el 21 % se extrae, nunca se añade encima. Los cuatro artículos actuales comparten el tipo general provisional. Para tipos mixtos futuros, el bundle real deberá devolver su asignación fiscal por componentes desde Shopify.

El envío permanece pendiente en la demostración: una cotización del carrito real no incluye componentes que solo existen en el navegador. No se anuncia envío gratuito ni se inventa ahorro. Al conectar el bundle real, debe utilizar el mismo cálculo de envío, promociones y total remoto del carrito Shopify.

## Conexión futura con Shopify

La configuración reserva la estrategia `native-bundle-product`, desactivada, y `shopifyBundleVariantId: null` en cada pack. No se han creado productos ni variantes de Shopify.

Para venderlos se necesita crear y publicar los bundles reales, configurar sus composiciones y precios en Shopify y resolver cada combinación seleccionada a su variante de bundle real. Esa correspondencia puede exigir una matriz por combinación; el único campo reservado no equivale a una conexión completa. Si las opciones superan los límites del producto bundle nativo, debe usarse un bundle personalizado mediante Cart Transform compatible con la tienda.

El servidor debe validar composición, disponibilidad, precio y moneda del bundle contra Shopify, añadir la variante padre compatible y conservar su relación con los componentes. No debe añadirse también una línea independiente por cada accesorio. Shopify debe asignar importes, impuestos e inventario en el checkout. No se admite un descuento exclusivo de React ni apilar descuentos para forzar el precio.

Cambiar `mode` o `enabled` en el JSON no habilita ventas: la implementación actual permanece deliberadamente en demostración hasta completar y verificar el adaptador de servidor y el checkout. No hay ningún identificador provisional que pueda enviarse a Shopify.

Referencias oficiales: [Shopify Bundles](https://help.shopify.com/en/manual/products/bundles/shopify-bundles), [arquitectura de bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles), [bundles personalizados](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-customized-bundle-function).

## Comprobaciones

Pruebas unitarias de las tres composiciones, precios, impuestos incluidos, cantidades, restauración, mezcla con líneas reales, bloqueo del pago y rechazo de variantes inexistentes o no disponibles. Pruebas de navegador a 375 y 1440 px: fotos reales, selectores, grupos, cantidades, persistencia, eliminación completa, combinación no disponible, ubicación en home, recomendaciones y detalles. El carrito de demostración no llama a operaciones de mutación comerciales.
