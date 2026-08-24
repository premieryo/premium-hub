import assert from "node:assert/strict";
import test from "node:test";
import { compareWithRetailPrice } from "./product-categories";

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
