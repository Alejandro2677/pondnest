# Archivos de identidad PondNest

Los originales de `public/logo/` se conservan sin cambios. La fuente canónica es `Logotipo minimalista PondNest en blanco y negro.png`, la versión sin resplandor. Las otras dos imágenes tienen iluminación/resplandor y no se usan como máster para evitar bordes borrosos.

No se han redibujado el monograma ni la tipografía. Se han extraído del raster original, retirando el fondo negro y conservando la suavidad de los bordes mediante transparencia. El horizontal recoloca las dos piezas extraídas y las escala de forma proporcional. No contiene texto nuevo, títulos ni bordes de presentación.

| Archivo base | Uso | Fondo |
| --- | --- | --- |
| `pondnest-principal` | Composición vertical original; pantalla de carga | Transparente, blanco |
| `pondnest-horizontal` | Header y footer | Transparente, blanco |
| `pondnest-icono` | Monograma PN con lienzo cuadrado | Transparente, blanco |
| `pondnest-fondo-claro` | Horizontal para superficies claras | Transparente, negro |
| `pondnest-avatar` | Perfil y avatar | Grafito, símbolo blanco con margen para recorte circular |

Cada versión tiene PNG y WebP sin pérdida. Principal, horizontal y fondo claro incluyen WebP de 320 y 640 px para pantallas responsive y de alta densidad. El sitio emplea `object-fit: contain`, dimensiones intrínsecas y `srcSet`; no amplía las imágenes por encima de la resolución disponible.

Los favicons incluyen PNG de 16, 32, 48, 180, 192 y 512 px y un ICO con 16, 32 y 48 px. Tienen fondo grafito para que el símbolo blanco sea legible tanto en interfaces claras como oscuras. El de 180 px se utiliza también como icono táctil de Apple.

Para repetir la extracción: `npm run prepare:logos`. Las coordenadas de procedencia están en `provenance.json`. El proceso solo sustituye derivados en `exports/` y el manifiesto de marca; no modifica los originales. Al ser archivos raster, no se entregan SVG simulados ni se garantiza resolución vectorial para impresión.
