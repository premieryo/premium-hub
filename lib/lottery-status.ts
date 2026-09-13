import type { LotteryItem } from "@/data/types";

export const lotteryStatuses = {
  beforeStart: "開始前",
  accepting: "受付中",
  closingSoon: "締切間近",
  ended: "終了",
} as const;

export type AutomaticLotteryStatus =
  (typeof lotteryStatuses)[keyof typeof lotteryStatuses];

const TOKYO_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;
const CLOSING_SOON_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * Parses ISO-like values without an explicit offset as Asia/Tokyo wall-clock time.
 * Values with Z or an offset are absolute instants and are handled by Date.parse.
 */
export function parseLotteryDateTime(value: string | undefined): Date | null {
  if (!value?.trim()) return null;

  const input = value.trim();
  const localMatch = input.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/,
  );

  if (localMatch) {
    const [, yearText, monthText, dayText, hourText = "0", minuteText = "0", secondText = "0", millisecondText = "0"] = localMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const second = Number(secondText);
    const millisecond = Number(millisecondText.padEnd(3, "0"));
    const utc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const candidate = new Date(utc - TOKYO_OFFSET_MILLISECONDS);
    const tokyo = new Date(candidate.getTime() + TOKYO_OFFSET_MILLISECONDS);

    if (
      tokyo.getUTCFullYear() !== year ||
      tokyo.getUTCMonth() !== month - 1 ||
      tokyo.getUTCDate() !== day ||
      tokyo.getUTCHours() !== hour ||
      tokyo.getUTCMinutes() !== minute ||
      tokyo.getUTCSeconds() !== second ||
      tokyo.getUTCMilliseconds() !== millisecond
    ) return null;

    return candidate;
  }

  const timestamp = Date.parse(input);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

export function getLotteryStatus(
  item: Pick<LotteryItem, "applicationStart" | "deadlineAt" | "status">,
  now = new Date(),
): string {
  const deadline = parseLotteryDateTime(item.deadlineAt);
  const applicationStart = parseLotteryDateTime(item.applicationStart);
  const nowTimestamp = now.getTime();

  // deadlineAt has priority: the deadline instant is already ended, while exactly
  // 24 hours before it is included in the closing-soon window.
  if (deadline) {
    const remaining = deadline.getTime() - nowTimestamp;
    if (remaining <= 0) return lotteryStatuses.ended;
    if (remaining <= CLOSING_SOON_MILLISECONDS) return lotteryStatuses.closingSoon;
    if (applicationStart && nowTimestamp < applicationStart.getTime()) {
      return lotteryStatuses.beforeStart;
    }
    return lotteryStatuses.accepting;
  }

  if (applicationStart) {
    return nowTimestamp < applicationStart.getTime()
      ? lotteryStatuses.beforeStart
      : lotteryStatuses.accepting;
  }

  return item.status;
}

export function hasLotteryEnded(
  item: Pick<LotteryItem, "deadlineAt">,
  now = new Date(),
): boolean {
  const deadline = parseLotteryDateTime(item.deadlineAt);
  return deadline !== null && now.getTime() >= deadline.getTime();
}
