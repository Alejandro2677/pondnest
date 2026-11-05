# PondNest

Frontend React + Vite para España, en español y EUR. **Demostración: no admite pagos ni crea pedidos.** Se reutilizan el proyecto y el GLB detallado v0.3 existentes.

PondNest es una tienda de consolas retro centrada en la R36S de 128 GB con ArkOS, con R36H como referencia secundaria. Incluye catálogo, carrito, guía de configuración, contenido social con consentimiento y una introducción 3D interactiva.

Tecnologías: React 19, Vite 6, React Router, Three.js con React Three Fiber/Drei, GSAP y ScrollTrigger. La integración comercial usa Shopify Storefront API; las comprobaciones utilizan Node.js Test Runner, Playwright y axe-core.

## Ejecutar

Node.js 24; verificado con Node 24.13.1 y Chrome instalado.

```sh
npm ci
npm run dev
```

URL habitual: http://localhost:5173. Para generar y revisar producción:

```sh
npm run build
npm start
```

Usar el servidor Node existente para servir `dist/` y `/api/commerce` bajo el mismo origen. Preparación de hosting, variables y comprobaciones: [PUBLICACION.md](PUBLICACION.md). El HTML mantiene `noindex, nofollow` mientras sea demo; retirarlo al aprobar el lanzamiento.

## Qué incluye

- Header fijo, menú móvil, catálogo, cuatro fichas con galería, cantidad y variantes, carrito y 404.
- Portada con GLB original: 102 mallas, 17 texturas integradas, aproximadamente 4,5 MB. Carga del módulo 3D bajo demanda.
- Progreso de descarga real; indeterminado cuando el servidor no declara tamaño. Sin demora artificial. Timeout de seguridad de 20 s y botón inmediato para entrar sin animación.
- Scroll reversible con giro de 360° y desmontaje simultáneos en una única timeline GSAP; reconstrucción final frontal. Recorrido efectivo de 700 vh desktop / 455 vh móvil (3,5 veces el anterior), más la altura de la escena sticky. Scrub de 0,25 s, sin reproducción automática ni inercia adicional del modelo.
- Comprar y saltar desde el inicio; fallback por error del modelo, fallo o pérdida de WebGL; escena pausada fuera de pantalla y DPR máximo 1,5.
- Reducción de movimiento del sistema, alternativa estática y elección recordada en sesión. En modo estático no se descarga el GLB.
- Dos filas opuestas de portadas locales de referencia, pausa manual/hover/foco y alternativa sin movimiento. Imágenes completas y optimizadas; no se afirma que los juegos estén incluidos. Configuración en `src/data/games.js` y detalles en [JUEGOS.md](JUEGOS.md).
- Accesorios con compatibilidad pendiente y packs informativos; no se habilitan combinaciones de compra sin verificar.
- FAQ, envíos, devoluciones, contacto, aviso legal, privacidad y cookies. Las páginas informativas son estructuras pendientes de aprobación, no textos legales definitivos.
- Imágenes WebP y carga diferida; fuentes locales con licencias OFL en `public/fonts/`. Originales conservados.
- Foco visible, salto al contenido, etiquetas, errores accesibles, idioma es-ES, títulos y descripción por ruta, formato monetario EUR.

## Arquitectura

Las secciones «Míralo en acción» y «Lo que opinan quienes la han probado» se configuran en `src/data/tiktokVideos.js` y `src/data/reviews.js`. TikTok contiene las cuatro publicaciones proporcionadas; las reseñas del proveedor permanecen en demostración. Los reproductores se cargan automáticamente cerca de la pantalla si hay consentimiento general válido para contenido externo, sin autoplay y silenciados. La elección persiste un máximo de 180 días y se modifica desde «Preferencias de cookies» en el footer; aceptar solo necesarias no permite TikTok. Instrucciones y límites del proveedor en [CONTENIDO_SOCIAL.md](CONTENIDO_SOCIAL.md).

| Archivo | Función |
| --- | --- |
| `src/App.jsx` | Rutas y componentes de presentación |
| `src/Store.jsx` | Catálogo y carrito, persistencia y bloqueo de operaciones concurrentes |
| `src/data/products.js` | Catálogo demo, FAQ y contenido pendiente |
| `src/services/commerce.js` | Adaptador demo / Shopify Storefront API |
| `src/components/Console3D.jsx` | Escena y grupos del GLB original |
| `src/styles.css` | Estilos conservados y refinamientos responsive |

En demo se guardan productos y cantidades, sin importes ficticios. Precio y subtotal aparecen como pendientes; checkout deshabilitado. Almacenamiento local separado por modo/dominio. Si el navegador lo bloquea, el carrito funciona durante la sesión sin persistir.

## Conectar Shopify

La integración usa Storefront privado desde un servidor Node. Configuración en `.env.local` con las variables de `.env.example`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` y `SHOPIFY_API_VERSION`. No usar variables VITE_ para credenciales.

Se conservan el catálogo y las imágenes locales. Los vínculos explícitos por GID están en `config/product-variants.json`; las referencias sin verificar no permiten compra. `npm run shopify:audit` consulta el catálogo real y genera `SHOPIFY_AUDIT.json`.

`Pagar` abre `/resumen-pedido`. `Continuar al pago` revisa cambios y navega al `checkoutUrl` del mismo carrito. Precios unitarios, subtotales y moneda proceden del carrito Shopify. AutoDS no se integra en el frontend.

Desarrollo: `npm run dev`. Producción: `npm run build` y `npm start`. GitHub Pages necesita una API externa bajo el mismo origen mediante proxy o sustituirse por alojamiento Node.

Estado real, referencias pendientes y pruebas: [SHOPIFY_INTEGRACION.md](SHOPIFY_INTEGRACION.md).

## Comprobaciones

```sh
npm test
npm run test:e2e
npm run test:shopify
```

Playwright usa Chrome instalado (`channel: chrome`). La suite general levanta Vite en 5173 si hace falta. La suite Shopify usa una instancia aislada en 5174, valores públicos ficticios y respuestas de red interceptadas: no conecta a Shopify ni crea pedidos reales.

Resultados, fases y límites en [VERIFICACION.md](VERIFICACION.md). Capturas locales en `test-results/` (no versionadas).

## Antes de producción

- Logo oficial SVG/PNG: el monograma actual es provisional, indicado en footer.
- SKU y datos técnicos comprobados, juegos/licencias y contenido de caja. El GLB no es CAD ni un escaneo: interiores, puertos y proporciones son aproximados.
- Fotos comerciales autorizadas y revisión de texturas. Las capturas y referencias IA no prueban hardware ni derechos de publicación.
- Compatibilidad de accesorios y economía de packs antes de habilitarlos.
- Precios, stock, fiscalidad, entrega, garantía, identidad del vendedor, contacto y políticas aprobadas.
- Pedido completo Shopify → AutoDS, cancelación y devolución.
- Móviles físicos, Safari/iOS, redes lentas y medición de rendimiento. El chunk 3D (~921 kB sin gzip, ~249 kB gzip) sigue siendo grande y Vite lo advierte. Se carga aparte de las fichas y carrito; queda margen de optimización de GLB, texturas y fuentes.
- SEO de producción: canonical, sitemap, metadatos comerciales y prerender si procede; alojamiento SPA, compresión y caché. Revisar consentimiento antes de integrar publicidad/analítica. No hay seguimiento publicitario activado.

Producto principal actualizado: R36S de 128 GB, morada transparente, ArkOS. Configuración y resumen del proveedor en src/data/mainProduct.js. Comparativa 3D, pendientes y trazabilidad en ACTUALIZACION_R36S.md. Las fotografías nuevas se conservan como referencia; no se publica material del proveedor automáticamente.

## Repositorio y cambios futuros

Repositorio privado: [Alejandro2677/pondnest](https://github.com/Alejandro2677/pondnest). Rama principal: `main`.

El repositorio incluye `src/`, `public/` (imágenes, fuentes y modelos GLB), `requisitos/`, scripts, pruebas y documentación. `node_modules/`, `dist/`, capturas generadas, archivos temporales, credenciales y `.env*` están excluidos; `.env.example` contiene solo campos vacíos o valores no secretos.

Para obtener el proyecto en otro equipo:

```sh
git clone https://github.com/Alejandro2677/pondnest.git
cd pondnest
npm ci
npm run dev
```

Para subir cambios desde Visual Studio Code: abre **Control de código fuente**, revisa los archivos modificados, prepara los cambios, escribe un mensaje de commit y pulsa **Confirmar**. Después usa **Sincronizar cambios** o **Push**. Comprueba que trabajas en el repositorio PondNest y la rama `main`.

También puedes usar la terminal integrada, desde la raíz del proyecto:

```sh
git status
git add .
git diff --cached --stat
git commit -m "Describe los cambios"
git push origin main
```

Revisa lo que preparas y no añadas secretos. Usa el inicio de sesión oficial de GitHub cuando sea necesario; no guardes tokens en archivos del proyecto. No se incluye una licencia comercial para las imágenes o los contenidos de terceros: conserva las comprobaciones de derechos pendientes descritas en la documentación.


## GitHub Pages

Web: https://alejandro2677.github.io/pondnest/

Compilar para Pages: `npm run build -- --mode pages`. Publicar el contenido de `dist` en la rama `gh-pages` (raíz). La navegación usa hash en Pages para poder recargar las páginas sin errores 404.
