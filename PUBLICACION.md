# Publicación de prueba de PondNest

## Arquitectura que debe desplegarse

React + Vite genera `dist/`. El proceso Node `server/start.js` sirve esa carpeta, conserva las rutas SPA al recargar y atiende `/api/commerce` bajo el mismo origen. El navegador nunca recibe el token privado. Las llamadas a Shopify salen del servidor; no requieren localhost ni una API instalada en el teléfono.

No desplegar únicamente `dist/` en GitHub Pages ni usar `vite preview` como servidor comercial. La antigua URL de Pages corresponde a otra versión y no incorpora este backend.

## Ejecutar y comprobar

Node 24, npm y, para las pruebas de navegador locales, Chrome:

```sh
npm ci
npm test
npm run build
npm run test:production
npm run check:secrets
npm start
```

`npm start` usa las variables del proceso. En desarrollo local puede leer `.env.local`; con `NODE_ENV=production` no lee archivos locales y no requiere Vite instalado en el runtime. Las pruebas de producción cargan las credenciales locales únicamente en el proceso de prueba, nunca en el frontend. Crean y vacían carritos temporales, sin pedidos ni pagos.

## Hosting compatible

Se incluye un `Dockerfile` de dos etapas y `render.yaml` para un **Web Service** de Render. También es compatible con Railway o cualquier hosting de contenedores/Node que permita variables privadas, HTTPS y un proceso persistente. El servidor escucha en `0.0.0.0` y en el puerto `PORT` asignado por el proveedor. Se ha preparado la configuración; no se ha contratado ni creado ningún servicio.

Para Render: conectar el repositorio, elegir Web Service con Docker y verificar los ajustes del archivo `render.yaml` antes de crear el servicio. El archivo propone un plan gratuito; revisar disponibilidad y condiciones actuales. No se ha iniciado un despliegue ni aceptado compromisos de pago.

Alternativa Node sin Docker: instalar dependencias de compilación con `npm ci --include=dev`, compilar con `npm run build` y arrancar con `npm start`. Un contenedor configurado ya sirve tanto la web como la API. La comprobación de salud es `/healthz`.

Variables privadas del hosting:

| Variable | Valor para la prueba |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Asignado por el hosting |
| `SHOPIFY_STORE_DOMAIN` | Dominio real `*.myshopify.com` de la tienda |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Token privado del canal Headless, solo en secretos del hosting |
| `SHOPIFY_API_VERSION` | `2026-10` |
| `PONDNEST_CHECKOUT_ENABLED` | `false` |
| `SHOPIFY_TRUST_PROXY` | `false`, salvo configuración documentada de un proxy de confianza |

No usar `VITE_` para credenciales. El frontend no necesita variables privadas ni una URL de localhost. No incluir `.env.local` en Git, en la imagen Docker ni en `dist/`.

## Seguridad de la versión pública de prueba

Por defecto el servidor elimina `checkoutUrl` de todos los carritos, deshabilita el botón de pago y rechaza `prepareCheckout`, incluidos productos individuales. Añadir al carrito no crea pedidos ni envía compras a proveedores. Los tres bloqueos comerciales de packs continúan en `false`: activación, verificación de checkout y verificación de fulfillment. La sesión excepcional de pruebas local queda ignorada en Git/Docker y no funciona desde el servidor de producción.

Se conservan `noindex, nofollow` en HTML y cabeceras. Esto evita indexación solicitada, **no es control de acceso**: una URL compartida es accesible públicamente. Si el preview debe ser confidencial, añadir autenticación del hosting antes de compartirlo.

Mantener Shopify Payments en modo de prueba y la automatización de todos los proveedores de AutoDS desactivada. Las capturas de la sesión anterior acreditan el estado mostrado entonces, no una comprobación actual de ambas cuentas. La aplicación no dispone de acceso administrativo a AutoDS para comprobarlo o cambiarlo. Los pedidos de prueba ya importados en AutoDS siguen siendo una tarea independiente: mantenerlos sin enviar al proveedor y revisarlos desde la cuenta antes de reactivar automatizaciones. No se han modificado ajustes externos ni procesado pedidos durante esta revisión.

## Antes de habilitar ventas reales

- Confirmar desde Shopify y AutoDS los ajustes actuales y resolver los pedidos de prueba pendientes.
- Completar pruebas finales de los tres packs y del checkout en móvil, con gateway de prueba confirmado y fulfillment aislado.
- Verificar SKU, colores, cantidades, seguimiento y gestión de cada componente en AutoDS. Importación en estado «Pendiente» no demuestra compra ni fulfillment correcto.
- Resolver las referencias visuales sin correspondencia comercial. Solo se ofrecen combinaciones con IDs reales, composición, precio y disponibilidad verificados.
- Aprobar identidad del vendedor, NIF, contacto, envíos, devoluciones, garantías, privacidad, cookies y derechos de las imágenes/contenidos. El repositorio contiene textos que declaran esos puntos pendientes.
- Confirmar portes e impuestos con direcciones de destino. Los 75/80/150 EUR son precios de producto; el total final depende del envío y del contexto de Shopify.
- Autorizar explícitamente la activación comercial. No basta cambiar una variable general: los bloqueos por pack siguen siendo independientes.

## Recursos y límites

Modelo 3D y frontend cargan como módulos separados. La compilación avisa de módulos superiores a 500 kB, incluido el módulo 3D; no es un fallo de compilación, pero conviene medir la experiencia en móviles reales con red lenta. No se han modificado el modelo ni las animaciones.

El servidor conserva HTML sin caché persistente, cachea los assets con hash y no devuelve HTML para archivos estáticos inexistentes. No sirve archivos fuera de `dist/`. Un runtime de producción no necesita herramientas de compilación; Docker no estaba disponible localmente para validar la imagen completa, por lo que debe comprobarse la primera construcción en el hosting.

La revisión de secretos recorre archivos candidatos, `dist/` y todos los blobs alcanzables del historial Git disponible. Compara también las credenciales privadas locales sin imprimirlas y busca formatos conocidos de tokens y claves. No sustituye una revisión universal de cualquier secreto o dato personal posible.

Referencias: [Render Web Services](https://render.com/docs/deploy-node-express-app), [Blueprints](https://render.com/docs/blueprint-spec), [Railway: puerto y escucha](https://docs.railway.com/networking/troubleshooting/application-failed-to-respond).
