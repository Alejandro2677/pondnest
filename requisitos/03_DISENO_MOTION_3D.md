# Diseño visual · Animación 3D · Rendimiento

## Identidad

- Marca **PondNest**. Logo aprobado fuera de este paquete: monograma P/N geométrico blanco sobre negro y texto PondNest blanco. **No sustituir por otro logo definitivo**; usar placeholder fiel hasta recibir archivo real.
- Estilo: oscuro premium, tecnológico elegante, sin estética arcade de neón ni efectos chillones.
- Colores orientativos, ajustables tras probar contrastes: fondo `#090A0E`, superficies `#14151B`, texto `#F5F5F7`, texto secundario `#A5A4AF`, acento lavanda `#AA97D1` muy dosificado.
- Tipografía limpia, títulos fuertes, gran respiración vertical y jerarquía clara. Referencias actuales: DM Sans y Space Grotesk (pueden mantenerse).
- Animaciones finas y sobrias, sin destellos exagerados, parallax que dificulte lectura ni exceso de desenfoque.

## Storyboard de la intro controlada por scroll

La escena 3D usa un único GLB: `public/models/gamegaga-r36hd-detailed.glb`. Secciones como guía, no tiempos rígidos:

| Progreso ilustrativo | Escena | Copy/contexto | Acción del usuario |
|---|---|---|---|
| 0-12 % | R36 HD morada completa, flotando, 3/4 frontal que pasa a frontal | «El retro regresa» | Comprar ahora / Explorar / Saltar |
| 12-32 % | Exploded view: carcasa, pantalla y controles se separan suavemente sin atravesarse | «Descubre cada detalle» | Scroll fluido |
| 32-48 % | Primer plano de pantalla, cruceta, ABXY y sticks; etiquetas discretas | Pantalla y controles, afirmaciones verificables | Scroll |
| 48-63 % | Piezas regresan; consola completa rota con easing hacia trasera | «Diseñada para jugar» | Scroll |
| 63-83 % | Vista posterior; cuatro gatillos se destacan de forma elegante | «Control también por detrás» | Scroll |
| 83-100 % | Regresa de frente; termina intro y aparece CTA / continuidad natural a catálogo | «Encuentra tu próxima consola» | Acceso inmediato a producto |

Nunca representar una parte física inexistente como producto real: interiores y puertos del GLB **son estimativos**. Si se presentan piezas internas, tratarlas visualmente o etiquetarlas genéricamente, sin fingir especificaciones verificadas. Evitar texto específico sobre posición de puerto de carga hasta verificar.

## Carga y fallback

- Loading con logo PondNest y progreso real de recursos, no un contador falso ni una espera artificial de X segundos.
- Preload del GLB crítico, manejo de errores y botón de acceso a tienda si 3D falla.
- Imagen poster correcta de la R36 HD para no dejar un lienzo vacío (está `public/models/gallery-r36hd-detailed.png` y fotos demo; preferir asset definitivo).
- Se puede entrar directamente a tienda sin visualizar intro desde el primer segundo disponible.
- **No mostrar pantallas de carga en cada cambio de ruta** ni al comprar.

## Implementación 3D

- `@react-three/fiber`, `@react-three/drei` y `three` para GLB. Animaciones vinculadas al scroll con `gsap/ScrollTrigger` o un controlador equivalente estable.
- Usar mallas identificadas del GLB existente. El componente previo `src/components/Console3D.jsx` agrupa nombres por prefijos (`front_`, `back_`, `screen_`, `controls_`, `middle_`, `back_trigger_`). Verificar nombres reales antes de suponer.
- Pivotes y transformaciones coherentes para reconstrucción y rotación en eje vertical; evitar saltos entre etapas; interpolaciones suaves y reversibles al hacer scroll hacia arriba.
- Luz de estudio suave, reflejos controlados, sombreado y material lila translúcido cuando sea posible sin romper rendimiento. No hacer que la consola parezca un bloque opaco.
- Mantener referencia de posición legible en smartphone; evitar que textos tapen botones de la propia consola; testeos con anchuras 320, 375, 430, 768, 1440.

## Rendimiento y accesibilidad

- Objetivo práctico: carga fluida y experiencia aceptable en móvil medio, no solo PC potente.
- Limitar DPR (aprox. 1-1.5 en móvil), evitar efectos de postproceso pesados, optimizar GLB/texturas y cargar recursos no críticos bajo demanda.
- `prefers-reduced-motion`: imagen fija o animación mínima, **sin scroll forzado**. Carruseles sin movimiento automático o controles para pausarlo.
- Sin WebGL/errores: mostrar imagen estática y CTA a catálogo.
- Botones con estados accesibles, foco visible, contraste, alt de imágenes y semántica de encabezados.
- Carruseles de juegos: dos filas horizontales, una a la izquierda y otra a la derecha; velocidad pausada; loop sin saltos; responsive; detener al hover/focus; soportar reducción de movimiento.

## Lo que NO queremos

- Animación de 10 pantallas que retrase la compra.
- Despiece de todos los circuitos fingiendo exactitud de hardware real.
- Logo artificial diferente al aprobado por el usuario.
- Fuegos artificiales, neón, vídeos a pantalla completa obligatorios o música automática.
- Poner la consola secundaria R36H en 3D.
