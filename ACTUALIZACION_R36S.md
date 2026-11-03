# R36S 128 GB · 03/11/2026

Producto principal: R36S, 128 GB, ArkOS, morada transparente. R36H permanece como producto secundario.

Configuración: `src/data/mainProduct.js`, también expuesta como `configuration` y `supplierRating` en la referencia del catálogo. Resumen: **4,6/5, 20 valoraciones**, independiente de las seis opiniones seleccionadas. Consultado en [el anuncio Alibaba 1601781446303](https://www.alibaba.com/product-detail/Original-R36S-128G-20000-Games-Arkos_1601781446303.html). El HTML del anuncio identifica `review.productReview.averageStar: 4.6`, `totalReviewCount: 20` y la opción `128GB-ARKOS / Clear Purple`. No confundir con la puntuación de la tienda del proveedor.

La ficha principal es `/productos/r36s`; el enlace antiguo redirige a ella. Se actualizan portada, CTA, catálogo demo, variante, FAQ, guía, metadatos y referencias de configuración social. Las cuatro URL de TikTok permanecen idénticas. Los handles de contenido histórico se siguen reconociendo para futuras importaciones; las opiniones de otros productos no se muestran como opiniones de R36S. Shopify debe publicar el nuevo producto con handle `r36s`; no se ha alterado ningún producto remoto ni se ha inventado precio o stock. El catálogo real sigue procediendo de Shopify.

## Comparación del modelo 3D

Referencias del anuncio guardadas para revisión en `requisitos/referencias/r36s-proveedor/`, con URL de procedencia en `fuente.json`. No se publican automáticamente las nuevas imágenes como fotografías autorizadas de la tienda.

La foto morada y las vistas de este anuncio comparten la misma composición frontal/trasera de varias referencias antiguas usadas para el prototipo. Por tanto no hay evidencia de un cambio de distribución general que justifique sustituir el modelo. Se conserva el GLB, sus materiales, jerarquía y la secuencia GSAP sin cambios. La vista de galería con el antiguo nombre incrustado se retira de la ficha y se reemplaza por el póster existente sin ese texto.

| Parte | Modelo actual frente al anuncio | Pendiente |
| --- | --- | --- |
| Carcasa | Ambos muestran formato vertical morado translúcido, esquinas redondeadas y zona trasera estriada. La profundidad y curvatura del modelo son aproximadas. | Medidas y vistas ortográficas; espesor, transparencia y contorno del alojamiento trasero. |
| Pantalla | Mismo marco negro y posición superior en las fotos; el modelo usa una superficie plana con imagen proyectada. | Tamaño físico, relación precisa marco/panel y profundidad. No se asumen resolución ni diagonal. |
| Botones | Coinciden cruceta a la izquierda, X azul arriba, A rojo a la derecha, B amarillo abajo, Y verde a la izquierda y tres botones centrales. El prototipo tiene relieves/texturas simplificados. | Leyendas pequeñas, perforaciones del altavoz y altura/diámetro exactos. |
| Joysticks | Dos controles inferiores en la misma disposición. Los aros y capuchones del modelo están simplificados. | Perfil, estrías y recorrido; no se presupone tecnología Hall ni calibración concreta. |
| Gatillos | Ambos tienen cuatro piezas traseras. El modelo usa bases redondeadas con proyección de foto; las imágenes sugieren una superficie más inclinada/curvada. | Perfil lateral y medidas para corregir el relieve sin deducirlo de perspectiva. |
| Conexiones | La imagen morada muestra un control lateral y una ranura TF1-OS. El modelo contiene ranuras laterales y puertos inferiores conceptuales. | Vistas nítidas de ambos laterales, borde superior e inferior: número, tipo y ubicación de USB, audio y ranuras. No se atribuye al producto la geometría conceptual. |
| Interior | Visible como efecto de desmontaje, no documentado por el anuncio. | Placa, batería, conectores y disposición real; permanecen ilustrativos. |

No se han retocado proporciones, gatillos o puertos con datos insuficientes. El aviso junto al 3D lo identifica como provisional. Hash del GLB conservado: `976C2094C8FB0EFD945BA19F7BF24B0557EAA04CA0D4F876B2AF6B0AD975CFB3`.

## Opiniones y ArkOS

Las seis opiniones originales siguen intactas en `src/data/supplierReviews.js`, igual que `reviews.js`. El anuncio recuperado no incluye sus textos; no se ha establecido que pertenezcan a este anuncio. Se ocultan de la sección actual hasta comprobarlo. Para volver a mostrarlas tras comprobar la correspondencia, definir `productHandle: "r36s"` y `productMatchVerified: true` en la selección; el permiso de reutilización comercial sigue siendo un requisito independiente. No se altera su valoración individual ni se las utiliza para calcular el resumen de 20 valoraciones.

El anuncio confirma ArkOS y muestra una mención promocional «2025», pero no ofrece una fecha/identificador de compilación ni mapa de controles. **2025 no se interpreta como versión de firmware.** La guía conserva tutoriales documentados y la distinción entre instrucciones de RetroArch y emuladores independientes. Los atajos quedan pendientes de comprobar con esa imagen del proveedor. El vídeo de referencia sí trata de R36S, pero no acredita que use la misma compilación.

Históricos de desarrollo en `requisitos/`, scripts y nombres de assets conservan sus nombres originales para trazabilidad. No son textos comerciales de la web actual.
