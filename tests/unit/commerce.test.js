import test from "node:test";
import assert from "node:assert/strict";
import { createCommerce } from "../../src/services/commerce.js";
const env = {
  VITE_SHOPIFY_STORE_DOMAIN: "pondnest-test.myshopify.com",
  VITE_SHOPIFY_STOREFRONT_TOKEN: "public-test-only",
  VITE_SHOPIFY_API_VERSION: "2026-10",
};
const p = {
  handle: "r36h",
  title: "R36H live",
  description: "Real catalog",
  productType: "Consola",
  images: { nodes: [{ url: "https://example.com/product.webp" }] },
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/1",
        title: "Real variant",
        availableForSale: false,
        price: { amount: "75.50", currencyCode: "EUR" },
      },
    ],
    pageInfo: { hasNextPage: false },
  },
};
const cart = {
  id: "gid://shopify/Cart/1?key=test",
  checkoutUrl: "https://pondnest-test.myshopify.com/checkouts/test",
  cost: { subtotalAmount: { amount: "151.00", currencyCode: "EUR" } },
  lines: {
    nodes: [
      {
        id: "line-1",
        quantity: 2,
        merchandise: {
          id: p.variants.nodes[0].id,
          title: "Real variant",
          availableForSale: true,
          price: p.variants.nodes[0].price,
          product: { handle: "r36h", title: p.title, featuredImage: null },
        },
        cost: { totalAmount: { amount: "151", currencyCode: "EUR" } },
      },
    ],
  },
};
function mock(resolver) {
  const calls = [];
  const service = createCommerce(env, async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, options, ...body });
    return { ok: true, json: async () => ({ data: resolver(body) }) };
  });
  return { service, calls };
}
test("demo has four products and checkout is blocked", async () => {
  const service = createCommerce({});
  assert.equal((await service.getProducts()).length, 4);
  assert.equal((await service.getProduct("r36h")).price, null);
  await assert.rejects(service.getCheckoutUrl("x"), /modo demo/);
});
test("incomplete live config fails closed", async () => {
  const service = createCommerce({
    VITE_SHOPIFY_STORE_DOMAIN: env.VITE_SHOPIFY_STORE_DOMAIN,
  });
  assert.equal(service.demo, false);
  await assert.rejects(service.getProducts(), /incompleta/);
});
test("catalog comes entirely from Shopify with Spain context", async () => {
  const { service, calls } = mock(() => ({
    products: { nodes: [p], pageInfo: { hasNextPage: false } },
  }));
  const products = await service.getProducts();
  assert.equal(products.length, 1);
  assert.equal(products[0].name, p.title);
  assert.equal(products[0].variants[0].available, false);
  assert.equal(products[0].price.amount, "75.50");
  assert.match(calls[0].query, /country:ES/);
  assert.equal(
    calls[0].url,
    "https://pondnest-test.myshopify.com/api/2026-10/graphql.json",
  );
  assert.equal(
    calls[0].options.headers["X-Shopify-Storefront-Access-Token"],
    "public-test-only",
  );
});
test("catalog paginates", async () => {
  const { service, calls } = mock(({ variables }) => ({
    products: {
      nodes: [p],
      pageInfo: { hasNextPage: !variables.after, endCursor: "next" },
    },
  }));
  assert.equal((await service.getProducts()).length, 2);
  assert.equal(calls[1].variables.after, "next");
});
test("cart create add update remove and checkout use Cart API", async () => {
  const { service, calls } = mock(({ query }) => {
    const name = [
      "cartCreate",
      "cartLinesAdd",
      "cartLinesUpdate",
      "cartLinesRemove",
    ].find((n) => query.includes(n));
    return name ? { [name]: { cart, userErrors: [], warnings: [] } } : { cart };
  });
  assert.equal((await service.createCart()).id, cart.id);
  assert.equal(
    (await service.addToCart(cart.id, "variant-1", 2)).lines[0].quantity,
    2,
  );
  await service.updateCart(cart.id, "line-1", 3);
  await service.updateCart(cart.id, "line-1", 0);
  assert.equal(await service.getCheckoutUrl(cart.id), cart.checkoutUrl);
  assert.equal(calls[0].variables.input.buyerIdentity.countryCode, "ES");
  assert.deepEqual(calls[1].variables.lines, [
    { merchandiseId: "variant-1", quantity: 2 },
  ]);
  assert.deepEqual(calls[2].variables.lines, [{ id: "line-1", quantity: 3 }]);
  assert.deepEqual(calls[3].variables.lineIds, ["line-1"]);
});
test("API user errors and network errors propagate", async () => {
  const { service } = mock(() => ({
    cartLinesAdd: {
      cart: null,
      userErrors: [{ message: "Stock unavailable" }],
    },
  }));
  await assert.rejects(service.addToCart("c", "v", 1), /Stock unavailable/);
  const offline = createCommerce(env, async () => {
    throw Error("offline");
  });
  await assert.rejects(offline.getProducts(), /conectar/);
});
test("expired and empty carts cannot checkout", async () => {
  const { service } = mock(() => ({ cart: null }));
  assert.equal(await service.getCart("expired"), null);
  await assert.rejects(service.getCheckoutUrl("expired"), /caducado/);
});
test("warnings returned to buyer, invalid checkout refused", async () => {
  const { service } = mock(() => ({
    cartLinesUpdate: {
      cart,
      userErrors: [],
      warnings: [{ message: "Quantity adjusted" }],
    },
  }));
  assert.deepEqual((await service.updateCart(cart.id, "line-1", 1)).warnings, [
    "Quantity adjusted",
  ]);
  const { service: insecure } = mock(() => ({
    cart: { ...cart, checkoutUrl: "http://example.com" },
  }));
  await assert.rejects(insecure.getCheckoutUrl(cart.id), /no válida/);
});
