import type { LotterySource } from "./lottery-sources";

export type LotteryCandidate = {
  sourceId: string;
  sourceName: string;
  sourcePolicy: LotterySource["policy"];
  title: string;
  url: string;
  genres: LotterySource["genres"];
};

const lotteryWords = ["抽選", "抽選販売", "事前抽選", "応募受付"];
const cardWords = [
  "ポケモンカード",
  "pokemon card",
  "one pieceカード",
  "one piece card",
  "ワンピースカード",
  "ドラゴンボール",
  "fusion world",
  "フュージョンワールド",
];

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizeUrl(href: string, baseUrl: string) {
  try {
    const url = new URL(decodeEntities(href), baseUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function isRelevantTitle(title: string) {
  const normalized = title.toLowerCase();
  return lotteryWords.some((word) => normalized.includes(word.toLowerCase()))
    && cardWords.some((word) => normalized.includes(word.toLowerCase()));
}

export function extractLotteryCandidates(source: LotterySource, html: string): LotteryCandidate[] {
  const candidates = new Map<string, LotteryCandidate>();
  const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html))) {
    const title = stripTags(match[2]);
    if (!title || !isRelevantTitle(title)) continue;
    const url = normalizeUrl(match[1], source.url);
    if (!url) continue;
    candidates.set(url, {
      sourceId: source.id,
      sourceName: source.name,
      sourcePolicy: source.policy,
      title,
      url,
      genres: source.genres,
    });
  }

  return [...candidates.values()];
}

export async function fetchLotteryCandidates(source: LotterySource, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { "user-agent": "PREMIUM-HUB-LotteryMonitor/1.0" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
    return extractLotteryCandidates(source, await response.text());
  } finally {
    clearTimeout(timeout);
  }
}
