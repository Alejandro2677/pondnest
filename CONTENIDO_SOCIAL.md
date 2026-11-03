# Vídeos y reseñas de PondNest

Las secciones están en la home, entre juegos y accesorios (vídeos) y entre accesorios e información (reseñas). El 3D, sus materiales y su timeline no se han modificado. No se añaden dependencias.

## Añadir vídeos de TikTok

Edita `src/data/tiktokVideos.js`. Están configuradas las cuatro publicaciones proporcionadas de `@chavalon.reviews`, `@brian_androwin`, `@arcadenoventas` y `@kemps007`, sin parámetros de seguimiento. Si vacías la lista se muestran cuatro espacios de demostración, sin reproductores ni solicitudes a TikTok.

Cada registro admite:

```js
{
  url: "https://www.tiktok.com/@CREADOR_REAL/video/ID_REAL",
  creator: "@CREADOR_REAL",
  description: "Descripción breve y factual de la publicación",
  productHandle: "r36s",
  embedAllowed: true,
  thumbnail: "/videos/miniatura-autorizada.webp", // opcional
}
```

Sustituye los marcadores por datos reales. No hay que descargar el vídeo: se integra el reproductor oficial. Publica únicamente contenido público relacionado con los productos de PondNest cuya integración esté permitida por su creador y las condiciones de TikTok. La marca `embedAllowed` es una confirmación manual del editor, no una comprobación automática de derechos.

- Usa la URL completa de una publicación `/@usuario/video/ID`; los enlaces cortos no pueden convertirse sin resolverlos. Se muestran como enlace al original, sin cargar reproductor.
- `productHandle` admite `r36s`, `r36h`, `funda-silicona` y `estuche-transporte`. Otros productos o enlaces fuera de TikTok se omiten.
- Miniatura opcional: archivo local autorizado dentro de `public/`. Por ejemplo `public/videos/miniatura-autorizada.webp` se referencia como `/videos/miniatura-autorizada.webp`. Las miniaturas remotas se ignoran para evitar solicitudes previas al consentimiento. Si no hay miniatura se muestra una tarjeta neutra.
- `embedAllowed: false`, ausente, o URL corta: solo enlace al original. `true` no garantiza que TikTok permita la reproducción en todos los países/navegadores.
- El nombre y la descripción se configuran manualmente; no se solicita oEmbed ni se consulta TikTok para obtener metadatos al cargar la página. Los parámetros de seguimiento de la URL se eliminan.

## Consentimiento y reproducción

1. Sin consentimiento no existe ningún iframe, script, imagen remota ni precarga de TikTok. La primera visita muestra el aviso general de cookies, no un aviso propio del carrusel.
2. Las categorías necesarias y contenido externo se gestionan con `CookieConsentProvider`. «Solo necesarias» nunca autoriza TikTok. «Aceptar contenido externo» o guardar esa categoría activada permite sus reproductores. La preferencia se guarda en `localStorage`, clave `pondnest:cookie-preferences`, con versión y caducidad máxima de 180 días. Registros expirados, incompatibles o mal formados se rechazan. Si el almacenamiento está bloqueado, la elección solo dura la sesión de la página.
3. Con permiso válido, cada reproductor cercano se carga automáticamente mediante IntersectionObserver (margen de aproximación de 350 px), sin botones de carga. Se muestran cuatro en escritorio desde 1024 px y un carrusel táctil en móvil. Todos usan autoplay desactivado y `force_muted=1`. TikTok puede inicializar su API solo después del primer clic en su botón de reproducción, o mostrar su propia elección de cookies. El iframe cargado se conserva; «Pulsa ▷ en el vídeo» no exige cargar nada más. «Activar sonido» recarga ese reproductor en pausa con audio permitido y silencia los otros; el usuario debe volver a pulsar reproducir.
4. Al comenzar a reproducir un vídeo, se solicita pausa y silencio a los demás. Solo uno puede tener audio habilitado en la URL. Al salir del área visible se solicita pausa/silencio y se retira su permiso de audio; al alejarse del margen de carga se desmonta. Al ocultar la pestaña se retiran todos. Al volver, cargan en pausa y silenciados, sin reanudación automática.
5. «Preferencias de cookies» en el footer permite modificar o retirar la autorización. Guardar contenido externo desactivado o «Solo necesarias» desmonta todos los iframes inmediatamente, bloquea nuevas solicitudes y conserva el rechazo al recargar. Se sincroniza entre pestañas y se comprueba la caducidad durante la sesión. Retirar la autorización no borra cookies que TikTok ya haya establecido.
6. Errores del proveedor o 15 segundos sin cargar el iframe muestran una alternativa con enlace al original. La ausencia inicial de API no se confunde con un fallo de red. Los nombres de creador y el enlace original permanecen visibles. Una vez en TikTok se aplican sus condiciones y privacidad.

Se valida el origen y la ventana emisora de los mensajes. No se usa reproducción automática, scripts globales de TikTok, descarga de vídeos ni analítica propia. La información del tercero está en las preferencias generales. El proyecto no tenía un gestor general anterior: esta implementación local es su punto único de decisión. Si se incorpora una plataforma de consentimiento externa, conectarla a este estado; no montar un segundo gestor paralelo. Los textos de privacidad definitivos del comercio siguen pendientes de aprobación antes de producción.

Referencia de implementación: [TikTok Embed Player, documentación oficial](https://developers.tiktok.com/docs/en/embed-player). La reproducción depende del proveedor, de los permisos de cada vídeo y de las restricciones del navegador.

## Añadir reseñas auténticas

`src/data/reviews.js` conserva el historial preparado para futuras integraciones; no se ha reemplazado ni mezclado con opiniones del proveedor. Actualmente está vacío. En su lugar, la sección muestra la selección del proveedor descrita a continuación, siempre etiquetada como demostración.

Estructura de un registro (rellenar con datos reales):

```js
{
  id: "ID_UNICO_DE_LA_OPINION",
  author: "NOMBRE_PUBLICO_AUTORIZADO",
  date: "FECHA_REAL_EN_FORMATO_YYYY-MM-DD",
  rating: null, // sustituir por la puntuación real, número entre 1 y 5
  comment: "COMENTARIO_REAL_AUTORIZADO",
  productHandle: "r36s",
  published: false, // activar solo al validar el contenido
  image: "/resenas/foto-autorizada.webp", // opcional, archivo local
  imageAlt: "Descripción de la imagen",
  source: "manual",
}
```

Solo aparecen registros publicados, no marcados como demo, con autor, comentario, fecha válida, producto reconocido y puntuación entre 1 y 5. Los identificadores duplicados se omiten. No incluyas datos privados de pedidos ni contactos: este archivo es público.

La valoración media y el recuento se calculan exclusivamente con esas reseñas publicadas. No se muestra un distintivo de compra verificada: esta estructura no acredita una compra. Las imágenes deben ser locales y autorizadas; las remotas se ignoran. El comentario se renderiza como texto, no HTML.

## Conectar una aplicación de reseñas

### Selección del proveedor en demostración

Las seis opiniones facilitadas se guardan por separado en `src/data/supplierReviews.js`. Cada registro conserva autor anonimizado, país, fecha ISO, valoración individual, variante y comentario español. El original inglés de la primera opinión se conserva en `originalComment`; no se han inventado originales para las otras cinco. Las dos opiniones de C*z se mantienen como registros distintos, con sus variantes respectivas.

`mode: "demo"`, `isSelection: true`, `productMatchVerified: false` y `reuseRightsVerified: false` identifican el estado pendiente. No son reseñas de clientes ni compras verificadas en PondNest. La sección muestra avisos de procedencia, traducción, selección parcial y revisión pendiente del producto y de los derechos. No calcula ni muestra una media ni una puntuación agregada de esta selección.

El carrusel permite ver tres tarjetas en escritorio y una principal en móvil, con flechas, desplazamiento horizontal suave y reducción de movimiento. Las estrellas naranjas muestran únicamente la valoración individual proporcionada. La variante se etiqueta como «Variante de esta opinión» para no presentarla como una variante confirmada del catálogo.

Estas opiniones no entran en `prepareReviews` ni en `reviewSummary`. Si una futura integración aporta reseñas publicadas válidas a `ReviewsSection`, se utiliza la vía existente de reseñas reales y no se mezcla la selección del proveedor. No basta con cambiar los metadatos del archivo para aprobar su publicación comercial: siguen pendientes comprobar la correspondencia del SKU y el permiso de reutilización.

### Integración futura

`ReviewsSection` acepta la prop `reviews` con una lista de esta misma estructura. Un futuro adaptador puede cargar datos autorizados de una aplicación de reseñas de Shopify, normalizar sus campos y pasar esa lista al componente. No es necesario cambiar la presentación. Las funciones `prepareReviews` y `reviewSummary` están en `src/services/socialContent.js`.

Pendiente: elegir proveedor, configurar acceso/credenciales en un backend si se requieren secretos, mapear productos y moderación, errores/paginación de la API y prueba con datos reales. No insertar tokens privados en el frontend. El resumen actual cuenta la lista publicada que recibe, no inventa el total de una API paginada; al integrar paginación, obtener todas las reseñas o adaptar el resumen a un agregado fiable del proveedor.

## Comprobaciones

- Build de Vite; pruebas unitarias de validación de URL, permisos, imágenes locales, datos de reseñas y medias.
- Navegador: primera visita sin conexión a TikTok, solo necesarias, aceptación, carga automática cerca del carrusel (cuatro iframes en escritorio), recarga con preferencia vigente, retirada desde el footer y entre pestañas, caducidad, diálogo accesible, móvil, pausa y coordinación de audio, fallback ante errores. No hay botones de carga ni segundo aviso encima de los vídeos. Los reproductores de estas pruebas están interceptados, sin usar vídeos reales.
- Se revisan puntuaciones, fechas, foto opcional y promedio con datos de prueba aislados. Accesibilidad automática, teclado, flujo de compra demo y regresión del 3D siguen cubiertos por la suite general.
- Prueba real en Chrome el 2 de noviembre de 2026: reproducción dentro de la web y audio silenciado confirmados para `@brian_androwin` (73,97 s), `@arcadenoventas` (60,37 s) y `@kemps007` (52,33 s), observando vídeo en reproducción y tiempo avanzando. El reproductor de `@chavalon.reviews` carga, pero el archivo multimedia devuelve HTTP 403 de `v16-webapp-prime.tiktok.com` y TikTok emite `3001 PLAYBACK_ERROR`; se muestra la alternativa al original. No se ha eludido esta restricción ni descargado el contenido. Su reproducción queda pendiente de una respuesta válida del proveedor o un enlace alternativo.
- No hay una aplicación de reseñas conectada ni pruebas en móvil físico.

Comandos: `npm test`, `npm run test:e2e` y `npm run build`. Capturas en `test-results/tiktok-demo-*.png` y `test-results/reviews-demo-*.png`.
