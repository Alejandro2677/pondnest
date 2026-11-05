import summaryConfig from "../config/cart-summary.json" with { type: "json" };
import { orderSummary } from "../src/services/orderSummary.js";
import { demoProducts } from "../src/data/products.js";
import { validateCheckoutUrl } from "../src/services/checkout.js";

export const createCommerce = (
  env = {},
  request = globalThis.fetch,
  context = {},
) => {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
  const configured = Boolean(domain || token);
  const version = env.SHOPIFY_API_VERSION || "2026-10";
  const valid =
    /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain || "") &&
    token &&
    /^\d{4}-(01|04|07|10)$/.test(version);
  const variantFields = `id title availableForSale requiresComponents selectedOptions{name value} price{amount currencyCode}
    components(first:30){nodes{quantity productVariant{id title sku availableForSale image{url altText} product{id handle title featuredImage{url altText}}}} pageInfo{hasNextPage}}`;
  const productFields = `id handle title description productType options{name values} images(first:10){nodes{url altText}} variants(first:100){nodes{${variantFields}} pageInfo{hasNextPage endCursor}}`;
  const cartFields = `id checkoutUrl totalQuantity buyerIdentity{countryCode}
    cost{subtotalAmount{amount currencyCode} totalAmount{amount currencyCode} totalAmountEstimated totalTaxAmount{amount currencyCode}}
    discountAllocations{targetType discountedAmount{amount currencyCode}}
    deliveryGroups(first:250){nodes{deliveryAddress{countryCodeV2 zip} selectedDeliveryOption{title estimatedCost{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}}} pageInfo{hasNextPage}}
    lines(first:250){pageInfo{hasNextPage} nodes{id quantity cost{amountPerQuantity{amount currencyCode} subtotalAmount{amount currencyCode} totalAmount{amount currencyCode}} merchandise{... on ProductVariant{id title availableForSale price{amount currencyCode} product{handle title featuredImage{url altText}}}}
      ... on ComponentizableCartLine{lineComponents{id quantity merchandise{... on ProductVariant{id title sku availableForSale product{id handle title}}}}}}}`;
  async function query(document, variables = {}) {
    if (!valid)
      throw new Error(
        "La configuración de Shopify está incompleta. Revisa el dominio y el token público de Storefront.",
      );
    let response;
    try {
      response = await request(
        `https://${domain}/api/${version}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Shopify-Storefront-Private-Token": token,
            ...(context.buyerIp ? { "Shopify-Storefront-Buyer-IP": context.buyerIp } : {}),
          },
          body: JSON.stringify({ query: document, variables }),
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch {
      throw new Error(
        "No se ha podido conectar con la tienda. Inténtalo de nuevo.",
      );
    }
    if (!response.ok)
      throw new Error(
        "La tienda no está disponible temporalmente. Inténtalo de nuevo.",
      );
    const body = await response.json();
    if (body.errors?.length)
      throw new Error(
        "Shopify no ha podido completar la solicitud. Revisa la configuración de Storefront.",
      );
    return body.data;
  }
  function product(p) {
    if (p.variants.pageInfo?.hasNextPage)
      throw new Error(
        "Este producto supera las variantes admitidas. Es necesario ampliar la paginación.",
      );
    const variants = p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      available: v.availableForSale,
      price: v.price,
      requiresComponents: Boolean(v.requiresComponents),
      selectedOptions: v.selectedOptions || [],
      components: v.components?.nodes || [],
      componentsComplete: Boolean(v.components && !v.components.pageInfo?.hasNextPage),
    }));
    const reference = demoProducts.find((d) => d.handle === p.handle);
    return {
      id: p.id,
      options: p.options || [],
      handle: p.handle,
      ...reference,
      name: reference?.name || p.title,
      configuration: reference?.configuration,
      supplierRating: reference?.supplierRating,
      description: reference?.description || p.description,
      demo: false,
      tag: reference?.tag || "PONDNEST",
      category:
        reference?.category ||
        (p.productType === "Accesorio" ? "accessory" : "console"),
      type: reference?.type || p.productType,
      image: reference?.image || p.images.nodes[0]?.url,
      gallery: reference?.gallery || p.images.nodes.map((i) => i.url),
      variants,
      price: variants[0]?.price,
      facts: reference?.facts || [],
      note: reference?.note || "",
    };
  }
  function cart(c) {
    if (!c) return null;
    if (c.lines.pageInfo?.hasNextPage) throw Error('El carrito requiere paginar sus lineas antes de continuar.');
    if (c.deliveryGroups?.pageInfo?.hasNextPage) throw Error("No se puede completar el desglose de env?os. Revisa el carrito en Shopify.");
    const normalized = {
      cost: c.cost,
      discountAllocations: c.discountAllocations || [],
      deliveryGroups: c.deliveryGroups?.nodes || [],
      id: c.id,
      checkoutUrl: c.checkoutUrl,
      buyerCountry: c.buyerIdentity?.countryCode || null,
      destinationCountry: c.deliveryGroups?.nodes?.[0]?.deliveryAddress?.countryCodeV2 || null,
      subtotal: c.cost.subtotalAmount,
      lines: c.lines.nodes.map((l) => ({
        id: l.id,
        quantity: l.quantity,
        variantId: l.merchandise.id,
        name: l.merchandise.product.title,
        handle: l.merchandise.product.handle,
        image: l.merchandise.product.featuredImage?.url,
        variant: l.merchandise.title,
        price: l.cost.amountPerQuantity || l.merchandise.price,
        available: l.merchandise.availableForSale,
        subtotal: l.cost.subtotalAmount,
        total: l.cost.totalAmount,
        components: (l.lineComponents || []).map(component => ({
          variantId: component.merchandise.id, quantity: component.quantity,
          name: component.merchandise.product.title, variant: component.merchandise.title,
          sku: component.merchandise.sku, available: component.merchandise.availableForSale,
        })),
      })),
    };
    normalized.summary = orderSummary(normalized, summaryConfig);
    // Keep address details on the server; the browser only needs the economic breakdown.
    delete normalized.deliveryGroups;
    return normalized;
  }
  async function mutation(name, args, declarations, variables) {
    const data = await query(
      `mutation(${declarations}) @inContext(country:ES,language:ES){${name}(${args}){cart{${cartFields}} userErrors{message} warnings{message}}}`,
      variables,
    );
    const result = data[name];
    if (result.userErrors.length)
      throw new Error(result.userErrors.map((e) => e.message).join(" "));
    const normalized = cart(result.cart);
    if (!normalized)
      throw new Error(
        "El carrito ha caducado. Vuelve a cargarlo antes de continuar.",
      );
    return {
      ...normalized,
      warnings: result.warnings?.map((w) => w.message) || [],
    };
  }
  async function completeVariants(p) {
    let page = p.variants.pageInfo;
    const cursors = new Set();
    while (page?.hasNextPage) {
      if (!page.endCursor || cursors.has(page.endCursor)) throw Error('Paginacion de variantes incompleta.');
      cursors.add(page.endCursor);
      const data = await query(`query($id:ID!,$after:String!) @inContext(country:ES,language:ES){node(id:$id){... on Product{variants(first:100,after:$after){nodes{${variantFields}} pageInfo{hasNextPage endCursor}}}}}`, {id:p.id,after:page.endCursor});
      const next = data.node?.variants;
      if (!next) throw Error('No se han podido consultar todas las variantes.');
      p.variants.nodes.push(...next.nodes);
      page = next.pageInfo;
    }
    p.variants.pageInfo = page || {};
    return p;
  }
  return {
    demo: !configured,
    storageKey: configured
      ? `pondnest:shopify:${domain}:cart`
      : "pondnest:demo:cart:v1",
    async getProducts() {
      if (!configured) return demoProducts;
      const result = [];
      let after = null;
      do {
        const d = await query(
          `query($after:String) @inContext(country:ES,language:ES){products(first:100,after:$after){nodes{${productFields}} pageInfo{hasNextPage endCursor}}}`,
          { after },
        );
        for (const p of d.products.nodes) result.push(product(await completeVariants(p)));
        after = d.products.pageInfo.hasNextPage
          ? d.products.pageInfo.endCursor
          : null;
      } while (after);
      return result;
    },
    async getProduct(handle) {
      if (!configured) return demoProducts.find((p) => p.handle === handle);
      const d = await query(
        `query($handle:String!) @inContext(country:ES,language:ES){product(handle:$handle){${productFields}}}`,
        { handle },
      );
      return d.product ? product(await completeVariants(d.product)) : null;
    },
    async getCart(id) {
      const d = await query(
        `query($id:ID!) @inContext(country:ES,language:ES){cart(id:$id){${cartFields}}}`,
        { id },
      );
      return cart(d.cart);
    },
    createCart: () =>
      mutation("cartCreate", "input:$input", "$input:CartInput!", {
        input: { buyerIdentity: { countryCode: "ES" } },
      }),
    updateBuyerIdentity: (id, countryCode = 'ES') =>
      mutation('cartBuyerIdentityUpdate', 'cartId:$id,buyerIdentity:$buyerIdentity', '$id:ID!,$buyerIdentity:CartBuyerIdentityInput!', {
        id, buyerIdentity: { countryCode },
      }),
    async prepareCheckout(id) {
      const current = await this.getCart(id);
      if (!current?.lines.length) throw Error('El carrito está vacío o ha caducado.');
      // Spain is the default market; preserve an explicit delivery destination.
      await this.updateBuyerIdentity(id, current.destinationCountry || 'ES');
      // Request a fresh checkoutUrl after context and pricing have been updated.
      const latest = await this.getCart(id);
      if (!latest?.lines.length) throw Error('El carrito está vacío o ha caducado.');
      validateCheckoutUrl(latest.checkoutUrl);
      return latest;
    },
    addToCart: (id, merchandiseId, quantity) =>
      mutation(
        "cartLinesAdd",
        "cartId:$id,lines:$lines",
        "$id:ID!,$lines:[CartLineInput!]!",
        { id, lines: [{ merchandiseId, quantity }] },
      ),
    updateCart: (id, lineId, quantity) =>
      quantity === 0
        ? mutation(
            "cartLinesRemove",
            "cartId:$id,lineIds:$lineIds",
            "$id:ID!,$lineIds:[ID!]!",
            { id, lineIds: [lineId] },
          )
        : mutation(
            "cartLinesUpdate",
            "cartId:$id,lines:$lines",
            "$id:ID!,$lines:[CartLineUpdateInput!]!",
            { id, lines: [{ id: lineId, quantity }] },
          ),
    async getCheckoutUrl(id) {
      if (!configured)
        throw new Error("La compra no está disponible en modo demo.");
      const c = await this.prepareCheckout(id);
      if (!c?.lines.length)
        throw new Error("El carrito está vacío o ha caducado.");
      return validateCheckoutUrl(c.checkoutUrl);
    },
  };
};
export const commerce = createCommerce();
export const money = (value) =>
  value
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: value.currencyCode,
      }).format(Number(value.amount))
    : "Precio por confirmar";
