# Variantes visuales

`config/product-variants.json` es la única configuración de referencias. Cada entrada tiene ID interno estable, producto, nombre, color, capacidad opcional, imagen principal, imágenes adicionales, ID de Shopify nulo y disponibilidad sin verificar. Los nombres de imágenes se refieren a `source` del manifiesto WebP, no a los nombres con hash: el sistema resuelve la URL optimizada automáticamente.

- R36S: 13 referencias individuales. Morado transparente es la inicial. `portada` es una fotografía general, no una variante.
- R36H: negro transparente, blanco y morado transparente, cada uno con 64 GB y 128 GB; seis referencias de demostración. Las fotografías verde y de conjuntos se mantienen en la galería sin crear variantes adicionales.
- Protector: negro (`negro`), blanco (`blancop`), morado (`lilap`) y verde (`verdep`). Las otras fotografías se conservan como vistas adicionales.
- Estuche: negro, sin selector.

La identificación visual no confirma SKU, packs, configuración ni stock del proveedor. Las referencias R36S `r36s-07` (`rojotr`) y `r36s-13` (`Imagen de ChatGPT 3 nov 2026, 18_26_53-6.png`) tienen apariencia roja transparente similar. Sus nombres son provisionales; se mantienen como dos referencias aportadas, pendientes de confirmar qué distingue sus presentaciones. No se han recibido capturas de Alibaba en esta solicitud. Los demás nombres describen únicamente la apariencia visible, sin atribuir especificaciones.

Para añadir las dos referencias R36S restantes: guarda sus originales en `public/productos/r36s/`, ejecuta `npm run optimize:images` y añade dos entradas a `products.r36s.variants` de `config/product-variants.json`, con IDs internos nuevos (`r36s-14`, `r36s-15`), nombres e imágenes identificados. No hay que modificar los componentes. No añadas entradas antes de recibir las imágenes.

Los selectores son una capa visual de demostración y no alteran la lógica ni las líneas del carrito existente. El identificador elegido se conserva en React y aparece en `data-variant-id` para inspección. No se envían estos IDs internos a Shopify. La navegación de la galería no cambia la referencia elegida. Cambiar de color o referencia restablece la vista a su imagen principal; cambiar solo capacidad conserva la fotografía que se está viendo.

Para la integración futura, asigna IDs reales explícitos y usa `getProductVariants(product, 'live')`: solo devuelve referencias mapeadas a entradas disponibles del catálogo real. `optionVariant` exige que la combinación completa exista y no cambia silenciosamente la otra dimensión. Actualmente las fichas conectadas conservan su comportamiento comercial previo; no se ha activado la integración de esta capa visual con Shopify.
