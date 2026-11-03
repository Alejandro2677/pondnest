# Shopify headless + AutoDS · Arquitectura objetivo

## Flujo previsto

**AutoDS → Shopify (productos y gestión de pedidos, según integración disponible) → Storefront API → web React PondNest → carrito Shopify → checkout alojado en Shopify.**

No conectar el frontend directamente a AutoDS para publicar precios y controlar pedidos. Shopify debe centralizar variantes, disponibilidad, pricing, carrito y checkout. Confirmar en la cuenta real que los pedidos creados por el checkout headless siguen el flujo de gestión de AutoDS previsto.

## Fase 1: sin cuentas conectadas

- `src/data/products` o equivalente con catálogo de prueba etiquetado.
- Capa de datos intercambiable: `getProducts()`, `getProduct(handle)`, `createCart()`, `addToCart()`, `updateCart()`, `getCheckoutUrl()`.
- Interface navegable y carrito de demostración etiquetado, **sin pagos simulados**.
- `.env.example` documentado con nombres de variables, sin credenciales ni secretos.

## Fase 2: Shopify configurado

- Usar versión vigente de **Shopify Storefront API**; consultar documentación oficial antes de codificar queries/mutaciones.
- Cargar fichas e imágenes reales desde Shopify; variantes con IDs válidos.
- Usar Shopify Cart API para crear y actualizar carrito. Redirigir al `checkoutUrl` facilitado por Shopify (sin construir un sistema de tarjetas de pago propio).
- Configurar dominio, impuestos, envío, moneda y políticas en Shopify antes de vender.
- Considerar sesión/carrito persistente para navegación y vuelta a la tienda. Gestionar errores de red, líneas agotadas y cambios de precio/stock.
- Token público de **Storefront API** solo bajo su contrato de acceso público; **nunca** insertar tokens Admin, contraseñas o claves privadas en el navegador o repositorio.
- Configurar AutoDS en Shopify y **probar un flujo real de pedido** antes del lanzamiento.

## Pagos y datos personales

- El navegador debe redirigir a Shopify Checkout; no recopilar ni almacenar datos de tarjeta en servidores propios.
- No incluir integraciones de pixel/analítica que requieran cookies no esenciales sin gestión adecuada del consentimiento.
- Configurar avisos exigibles a la venta en España: identidad y contacto del vendedor, precios e impuestos, plazos y gastos de envío, desistimiento/devoluciones, garantía, privacidad/cookies y condiciones de compra (revisión profesional recomendable).

## Configuración orientativa (sin valores reales)

```env
VITE_SHOPIFY_STORE_DOMAIN=tu-tienda.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=REEMPLAZAR_POR_TOKEN_PUBLICO_STOREFRONT
VITE_SHOPIFY_API_VERSION=VERSION_SOPORTADA_ACTUAL
```

**Nota**: es una plantilla ilustrativa. Verificar nombres y soporte con la versión de la API elegida. No pedir ni copiar claves privadas al chat. Mantener `VITE_` únicamente para valores permitidos en cliente.

## Verificaciones críticas

- Alta/actualización de variantes AutoDS → Shopify.
- Mapeo de variantes y stock Shopify → web.
- Compra de prueba completa → pedido Shopify → automatización AutoDS.
- Cancelaciones, devoluciones y atención al cliente.
- Compatibilidad de dropshipping y plazos reales para España.
