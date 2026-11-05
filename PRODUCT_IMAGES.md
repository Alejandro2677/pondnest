# Fotografías de productos

1. Añade originales a `public/productos/r36s/`, `bag/`, `protector/` o `r36h/`.
2. Ejecuta `npm run optimize:images` (también se ejecuta antes de compilar).
3. Reinicia la vista previa o vuelve a publicar la compilación para ver los cambios.

Sharp reconoce JPEG, PNG, WebP, AVIF, TIFF y GIF estático por contenido, incluso sin extensión. Un formato no compatible requiere exportarlo a PNG/JPEG. Las imágenes animadas o multipágina generan un error explícito para evitar perder fotogramas. Los originales nunca se sobrescriben ni eliminan.

En `config/product-images.json`, `primary` admite el nombre completo del original o su nombre sin extensión (por ejemplo, `01-principal.webp`). `order` permite fijar una secuencia explícita de nombres. Primero aparece la portada, después los nombres de `order`, después el resto por nombre de archivo en orden Unicode estable e independiente del idioma. Usa prefijos `01-`, `02-`… para controlar ese orden. No uses nombres duplicados con diferentes extensiones si configuras la portada sin extensión.

La calidad predeterminada es 85, con un máximo de 1920 px por lado, sin ampliar, recortar ni deformar. `widths` configura las versiones responsive. Se aplica la orientación EXIF y se conserva la transparencia; no se añaden fondos ni ajustes de color. WebP existentes se comparan con la recompresión; si el original es menor y no necesita reducirse ni orientarse, se copia intacto.

Las versiones finales están en `_optimized/`, con nombres basados en el contenido. `src/data/product-images.generated.json` contiene dimensiones, variantes y estadísticas. `.cache/product-images.json` evita reconvertir originales que no cambian. Conserva el manifiesto y las imágenes optimizadas junto con el código. Los archivos derivados antiguos se conservan para no romper cachés de despliegues anteriores; no forman parte de la galería actual.

Cada producto usa únicamente su propia carpeta. Si queda vacía, se mantiene la referencia de demostración y se avisa en la consola de desarrollo. La capa visual aplica las fotografías locales también a productos conectados, sin cambiar Shopify ni la lógica del carrito.

`public/_headers` configura un año de caché inmutable para las imágenes con hash en hosts compatibles con ese formato (por ejemplo, Netlify). En otros hosts configura la misma cabecera `Cache-Control: public, max-age=31536000, immutable` para `/productos/*/_optimized/*` (incluye el prefijo `/pondnest/` si publicas con ese base). No la apliques a originales ni al HTML. Vite de desarrollo no representa la política de caché del servidor de producción.

El informe del comando compara bytes de originales con versiones WebP completas; `responsiveBytes` incluye además todas las variantes activas. Los originales siguen ocupando espacio en disco y en `dist` porque se conservan dentro de `public`. El ahorro indicado corresponde a las imágenes servidas, no al almacenamiento total de la carpeta.
