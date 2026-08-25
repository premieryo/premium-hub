import assert from "node:assert/strict";
import test from "node:test";
import { officialCardCatalog, mergeOfficialCardCatalog } from "../data/card-catalog";
import type { Product } from "../data/types";
import { compareWithRetailPrice, productsInCategory, recentProductsInCategory, splitBoosterProductsByRelease } from "./product-categories";

test("retail comparison keeps the +50 percent premium boundary", () => {
  assert.equal(compareWithRetailPrice(8100, 5400)?.tone, "fire");
});

test("retail comparison keeps the +10 percent above-retail boundary", () => {
  assert.equal(compareWithRetailPrice(5940, 5400)?.tone, "high");
});

test("retail comparison keeps the -10 percent near-retail boundary", () => {
  assert.equal(compareWithRetailPrice(4860, 5400)?.tone, "near");
});

test("retail comparison classifies values below -10 percent as below retail", () => {
  assert.equal(compareWithRetailPrice(4859, 5400)?.tone, "below");
});

test("retail comparison returns null without a confirmed retail price", () => {
  assert.equal(compareWithRetailPrice(5400, undefined), null);
});

test("official catalog has unique IDs and the expected booster products per card genre", () => {
  assert.equal(new Set(officialCardCatalog.map((product) => `${product.genre}:${product.id}`)).size, officialCardCatalog.length);
  assert.equal(officialCardCatalog.filter((product) => product.genre === "pokemon" && product.productCategory === "booster-box").length, 16);
  assert.equal(officialCardCatalog.filter((product) => product.genre === "onepiece" && product.productCategory === "booster-box").length, 15);
  assert.equal(officialCardCatalog.filter((product) => product.genre === "dragonball" && product.productCategory === "booster-box").length, 15);
});

test("official catalog keeps every new product tracking disabled", () => {
  assert.ok(officialCardCatalog.every((product) => product.priceTrackingEnabled === false));
});

test("official booster retail prices only use official sales evidence", () => {
  const pricedBoosters = officialCardCatalog.filter(
    (product) => product.productCategory === "booster-box" && product.retailPrice,
  );
  assert.equal(pricedBoosters.filter((product) => product.genre === "pokemon").length, 1);
  assert.equal(pricedBoosters.filter((product) => product.genre === "onepiece").length, 4);
  assert.equal(pricedBoosters.filter((product) => product.genre === "dragonball").length, 12);
  assert.ok(pricedBoosters.every((product) =>
    product.officialUrl.includes("pokemon-card.com") || product.officialUrl.includes("p-bandai.jp")));
  assert.equal(pricedBoosters.find((product) => product.id === "story-booster-01-st01-box")?.retailPrice, 6600);
  assert.equal(pricedBoosters.find((product) => product.id === "dragonball-sb02")?.retailPrice, 7920);
  assert.equal(pricedBoosters.find((product) => product.id === "world-strongest-warriors-op17-box")?.retailPrice, 5760);
});

test("fallback merge preserves existing commerce data and tracking", () => {
  const existing: Product = { id: "storm-emeralda-box", genre: "pokemon", name: "existing", type: "box", searchWord: "existing", releaseDate: "2026-07-31", marketPrice: 17000, shop: "shop", url: "https://example.com", priceTrackingEnabled: true };
  const merged = mergeOfficialCardCatalog([existing], "pokemon").find((product) => product.id === existing.id);
  assert.equal(merged?.marketPrice, 17000);
  assert.equal(merged?.shop, "shop");
  assert.equal(merged?.priceTrackingEnabled, true);
  assert.equal(merged?.productCategory, "booster-box");
});

test("fallback merge restores the five production tracking products", () => {
  const tracked = (["pokemon", "onepiece", "dragonball"] as const)
    .flatMap((genre) => mergeOfficialCardCatalog([], genre))
    .filter((product) => product.priceTrackingEnabled === true);
  assert.equal(tracked.length, 5);
});

test("recent product view separates categories and limits booster products to 15", () => {
  const pokemon = mergeOfficialCardCatalog([], "pokemon");
  const boosters = recentProductsInCategory(pokemon, "booster-box", 15);
  assert.equal(boosters.length, 15);
  assert.ok(boosters.every((product) => product.productCategory === "booster-box"));
  assert.ok(boosters.every((product, index) => index === 0 || boosters[index - 1].releaseDate >= product.releaseDate));
  assert.equal(productsInCategory(pokemon, "collection-box").length, 5);
});

test("products view separates upcoming boosters before limiting released boosters", () => {
  const pokemon = mergeOfficialCardCatalog([], "pokemon");
  const result = splitBoosterProductsByRelease(pokemon, 15, new Date("2026-08-25T00:00:00+09:00"));
  assert.deepEqual(result.upcoming.map((product) => product.id), ["30th-celebration-box"]);
  assert.equal(result.released.length, 15);
  assert.ok(result.released.some((product) => product.id === "battle-partners-box"));
  assert.ok(result.released.every((product) => product.productCategory === "booster-box"));
});
