# Verificación · 2 de noviembre de 2026

## Consentimiento general y carga automática de TikTok

El repositorio tenía una página informativa, pero no un gestor global de cookies. Se añade un gestor único, versionado, con categorías necesarias/contenido externo y preferencias persistidas durante un máximo de 180 días. Se abre desde el footer. Preferencias inválidas, caducadas o solo necesarias no permiten TikTok; la retirada desmonta los iframes y se sincroniza entre pestañas.

Se eliminan el aviso superior propio de TikTok, el botón de retirada en la sección y los botones de carga. IntersectionObserver carga los vídeos cercanos automáticamente si hay permiso. Sin autoplay ni audio inicial; cuatro tarjetas en escritorio y carrusel táctil en móvil. Los eventos de reproducción pausan/silencian otros reproductores y solo una URL puede permitir sonido. Se conserva la alternativa al original ante fallos del proveedor y no se cambian las URL configuradas.

Pruebas específicas: primera visita y cero solicitudes antes de aceptar, elección de solo necesarias, aceptación, recarga con permiso válido, retirada desde el footer y otra pestaña, caducidad, teclado/accesibilidad del diálogo, móvil, carga automática de los cuatro IDs, coordinación de audio y errores. Las pruebas de contenido externo interceptan TikTok; no vuelven a certificar la disponibilidad real del vídeo del proveedor que devolvía 403. Se mantienen las comprobaciones de regresión de 3D, catálogo, juegos y opiniones. Las preferencias de las pruebas no relacionadas parten de «Solo necesarias»; las de consentimiento parten de una visita limpia.

## Selección de opiniones del proveedor

Se incorporan las seis opiniones proporcionadas en `src/data/supplierReviews.js`, separadas del historial original `src/data/reviews.js`, que conserva su hash. Procedencia, traducción, carácter selectivo y modo demostración visibles; sin media ni acreditación de compra en PondNest. Se conservan las variantes y fechas aportadas, así como el único comentario original facilitado. Tres tarjetas visibles en escritorio y una principal en móvil, estrellas naranjas y navegación horizontal.

Las pruebas nuevas revisan los seis registros, fecha/autor/país/variante/comentario, estrellas, ausencia de promedio, avisos, flechas y accesibilidad en 375 y 1440 px. También comprueban que la selección no entra en la vía de reseñas publicadas y que los dos registros de C*z siguen separados. Los archivos de configuración de TikTok, modelo y timeline 3D conservan sus hashes previos. Los datos del proveedor siguen pendientes de comprobar SKU y derechos de reutilización comercial.

## Publicaciones reales de TikTok

Se configuran las cuatro URL proporcionadas y se eliminan sus parámetros de seguimiento. Se mantienen el carrusel, el consentimiento previo y un solo iframe. Se corrige una incompatibilidad observada en la prueba real: TikTok puede emitir API-ready solo tras el primer clic en sus controles; un iframe cargado ya no se retira por esperar ese evento ni se pausa la acción del usuario. Carga sin autoplay, silencio forzado inicial y audio únicamente tras activación explícita (recarga en pausa).

Prueba real: reproducción silenciada confirmada para brian_androwin, arcadenoventas y kemps007. chavalon.reviews devuelve HTTP 403 en el servidor multimedia y `3001 PLAYBACK_ERROR`; su reproducción no se declara validada y conserva el fallback. Detalles en [CONTENIDO_SOCIAL.md](CONTENIDO_SOCIAL.md). Se amplían las pruebas para los cuatro IDs, el inicio nativo diferido y el cambio explícito de sonido. El 3D y el resto de las secciones no se modifican.

## Portadas de juegos

Se sustituyen únicamente las tarjetas de géneros del carrusel de juegos por las seis portadas locales proporcionadas. Se conservan los originales y se crean derivados WebP sin recorte, reduciendo el peso conjunto aproximadamente un 67 %. Configuración y correspondencia de archivos en [JUEGOS.md](JUEGOS.md).

Cuatro comprobaciones adicionales cubren carga de todas las imágenes, original de respaldo, tamaños iguales, imágenes completas, direcciones opuestas, pausa, bucle sin huecos a 375/1440/2560 px y alternativa de movimiento reducido. El aviso de la sección no promete juegos incluidos y señala la revisión pendiente de derechos. `Console3D.jsx` y `consoleSequence.js` conservan los hashes previos al cambio.

## Incorporación de vídeos y reseñas

Se añaden componentes independientes, carrusel horizontal compartido, datos configurables y estilos limitados a las nuevas secciones. Las únicas modificaciones de la home son imports e inserción de los dos componentes. No se modifica el 3D; los hashes de `Console3D.jsx` y `consoleSequence.js` coinciden con los previos al cambio. No se añadieron dependencias.

Inicialmente son espacios demo sin contenido de terceros ni puntuaciones inventadas. Reproductor oficial bajo consentimiento y acción explícita, uno a la vez, sin autoplay, con controles y cierre fuera de pantalla. Reseñas preparadas para autor, fecha, puntuación y foto autorizada; promedio únicamente sobre datos publicados válidos. Pruebas adicionales y configuración documentadas en [CONTENIDO_SOCIAL.md](CONTENIDO_SOCIAL.md). No se ha conectado una aplicación de opiniones ni probado un vídeo real autorizado.

## Ajuste de animación 3D

Se amplía el scroll efectivo 3,5 veces (700 vh en escritorio y 455 vh en móvil), conservando el sticky y los estilos de la tienda. Giro 0–360°, separación y montaje se controlan desde una sola timeline reversible con scrub de 0,25 s. La trasera permanece visible con piezas separadas en el tramo central. Se elimina la interpolación por fotograma para evitar posiciones residuales e inercia adicional. Modelo, materiales y funciones comerciales se conservan.

Comprobados build, 12 tests unitarios (4 nuevos de sincronización, giro completo, reversibilidad y ausencia de autoplay) y 17 pruebas de navegador: los 14 recorridos existentes y 3 nuevos sobre las transformaciones reales de Three.js, en escritorio/móvil y tras cambiar el tamaño. Se verifican distancia de scroll, sticky, separación simultánea al giro, trasera, reconstrucción y retorno sin desplazamientos; capturas locales en `test-results/synchronized-*.png`. No se ha probado un teléfono físico.

## Revisión y fases

Se leyeron los documentos de `requisitos/`, referencias visuales, código original e índice del GLB antes de editar. El modelo detallado contiene 102 mallas y 17 imágenes integradas; se conserva. R36H y accesorios no cargan escenas 3D.

El prototipo ya tenía React/Vite, estilos, tarjetas estáticas, escena por grupos y ScrollTrigger. Faltaban fichas, carrito, servicio comercial, FAQ, páginas informativas y manejo completo de errores. Se retiró la capacidad de 64 GB no validada del texto público y el contacto sin comportamiento se sustituyó por una página pendiente de configuración.

1. Auditoría de documentos, imágenes, código y modelo. Dependencias instaladas; stack conservado.
2. Datos, adaptador comercial, rutas, estado compartido y errores.
3. Loader real, portada, encuadre responsive y CTA.
4. Despiece visual con grupos originales, controles, reconstrucción, giro posterior, gatillos y frontal. Capturas de poses estabilizadas y comprobación de scroll reversible.
5. Catálogo, galerías, dos filas de géneros, accesorios y packs informativos.
6. Carrito demo persistente y adaptador Storefront. Integración probada con respuestas controladas; falta tienda real.
7. WebP, fuentes locales, DPR limitado, pausa de escena fuera de pantalla, reducción de movimiento y acceso por teclado.
8. Build, pruebas y capturas de Chrome en Playwright. No se ha publicado el sitio.

## Comprobaciones

- Instalación npm completada; auditoría sin vulnerabilidades en dependencias instaladas.
- Build Vite completado. Advertencia de tamaño del módulo 3D documentada en README.
- 8 pruebas de servicio: demo, configuración incompleta, fuente de precios/stock, paginación, Cart API, errores, caducidad, avisos y checkout HTTPS.
- 14 pruebas de navegador: anchuras 320/375/430/768/1440; ficha → añadir → cambiar cantidad → recargar → quitar; checkout demo bloqueado, menú, galería, cuatro fichas, FAQ, información y 404. Verificación de imágenes del catálogo al desplazarse.
- La suite incluye GLB cargado, capítulos en ambos sentidos, salto de intro, encuadre móvil/tablet/pantalla corta, fallo del GLB, descarga bloqueada y ausencia de WebGL. La alternativa estática no solicita el modelo. No se detectaron errores JS bloqueantes en los recorridos que los registran.
- Axe no detectó incidencias para las reglas WCAG 2 A/AA y 2.1 AA examinadas en inicio estático, ficha protagonista, carrito vacío y FAQ. Se prueba el salto al contenido con teclado. No equivale a una auditoría completa de accesibilidad.
- 3 pruebas Shopify con respuestas interceptadas: catálogo, variante agotada, persistencia, cantidades/subtotal y redirección a checkout de prueba; fallo de red y rechazo de stock. No se enviaron solicitudes comerciales ni se crearon pedidos reales.

## Límites

- Sin logo oficial, datos comerciales validados, tienda Shopify/AutoDS conectada ni pedido real probado.
- Hardware, juegos/licencias, compatibilidades, permisos de imágenes y contenido legal pendientes de verificar.
- El control nativo de Chrome se detuvo automáticamente al no poder determinar la URL activa con suficiente confianza. No se continuó por esa vía; se revisaron capturas locales de las pruebas automatizadas.
- Sin pruebas en móvil físico, Safari/iOS o Firefox; sin medición de red móvil real ni certificación Lighthouse/Core Web Vitals.
- Modelo aproximado de 4,5 MB y módulo Three/R3F grande. Requiere medición de rendimiento con dispositivos y alojamiento reales.
- Fuentes locales con licencias OFL. Versiones WebP y originales de producto conservados; la conversión no resuelve derechos comerciales.
- Packs de compra, formulario de contacto, publicidad y pagos demo no habilitados. Las páginas informativas son estructuras pendientes, no políticas aprobadas.

## 2026-11-03 · Guía ArkOS
- Ruta /guia-configuracion: 9 categorías y 15 tutoriales; búsqueda sin distinción de tildes, filtros y acordeones.
- Fuentes y límites documentados en GUIA_CONFIGURACION.md. ArkOS confirmado por el propietario; versión y botones de su R36 HD sin verificar.
- YouTube sujeto a consentimiento v2 TikTok/YouTube, diferido y retirado al revocar. Reproducción real no confirmada en navegador automatizado; enlace original disponible.
- Build correcto, 21 pruebas unitarias y 42 pruebas de navegador aprobadas, incluida accesibilidad de la guía, tamaños 375/768/1440 y regresiones de tienda, 3D, juegos, reseñas y TikTok.
- Hashes de Console3D, consoleSequence, Store, commerce y configuración TikTok idénticos a los anteriores al cambio.


## 2026-11-03 · Cambio de producto principal a R36S
- Catálogo, variante 128 GB morada transparente / ArkOS, portada, enlaces, FAQ, SEO y guía actualizados. R36H conservada. URL anterior redirige a /productos/r36s.
- Anuncio Alibaba 1601781446303 consultado: productReview.averageStar 4.6 y totalReviewCount 20. Resumen independiente en src/data/mainProduct.js, sin promediar las seis opiniones.
- Opiniones originales y reviews.js sin cambios; seis seleccionadas ocultas hasta verificar asociación al nuevo anuncio. Prueba con datos de asociación confirmada conserva su carrusel y presentación.
- GLB, Console3D.jsx, consoleSequence.js y Store.jsx sin cambios. Comparativa de siete imágenes y límites en ACTUALIZACION_R36S.md.
- Build correcto; 21 pruebas unitarias. 44 de 45 casos de navegador pasaron en la ejecución completa; se actualizó una expectativa que mezclaba R36H con R36S y el caso corregido pasó en repetición aislada. Los 45 casos quedan verificados. Tres pruebas de Shopify con API simulada aprobadas.
- Capturas de escritorio/móvil inspeccionadas en artifacts/r36s. No se ha publicado la web ni cambiado el catálogo remoto de Shopify.

