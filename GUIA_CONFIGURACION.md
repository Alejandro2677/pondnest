# Guía ArkOS · revisión 03/11/2026

Ruta: `/guia-configuracion`. Contenido editable en `src/data/setupGuide.js`; presentación en `src/components/SetupGuide.jsx` y `setupGuide.css`.

El propietario confirma ArkOS para su R36S de 128 GB. No dispone de versión, fecha de compilación ni mapa de botones. **Ningún atajo se ha probado en esa unidad física.** La guía muestra esta limitación y diferencia los menús documentados de la compatibilidad aún pendiente. Las instrucciones de RetroArch solo se aplican a núcleos libretro, no automáticamente a emuladores independientes.

Fuentes primarias consultadas:

- Menús de volumen, brillo, idioma, tema y apagado: [código de EmulationStation de ArkOS](https://github.com/christianhaitian/EmulationStation-fcamod/blob/master/es-app/src/guis/GuiMenu.cpp). Confirmados en el código upstream, pendientes en la imagen del proveedor. Language está en Advanced Settings; no en UI Settings.
- [Controles y atajos de RetroArch](https://docs.libretro.com/guides/input-and-controls/): remapeos por juego/núcleo y consulta de hotkeys.
- [Quick Menu](https://docs.libretro.com/guides/quick-menu/): estados, opciones de núcleo y cierre del contenido.
- [FAQ ArkOS RG351MP](https://github.com/christianhaitian/arkos/wiki/Frequently-Asked-Questions---RG351MP): distingue configuración global de RetroArch y la iniciada desde juegos. No se transfieren sus atajos físicos a R36S.
- [Sistemas y requisitos de ArkOS](https://github.com/christianhaitian/arkos/wiki/ArkOS-Emulators-and-Ports-information): formatos y BIOS, sin redistribución.
- [Mapa ArkOS-R3XS](https://github.com/AeolusUX/ArkOS-R3XS/wiki/Global-event-keys-and-emulator-event-keys.): ejemplos FN claramente pendientes para esta unidad.

Vídeo aportado: https://www.youtube.com/watch?v=tiz6-kqMOYo · El Viciao Electrónico. Su título y descripción identifican **R36S**, el modelo principal actual; la compilación exacta puede diferir. Se integra como referencia, sin presentar su firmware/atajos como compatibles. La página oficial lista subtítulos automáticos españoles, pero la petición de su texto devolvió un cuerpo vacío; no se ha verificado una transcripción ni se han inventado marcas de tiempo. No se descargó ni republicó vídeo, imágenes o subtítulos. Sin capturas auténticas de la unidad, se prefieren iconos a pantallas ficticias.

El reproductor oficial usa youtube-nocookie.com, autoplay=0, proporción 16:9, carga diferida y observación de proximidad. Solo se monta con consentimiento general de contenido externo vigente y se desmonta al retirarlo. El enlace original siempre está disponible, también si el proveedor impide el embed. Se conserva el Referer necesario para YouTube. No se promete detectar todos los errores internos de un iframe de otro origen.

Las preferencias pasan a versión 2 porque se añade YouTube al alcance antes limitado a TikTok. Las elecciones v1 se invalidan para solicitar una decisión explícita sobre ambos servicios. Cookies necesarias nunca autorizan los reproductores.

Pendiente: obtener imagen/versión de ArkOS del proveedor, verificar los menús y botones en la R36S y aportar capturas propias. Calibración de joysticks, silencio físico, brillo físico y reinicio forzado quedan sin instrucciones específicas. No se propone formateo ni instalación de firmware.

Comprobación con YouTube real: el iframe oficial se montó con consentimiento, pero el navegador automatizado no expuso controles reproducibles en 15 segundos. No se declara verificada la reproducción real. Las pruebas de consentimiento usan un iframe de prueba para aislar la red del proveedor.

Actualización del producto: ver ACTUALIZACION_R36S.md. Anuncio 1601781446303 consultado: variante 128GB-ARKOS / Clear Purple. Compilación exacta no indicada.
