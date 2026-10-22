import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { priceAvailability, rankingPricePresentation, STOCK_OBSERVATION_MAX_AGE_MS } from "./price-availability";
import PublicProductCard from "../components/genre/PublicProductCard";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import MarketRankingPage from "../components/genre/MarketRankingPage";
import { genreConfigs } from "../data/genre-config";
import { mergeOfficialCardCatalog, officialCardCatalog } from "../data/card-catalog";
import type { RankingItem } from "../data/types";
const now = new Date("2026-10-22T03:00:00Z");
const updatedAt = "2026-10-12T19:42:27.968Z";
const product = { ...officialCardCatalog.find(p => p.id === "story-booster-01-st01-box")!, marketPrice: 10980, updatedAt, shop: "検証店", imageEnabled: false };
const ranking = { id: product.id, genre: "dragonball", product: product.name, shop: "検証店", currentPrice: 10980, previousPrice: 17800, changeRate: -38.31, changeAmount: -6820, status: "前回比 -6,820円 (-38.31%)", price: "10,980円", updatedAt, icon: "📦", href: "/dragonball/ranking" } as RankingItem;
test("ST01旧観測は価格を残し現在在庫・比較値と誤認させない", () => {
  const before = structuredClone(ranking);
  const value = rankingPricePresentation(ranking, now);
  assert.equal(value.price, "最終取得価格 10,980円");
  assert.match(value.description, /現在の在庫未確認/);
  assert.match(value.date, /2026\/10\/13 04:42 JST/);
  assert.doesNotMatch(value.description, /38.31|6,820/);
  assert.deepEqual(ranking, before);
});
test("取得日時だけ新しくても在庫確認記録のない旧データは比較しない", () => {
  assert.equal(priceAvailability({ updatedAt: now.toISOString() }, now).comparable, false);
});
for (const [name, stock, checkedAt, expected] of [
  ["新しい在庫あり", "in-stock", now.toISOString(), true],
  ["在庫なし", "out-of-stock", now.toISOString(), false],
  ["在庫不明", "unknown", now.toISOString(), false],
  ["未来日時", "in-stock", "2026-10-23T03:00:00Z", false],
  ["日時不正", "in-stock", "invalid", false],
] as const) test(`${name}の比較可否`, () => {
  const value = priceAvailability({ updatedAt: checkedAt, priceStockStatus: stock, priceStockCheckedAt: checkedAt }, now);
  assert.equal(value.comparable, expected);
  if (stock === "out-of-stock") assert.match(value.stock, /在庫なし/);
});
test("24時間を超えると在庫確認を失効し比較しない", () => {
  const date = now.toISOString();
  const item = { updatedAt: date, priceStockStatus: "in-stock" as const, priceStockCheckedAt: date };
  assert.equal(priceAvailability(item, new Date(now.getTime() + STOCK_OBSERVATION_MAX_AGE_MS)).comparable, true);
  assert.equal(priceAvailability(item, new Date(now.getTime() + STOCK_OBSERVATION_MAX_AGE_MS + 1)).comparable, false);
});
test("画像/行更新日時では在庫証拠を更新せず価格観測時刻と一致が必要", () => {
  assert.equal(priceAvailability({ updatedAt, priceStockStatus: "in-stock", priceStockCheckedAt: now.toISOString() }, now).comparable, false);
});
test("商品カードは旧10,980円を最終取得と在庫未確認・JST日時で表示", () => {
  const html = renderToStaticMarkup(createElement(PublicProductCard, { product }));
  assert.match(html, /最終取得価格/); assert.match(html, /10,980円/);
  assert.match(html, /現在の在庫未確認/); assert.match(html, /2026\/10\/13 04:42 JST/);
  assert.doesNotMatch(html, /現在相場/);
});
test("相場ランキングは旧価格の定価比と前回比を隠し正常な保存値を変えない", () => {
  const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {} as never }, createElement(MarketRankingPage, { config: genreConfigs.dragonball, products: [product], ranking: [ranking] })));
  assert.match(html, /最終取得価格/); assert.match(html, /10,980円/); assert.match(html, /比較対象外/);
  assert.doesNotMatch(html, /38.31|6,820|66.4/);
  assert.equal(ranking.previousPrice, 17800);
});

test("商品カタログ結合後も在庫確認の証拠と価格時刻を同時に保持する", () => {
  const observation = { ...product, updatedAt: now.toISOString(), priceStockStatus: "in-stock" as const, priceStockCheckedAt: now.toISOString() };
  const merged = mergeOfficialCardCatalog([observation], "dragonball").find(p => p.id === product.id)!;
  assert.equal(merged.marketPrice, observation.marketPrice);
  assert.equal(priceAvailability(merged, now).comparable, true);
  const legacy = mergeOfficialCardCatalog([product], "dragonball").find(p => p.id === product.id)!;
  assert.equal(priceAvailability(legacy, now).comparable, false);
});
