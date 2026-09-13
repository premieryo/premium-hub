import type { LotterySource } from "./lottery-sources";

export type VerifiedLotteryRecord = {
  sourceId: string;
  sourceUrl: string;
  sourcePolicy: LotterySource["policy"];
  parserId: string;
  parserVerified: boolean;
  genre: "pokemon" | "onepiece" | "dragonball";
  product: string;
  officialUrl: string;
  applicationStart: string;
  deadlineAt: string;
  ambiguityReason?: string | null;
};

export type AutoPublishDecision = {
  allowed: boolean;
  reasons: string[];
};

const exactTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function parseExactTimestamp(value: string) {
  if (!exactTimestampPattern.test(value)) return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function sameOfficialHost(sourceUrl: string, officialUrl: string) {
  try {
    return new URL(sourceUrl).hostname === new URL(officialUrl).hostname;
  } catch {
    return false;
  }
}

export function evaluateLotteryAutoPublish(
  record: VerifiedLotteryRecord,
  now = new Date(),
): AutoPublishDecision {
  const reasons: string[] = [];
  const start = parseExactTimestamp(record.applicationStart);
  const deadline = parseExactTimestamp(record.deadlineAt);
  const nowMs = now.getTime();

  if (record.sourcePolicy !== "auto") reasons.push("source-policy-review");
  if (!record.parserVerified || !record.parserId.trim()) reasons.push("parser-not-verified");
  if (!record.product.trim()) reasons.push("product-missing");
  if (!sameOfficialHost(record.sourceUrl, record.officialUrl)) reasons.push("official-host-mismatch");
  if (record.ambiguityReason?.trim()) reasons.push("ambiguous-source-data");
  if (start === null) reasons.push("invalid-application-start");
  if (deadline === null) reasons.push("invalid-deadline");

  if (start !== null && deadline !== null) {
    if (start >= deadline) reasons.push("invalid-application-window");
    if (nowMs < start) reasons.push("application-not-started");
    if (nowMs > deadline) reasons.push("application-ended");
  }

  return { allowed: reasons.length === 0, reasons };
}
