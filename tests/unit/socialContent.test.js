import test from "node:test";
import assert from "node:assert/strict";
import {
  parseTikTokUrl,
  prepareVideos,
  playerUrl,
  prepareReviews,
  reviewSummary,
  localImage,
} from "../../src/services/socialContent.js";

const video = {
  url: "https://www.tiktok.com/@test-fixture/video/1000000000000000001?tracking=removed",
  creator: "@test-fixture",
  description: "Fixture",
  productHandle: "gamegaga-r36-hd",
  embedAllowed: true,
};
const review = {
  id: "fixture",
  author: "Autor de prueba",
  date: "2026-11-02",
  rating: 4,
  comment: "Contenido de prueba",
  productHandle: "gamegaga-r36-hd",
  published: true,
};

test("TikTok URLs are validated and tracking is removed", () => {
  assert.equal(parseTikTokUrl(video.url).id, "1000000000000000001");
  assert.equal(parseTikTokUrl(video.url).url.includes("tracking"), false);
  for (const bad of [
    "javascript:alert(1)",
    "https://www.tiktok.com.evil.test/@a/video/12345678901",
    "http://www.tiktok.com/@a/video/12345678901",
    "https://user:password@www.tiktok.com/@a/video/12345678901",
  ])
    assert.equal(parseTikTokUrl(bad), null);
});
test("only related and explicitly permitted videos are embeddable", () => {
  assert.equal(prepareVideos([video])[0].playable, true);
  assert.equal(
    prepareVideos([{ ...video, embedAllowed: false }])[0].playable,
    false,
  );
  assert.equal(
    prepareVideos([{ ...video, url: "https://vm.tiktok.com/short/" }])[0]
      .playable,
    false,
  );
  assert.equal(
    prepareVideos([
      video,
      video,
      null,
      { ...video, productHandle: "unrelated" },
    ]).length,
    1,
  );
  assert.deepEqual(prepareVideos(null), []);
  assert.match(playerUrl("1000000000000000001"), /autoplay=0/);
  assert.match(playerUrl("1000000000000000001"), /force_muted=1/);
  assert.match(playerUrl("1000000000000000001", true), /force_muted=0/);
  assert.throws(() => playerUrl("../unsafe"));
});
test("remote thumbnails cannot issue requests before consent", () => {
  assert.equal(
    localImage("/images/authorized.webp"),
    "/images/authorized.webp",
  );
  for (const remote of [
    "//tracking.test/photo",
    "https://tracking.test/photo",
    "/\\tracking.test/photo",
    "data:image/png;base64,test",
  ])
    assert.equal(localImage(remote), null);
  assert.equal(
    prepareVideos([{ ...video, thumbnail: "https://tracking.test/photo" }])[0]
      .thumbnail,
    null,
  );
});
test("reviews require published genuine data and valid scores and dates", () => {
  const entries = prepareReviews([
    review,
    review,
    null,
    { ...review, id: "demo", demo: true },
    { ...review, id: "unpublished", published: false },
    { ...review, id: "bad-score", rating: 0 },
    { ...review, id: "bad-date", date: "2026-02-31" },
    { ...review, id: "missing", author: "" },
  ]);
  assert.equal(entries.length, 1);
  assert.deepEqual(prepareReviews(null), []);
});
test("ratings are calculated solely from published reviews, never demo placeholders", () => {
  assert.equal(reviewSummary(prepareReviews([])), null);
  assert.deepEqual(
    reviewSummary(
      prepareReviews([review, { ...review, id: "second", rating: 5 }]),
    ),
    { count: 2, average: 4.5 },
  );
});
