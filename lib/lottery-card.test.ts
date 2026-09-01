import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LotteryCard, { formatLotteryDateTime } from "@/components/genre/LotteryCard";
import type { LotteryItem } from "@/data/types";

const item: LotteryItem = {
  id: "lottery-test",
  genre: "pokemon",
  shop: "テストショップ",
  product: "テスト商品",
  status: "受付中",
  icon: "🎯",
  href: "/pokemon/lottery",
  deadline: "表示用締切",
  applicationStart: "2026-09-01T01:00:00.000Z",
  deadlineAt: "2026-09-05T14:59:00.000Z",
  resultDate: "2026-09-06T03:00:00.000Z",
  saleDate: "2026-09-07T00:00:00.000Z",
  officialUrl: "https://example.com/apply",
};

test("抽選日時を日本時間で表示する", () => {
  assert.equal(formatLotteryDateTime(item.deadlineAt!), "9月5日 23:59");
});

test("抽選カードは既存項目と公式応募CTAを表示する", () => {
  const html = renderToStaticMarkup(createElement(LotteryCard, { item }));

  assert.match(html, /テスト商品/);
  assert.match(html, /テストショップ/);
  assert.match(html, /受付中/);
  assert.match(html, /応募開始/);
  assert.match(html, /9月5日 23:59まで/);
  assert.match(html, /当選発表/);
  assert.match(html, /販売・購入期間/);
  assert.match(html, /公式サイトで応募する ↗/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /表示用締切/);
  assert.doesNotMatch(html, /詳細を見る/);
});

test("公式URLと任意日時がない場合はCTAと該当項目を表示しない", () => {
  const minimalItem = { ...item, officialUrl: undefined, applicationStart: undefined, resultDate: undefined, saleDate: undefined };
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: minimalItem }));

  assert.doesNotMatch(html, /公式サイトで応募する/);
  assert.doesNotMatch(html, /応募開始/);
  assert.doesNotMatch(html, /当選発表/);
  assert.doesNotMatch(html, /販売・購入期間/);
});

test("deadlineAtがない場合は既存の締切表示を使う", () => {
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: { ...item, deadlineAt: undefined } }));
  assert.match(html, /表示用締切/);
});
