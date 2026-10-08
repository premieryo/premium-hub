import assert from "node:assert/strict";
import test from "node:test";
import { attachProductImages, resolveProductImage } from "./shared-product-images";
import type { Product } from "@/data/types";
const product: Product = { id: "normal", name: "ブラックボルト BOX", genre: "pokemon", type: "box", searchWord: "ブラックボルト BOX", releaseDate: "2025-06-06", imageEnabled: true, imageAsset: { source: "valuecommerce", src: "https://item-shopping.c.yimg.jp/i/j/shop_item", clickUrl: "https://ck.jp.ap.valuecommerce.com/servlet/referral", alt: "BOX", width: 300, height: 300 } };
test("商品IDで最新の画像を共有し価格を変更しない", () => {
  const item = { id: "lottery", productId: "normal", product: "抽選商品", price: 1180 };
  const result = attachProductImages([item], [product])[0];
  assert.equal(result.imageAsset, product.imageAsset);
  assert.equal(result.price, 1180);
  assert.equal("imageAsset" in item, false);
});
test("通常版とデラックスの部分一致では共有しない", () => assert.equal(resolveProductImage({ id: "lottery", product: "ブラックボルト デラックス BOX" }, [product]), undefined));
test("不明な明示商品IDは名称で補完しない", () => assert.equal(resolveProductImage({ id: "lottery", productId: "unknown", product: product.name }, [product]), undefined));
test("BOXのIDが付いていてもパックセット・複数商品にはBOX画像を使わない", () => {
  for (const name of ["ブラックボルト 20パックセット", "ブラックボルト／ホワイトフレア 抽選販売"])
    assert.equal(resolveProductImage({ id: "lottery", productId: "normal", product: name }, [product]), undefined);
});
test("同名複数商品と無効化画像は共有しない", () => {
  const item = { id: "lottery", product: product.name };
  assert.equal(resolveProductImage(item, [product, { ...product, id: "other" }]), undefined);
  assert.equal(resolveProductImage(item, [{ ...product, imageEnabled: false }]), undefined);
});
