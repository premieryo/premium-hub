import assert from "node:assert/strict";
import test from "node:test";
import { officialCardCatalog } from "../data/card-catalog";
import { validateCandidate } from "../scripts/updateGenrePrices";
import type { YahooItem } from "./api/yahoo";
const box: YahooItem = { name: "ブラックボルト BOX 新品未開封 シュリンク付き", janCode: "4521329427768", price: 29400, seller: { name: "ノア商社Yahoo!店" }, url: "https://store.shopping.yahoo.co.jp/noahshoping/4521329427768.html", condition: "new", inStock: true };
const normal = officialCardCatalog.find(p => p.id === "black-bolt-box")!;
test("実混入26,500円デラックス版は通常版に採用しない", () => {
  assert.throws(() => validateCandidate(normal, { ...box, name: "『新品』ポケモンカード S&V 拡張パックデラックス ブラックボルト BOX ※シュリンク付き", janCode: "4521329427300", price: 26500 }));
  assert.doesNotThrow(() => validateCandidate(normal, box));
});
for (const name of ["ブラックボルト", "ホワイトフレア"]) for (const variant of ["デラックス", "Deluxe", "DX"]) {
  test(`${name}通常版に${variant}仕様を混入させない`, () => {
    assert.throws(() => validateCandidate({ ...normal, jan: undefined, name, searchWord: `${name} BOX` }, { ...box, name: `${name} ${variant} BOX 新品未開封` }));
  });
}
test("確認済みJANは欠落・別JANを許可せず、JAN一致でも別仕様を許可しない", () => {
  assert.throws(() => validateCandidate(normal, { ...box, janCode: undefined }));
  assert.throws(() => validateCandidate(normal, { ...box, janCode: "4521329427300" }));
  assert.throws(() => validateCandidate(normal, { ...box, name: "ブラックボルト Deluxe BOX 新品未開封" }));
  const deluxe = officialCardCatalog.find(p => p.id === "black-bolt-deluxe-box")!;
  assert.throws(() => validateCandidate(deluxe, box));
  assert.doesNotThrow(() => validateCandidate(deluxe, { ...box, name: "ブラックボルト デラックス BOX 新品未開封", janCode: "4521329427300" }));
});
for (const genre of ["pokemon", "onepiece", "dragonball"] as const) {
  test(`${genre}はタイトルが正常でも説明の破損許容条件を除外`, () => {
    const id = { pokemon: "30th-celebration-box", onepiece: "world-strongest-warriors-op17-box", dragonball: "story-booster-01-st01-box" }[genre];
    const product = officialCardCatalog.find(p => p.id === id)!;
    const item = { ...box, name: `${product.searchWord} 新品未開封`, janCode: product.jan };
    assert.throws(() => validateCandidate(product, { ...item, description: "BOXの破れ、シュリンク包装の破れがある場合があります。" }));
    assert.doesNotThrow(() => validateCandidate(product, { ...item, description: "新品未開封1BOX。外箱に軽微なスレや小傷がある場合があります。" }));
  });
}
