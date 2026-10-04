import assert from "node:assert/strict";
import test from "node:test";
import { formatReleaseDate } from "./release-date";
import { officialCardCatalog, mergeOfficialCardCatalog } from "../data/card-catalog";
import { isReleasedInTokyo, selectPriceTrackingProducts } from "./price-tracking";

test("発売日はUTC・JST・米国時間でも前日にならない（全カタログ）", () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ["UTC", "Asia/Tokyo", "America/Los_Angeles"]) {
      process.env.TZ = zone;
      for (const product of officialCardCatalog) {
        const [year, month, day] = product.releaseDate.split("-");
        assert.equal(formatReleaseDate(product.releaseDate), `${year}年${Number(month)}月${Number(day)}日`);
      }
      assert.equal(formatReleaseDate("2026-10-31"), "2026年10月31日");
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
test("不正な日付でページを落とさず未確認表示", () => {
  for (const value of ["", "2026-02-30", "2026-13-01", "2026-10-31T00:00:00Z"]) assert.equal(formatReleaseDate(value), "発売日未確認");
});
test("EB05は公式10月31日を優先し10月4日の価格追跡に入らない", () => {
  const product = officialCardCatalog.find((p) => p.id === "onepiece-eb05")!;
  assert.equal(product.releaseDate, "2026-10-31");
  assert.equal(selectPriceTrackingProducts("onepiece", [{ ...product, releaseDate: "2026-10-01" }], new Date("2026-10-04T11:17:46Z")).length, 0);
  const merged = mergeOfficialCardCatalog([{ ...product, releaseDate: "2026-10-01", marketPrice: 10000 }], "onepiece");
  const eb05 = merged.find((p) => p.id === product.id)!;
  assert.equal(eb05.releaseDate, "2026-10-31");
  assert.equal(eb05.marketPrice, 10000);
  assert.equal(isReleasedInTokyo(eb05, new Date("2026-10-30T14:59:59Z")), false);
  assert.equal(isReleasedInTokyo(eb05, new Date("2026-10-30T15:00:00Z")), true);
  assert.ok(!selectPriceTrackingProducts("onepiece", merged, new Date("2026-10-04T11:17:46Z")).some((p) => p.id === eb05.id));
});
