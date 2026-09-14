import assert from "node:assert/strict";
import test from "node:test";
import { evaluateLotteryAutoPublish, type VerifiedLotteryRecord } from "./lottery-verification";

const base: VerifiedLotteryRecord = {
  sourceId: "pokemon-center-online",
  sourceUrl: "https://www.support.pokemoncenter-online.com/lottery",
  sourcePolicy: "auto",
  parserId: "pokemon-center-v1",
  parserVerified: true,
  genre: "pokemon",
  product: "ポケモンカードゲーム MEGA 拡張パック BOX",
  officialUrl: "https://www.support.pokemoncenter-online.com/lottery/item",
  applicationStart: "2026-09-11T07:00:00.000Z",
  deadlineAt: "2026-09-16T07:59:00.000Z",
  ambiguityReason: null,
};

const now = new Date("2026-09-14T00:00:00.000Z");

test("allows only a fully verified active official lottery", () => {
  assert.deepEqual(evaluateLotteryAutoPublish(base, now), { allowed: true, reasons: [] });
});

test("rejects review-policy sources", () => {
  const decision = evaluateLotteryAutoPublish({ ...base, sourcePolicy: "review" }, now);
  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes("source-policy-review"));
});

test("rejects external officialUrl hosts and ambiguous source data", () => {
  const decision = evaluateLotteryAutoPublish({
    ...base,
    officialUrl: "https://example.com/lottery",
    ambiguityReason: "締切時刻が確認できない",
  }, now);
  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes("official-host-mismatch"));
  assert.ok(decision.reasons.includes("ambiguous-source-data"));
});

test("rejects lotteries that have not started or already ended", () => {
  const before = evaluateLotteryAutoPublish(base, new Date("2026-09-10T00:00:00.000Z"));
  const after = evaluateLotteryAutoPublish(base, new Date("2026-09-17T00:00:00.000Z"));
  assert.ok(before.reasons.includes("application-not-started"));
  assert.ok(after.reasons.includes("application-ended"));
});

test("rejects date-only or timezone-less timestamps", () => {
  const dateOnly = evaluateLotteryAutoPublish({ ...base, applicationStart: "2026-09-11" }, now);
  const noTimezone = evaluateLotteryAutoPublish({ ...base, deadlineAt: "2026-09-16T16:59:00" }, now);
  assert.ok(dateOnly.reasons.includes("invalid-application-start"));
  assert.ok(noTimezone.reasons.includes("invalid-deadline"));
});

test("rejects invalid date windows and unverified parsers", () => {
  const decision = evaluateLotteryAutoPublish({
    ...base,
    parserVerified: false,
    applicationStart: "invalid",
    deadlineAt: "2026-09-01T00:00:00.000Z",
  }, now);
  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.includes("parser-not-verified"));
  assert.ok(decision.reasons.includes("invalid-application-start"));
});
