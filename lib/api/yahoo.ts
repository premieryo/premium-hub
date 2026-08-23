import type { ProductType } from "@/data/types";

export type YahooItem = {
  name: string;
  price: number;
  url: string;
  inStock: boolean;
  condition: string;
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
};

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

function getCoreQuery(query: string) {
  return normalize(query).replace(/box|ボックス|本体|新品|未開封/g, "");
}

function scoreItem(item: YahooItem, query: string, productType: ProductType) {
  const name = normalize(item.name);
  const coreQuery = getCoreQuery(query);

  if (excludedWords.some((word) => name.includes(normalize(word)))) return -1;
  if (["1パック", "5パック", "10パック", "バラパック", "パック単品"].some((word) => name.includes(word))) return -1;
  if (coreQuery && !name.includes(coreQuery)) return -1;

  let score = 0;
  if (name.includes(normalize(query))) score += 100;

  if (productType === "box") {
    if (!name.includes("box") && !name.includes("ボックス")) return -1;
    if (openedBoxWords.some((word) => name.includes(normalize(word)))) return -1;
    score += 50;
    if (name.includes("シュリンク") || name.includes("未開封")) score += 20;
  } else if (productType === "figure" || productType === "toy") {
    if (name.includes("本体") || name.includes("完成品") || name.includes("セット")) score += 30;
    if (name.includes("パーツのみ") || name.includes("付属品のみ")) return -1;
  }

  return score;
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
    in_stock: "true",
  });

  const url =
    "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch" +
    `?${params.toString()}`;

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

  return data.hits
    .map((item) => ({ item, score: scoreItem(item, query, productType) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .map(({ item }) => item);
}
