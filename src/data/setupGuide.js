import { mainProduct } from "./mainProduct.js";
// Listing confirms ArkOS, but its precise build and physical hotkeys are unspecified.
export const guideDevice = { model: mainProduct.name, capacity: mainProduct.capacity, color: mainProduct.color, os: mainProduct.os, build: mainProduct.firmwareBuild, supplierUrl: mainProduct.supplierUrl, hardwareTested: false, checkedAt: "2026-11-03" };
const es = "https://github.com/christianhaitian/EmulationStation-fcamod/blob/master/es-app/src/guis/GuiMenu.cpp";
const input = "https://docs.libretro.com/guides/input-and-controls/";
const quick = "https://docs.libretro.com/guides/quick-menu/";
const ark = "https://github.com/christianhaitian/arkos/wiki/Frequently-Asked-Questions---RG351MP";
export const hotkeySource = "https://github.com/AeolusUX/ArkOS-R3XS/wiki/Global-event-keys-and-emulator-event-keys.";
export const videoReference = { id: "tiz6-kqMOYo", url: "https://www.youtube.com/watch?v=tiz6-kqMOYo", creator: "El Viciao Electrónico", model: "R36S" };
export const guideTopics = [
  { id: "sonido", title: "Sonido", icon: "♫", description: "Volumen, silencio y audio del juego.", tutorials: [
    { title: "Ajustar el volumen y silenciar", source: es, steps: ["En EmulationStation, abre el menú con START.", "En Sound Settings, ajusta System Volume. El valor 0 silencia; súbelo gradualmente para recuperar sonido.", "Vuelve al juego y comprueba el resultado."], note: "La música del menú y el audio del juego son distintos. Los botones físicos de volumen y un posible atajo de silencio están pendientes de validar en esta unidad." },
    { title: "Revisar el audio en RetroArch", source: "https://docs.libretro.com/", steps: ["Abre RetroArch y entra en Settings → Audio.", "Comprueba que el audio no esté silenciado y que la salida esté activada, si esas opciones aparecen en tu versión.", "Prueba otro juego antes de cambiar nada más. Anota los valores originales."], note: "No cambies el controlador de audio ni el dispositivo de salida sin la configuración del proveedor. La ruta exacta de estas opciones depende de la versión de RetroArch." },
  ] },
  { id: "pantalla", title: "Pantalla", icon: "☀", description: "Brillo y opciones visuales.", tutorials: [
    { title: "Cambiar el brillo", source: es, steps: ["En el menú principal, pulsa START y abre Display Settings.", "Ajusta Brightness y vuelve al menú."], note: "No se presuponen controles de contraste o saturación. Los atajos físicos de brillo no están verificados para la R36S." },
    { title: "Opciones visuales de los emuladores", source: quick, steps: ["Con un juego abierto en RetroArch, accede a Quick Menu mediante el atajo configurado en tu unidad.", "Consulta las opciones del núcleo y los shaders disponibles. Anota el estado original antes de probar un cambio.", "Reanuda el juego y comprueba imagen y fluidez. Revierte el cambio si empeoran."], note: "Las opciones dependen del núcleo. Un shader puede reducir el rendimiento; no se recomienda un ajuste universal." },
  ] },
  { id: "idioma", title: "Idioma", icon: "文", description: "El menú en tu idioma.", tutorials: [
    { title: "Cambiar el idioma del sistema", source: es, steps: ["Desde EmulationStation, pulsa START.", "En Advanced Settings, busca Language y selecciona el idioma disponible.", "Vuelve al menú y permite que se recargue si lo solicita."], note: "Esto cambia la interfaz de EmulationStation, no todos los programas de ArkOS. Si falta la opción, detente: la imagen del proveedor puede variar. El idioma de cada juego depende de su edición y de sus propios ajustes." },
  ] },
  { id: "controles", title: "Controles", icon: "✚", description: "Botones y joysticks por juego.", tutorials: [
    { title: "Cambiar botones sin alterar la navegación", source: input, steps: ["Abre un juego de RetroArch y entra en Quick Menu → Controls → Port 1 Controls.", "Cambia la función del botón o eje que necesites y prueba el juego.", "Guarda con Save Game Remap File para ese juego, o Save Core Remap File para el núcleo completo."], note: "Un remapeo de juego no equivale a calibrar el joystick. La calibración física de esta unidad está pendiente de confirmar. Algunos emuladores independientes utilizan menús diferentes." },
  ] },
  { id: "partidas", title: "Partidas", icon: "▣", description: "Guardar, recuperar y salir.", tutorials: [
    { title: "Guardar y cargar un estado", source: quick, steps: ["En un juego de RetroArch, abre Quick Menu y elige la ranura de estado disponible.", "Usa Save State para guardar y comprueba la confirmación antes de salir.", "Para recuperar ese punto, selecciona la misma ranura y usa Load State."], note: "Cargar un estado reemplaza el progreso actual. No todos los núcleos admiten estados; conserva también el guardado interno del juego. Los estados pueden ser incompatibles entre núcleos o versiones." },
    { title: "Salir correctamente del juego", source: quick, steps: ["Guarda desde el propio juego cuando sea posible y espera a que termine.", "En Quick Menu, usa Close Content para cerrar el juego.", "Desde el menú principal de RetroArch, selecciona Quit RetroArch para volver al sistema."], note: "No cortes la alimentación mientras se guarda. Los emuladores independientes tienen su propia opción de salida." },
  ] },
  { id: "retroarch", title: "RetroArch", icon: "⌘", description: "Menús, atajos y ajustes del núcleo.", tutorials: [
    { title: "Identificar cómo abrir el menú", source: input, steps: ["Desde la lista de sistemas, abre RetroArch (o RetroArch32 si es el que utiliza tu juego).", "En Settings → Input → Hotkeys, consulta Hotkey Enable y la asignación para abrir el menú, sin modificarlas.", "Anota esas asignaciones y comprueba el acceso en un juego de ese mismo RetroArch."], note: "El nombre puede ser Menu Toggle o Menu Toggle Controller Combo. FN + X y SELECT + X aparecen en variantes diferentes de ArkOS: ninguno está confirmado para esta R36S. Si no puedes acceder, solicita al proveedor su mapa de controles." },
    { title: "Modificar ajustes del emulador", source: ark, steps: ["Con el juego abierto, entra en Quick Menu y consulta Core Options (Options en algunas versiones).", "Cambia una sola opción y prueba el resultado antes de conservarla.", "Para ajustes globales, abre RetroArch desde el menú del sistema. ArkOS puede impedir guardar la configuración global desde un juego."], note: "RetroArch y RetroArch32 tienen configuraciones distintas. Evita guardar cambios globales para resolver un problema de un solo juego." },
  ] },
  { id: "personalizacion", title: "Personalización", icon: "◇", description: "Temas y apariencia del menú.", tutorials: [
    { title: "Cambiar un tema instalado", source: es, steps: ["Pulsa START y entra en UI Settings.", "Selecciona Theme (Theme Set en algunas versiones) y elige un tema instalado.", "Vuelve al menú para ver el resultado."], note: "Anota el tema anterior. Usa solo los temas ya disponibles; no se requiere instalar paquetes ni modificar archivos del sistema." },
  ] },
  { id: "mantenimiento", title: "Mantenimiento", icon: "⏻", description: "Apagado y cuidado de la microSD.", tutorials: [
    { title: "Apagar y proteger la tarjeta", source: es, steps: ["Cierra el juego y vuelve a EmulationStation.", "Pulsa START → Quit → Shutdown System y confirma.", "Espera al apagado completo antes de extraer la microSD."], note: "Suspender no equivale a apagar. No retires la tarjeta mientras se utiliza, no aceptes formatearla si un ordenador lo propone y conserva una copia de tus partidas. El atajo de apagado físico está pendiente de validar." },
  ] },
  { id: "problemas", title: "Solución de problemas", icon: "?", description: "Comprobaciones sencillas antes de cambiar nada.", tutorials: [
    { title: "Un juego no tiene sonido", source: quick, steps: ["Comprueba el volumen del sistema y después el de RetroArch siguiendo Sonido.", "Prueba otro juego del mismo núcleo y otro sistema para acotar el fallo.", "Si solo falla uno, revisa sus opciones de audio y comunica al soporte el juego y núcleo afectados."], note: "No eleves la ganancia ni cambies controladores al azar." },
    { title: "El juego no arranca", source: "https://github.com/christianhaitian/arkos/wiki/ArkOS-Emulators-and-Ports-information", steps: ["Anota el sistema, juego y mensaje de error.", "Consulta en la documentación de ArkOS el formato y los requisitos de BIOS del núcleo elegido.", "Prueba otro juego compatible que ya tengas y facilita el resultado al soporte."], note: "No se proporcionan descargas de juegos o BIOS. No cambies firmware para intentar abrir un juego." },
    { title: "La consola está bloqueada", source: "https://github.com/christianhaitian/arkos/wiki", steps: ["Espera a que termine una posible carga o guardado.", "Si el menú responde, cierra el juego y apaga desde el sistema.", "Si no responde, consulta al proveedor el procedimiento de recuperación de tu unidad e indica la versión de ArkOS."], note: "El reinicio forzado, su combinación y duración están pendientes de verificar. No extraigas la microSD ni instales una imagen de otra consola." },
  ] },
];
export const normalizeGuideSearch = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
export function searchGuide(query, category = "all") {
  const terms = normalizeGuideSearch(query).split(/\s+/).filter(Boolean);
  return guideTopics.filter(t => category === "all" || category === t.id).map(t => ({ ...t, tutorials: t.tutorials.filter(item => {
    const haystack = normalizeGuideSearch([t.title, t.description, item.title, ...item.steps, item.note].join(" "));
    return terms.every(term => haystack.includes(term));
  }) })).filter(t => t.tutorials.length);
}
