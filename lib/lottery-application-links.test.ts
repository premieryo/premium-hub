import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LotteryApplicationLinks from "../components/genre/LotteryApplicationLinks";
import type { LotteryItem } from "../data/types";
const officialUrl = "https://official.example/news/lottery";
const applicationUrl = "https://entry.example/events/123";
function render(item: Pick<LotteryItem, "officialUrl" | "applicationUrl" | "applicationType">) {
  return renderToStaticMarkup(createElement(LotteryApplicationLinks, { item }));
}
for (const applicationType of ["online", "both"] as const) {
  test(`${applicationType}は公式情報と明示されたWeb応募先を別々に使う`, () => {
    const html = render({ officialUrl, applicationUrl, applicationType });
    assert.match(html, /href="https:\/\/official.example\/news\/lottery"[^>]*>公式情報・応募条件を確認/);
    assert.match(html, /href="https:\/\/entry.example\/events\/123"[^>]*>Web応募ページを開く/);
    assert.equal((html.match(/<a /g) ?? []).length, 2);
    assert.doesNotMatch(html, /公式サイトで応募する/);
    if (applicationType === "both") assert.match(html, /店頭応募の受付店舗/);
  });
}
test("Web応募先がない場合に公式記事を応募フォームと見なさない", () => {
  const html = render({ officialUrl, applicationType: "online" });
  assert.match(html, /Web応募先のURLは確認中/);
  assert.doesNotMatch(html, /Web応募ページを開く/);
  assert.equal((html.match(/<a /g) ?? []).length, 1);
});
test("アプリは公式案内へ誘導しWeb応募とは表示しない", () => {
  const html = render({ officialUrl, applicationUrl, applicationType: "app" });
  assert.match(html, /アプリ応募の公式案内を確認/);
  assert.match(html, /href="https:\/\/entry.example\/events\/123"[^>]*>アプリ応募の案内を確認/);
  assert.match(html, /アプリ内で行ってください/);
  assert.doesNotMatch(html, /Web応募ページ|公式サイトで応募/);
});
test("同じアプリ案内URLは重複ボタンにしない", () => {
  const html = render({ officialUrl, applicationUrl: officialUrl, applicationType: "app" });
  assert.equal((html.match(/<a /g) ?? []).length, 1);
});
test("店頭応募は公式の店舗案内へ誘導しWeb応募URLを使わない", () => {
  const html = render({ officialUrl, applicationUrl, applicationType: "store" });
  assert.match(html, /店頭応募の公式案内を確認/);
  assert.match(html, /受付店舗・方法・条件/);
  assert.doesNotMatch(html, /entry.example|Web応募ページ/);
});
test("応募方法が不明な旧データは公式情報だけ表示し、Web応募と推測しない", () => {
  const html = render({ officialUrl, applicationUrl });
  assert.match(html, /公式情報・応募条件を確認/);
  assert.doesNotMatch(html, /Web応募ページ|entry.example/);
});
test("未確認リンクや危険なURLを応募先として補完しない", () => {
  const html = render({ officialUrl: "javascript:alert(1)", applicationUrl: "data:text/html,unsafe", applicationType: "online" });
  assert.doesNotMatch(html, /<a |javascript:|data:text/);
  assert.match(html, /確認中/);
});
