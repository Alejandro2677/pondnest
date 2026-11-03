# Checklist de aceptación · PondNest v1

## Setup

- [ ] `npm install` completa sin errores relevantes.
- [ ] `npm run dev` abre la web y no hay errores de consola bloqueantes.
- [ ] `npm run build` finaliza correctamente.
- [ ] No hay secretos privados en archivos públicos o git.

## Identidad y diseño

- [ ] PondNest logo real integrado, o pendiente claramente señalado sin inventar logo definitivo.
- [ ] Estética oscura premium consistente y buena jerarquía visual.
- [ ] Home usable y atractiva en escritorio y móvil (320, 375, 430, 768, 1440 px).
- [ ] Header, navegación, carrito y footer visibles y coherentes.

## 3D

- [ ] Carga `public/models/gamegaga-r36hd-detailed.glb` correctamente.
- [ ] Solo la Gamegaga R36 HD tiene escena 3D; R36H y accesorios son normales.
- [ ] Loading refleja la carga, no barra falsa.
- [ ] Si GLB falla, se puede navegar/comprar sin bloqueo.
- [ ] Scroll reversible: presentación → despiece → controles → montaje/giro → trasera/gatillos → regreso → tienda.
- [ ] Textos no tapan consola ni CTA en móvil.
- [ ] «Comprar ahora» y «Saltar introducción» funcionan.
- [ ] Con `prefers-reduced-motion`, se presenta alternativa clara sin animación obligatoria.
- [ ] Render estable a resolución móvil razonable.

## Catálogo y juegos

- [ ] Los 4 productos tienen ficha o pantalla de detalle accesible.
- [ ] R36 HD morada es protagonista, no sustituida por R36S convencional.
- [ ] No se afirma compatibilidad de fundas/estuche sin verificar.
- [ ] Sección juegos: dos filas horizontales moviéndose en direcciones opuestas con pausa y fallback.
- [ ] Ninguna cifra de juegos/títulos protegidos se presenta como incluido sin verificación.
- [ ] Imágenes del proveedor e IA marcadas para revisión de derechos antes de publicar.

## Ecommerce

- [ ] En modo demo, los botones no fingen procesar pagos reales.
- [ ] Shopify preparado con capa de servicios separada.
- [ ] Con Shopify real, fichas, variantes, precios y stock provienen de la tienda, no de mocks.
- [ ] Carrito permite añadir, quitar, modificar cantidades y muestra errores adecuados.
- [ ] Checkout redirige a URL real de Shopify, no a formulario inventado.
- [ ] AutoDS y Shopify probados juntos antes de activar venta real.

## Legal/SEO/UX

- [ ] No hay reseñas, contadores ni descuentos falsos.
- [ ] Páginas legales informativas disponibles y textos pendientes revisados antes de publicar.
- [ ] Idioma `es-ES`, moneda EUR; títulos/meta descripciones y alt adecuados.
- [ ] Navegación teclado y contraste accesibles.
- [ ] Estado vacío, error, carga, agotado probados.
- [ ] Comprobar en móvil real y en navegador sin WebGL.

## Entrega

- [ ] `README.md` actualizado.
- [ ] Describir qué está acabado, qué es demo y qué depende de activos, Shopify o derechos.
- [ ] Anotar pruebas ejecutadas y errores persistentes sin declarar éxito ficticio.
