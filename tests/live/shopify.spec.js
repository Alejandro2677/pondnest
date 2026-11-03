import { test, expect } from "@playwright/test";
const price = { amount: "89.00", currencyCode: "EUR" };
const variants = [
  { id: "v1", title: "Morada", availableForSale: true, price },
  { id: "v2", title: "Agotada de prueba", availableForSale: false, price },
];
const product = {
  handle: "r36s",
  title: "R36S Shopify",
  description: "Descripción de prueba desde Shopify.",
  productType: "Consola",
  images: { nodes: [] },
  variants: { nodes: variants, pageInfo: { hasNextPage: false } },
};
async function fixture(page, options = {}) {
  let quantity = 0;
  const calls = [];
  const makeCart = () => ({
    id: "gid://shopify/Cart/test?key=fixture",
    checkoutUrl: "https://pondnest-test.myshopify.com/checkouts/test",
    totalQuantity: quantity,
    cost: {
      subtotalAmount: { amount: String(quantity * 89), currencyCode: "EUR" },
    },
    lines: {
      nodes: quantity
        ? [
            {
              id: "line1",
              quantity,
              merchandise: {
                ...variants[0],
                product: {
                  handle: product.handle,
                  title: product.title,
                  featuredImage: null,
                },
              },
              cost: {
                totalAmount: {
                  amount: String(quantity * 89),
                  currencyCode: "EUR",
                },
              },
            },
          ]
        : [],
    },
  });
  await page.route(
    "https://pondnest-test.myshopify.com/api/**",
    async (route) => {
      const { query, variables } = route.request().postDataJSON();
      calls.push(query);
      if (options.offline) return route.abort();
      if (query.includes("products("))
        return route.fulfill({
          json: {
            data: {
              products: { nodes: [product], pageInfo: { hasNextPage: false } },
            },
          },
        });
      const operation = [
        "cartCreate",
        "cartLinesAdd",
        "cartLinesUpdate",
        "cartLinesRemove",
      ].find((x) => query.includes(x));
      if (options.rejectAdd && operation === "cartLinesAdd")
        return route.fulfill({
          json: {
            data: {
              cartLinesAdd: {
                cart: null,
                userErrors: [{ message: "Stock agotado de prueba" }],
                warnings: [],
              },
            },
          },
        });
      if (operation === "cartLinesAdd") quantity += variables.lines[0].quantity;
      if (operation === "cartLinesUpdate")
        quantity = variables.lines[0].quantity;
      if (operation === "cartLinesRemove") quantity = 0;
      return route.fulfill({
        json: {
          data: operation
            ? {
                [operation]: { cart: makeCart(), userErrors: [], warnings: [] },
              }
            : { cart: makeCart() },
        },
      });
    },
  );
  return calls;
}
test("Shopify catalog variants cart persistence updates and checkout", async ({
  page,
}) => {
  const calls = await fixture(page);
  await page.goto("/productos/r36s");
  await expect(page.locator("h1")).toHaveText(product.title);
  await expect(page.locator(".demo-ribbon")).toHaveCount(0);
  await expect(page.locator(".detail-price")).toContainText("89,00");
  await page.locator("select").selectOption("v2");
  await expect(
    page.getByRole("button", { name: "Agotado", exact: true }),
  ).toBeDisabled();
  await page.locator("select").selectOption("v1");
  await page.getByRole("button", { name: "Añadir al carrito" }).click();
  await expect(page.locator("output")).toHaveText("1");
  await page.reload();
  await expect(page.locator("output")).toHaveText("1");
  await page.getByRole("button", { name: "Aumentar cantidad" }).click();
  await expect(page.locator("output")).toHaveText("2");
  await expect(page.locator(".cart-summary strong")).toContainText("178,00");
  await page.getByRole("button", { name: "Reducir cantidad" }).click();
  await expect(page.locator("output")).toHaveText("1");
  await page.route("https://pondnest-test.myshopify.com/checkouts/test", (r) =>
    r.fulfill({ contentType: "text/html", body: "<h1>Checkout fixture</h1>" }),
  );
  await page.getByRole("button", { name: "Continuar a Shopify" }).click();
  await expect(page).toHaveURL(
    "https://pondnest-test.myshopify.com/checkouts/test",
  );
  expect(calls.some((q) => q.includes("cartCreate"))).toBe(true);
  expect(calls.some((q) => q.includes("cartLinesAdd"))).toBe(true);
});
test("Shopify errors show retry, without falling back to demo", async ({
  page,
}) => {
  await fixture(page, { offline: true });
  await page.goto("/productos");
  await expect(page.getByRole("alert")).toContainText(
    "No se ha podido conectar",
  );
  await expect(
    page.getByRole("button", { name: "Volver a intentar" }),
  ).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(0);
  await expect(page.locator(".demo-ribbon")).toHaveCount(0);
});
test("Shopify stock rejection keeps buyer on product with error", async ({
  page,
}) => {
  await fixture(page, { rejectAdd: true });
  await page.goto("/productos/r36s");
  await page.getByRole("button", { name: "Añadir al carrito" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Stock agotado de prueba",
  );
  await expect(page).toHaveURL(/productos/);
});
