import assert from "node:assert/strict";
import test from "node:test";
import { findMultipleItemExpression } from "./commerce-matching";
import { evaluateProductIdentity } from "./commerce-matching";
import type { Product } from "@/data/types";
import type { YahooItem } from "@/lib/api/yahoo";
import { selectSafePriceCandidate, validateCandidate } from "@/scripts/updateGenrePrices";

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

const dragonBallProduct: Product = { id: "fb01", name: "ブースターパック 覚醒の鼓動", genre: "dragonball", type: "box", productCategory: "booster-box", seriesNumber: "FB01", searchWord: "覚醒の鼓動 FB01 BOX", releaseDate: "2024-02-16" };
const sealedBox: YahooItem = { name: "覚醒の鼓動 FB01 BOX 新品未開封 テープ付き", price: 5000, url: "https://example.com/fb01", inStock: true, condition: "new", seller: { name: "shop" } };
test("シリーズ番号の完全一致を必須にする", () => assert.doesNotThrow(() => validateCandidate(dragonBallProduct, sealedBox)));
test("FB01とFB10を誤一致しない", () => assert.throws(() => validateCandidate(dragonBallProduct, { ...sealedBox, name: "覚醒の鼓動 FB10 BOX 新品未開封 テープ付き" })));

for (const title of ["商品12BOXセット", "商品10箱", "新品【2BOX】", "商品 BOX×12", "商品 20個セット"]) {
  test(`境界・2桁数量を検出: ${title}`, () => assert.ok(findMultipleItemExpression(title)));
}
test("ショップが語句を挿入しても名称・番号を照合", () => assert.doesNotThrow(() => validateCandidate(
  { ...dragonBallProduct, searchWord: "CROSS FORCE FB10 BOX", seriesNumber: "FB10" },
  { ...sealedBox, name: "CROSS FORCE ドラゴンボール FB-10 新品未開封 BOX" })));
for (const suffix of [" 1パック販売", " 英語版", " 12BOXセット", " FB02", " 選べる商品"]) {
  test(`BOX価格への混入を除外: ${suffix}`, () => assert.throws(() => validateCandidate(dragonBallProduct, { ...sealedBox, name: sealedBox.name + suffix })));
}
test("JAN不一致は通常BOXでも除外", () => assert.throws(() => validateCandidate(
  { ...dragonBallProduct, jan: "4580000000001" }, { ...sealedBox, janCode: "4580000000002" })));
test("通常版にデラックス版を混入させない", () => assert.throws(() => validateCandidate(
  { ...dragonBallProduct, genre: "pokemon", searchWord: "ブラックボルト BOX" },
  { ...sealedBox, name: "ブラックボルト デラックス BOX 新品未開封" })));

test("不適切な先頭候補の後から安全なBOXを採用", () => assert.equal(selectSafePriceCandidate(dragonBallProduct,
  [{ ...sealedBox, name: sealedBox.name + " 12BOXセット" }, sealedBox]), sealedBox));
test("通常のBOX封入パック数は採用", () => assert.doesNotThrow(() => validateCandidate(dragonBallProduct,
  { ...sealedBox, name: sealedBox.name + " 24パック入り" })));
test("対応商品名入りのBOXローダーを除外", () => assert.throws(() => validateCandidate(
  { ...dragonBallProduct, genre: "pokemon", searchWord: "ブラックボルト BOX" },
  { ...sealedBox, name: "ブラックボルト BOX ローダー 保管用 未開封シュリンク付きBOX対応" })));

// Reproduce accessories advertising compatible unopened BOXes in their title.
for (const definition of [
  { genre: "pokemon", query: "ブラックボルト BOX", series: undefined },
  { genre: "pokemon", query: "ホワイトフレア BOX", series: undefined },
  { genre: "onepiece", query: "世界最強の戦士 OP-17 BOX", series: "OP-17" },
  { genre: "dragonball", query: "STORY BOOSTER 01 ST01 BOX", series: "ST01" },
] as const) {
  const product: Product = { ...dragonBallProduct, genre: definition.genre, searchWord: definition.query, seriesNumber: definition.series };
  const genuine = { ...sealedBox, name: `${definition.query} 新品未開封 シュリンク付き`, price: 13500 };
  for (const accessory of ["ローダー", "保管用", "保護ケース", "カードケース", "BOXケース", "UVカット", "空箱", "箱のみ", "アクリルケース", "マグネットケース", "ディスプレイケース", "収納ケース", "BOXプロテクター", "box protector", "storage case"]) {
    test(`${definition.genre}/${definition.query}: ${accessory}を除外し本物1BOXを選択`, () => {
      const fake = { ...genuine, name: `${definition.query} ${accessory} 未開封シュリンク付きBOX対応`, price: 1180 };
      assert.throws(() => validateCandidate(product, fake));
      assert.equal(selectSafePriceCandidate(product, [fake, genuine]), genuine);
      assert.equal(selectSafePriceCandidate(product, [fake]), undefined);
    });
  }
}
