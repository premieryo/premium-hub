import assert from "node:assert/strict";
import test from "node:test";
import { officialCardCatalog } from "../data/card-catalog";
import type { Product } from "../data/types";
import { buildSnkrdunkSearchTerm, buildSnkrdunkSearchUrl, getSnkrdunkLinkLabel, SNKRDUNK_EXTERNAL_LINK_PROPS } from "./snkrdunk";

function product(id: string) {
  const result = officialCardCatalog.find((item) => item.id === id);
  assert.ok(result, `catalog product not found: ${id}`);
  return result;
}

test("Pokemonは商品検索語にBOXを付ける", () => {
  assert.equal(buildSnkrdunkSearchTerm(product("battle-partners-box")), "バトルパートナーズ BOX");
});

test("ONE PIECEはシリーズ番号、商品名、BOXの順にする", () => {
  assert.equal(buildSnkrdunkSearchTerm(product("world-strongest-warriors-op17-box")), "OP-17 世界最強の戦士 BOX");
});

test("Dragon Ballはシリーズ番号、商品名、BOXの順にする", () => {
  assert.equal(buildSnkrdunkSearchTerm(product("dragonball-fb01")), "FB01 覚醒の鼓動 BOX");
});

test("collection-boxは正式商品名を使う", () => {
  assert.equal(buildSnkrdunkSearchTerm(product("onepiece-kumamoto-special")), "プレミアムカードコレクション 熊本県スペシャル");
});

test("検索URLはHTTPSの公式ホストとencoded keywordsを使う", () => {
  const url = new URL(buildSnkrdunkSearchUrl(product("battle-partners-box"))!);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "snkrdunk.com");
  assert.equal(url.pathname, "/search/");
  assert.equal(url.searchParams.get("keywords"), "バトルパートナーズ BOX");
  assert.match(url.href, /keywords=/);
});

test("発売前のリンク文言", () => {
  assert.equal(getSnkrdunkLinkLabel({ ...product("30th-celebration-futuristic-box"), releaseDate: "2999-09-16" }), "スニダンで出品状況を見る ↗");
});

test("追跡OFFのリンク文言", () => {
  assert.equal(getSnkrdunkLinkLabel(product("battle-partners-box")), "スニダンで相場を確認 ↗");
});

test("Yahoo価格がある追跡ON商品のリンク文言", () => {
  const tracked: Product = { ...product("storm-emeralda-box"), priceTrackingEnabled: true, marketPrice: 17000 };
  assert.equal(getSnkrdunkLinkLabel(tracked), "スニダンでも確認する ↗");
});

test("カード3ジャンルのbooster/collection全商品でURLを生成する", () => {
  const supported = officialCardCatalog.filter(({ genre }) => ["pokemon", "onepiece", "dragonball"].includes(genre));
  assert.equal(supported.length, 58);
  assert.ok(supported.every((item) => buildSnkrdunkSearchUrl(item)?.startsWith("https://snkrdunk.com/search/?keywords=")));
});

test("外部リンクは別タブで安全に開く", () => {
  assert.deepEqual(SNKRDUNK_EXTERNAL_LINK_PROPS, { target: "_blank", rel: "noopener noreferrer" });
});
