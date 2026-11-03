import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { supplierReviewSelection } from "../../src/data/supplierReviews.js";

for (const width of [375, 1440]) {
  test(`supplier review selection is labelled demo and renders accurately ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Exercise rendering only after an explicit product match; production
    // preserves the original unverified selection without displaying it as R36S.
    await page.route("**/src/data/supplierReviews.js", async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace("productMatchVerified: false", 'productHandle: "r36s", productMatchVerified: true');
      await route.fulfill({ response, body });
    });
    await page.goto("/");
    await page.locator("#resenas").scrollIntoViewIfNeeded();
    const section = page.locator("#resenas");
    const cards = section.locator(".review-card");
    await expect(cards).toHaveCount(6);
    await expect(section.locator(".review-summary")).toHaveCount(0);
    await expect(section.locator(".supplier-review-notice")).toContainText(
      "MODO DEMOSTRACIÓN",
    );
    await expect(section.locator(".supplier-review-notice")).toContainText(
      "No son opiniones de clientes ni compras verificadas en PondNest",
    );
    await expect(section.locator(".supplier-review-notice")).toContainText(
      "mismo producto",
    );
    await expect(section.locator(".section-heading")).toContainText(
      "Una selección, no todas sus valoraciones",
    );
    for (const [index, review] of supplierReviewSelection.items.entries()) {
      const card = cards.nth(index);
      await expect(card.locator("h3")).toHaveText(review.author);
      await expect(card.locator(".review-country")).toHaveText(review.country);
      await expect(card.locator("time")).toHaveAttribute(
        "datetime",
        review.date,
      );
      await expect(card.locator(".review-comment")).toHaveText(review.comment);
      await expect(card.locator(".review-source-detail")).toContainText(
        review.variant,
      );
      await expect(
        card.getByRole("img", { name: "5 de 5 estrellas" }),
      ).toHaveCount(1);
      await expect(card.locator(".review-star-fill")).toHaveCount(5);
      await expect(card.locator(".review-stars")).toHaveCSS(
        "color",
        "rgb(245, 163, 90)",
      );
    }
    const countInView = await cards.evaluateAll((nodes) => {
      const bounds = nodes[0].parentElement.getBoundingClientRect();
      return nodes.filter((node) => {
        const r = node.getBoundingClientRect();
        return r.left >= bounds.left - 1 && r.right <= bounds.right + 1;
      }).length;
    });
    expect(countInView).toBe(width === 1440 ? 3 : 1);
    await page.screenshot({
      path: `test-results/supplier-reviews-${width}.png`,
    });
    const track = section.locator(".social-carousel-track");
    await section
      .getByRole("button", { name: "Siguiente: Opiniones del proveedor" })
      .click();
    expect(await track.evaluate((node) => node.scrollLeft)).toBeGreaterThan(
      100,
    );
    await section
      .getByRole("button", { name: "Anterior: Opiniones del proveedor" })
      .click();
    expect(await track.evaluate((node) => node.scrollLeft)).toBeLessThan(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .include("#resenas")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations.map((v) => v.id)).toEqual([]);
  });
}

test("supplier reviews stay separate from the published-review pipeline", async () => {
  const { reviews } = await import("../../src/data/reviews.js");
  const { prepareReviews } =
    await import("../../src/services/socialContent.js");
  expect(reviews).toEqual([]);
  expect(prepareReviews(supplierReviewSelection.items)).toEqual([]);
  expect(supplierReviewSelection.mode).toBe("demo");
  expect(supplierReviewSelection.productMatchVerified).toBe(false);
  expect(supplierReviewSelection.reuseRightsVerified).toBe(false);
  expect(supplierReviewSelection.items[0].originalComment).toBe(
    "great handheld gaming machine lots of fun",
  );
  expect(
    supplierReviewSelection.items.filter((r) => r.author === "C*z"),
  ).toHaveLength(2);
});
