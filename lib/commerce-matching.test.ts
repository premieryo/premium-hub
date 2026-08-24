import assert from "node:assert/strict";
import test from "node:test";
import { findMultipleItemExpression } from "./commerce-matching";
import { evaluateProductIdentity } from "./commerce-matching";
import type { Product } from "@/data/types";
import type { YahooItem } from "@/lib/api/yahoo";

for (const title of ["STORY BOOSTER 01 BOX", "FB01 BOX", "FB10 BOX", "OP-01 BOX", "OP-17 BOX", "SB01 BOX", "ST01 BOX", "Vol.1 BOX", "第1弾 BOX"]) {
  test(`シリーズ番号を数量と誤認しない: ${title}`, () => assert.equal(findMultipleItemExpression(title), null));
}
for (const title of ["商品 2BOX", "商品 2箱", "商品 BOX×2", "商品 2BOXセット", "商品 3個セット", "商品 2ボックス"]) {
  test(`複数商品を検出する: ${title}`, () => assert.ok(findMultipleItemExpression(title)));
}

const collectionProduct: Product = { id: "limited-set", name: "プレミアムカードコレクション02", genre: "dragonball", type: "other", productCategory: "collection-box", seriesNumber: "PCC02", searchWord: "プレミアムカードコレクション02", releaseDate: "2026-03-01", jan: "4580000000001" };
const yahooItem: YahooItem = { name: "プレミアムカードコレクション02 PCC02 新品", price: 3000, url: "https://example.com/item", inStock: true, condition: "new", seller: { name: "shop" }, janCode: "4580000000001" };

test("collectionはJAN完全一致と名称一致で採用", () => assert.equal(evaluateProductIdentity(collectionProduct, yahooItem).accepted, true));
test("collectionはJAN不一致なら名称一致でもskip", () => assert.equal(evaluateProductIdentity(collectionProduct, { ...yahooItem, janCode: "4580000000002" }).accepted, false));
test("collectionは公式JAN・型番なしならskip", () => assert.equal(evaluateProductIdentity({ ...collectionProduct, jan: undefined }, yahooItem).accepted, false));
