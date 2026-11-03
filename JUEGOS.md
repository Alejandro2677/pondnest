# Portadas de referencia

La sección reutiliza las dos filas del carrusel existente. Los títulos son referencias visuales; no se ha confirmado su inclusión en la consola. Los derechos de uso de las portadas siguen pendientes antes de publicar comercialmente.

## Archivos locales

| Título | Original proporcionado |
| --- | --- |
| Mario Kart: Super Circuit | `public/juegos/supermario.webp` |
| Super Mario Land 2 | `public/juegos/supermarioland.webp` |
| The Legend of Zelda: The Minish Cap | `public/juegos/zelda.webp` |
| Tetris | `public/juegos/tetris.webp` |
| Pac-Man | `public/juegos/pacman.webp` |
| Pokémon Esmeralda | `public/juegos/pokemon.webp` |

Los seis archivos originales se conservan. Aunque sus nombres terminan en `.webp`, su contenido original es JPEG. Las versiones derivadas de `public/juegos/optimized/` son WebP auténticos, reducidos a un máximo de 480 × 480 px sin recortar. La sección utiliza `<picture>` con el original como respaldo, respetando su nombre y extensión.

Peso conjunto: 846.010 bytes originales → 282.780 bytes optimizados (aproximadamente un 67 % menos). No hay imágenes externas. Se cargan de forma diferida; al acercarse la sección se preparan las seis imágenes para que no aparezcan vacías al entrar en la fila.

## Cambios futuros

Los nombres, géneros y asociación de archivos se encuentran en `src/data/games.js`. Se detectan extensiones y mayúsculas reales; si renombras un archivo de forma que ya no identifica al juego, ajusta la asociación. La falta de un archivo muestra un estado explícito, no una portada inventada.

Para regenerar las versiones optimizadas tras sustituir imágenes:

```sh
python scripts/optimize-game-covers.py
```

Requiere Python y Pillow. El script preserva el original y solo guarda una versión derivada si pesa menos. El frontend no necesita Python para ejecutarse.

## Comportamiento y verificación

- Primera fila a la izquierda y segunda a la derecha, lentamente. El bucle duplica secuencias idénticas y conserva la distancia entre tarjetas; en pantallas anchas amplía la secuencia para cubrir el ancho sin huecos y mantiene la velocidad por píxel.
- Tarjetas iguales, portadas con `object-fit: contain`, nombre y género, bordes redondeados, sombras y hover sutil.
- Pausa con cursor, foco y el botón existente. Con movimiento reducido no hay autoplay ni escala en hover; se muestran seis portadas por fila y se permite desplazamiento horizontal manual.
- Pruebas de navegador a 375, 1440 y 2560 px: seis imágenes cargadas, rutas locales válidas, tamaños uniformes, dirección, pausa, distancia exacta del bucle, cobertura de pantallas anchas y aviso sobre inclusión/derechos. Prueba adicional de movimiento reducido.
- Capturas: `test-results/game-covers-375.png`, `game-covers-1440.png` y `game-covers-2560.png`.
- El modelo, los materiales y la timeline 3D conservan sus hashes originales. No se modifican productos, TikTok, reseñas ni carrito.
