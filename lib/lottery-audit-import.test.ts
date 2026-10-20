import assert from "node:assert/strict";
import test from "node:test";
import { previewLotteryAudit, parseAuditTimestamp, isOfficialAuditUrl, type AuditInput } from "./lottery-audit-import";
import { processLotteryAudit } from "./lottery-audit-service";
import { isPublicInformationItem } from "./information-moderation";
import type { AdminItem } from "./admin-data";
import type { LotteryItem } from "../data/types";
const now = new Date("2026-10-20T16:03:26Z");
const candidate: AuditInput = { genre: "onepiece", product: "Heroines Edition vol.2 EB-05", shop: "公式ショップ", applicationStart: "2026-10-21T10:00", deadlineAt: "2026-10-25T23:59", applicationType: "online", applicationConditions: "1人1店舗のみ、本人確認書類が必要", officialUrl: "https://bandainamco-am.co.jp/official_shop/onepiece-cardgame/news/important/20261020.html", applicationUrl: "https://bandainamco-am.co.jp/official_shop/onepiece-cardgame/news/important/20261020.html", observedAt: "2026-10-21T01:00", evidence: "公式案内に10月21日10時〜25日23時59分、1人1店舗と明記。", evidenceKind: "official" };
const preview = (value: Partial<AuditInput> = {}, existing: AdminItem[] = []) => previewLotteryAudit([{ ...candidate, ...value }], existing, now)[0];

test("正常な公式候補はJSTを正規化し承認待ちのみ、未承認のまま公開しない", () => {
  const result = preview();
  assert.equal(result.eligible, true);
  assert.equal(result.item?.deadlineAt, "2026-10-25T14:59:00.000Z");
  assert.equal(result.item?.publicationStatus, "pending");
  assert.equal(isPublicInformationItem(result.item as unknown as LotteryItem), false);
  assert.equal(result.item?.applicationConditions, candidate.applicationConditions);
});
for (const [label, change] of [
  ["10月19日16:59締切のポケセン", { genre: "pokemon", deadlineAt: "2026-10-19T16:59" }],
  ["締切不明", { deadlineAt: "" }], ["存在しない日", { deadlineAt: "2026-02-30T12:00" }],
  ["根拠不足", { evidence: "" }], ["競合情報のみ", { officialUrl: "https://competitor.example/article", evidenceKind: "competitor" }],
  ["未来の確認日時", { observedAt: "2026-10-22T12:00" }], ["応募URLなし", { applicationUrl: "" }],
] as const) test(`${label}は登録対象外`, () => assert.equal(preview(change as Partial<AuditInput>).eligible, false));

test("アプリはWeb応募と区別し、推測した応募URLなしで公式案内を保持", () => {
  const result = preview({ applicationType: "app", applicationUrl: "" });
  assert.equal(result.eligible, true);
  assert.equal(result.item?.applicationType, "app");
  assert.equal(result.item?.applicationUrl, undefined);
  assert.equal(result.item?.officialUrl, candidate.officialUrl);
});
test("既存情報と同じURL・表記違い・締切変更は新規登録せず差分を返す", () => {
  const existing = preview().item!;
  const result = preview({ product: "別表記のEB-05", deadlineAt: "2026-10-26T23:59" }, [existing]);
  assert.equal(result.eligible, false);
  assert.equal(result.matches[0].id, existing.id);
  assert.ok(result.matches[0].differences.some(diff => diff.startsWith("deadlineAt:")));
});
test("JSON内重複も除外、追跡用URLパラメーターで回避させない", () => {
  const results = previewLotteryAudit([candidate, { ...candidate, officialUrl: `${candidate.officialUrl}?utm_source=copy` }], [], now);
  assert.equal(results.filter(row => row.eligible).length, 1);
});
test("当日と24時間以内をJSTで優先する", () => {
  const rows = previewLotteryAudit([candidate, { ...candidate, shop: "翌日", officialUrl: "https://p-bandai.jp/item/2", applicationStart: "", deadlineAt: "2026-10-22T00:30" }, { ...candidate, shop: "本日", officialUrl: "https://p-bandai.jp/item/3", applicationStart: "", deadlineAt: "2026-10-21T22:00" }], [], now);
  assert.deepEqual(rows.map(row => row.priority), ["当日締切", "24時間以内", "通常"]);
});
test("曖昧日時・ロールオーバー・偽公式ホストを拒否", () => {
  for (const value of ["10月25日", "2026-10-25", "2026-10-25T24:00", "2026-11-31T12:00"]) assert.equal(parseAuditTimestamp(value), null);
  for (const url of ["https://pokemoncenter-online.com.evil.example/a", "javascript:alert(1)", "https://127.0.0.1/", "https://user@p-bandai.jp/a"]) assert.equal(isOfficialAuditUrl(url), false);
});
test("検証は書込なし、保存時も公開状態をクライアントから指定させない", async () => {
  const created: AdminItem[] = [];
  const deps = { read: async () => created, create: async (item: AdminItem) => { created.push(item); }, now: () => now, enabled: true };
  const candidates = [{ ...candidate, publicationStatus: "approved", id: "attacker-chosen" }];
  const first = await processLotteryAudit({ action: "preview", candidates }, "admin-id", deps);
  assert.equal(created.length, 0);
  const saved = await processLotteryAudit({ action: "save", candidates, index: 0, fingerprint: first.fingerprint }, "admin-id", deps);
  assert.equal(saved.item?.publicationStatus, "pending");
  assert.equal(saved.item?.importedBy, "admin-id");
  assert.match(String(saved.item?.id), /^audit-[0-9a-f]{32}$/);
  await assert.rejects(processLotteryAudit({ action: "save", candidates, index: 0, fingerprint: first.fingerprint }, "admin-id", deps));
  assert.equal(created.length, 1);
});
test("権限修正前の保存・変更後の古いプレビューは拒否する", async () => {
  const deps = { read: async () => [], create: async () => { throw new Error("write must not run"); }, now: () => now, enabled: false };
  const first = await processLotteryAudit({ action: "preview", candidates: [candidate] }, "admin", deps);
  await assert.rejects(processLotteryAudit({ action: "save", candidates: [candidate], index: 0, fingerprint: first.fingerprint }, "admin", deps), /検証専用/);
  await assert.rejects(processLotteryAudit({ action: "save", candidates: [{ ...candidate, shop: "変更" }], index: 0, fingerprint: first.fingerprint }, "admin", { ...deps, enabled: true }), /再検証/);
});
test("プレビュー後に締切を過ぎた候補・過大バッチを拒否する", async () => {
  assert.throws(() => previewLotteryAudit(Array(21).fill(candidate), [], now));
  const deps = { read: async () => [], create: async () => { throw new Error("write must not run"); }, now: () => now, enabled: true };
  const first = await processLotteryAudit({ action: "preview", candidates: [candidate] }, "admin", deps);
  await assert.rejects(processLotteryAudit({ action: "save", candidates: [candidate], index: 0, fingerprint: first.fingerprint }, "admin", { ...deps, now: () => new Date("2026-10-26T00:00:00+09:00") }), /再検証/);
});
