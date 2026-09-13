import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getLotteryStatus,
  hasLotteryEnded,
  parseLotteryDateTime,
} from "@/lib/lottery-status";

const manual = "手動ステータス";
const item = (applicationStart?: string, deadlineAt?: string, status = manual) => ({
  applicationStart,
  deadlineAt,
  status,
});
const at = (value: string) => new Date(value);

test("開始前", () => {
  assert.equal(getLotteryStatus(item("2026-09-15T10:00:00+09:00", "2026-09-17T10:00:00+09:00"), at("2026-09-15T00:59:59Z")), "開始前");
});

test("開始時刻ちょうどは受付中", () => {
  assert.equal(getLotteryStatus(item("2026-09-15T10:00:00+09:00", "2026-09-17T10:00:00+09:00"), at("2026-09-15T01:00:00Z")), "受付中");
});

test("締切24時間より前は受付中", () => {
  assert.equal(getLotteryStatus(item(undefined, "2026-09-17T10:00:00+09:00"), at("2026-09-16T00:59:59.999Z")), "受付中");
});

test("締切24時間以内は締切間近", () => {
  assert.equal(getLotteryStatus(item(undefined, "2026-09-17T10:00:00+09:00"), at("2026-09-16T02:00:00Z")), "締切間近");
});

test("締切24時間ちょうどは締切間近", () => {
  assert.equal(getLotteryStatus(item(undefined, "2026-09-17T10:00:00+09:00"), at("2026-09-16T01:00:00Z")), "締切間近");
});

test("締切直前は締切間近", () => {
  assert.equal(getLotteryStatus(item(undefined, "2026-09-17T10:00:00+09:00"), at("2026-09-17T00:59:59.999Z")), "締切間近");
});

test("締切時刻ちょうどと締切後は終了し、公開対象外", () => {
  const lottery = item(undefined, "2026-09-17T10:00:00+09:00");
  const deadline = at("2026-09-17T01:00:00Z");
  assert.equal(getLotteryStatus(lottery, deadline), "終了");
  assert.equal(hasLotteryEnded(lottery, deadline), true);
  assert.equal(getLotteryStatus(lottery, at("2026-09-17T01:00:00.001Z")), "終了");
});

test("applicationStartなしでも未来の締切から判定する", () => {
  assert.equal(getLotteryStatus(item(undefined, "2026-09-18T10:00:00+09:00"), at("2026-09-16T01:00:00Z")), "受付中");
});

test("deadlineAtなしでも開始日時から判定する", () => {
  assert.equal(getLotteryStatus(item("2026-09-17T10:00:00+09:00"), at("2026-09-16T01:00:00Z")), "開始前");
  assert.equal(getLotteryStatus(item("2026-09-15T10:00:00+09:00"), at("2026-09-16T01:00:00Z")), "受付中");
});

test("不正な日時を無視し、判定可能な日時を使用する", () => {
  assert.equal(getLotteryStatus(item("invalid", "2026-09-18T10:00:00+09:00"), at("2026-09-16T01:00:00Z")), "受付中");
  assert.equal(parseLotteryDateTime("2026-02-30T10:00"), null);
});

test("有効な日時がなければ手動statusへフォールバックする", () => {
  assert.equal(getLotteryStatus(item(undefined, undefined)), manual);
  assert.equal(getLotteryStatus(item("invalid", "also-invalid")), manual);
});

test("オフセットなし日時はAsia/Tokyoとして解釈する", () => {
  assert.equal(parseLotteryDateTime("2026-09-17T10:00:00")?.toISOString(), "2026-09-17T01:00:00.000Z");
  assert.equal(parseLotteryDateTime("2026-09-17 10:00")?.toISOString(), "2026-09-17T01:00:00.000Z");
});

test("deadlineAtは開始日時より優先して終了と締切間近を判定する", () => {
  assert.equal(getLotteryStatus(item("2026-09-18T10:00:00+09:00", "2026-09-17T10:00:00+09:00"), at("2026-09-17T00:00:00Z")), "締切間近");
  assert.equal(getLotteryStatus(item("2026-09-18T10:00:00+09:00", "2026-09-17T10:00:00+09:00"), at("2026-09-17T01:00:00Z")), "終了");
});
