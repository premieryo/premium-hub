import assert from "node:assert/strict";
import test from "node:test";
import { extractLotteryCandidates } from "./lottery-source-monitor";
import type { LotterySource } from "./lottery-sources";

const source: LotterySource = {
  id: "test",
  name: "Test Official Shop",
  url: "https://example.com/news/",
  policy: "auto",
  genres: ["pokemon"],
};

test("extracts relevant official lottery links and normalizes relative URLs", () => {
  const html = `
    <a href="/news/lottery-1">ポケモンカード 新商品 抽選販売のお知らせ</a>
    <a href="/news/restock">ポケモンカード 再販のお知らせ</a>
    <a href="/news/other">抽選販売のお知らせ</a>
  `;
  assert.deepEqual(extractLotteryCandidates(source, html), [
    {
      sourceId: "test",
      sourceName: "Test Official Shop",
      sourcePolicy: "auto",
      title: "ポケモンカード 新商品 抽選販売のお知らせ",
      url: "https://example.com/news/lottery-1",
      genres: ["pokemon"],
    },
  ]);
});

test("deduplicates duplicate links", () => {
  const html = `
    <a href="/news/lottery-1">ポケモンカード 抽選販売</a>
    <a href="/news/lottery-1#top">ポケモンカード 抽選販売</a>
  `;
  assert.equal(extractLotteryCandidates(source, html).length, 1);
});
