# PROMPT MAESTRO · IMPLEMENTAR PONDNEST

Actúa como un **desarrollador frontend senior, diseñador de interfaces e integrador Shopify headless**, con experiencia en React, Three.js, React Three Fiber, GSAP ScrollTrigger, animaciones por scroll, optimización móvil, accesibilidad y conversión de ecommerce.

## TU MISIÓN

Construye dentro de **este repositorio abierto** la primera versión completa y navegable del frontend de **PondNest (pondnest.com)**, una tienda premium de consolas retro para el mercado de **España**. No te limites a describir cómo lo harías: **inspecciona los archivos, implementa los cambios y prueba lo que sea posible**.

Antes de tocar código, lee íntegramente y en este orden:

1. `requisitos/00_LEEME_PRIMERO.md`
2. `requisitos/02_REQUISITOS_FUNCIONALES.md`
3. `requisitos/03_DISENO_MOTION_3D.md`
4. `requisitos/04_PRODUCTOS_Y_CONTENIDOS.md`
5. `requisitos/05_SHOPIFY_AUTODS.md`
6. `requisitos/06_CHECKLIST_ACEPTACION.md`
7. `requisitos/07_ASSETS_Y_RUTAS.md`

Lee después `package.json`, `src/`, `public/`, `README.md` y las imágenes de referencia. Parte del código v0.3 existente; **no sustituyas sin necesidad piezas ya útiles**. Si el repositorio no tiene alguna parte, créala.

## VISIÓN DE LA WEB

Estética **oscura, cinematográfica, minimalista y premium**, no arcade neón recargado. Fondo casi negro/grafito, tipografía limpia y contundente, acentos discretos de lavanda inspirados en la consola morada. Sensación de producto cuidado, sin saturación de banners. Diseño priorizado para móviles porque las visitas llegarán sobre todo de TikTok, Instagram y Meta Ads.

La home empieza con una **pantalla de carga PondNest** vinculada a la descarga real del 3D (sin esperas inventadas). Después muestra una **consola Gamegaga R36 HD vertical morada transparente en 3D** y una introducción **intermedia de scroll**, que no impida comprar: aparece completa, se separan piezas visuales, se explican pantalla y controles, se reúne, gira para enseñar los cuatro gatillos traseros, vuelve de frente y desemboca en la tienda. Botón visible desde el principio: **«Comprar ahora»** y enlace **«Saltar introducción»**. La intro no debe repetirse en cada página de producto.

**No confundir la Gamegaga R36 HD con la R36S clásica.** El usuario eligió la consola de las imágenes de proveedor y de `requisitos/referencias/`. **Solo ese modelo tiene animación 3D**. La R36H horizontal será una ficha normal. Los otros dos productos son funda de silicona y estuche de transporte.

El modelo ya está en `public/models/gamegaga-r36hd-detailed.glb` (o debe añadirse ahí antes de probarlo). **Úsalo**; no lo sustituyas por una caja de geometría genérica ni uses un modelo descargado de otra consola. Es un prototipo de múltiples mallas y texturas integradas que puede abrirse por grupos. Si necesita mejoras visuales, adapta escena, luz y controles; señala los defectos del archivo en vez de inventar detalles físicos de hardware.

## SECCIONES DE LA HOME (ORDEN PROPUESTO)

1. Pantalla de carga con logo PondNest auténtico cuando esté disponible y progreso real del 3D; fallback ante fallo de red.
2. Header transparente al principio, con logo, menú, acceso a productos y carrito. Sticky discreto al desplazarse.
3. Hero y secuencia 3D con scroll y CTA persistente para saltar a compra.
4. Producto protagonista Gamegaga R36 HD, con imágenes, ventajas verificadas y CTA a su ficha.
5. Sección «Revive los clásicos» o «Un universo retro» con **dos carruseles de tarjetas de juegos desplazándose suavemente en direcciones opuestas**. Pueden ser tarjetas de géneros o ilustraciones originales mientras no haya lista de juegos y permisos confirmados.
6. Sección para elegir consola: R36 HD vertical y R36H horizontal.
7. Accesorios: funda de silicona y estuche; sugerencias de pack **solo si se confirma compatibilidad y márgenes**.
8. Ventajas y confianza con información real; sin badges, reseñas, cifras ni tiempos de entrega inventados.
9. Preguntas frecuentes y footer con páginas de información, contacto y políticas. Crear estructuras para contenido legal, marcar pendiente cualquier texto no aprobado.

Además, preparar páginas de detalle de producto, carrito y páginas informativas. Navegación real; botones con comportamiento real o estado claramente deshabilitado durante la fase demo.

## STACK Y ESTRUCTURA

Mantener **React + Vite** y reutilizar dependencias cuando estén presentes. Para 3D: `three`, `@react-three/fiber`, `@react-three/drei`; para scroll: `gsap` y `ScrollTrigger`. Estilos: conservar CSS actual o migrar gradualmente a **Tailwind** si aporta valor; **no reescribir todo solo por cambiar de herramienta**. Modularizar componentes y centralizar contenido provisional en archivos de datos. Usar React Router si hace falta para rutas; comprobar versiones actuales y compatibilidad.

Arquitectura comercial: **Shopify es la fuente de catálogo, variantes, precio, disponibilidad y checkout cuando se conecte**; **AutoDS es el proveedor/automatización conectado a Shopify, no al frontend directamente**. Preparar una capa de servicio separada y modo demo sin credenciales. Utilizar la Storefront API y `checkoutUrl` del carrito Shopify cuando llegue la fase de integración. Nunca poner tokens de Admin API ni secretos privados en código cliente.

## REGLAS NO NEGOCIABLES

- El sitio debe estar en **español de España**, mostrar EUR y contemplar compradores en España.
- No inventar especificaciones, potencia, número de juegos, lista de títulos, stock, precios, compatibilidades, fechas de envío, devoluciones, valoraciones ni testimonios.
- Las imágenes creadas por IA y las capturas de proveedor son **referencias de diseño**, no pruebas del hardware ni materiales automáticamente autorizados para comercializar. Verificar derechos de uso antes de publicar.
- No afirmar que juegos concretos están incluidos ni usar carátulas de videojuegos protegidas sin permisos. El catálogo de juegos depende de la versión y de los derechos de distribución.
- No simular compras exitosas ni mostrar descuentos/reseñas falsos. Si aún no está Shopify configurado, usar modo demo claramente indicado.
- La pantalla de carga se cierra al estar el 3D listo; implementar fallback por fallo para no dejar al usuario atrapado.
- Aceptar `prefers-reduced-motion`, navegación por teclado, imágenes con alt y experiencia usable sin WebGL.
- Responsive real, buen contraste, objetivo de rendimiento razonable en móviles; reducir DPR y efectos costosos.
- No repetir el 3D para la R36H ni los accesorios.
- Evitar preguntas innecesarias: avanzar con placeholders claramente señalados para elementos faltantes.

## ORDEN DE IMPLEMENTACIÓN

**Fase A - Auditoría:** inspeccionar estructura existente, modelo GLB y assets; detectar errores y dependencias; escribir plan de cambios breve.

**Fase B - Diseño visual:** header, portada, loader, secciones completas, footer y responsive. Asegurar coherencia y CTA claro.

**Fase C - 3D:** mejorar iluminación y escala del GLB existente; scroll con etapas limpias, transición reconstrucción/giro, textos asociados, posibilidad de saltar y fallbacks. Los nombres de grupos actuales están en `src/components/Console3D.jsx`.

**Fase D - Catálogo y navegación:** fichas de los cuatro productos, variantes condicionadas a datos disponibles, carrito demo identificable y preparación Shopify.

**Fase E - Integración condicional Shopify:** si hay datos reales autorizados, conectar Storefront API y checkout; si no, dejar interfaz de servicio, archivo `.env.example` sin secretos y pasos de conexión. No pedir contraseñas.

**Fase F - Verificación:** ejecutar instalación, build y pruebas disponibles; inspeccionar móvil y desktop; comprobar enlaces, interacciones y fallos de carga; arreglar lo encontrado.

## ENTREGA QUE ESPERO

1. Código modificado dentro del proyecto, no solo documentación.
2. Una home coherente y visualmente convincente, ajustada al modelo R36 HD real del repositorio.
3. Páginas y componentes reutilizables listos para conectar Shopify.
4. `README.md` actualizado con instrucciones de ejecución, arquitectura y pendientes.
5. Resumen final en español: qué funciona, qué está en demo, qué recursos faltan, comandos de prueba y limitaciones reales.

Primero **lee `requisitos/` y la estructura del repositorio**, después implementa. No inventes que has compilado, probado o conectado APIs si no lo hiciste.
