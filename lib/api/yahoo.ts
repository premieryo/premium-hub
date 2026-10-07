import { matchesCommerceQuery } from "../commerce-matching";
import type { ProductType } from "@/data/types";

export type YahooItem = {
  name: string;
  price: number;
  url: string;
  inStock: boolean;
  condition: string;
  janCode?: string;
  exImage?: {
    url?: string;
    width?: number;
    height?: number;
  };
  seller: {
    name: string;
  };
};

type YahooSearchResponse = {
  totalResultsAvailable: number;
  totalResultsReturned: number;
  hits: YahooItem[];
};

export type YahooSearchOptions = {
  productType?: ProductType;
  timeoutMs?: number;
  purpose?: "price" | "image";
  onEvaluated?: (candidates: { item: YahooItem; score: number }[]) => void;
};

export type YahooAffiliateConfig = {
  sid?: string;
  pid?: string;
};

const yahooItemSearchEndpoint =
  "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";
const valueCommerceReferralEndpoint =
  "https://ck.jp.ap.valuecommerce.com/servlet/referral";

const excludedWords = [
  "オリパ", "くじ", "福袋", "シングルカード", "カード単品",
  "スリーブ", "デッキシールド", "プレイマット", "カードケース",
  "ファイル", "サプライ", "空箱", "箱のみ", "中古",
];

const openedBoxWords = [
  "シュリンクなし", "シュリンク無し", "シュリンク無", "開封済み",
];

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function scoreItem(item: YahooItem, query: string, productType: ProductType, purpose: "price" | "image") {
  const name = normalize(item.name);

  if (excludedWords.some((word) => name.includes(normalize(word)))) return -1;
  if (/(?<![0-9])1パック|(?:バラ|単品)パック|パック単品|ばら売り|バラ売り/.test(name)) return -1;
  if (!matchesCommerceQuery(item.name, query)) return -1;

  let score = 0;
  if (name.includes(normalize(query))) score += 100;

  if (productType === "box") {
    if (!name.includes("box") && !name.includes("ボックス")) return -1;
    if (purpose === "price" && openedBoxWords.some((word) => name.includes(normalize(word)))) return -1;
    score += 50;
    if (name.includes("シュリンク") || name.includes("未開封")) score += 20;
  } else if (productType === "figure" || productType === "toy") {
    if (name.includes("本体") || name.includes("完成品") || name.includes("セット")) score += 30;
    if (name.includes("パーツのみ") || name.includes("付属品のみ")) return -1;
  }

  return score;
}

export function buildYahooItemSearchUrl(
  params: URLSearchParams,
  affiliate: YahooAffiliateConfig = {},
  warn: (message: string) => void = console.warn,
) {
  const sid = affiliate.sid?.trim() ?? "";
  const pid = affiliate.pid?.trim() ?? "";

  if (/^\d+$/.test(sid) && /^\d+$/.test(pid)) {
    const referralUrl = new URL(valueCommerceReferralEndpoint);
    referralUrl.searchParams.set("sid", sid);
    referralUrl.searchParams.set("pid", pid);
    referralUrl.searchParams.set("vc_url", "");
    params.set("affiliate_type", "vc");
    params.set("affiliate_id", referralUrl.toString());
  } else if (sid !== "" || pid !== "") {
    warn("VALUECOMMERCE_SID/PID must both contain digits only; using regular Yahoo URLs.");
  }

  return `${yahooItemSearchEndpoint}?${params.toString()}`;
}

export async function searchYahooItems(
  query: string,
  options: YahooSearchOptions = {}
): Promise<YahooItem[]> {
  const clientId = process.env.YAHOO_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "YAHOO_CLIENT_IDが設定されていません。"
    );
  }

  const productType = options.productType ?? "box";
  const normalizedQuery = normalize(query);
  const qualifier = productType === "box"
    ? normalizedQuery.includes("box") || normalizedQuery.includes("ボックス") ? "" : "BOX"
    : productType === "figure" || productType === "toy"
      ? normalizedQuery.includes("本体") ? "" : "本体"
      : "";
  const params = new URLSearchParams({
    appid: clientId,
    query: `${query} ${qualifier}`.trim(),
    results: "50",
    sort: "-score",
    condition: "new",
    image_size: "300",
  });

  if (options.purpose !== "image") params.set("in_stock", "true");

  const url = buildYahooItemSearchUrl(params, {
    sid: process.env.VALUECOMMERCE_SID,
    pid: process.env.VALUECOMMERCE_PID,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);
  let response: Response;

  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Yahoo! APIがタイムアウトしました（${options.timeoutMs ?? 10_000}ms）`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(
      `Yahoo! APIエラー: ${response.status}`
    );
  }

  const data =
    (await response.json()) as YahooSearchResponse;

  if (!Array.isArray(data.hits)) {
    throw new Error("Yahoo! APIのレスポンス形式が不正です。");
  }

  const evaluated = data.hits.map((item) => ({ item, score: scoreItem(item, query, productType, options.purpose ?? "price") }));
  options.onEvaluated?.(evaluated);
  return evaluated
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .map(({ item }) => item);
}
