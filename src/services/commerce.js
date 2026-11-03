import { demoProducts } from "../data/products.js";

export const createCommerce = (
  env = import.meta.env || {},
  request = globalThis.fetch,
) => {
  const domain = env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
  const token = env.VITE_SHOPIFY_STOREFRONT_TOKEN?.trim();
  const configured = Boolean(domain || token);
  const version = env.VITE_SHOPIFY_API_VERSION || "2026-10";
  const valid =
    /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain || "") &&
    token &&
    /^\d{4}-(01|04|07|10)$/.test(version);
  const productFields = `id handle title description productType images(first:10){nodes{url altText}} variants(first:100){nodes{id title availableForSale price{amount currencyCode}} pageInfo{hasNextPage}}`;
  const cartFields = `id checkoutUrl totalQuantity cost{subtotalAmount{amount currencyCode}} lines(first:250){nodes{id quantity cost{totalAmount{amount currencyCode}} merchandise{... on ProductVariant{id title availableForSale price{amount currencyCode} product{handle title featuredImage{url altText}}}}}}`;
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
            "X-Shopify-Storefront-Access-Token": token,
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
    if (p.variants.nodes.some((v) => v.price.currencyCode !== "EUR"))
      throw new Error(
        "Configura el mercado de España en EUR antes de habilitar el catálogo.",
      );
    const variants = p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      available: v.availableForSale,
      price: v.price,
    }));
    const reference = demoProducts.find((d) => d.handle === p.handle);
    return {
      handle: p.handle,
      name: p.title,
      configuration: reference?.configuration,
      supplierRating: reference?.supplierRating,
      description: p.description,
      demo: false,
      tag: "PONDNEST",
      category:
        reference?.category ||
        (p.productType === "Accesorio" ? "accessory" : "console"),
      type: p.productType,
      image: p.images.nodes[0]?.url,
      gallery: p.images.nodes.map((i) => i.url),
      variants,
      price: variants[0]?.price,
      facts: [],
      note: "",
    };
  }
  function cart(c) {
    if (!c) return null;
    return {
      id: c.id,
      checkoutUrl: c.checkoutUrl,
      subtotal: c.cost.subtotalAmount,
      lines: c.lines.nodes.map((l) => ({
        id: l.id,
        quantity: l.quantity,
        variantId: l.merchandise.id,
        name: l.merchandise.product.title,
        handle: l.merchandise.product.handle,
        image: l.merchandise.product.featuredImage?.url,
        variant: l.merchandise.title,
        price: l.merchandise.price,
        available: l.merchandise.availableForSale,
        total: l.cost.totalAmount,
      })),
    };
  }
  async function mutation(name, args, declarations, variables) {
    const data = await query(
      `mutation(${declarations}){${name}(${args}){cart{${cartFields}} userErrors{message} warnings{message}}}`,
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
        result.push(...d.products.nodes.map(product));
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
      return d.product ? product(d.product) : null;
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
      const c = await this.getCart(id);
      if (!c?.lines.length)
        throw new Error("El carrito está vacío o ha caducado.");
      const url = new URL(c.checkoutUrl);
      if (url.protocol !== "https:")
        throw new Error("URL de checkout no válida.");
      return url.href;
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
