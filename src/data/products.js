import { mainProduct } from "./mainProduct.js";
export const demoProducts = [
  {
    handle: mainProduct.handle,
    name: mainProduct.name,
    configuration: mainProduct,
    supplierRating: mainProduct.supplierRating,
    tag: "LA PROTAGONISTA",
    category: "console",
    type: mainProduct.variantLabel,
    image: "/productos/r36hd-demo.webp",
    description:
      "El retro regresa con la R36S de 128 GB y sistema ArkOS. La variante protagonista de PondNest será la morada transparente.",
    facts: [
      "Carcasa morada transparente",
      "128 GB",
      "Sistema operativo ArkOS",
    ],
    gallery: [
      "/productos/r36hd-demo.webp",
      "/models/hero-poster.webp",
    ],
    note: "Imagen y 3D provisionales conservados del prototipo anterior. Disposición general contrastada con el anuncio de la R36S; proporciones, interiores y conexiones no verificados. Pantalla, procesador, batería, versión exacta de ArkOS, juegos y contenido de la caja pendientes de confirmar.",
  },
  {
    handle: "r36h",
    name: "R36H",
    tag: "OTRA FORMA DE JUGAR",
    category: "console",
    type: "Formato horizontal",
    image: "/productos/r36h-demo.webp",
    description:
      "Otra perspectiva del juego portátil. Explora el formato horizontal de nuestra selección.",
    facts: ["Diseño horizontal"],
    note: "Colores, capacidades, especificaciones y contenido de la caja por confirmar.",
  },
  {
    handle: "funda-silicona",
    name: "Funda de silicona",
    tag: "PROTECCIÓN",
    category: "accessory",
    type: "Compatibilidad por confirmar",
    image: "/productos/silicona-demo.webp",
    description:
      "Un accesorio de protección para completar tu equipo, una vez comprobado el ajuste al modelo exacto.",
    facts: [],
    note: "La referencia del accesorio corresponde a R36S. Ajuste a la variante concreta de 128 GB y compatibilidad con R36H pendientes de comprobar.",
  },
  {
    handle: "estuche-transporte",
    name: "Estuche de transporte",
    tag: "CONTIGO, DONDE VAYAS",
    category: "accessory",
    type: "Compatibilidad por confirmar",
    image: "/productos/estuche-demo.webp",
    description:
      "Un lugar para guardar tu consola entre partidas. Medidas y ajuste pendientes de verificación.",
    facts: [],
    note: "Compatibilidad con R36S y R36H por confirmar.",
  },
].map((p) => ({
  ...p,
  demo: true,
  price: null,
  variants: [
    {
      id: `demo:${p.handle}`,
      title: p.handle === mainProduct.handle ? mainProduct.variantLabel : "Referencia de demostración",
      available: true,
      price: null,
    },
  ],
  gallery: p.gallery || [p.image],
}));

export const faqs = [
  [
    "¿Puedo comprar ya?",
    "Esta versión es una demostración. Puedes explorar productos y probar el carrito, pero todavía no se aceptan pagos ni pedidos.",
  ],
  [
    "¿Qué juegos incluye?",
    "No hay una lista de títulos ni una cantidad verificada. Publicaremos el contenido únicamente tras comprobar la versión del producto y los derechos de distribución. Las tarjetas de géneros son ilustrativas.",
  ],
  [
    "¿Las fundas sirven para la R36S?",
    "La compatibilidad de la funda y del estuche con ambas consolas está por confirmar. Por eso no ofrecemos packs de compra todavía.",
  ],
  [
    "¿Cuánto tarda el envío?",
    "Los plazos, gastos y zonas de entrega en España se publicarán cuando estén confirmados con el proveedor y configurados en la tienda.",
  ],
  [
    "¿Cómo funcionan las devoluciones y la garantía?",
    "Las condiciones definitivas, el procedimiento de devolución y la garantía están pendientes de aprobación antes de abrir la venta.",
  ],
  [
    "¿El modelo 3D es exacto?",
    "Es una reconstrucción visual aproximada a partir de referencias. Los interiores, puertos y proporciones no constituyen una ficha técnica del producto.",
  ],
];

export const infoPages = {
  envios: [
    "Envíos",
    "Destino previsto: España",
    "Pendiente de confirmar: zonas de entrega, transportistas, gastos, plazos y seguimiento. Esta demo no admite pedidos.",
  ],
  devoluciones: [
    "Devoluciones y garantía",
    "Condiciones pendientes de aprobación",
    "Antes de abrir la venta publicaremos las condiciones aplicables, plazos, procedimiento, dirección de devolución y canales de asistencia.",
  ],
  contacto: [
    "Contacto",
    "Estamos preparando nuestra tienda",
    "El canal oficial de atención y la identidad del vendedor están pendientes de configuración. No hay un formulario de envío habilitado en esta demostración.",
  ],
  "aviso-legal": [
    "Aviso legal",
    "Documento pendiente de aprobación",
    "Faltan la identidad del titular, NIF, domicilio y datos de contacto del comercio. Esta página es una estructura informativa, no un texto legal aprobado.",
  ],
  privacidad: [
    "Privacidad",
    "Documento pendiente de aprobación",
    "Se deben completar el responsable, finalidades, bases, destinatarios, conservación y ejercicio de derechos antes del lanzamiento. No hay formularios de datos personales ni analítica activados en esta demo.",
  ],
  cookies: [
    "Cookies y almacenamiento",
    "Preferencias funcionales y contenido externo opcional",
    "Se utiliza almacenamiento local para recordar el carrito, la elección de movimiento y tus preferencias de cookies durante un máximo de 180 días. Las cookies necesarias no autorizan TikTok ni YouTube: sus reproductores solo se cargan al acercarse a la pantalla si aceptas contenido externo. Puedes modificar o retirar ese permiso desde Preferencias de cookies en el footer; al retirarlo se detienen y retiran los reproductores, pero no se borran las cookies que esos servicios ya hayan establecido. La política definitiva deberá revisarse antes del lanzamiento comercial.",
  ],
};
