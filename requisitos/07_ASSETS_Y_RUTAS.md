# Assets, archivos y rutas exactas

## Código y 3D de la versión v0.3

Si has abierto el ZIP **`pondnest-modelo-3d-v03.zip`**, el proyecto actual debería contener:

```text
src/App.jsx
src/styles.css
src/components/Console3D.jsx
public/models/gamegaga-r36hd-detailed.glb
public/models/gallery-r36hd-detailed.png
public/models/preview-r36hd-detailed.png
public/productos/r36hd-demo.jpg
public/productos/r36h-demo.jpg
public/productos/silicona-demo.jpg
public/productos/estuche-demo.jpg
```

`gamegaga-r36hd-detailed.glb` tiene **texturas integradas**; no es necesario cargar las imágenes IA originales por separado para dibujarlo. No usar `gamegaga-r36hd-prototype.glb` como modelo principal: es la versión antigua menos realista.

## Carpeta `requisitos/referencias/`

- `referencia_proveedor_frontal.jpg` o `.png`: captura comercial real de Gamegaga, útil para comprobar distribución externa.
- `referencia_proveedor_trasera.jpg`/`.png`: captura comercial posterior y gatillos.
- `frontal_generado_ia.png`, `trasera_generada_ia.png`: imágenes recreadas por IA en conversación; buenas para look&feel, **pueden contener botones y detalles inventados**.
- `superior_inferior_generado_ia.png`: **concepto visual**, no prueba de distribución real de puertos ni de carga.
- `vista_previa_modelo_v03.png`: preview del GLB existente.
- `lateral_derecho_proveedor.png`, `lateral_izquierdo_proveedor.png`, `borde_superior_proveedor.png`, `borde_inferior_proveedor.png`: recortes de baja resolución, útiles solo como guía.

**Licencias**: capturas de proveedor no autorizan automáticamente su publicación comercial. Conservar en `requisitos/` como material de trabajo. Las imágenes generadas tampoco prueban características técnicas. No representar un puerto generado como especificación real.

## Archivos que faltan de verdad

1. **Logo aprobado de PondNest**, ideal SVG o PNG transparente. Monograma blanco P/N fusionadas, texto «PondNest». En `public/logo/pondnest.svg` o `.png`.
2. Enlaces/SKU de AutoDS de los 4 productos, y fotos/vídeos de producto autorizados.
3. Medidas y ficha técnica comprobadas de Gamegaga R36 HD, incluyendo los puertos y sistemas/juegos suministrados.
4. Compatibilidad real de la funda y estuche con el modelo morado.
5. Precios de venta, variantes y textos comerciales definitivos.
6. Configuración Shopify **cuando se vaya a integrar**, sin enviar secretos al chat.
7. Datos legales y contacto oficial del comercio, con revisión de políticas antes de lanzamiento.

## Organización aconsejada

No copiar el GLB dentro de `requisitos/` si ya está en `public/models/`, porque la web debe servirlo desde esta última ruta. `requisitos/` sirve al agente como **especificación y referencia**, no como carpeta de producción.
