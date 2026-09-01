import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LotteryCard, { formatApplicationType, formatLotteryDateTime } from "@/components/genre/LotteryCard";
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
  applicationConditions: "会員登録必須\n過去1年以内の購入履歴が必要",
  applicationType: "online",
  notes: "1人1回まで\n当選後のキャンセル不可",
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
  assert.match(html, /応募方法：/);
  assert.match(html, /オンライン/);
  assert.match(html, /応募条件/);
  assert.match(html, /会員登録必須/);
  assert.match(html, /過去1年以内の購入履歴が必要/);
  assert.match(html, /注意事項/);
  assert.match(html, /1人1回まで/);
  assert.match(html, /公式サイトで応募する ↗/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /表示用締切/);
  assert.doesNotMatch(html, /詳細を見る/);
});

test("公式URLと任意日時がない場合はCTAと該当項目を表示しない", () => {
  const minimalItem = { ...item, officialUrl: undefined, applicationStart: undefined, resultDate: undefined, saleDate: undefined, applicationConditions: undefined, applicationType: undefined, notes: undefined };
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: minimalItem }));

  assert.doesNotMatch(html, /公式サイトで応募する/);
  assert.doesNotMatch(html, /応募開始/);
  assert.doesNotMatch(html, /当選発表/);
  assert.doesNotMatch(html, /販売・購入期間/);
  assert.doesNotMatch(html, /応募方法/);
  assert.doesNotMatch(html, /応募条件/);
  assert.doesNotMatch(html, /注意事項/);
});

test("deadlineAtがない場合は既存の締切表示を使う", () => {
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: { ...item, deadlineAt: undefined } }));
  assert.match(html, /表示用締切/);
});

test("追加項目が一部だけある抽選は設定項目だけ表示する", () => {
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: { ...item, applicationConditions: undefined, notes: undefined, applicationType: "store" } }));

  assert.match(html, /応募方法：/);
  assert.match(html, /店頭/);
  assert.doesNotMatch(html, /応募条件/);
  assert.doesNotMatch(html, /注意事項/);
});

test("応募方法の全区分を日本語表示へ変換する", () => {
  assert.equal(formatApplicationType("online"), "オンライン");
  assert.equal(formatApplicationType("store"), "店頭");
  assert.equal(formatApplicationType("both"), "オンライン・店頭");
});

test("長文の応募条件と注意事項を省略せず表示する", () => {
  const longCondition = "アプリ会員登録後、対象期間内の購入履歴が必要です。".repeat(12);
  const longNotes = "応募はお一人様1回までで、当選後のキャンセルはできません。".repeat(12);
  const html = renderToStaticMarkup(createElement(LotteryCard, { item: { ...item, applicationConditions: longCondition, notes: longNotes } }));

  assert.match(html, new RegExp(longCondition));
  assert.match(html, new RegExp(longNotes));
  assert.match(html, /whitespace-pre-wrap break-words/);
});
