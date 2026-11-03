# PondNest · Instrucciones para el asistente de programación

**Proyecto:** tienda online PondNest, frontend propio, mercado inicial España.  
**Idioma público:** español (España). **Moneda:** EUR. **Dominio previsto:** pondnest.com.  
**Estado:** prototipo. No hay checkout activo ni afirmaciones de catálogo verificadas.

## Cómo usar esta carpeta

1. Sitúa esta carpeta `requisitos/` en la **raíz** del proyecto abierto en VS Code, al lado de `src/`, `public/` y `package.json`.
2. Coloca el archivo `public/models/gamegaga-r36hd-detailed.glb` en la ruta indicada (si usas el proyecto PondNest v0.3 ya está incluido).
3. Abre el asistente de programación **con acceso al workspace** y pégale el contenido de `01_PROMPT_MAESTRO.md`, o bien envíale: «Lee todos los archivos de `requisitos/`, empezando por `01_PROMPT_MAESTRO.md`, e implementa el proyecto por fases siguiendo las verificaciones».
4. El asistente debe modificar código del repositorio, no limitarse a dar consejos; debe entregar un informe de cambios y comprobaciones.
5. Añade el logo definitivo y los datos comerciales de Shopify cuando existan. **No bloquean el trabajo inicial**.

## Prioridad de las fuentes

1. Peticiones confirmadas por el usuario reflejadas en esta carpeta.
2. Código y assets reales presentes en el proyecto.
3. Documentación oficial y actualizada de librerías/APIs.
4. Referencias visuales de la carpeta `referencias/`.

Si algo es incierto, marcarlo como pendiente de verificación. No inventar datos de producto, juegos, disponibilidad, precios, reseñas, envíos ni políticas legales.

## Alcance inicial

El resultado buscado es **una web navegable, rápida y visualmente premium**, con una intro de una única consola 3D, secciones de catálogo, detalle de producto, carrito y preparación de integración con Shopify. **No prometer ventas reales** hasta configurar la tienda.

## Documentos

- `01_PROMPT_MAESTRO.md`: encargo completo al agente de código.
- `02_REQUISITOS_FUNCIONALES.md`: páginas, secciones e interacciones.
- `03_DISENO_MOTION_3D.md`: identidad visual, animación, accesibilidad y rendimiento.
- `04_PRODUCTOS_Y_CONTENIDOS.md`: catálogo provisional y contenido permitido.
- `05_SHOPIFY_AUTODS.md`: arquitectura e integración comercial.
- `06_CHECKLIST_ACEPTACION.md`: pruebas y criterios de finalización.
- `07_ASSETS_Y_RUTAS.md`: archivos concretos y referencias.
- `referencias/`: imágenes del producto, algunas recreadas por IA; **no constituyen prueba técnica de hardware real**.

## Cambios importantes respecto al prototipo existente

- La **Gamegaga R36 HD vertical morada transparente** es la única consola con 3D y scroll animado.
- La otra consola (R36H, horizontal) aparece como producto normal, **sin modelo 3D**.
- Funda de silicona y estuche: productos normales. Compatibilidad con la Gamegaga R36 HD **por confirmar**.
- El archivo v0.3 usa mallas y texturas reconstruidas, parcialmente a partir de imágenes generadas. No es un escaneo fiel.
- El logo P/N real no está incluido en esta carpeta. Sustituir cualquier marca provisional cuando el usuario aporte su archivo.
