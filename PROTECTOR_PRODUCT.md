# Funda protectora para R36S

El contenido público y las especificaciones están en `src/data/protectorProduct.js`. El peso no se publica porque las cifras del proveedor son contradictorias. Dimensiones, material, marca y ajuste físico siguen pendientes de comprobación por PondNest.

Los cuatro colores y los IDs internos están en `config/product-variants.json`, bajo `funda-silicona`. Las referencias originales se resuelven a WebP mediante el manifiesto. Cada galería empieza por el color seleccionado, seguido de los otros tres, la composición general y las demás fotografías. No existen fotografías de la funda instalada ni vistas de detalle independientes entre los archivos aportados.

Para publicar información de envío confirmada, configura `shipping` en `protectorProduct.js` como `{ summary: '…', details: '…' }`. Mientras sea `null`, no se muestran plazos ni gastos inventados. Se mantiene el enlace general de envíos.

La recomendación en R36S enlaza a la ficha para elegir color. La compra conjunta está inactiva mientras no haya un catálogo real, precios positivos y variantes disponibles de ambos productos, además de un ID Shopify real y explícito para la funda en `config/product-variants.json`. La referencia de la funda se elige con el valor predeterminado configurado (negro actualmente); su color y ambos precios se muestran antes de añadir. No se aplican descuentos. Los selectores de la ficha de R36S conservan su comportamiento anterior.

Cuando se cumplan los requisitos, el componente usa el método `add` existente para añadir una unidad de consola y una de funda. Son dos operaciones secuenciales; si falla la segunda, avisa de que la consola ya está en el carrito y bloquea repetir la compra conjunta desde esa instancia. No se modifica la lógica general del carrito ni se envían IDs internos de demostración a Shopify.
