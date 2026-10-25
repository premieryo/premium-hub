import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatReleaseDate } from "./release-date";
import { officialCardCatalog, mergeOfficialCardCatalog } from "../data/card-catalog";
import { sortProductsByReleaseDate } from "../data/types";
import { isReleasedInTokyo } from "./price-tracking";
import { splitBoosterProductsByRelease } from "./product-categories";
import PublicProductCard from "../components/genre/PublicProductCard";

const expected = [
  ["30th-celebration-box", "2026-09-16"],
  ["30th-celebration-futuristic-box", "2026-09-16"],
  ["storm-emeralda-box", "2026-07-31"],
  ["onepiece-eb05", "2026-10-31"],
  ["dragonball-fb11", "2026-09-12"],
  ["dragonball-fb12", "2026-12-12"],
] as const;
const products = expected.map(([id]) => officialCardCatalog.find(p => p.id === id)!);

test("全カタログの日付文字列はUTC・JST・米国時間でも前日にならない", () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ["UTC", "Asia/Tokyo", "America/Los_Angeles"]) {
      process.env.TZ = zone;
      for (const p of officialCardCatalog) {
        const [y,m,d] = p.releaseDate.split("-");
        assert.equal(formatReleaseDate(p.releaseDate), `${y}年${Number(m)}月${Number(d)}日`);
      }
      for (const [id,date] of expected) {
        const p = { ...officialCardCatalog.find(p => p.id === id)!, imageEnabled: false };
        assert.equal(p.releaseDate, date);
        const html = renderToStaticMarkup(createElement(PublicProductCard, { product:p }));
        assert.ok(html.includes(formatReleaseDate(date)), `${zone}/${id}`);
      }
    }
  } finally { if(previous === undefined) delete process.env.TZ; else process.env.TZ=previous; }
});
test("無効な日付は未確認表示にしてページを落とさない", () => {
  for (const value of ["", "2026-02-30", "2026-13-01", "2026-10-31T00:00:00Z"]) assert.equal(formatReleaseDate(value), "発売日未確認");
  assert.equal(formatReleaseDate("2028-02-29"), "2028年2月29日");
});
test("6商品の前日23:59:59.999と当日00:00 JSTで発売判定が切り替わる", () => {
  for(const p of products) {
    const midnight = new Date(`${p.releaseDate}T00:00:00+09:00`);
    assert.equal(isReleasedInTokyo(p, new Date(midnight.getTime()-1)), false, p.id);
    assert.equal(isReleasedInTokyo(p, midnight), true, p.id);
    // A persisted upcoming flag does not override the Japanese calendar date.
    assert.equal(isReleasedInTokyo({...p,releaseStatus:"upcoming"}, midnight), true);
  }
});
test("EB05の公式10/31を結合後も保持し、DBの価格・画像等を変更しない", () => {
  const p = products.find(p=>p.id==="onepiece-eb05")!;
  const existing = {...p,releaseDate:"2026-10-01",marketPrice:12345,shop:"保持対象",updatedAt:"2026-10-01T00:00:00Z",imageEnabled:false};
  const before = structuredClone(existing);
  const merged=mergeOfficialCardCatalog([existing],"onepiece").find(p=>p.id===existing.id)!;
  assert.equal(merged.releaseDate,"2026-10-31");
  for(const key of ["marketPrice","shop","updatedAt","imageEnabled"] as const) assert.equal(merged[key],existing[key]);
  assert.deepEqual(existing,before);
  const split=splitBoosterProductsByRelease([merged],15,new Date("2026-10-30T14:59:59.999Z"));
  assert.equal(split.upcoming.length,1);assert.equal(split.released.length,0);
  assert.equal(splitBoosterProductsByRelease([merged],15,new Date("2026-10-30T15:00:00Z")).released.length,1);
});
test("発売日順は6商品の正しいカレンダー順で入力を変更しない", () => {
  const before=products.map(p=>p.id);
  const dates=sortProductsByReleaseDate(products).map(p=>p.releaseDate);
  assert.deepEqual(dates,["2026-12-12","2026-10-31","2026-09-16","2026-09-16","2026-09-12","2026-07-31"]);
  assert.deepEqual(products.map(p=>p.id),before);
});
