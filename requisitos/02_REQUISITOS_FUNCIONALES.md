# Requisitos funcionales y mapa de páginas

## Objetivo de producto

Visitante llega desde TikTok/Instagram/Meta Ads -> entiende el producto sin esfuerzo -> puede saltarse la intro -> ve catálogo, especificaciones y condiciones -> elige variante -> añade al carrito -> finaliza en Shopify **cuando esté conectado**.

## Inicio `/`

- **Loading**: monograma y nombre PondNest; barra de carga real del GLB; no bloquear indefinidamente; fallback si falla.
- **Header**: logo, Consolas, Juegos, Accesorios, Información/FAQ y carrito; en móvil menú compacto totalmente funcional.
- **Hero 3D**: Gamegaga R36 HD morada; título emocional breve; CTA «Comprar ahora» que desplace a producto/ficha; CTA «Explorar consola» opcional; enlace «Saltar introducción».
- **Intro por scroll**: etapas explicadas en `03_DISENO_MOTION_3D.md`, sin autoplay obligado ni scroll-trap. Entre 2 y 3 pantallas de desplazamiento aproximadas desktop; versión móvil más breve.
- **Producto protagonista**: presentación de la R36 HD, galería, rasgos verificados, botón a ficha, productos complementarios si son compatibles.
- **Juegos**: dos filas de tarjetas con animación horizontal suave, sentido opuesto y pausa en hover/focus. No atribuir títulos concretos no verificados; si son ilustraciones originales, identificarlas como ejemplos de géneros.
- **Dos formatos**: tarjetas R36 HD y R36H. Solo la primera con intro 3D.
- **Accesorios**: funda de silicona y estuche; no preseleccionar como compatibles con R36 HD sin confirmar.
- **Packs**: sección opcional, inicialmente meramente informativa; activarla solo cuando variantes, compatibilidades y economía estén comprobadas. No aplicar descuentos falsos.
- **Confianza y FAQ**: envíos, devoluciones, garantía, soporte, contenido de la caja, juegos y compatibilidad; mostrar información confirmada o «Por confirmar» durante la demo.
- **Footer**: logo, navegación, contacto real cuando exista, datos de empresa cuando estén disponibles, avisos legales y política de privacidad/cookies.

## Rutas previstas

- `/` Inicio
- `/productos` listado de consolas y accesorios (puede compartir vista con home si se decide)
- `/productos/gamegaga-r36-hd` ficha del protagonista
- `/productos/r36h` ficha secundaria
- `/productos/funda-silicona` ficha accesorio
- `/productos/estuche-transporte` ficha accesorio
- `/carrito` resumen/cart drawer y acceso a checkout Shopify en fase integrada
- `/envios`, `/devoluciones`, `/faq`, `/contacto`, `/aviso-legal`, `/privacidad`, `/cookies`
- Ruta 404 amable con enlace a tienda

Las páginas informativas deben existir con estructura; **no publicar textos legales inventados**. Requieren revisión de operador real y, si procede, asesoría.

## Producto y carrito

- Galería con imágenes coherentes, miniaturas accesibles, zoom opcional.
- Nombre, precio EUR, disponibilidad, entrega estimada y variantes **solo desde fuente real al conectar Shopify**.
- Selector de color/capacidad si existen variantes confirmadas; evitar inventar combinaciones.
- Añadir al carrito con cantidad, variantes, precio, subtotal, quitar y modificar cantidad.
- Estados vacíos, cargando, error y agotado.
- Al conectar Shopify, carrito persistente usando Shopify Cart API y redirigir a `checkoutUrl`.
- Demo sin Shopify: mostrar explícitamente `MODO DEMO · Compra no disponible`, y no lanzar checkout ni mostrar confirmación falsa.
- CTA visibles sin bloquear acceso por animación; flujo de compra independiente del 3D.

## Reducción de fricción

- Header y botón de compra visibles tempranamente.
- Landing orientada a móvil; navegación fácil con pulgar.
- Imágenes ligeras, elementos interactivos con feedback, páginas rápidas.
- Ofertas, badges, tiempos y reseñas solo verificables.
- Links funcionales, formularios funcionales si se habilitan, sin acciones falsas.

## Medición futura (opcional hasta consentimiento)

Preparar hooks para eventos `view_item`, `add_to_cart`, `begin_checkout`, `purchase` cuando existan Shopify y configuración de analítica. No disparar `purchase` hasta confirmación real. Cumplimiento de consentimiento para tracking no esencial en España.
