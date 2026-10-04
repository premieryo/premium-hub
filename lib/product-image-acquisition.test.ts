import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/data/types";
import type { YahooItem } from "./api/yahoo";
import { createProductImageAsset, selectImageAcquisitionProducts } from "./product-image-acquisition";
import { selectPriceTrackingProducts } from "./price-tracking";
import { validateCandidate } from "@/scripts/updateGenrePrices";

const product: Product = { id: "upcoming", genre: "pokemon", type: "box", name: "新商品BOX", searchWord: "新商品 BOX", releaseDate: "2099-01-01", priceTrackingEnabled: false };
const item: YahooItem = { name: "新商品 BOX 予約受付", price: 0, condition: "new", inStock: false,
  seller: { name: "shop" }, url: "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=123&pid=456&vc_url=https%3A%2F%2Fstore.shopping.yahoo.co.jp%2Fshop%2Fitem.html",
  exImage: { url: "https://item-shopping.c.yimg.jp/i/n/shop_item", width: 300, height: 300 } };
test("未発売・追跡無効・在庫なしでも画像のみ取得できる", () => {
  assert.deepEqual(selectImageAcquisitionProducts("pokemon", [product]), [product]);
  assert.deepEqual(selectPriceTrackingProducts("pokemon", [product]), []);
  assert.ok(createProductImageAsset(product, item));
  assert.throws(() => validateCandidate(product, item));
});
test("画像が手動無効なら取得しない", () => assert.equal(selectImageAcquisitionProducts("pokemon", [{ ...product, imageEnabled: false }]).length, 0));
test("別プロバイダー画像を上書きしない", () => assert.equal(selectImageAcquisitionProducts("pokemon", [{ ...product, imageAsset: { ...createProductImageAsset(product, item)!, source: "amazon" } }]).length, 0));
for (const changes of [
  { url: "https://store.shopping.yahoo.co.jp/shop/item.html" },
  { url: "https://ck.jp.ap.valuecommerce.com.evil.test/servlet/referral?sid=123&pid=456" },
  { url: "https://ck.jp.ap.valuecommerce.com/servlet/referral" },
  { name: "別商品 BOX" },
  { name: "新商品 12BOXセット" },
  { exImage: { ...item.exImage!, url: "https://manufacturer.example/image.png" } },
  { exImage: { ...item.exImage!, width: 0 } },
]) {
  test(`画像の許可条件・商品一致を検証: ${JSON.stringify(changes)}`, () => assert.equal(createProductImageAsset(product, { ...item, ...changes }), null));
}
