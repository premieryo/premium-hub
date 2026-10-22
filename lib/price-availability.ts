import type { Product, RankingItem } from "@/data/types";

type Observation = Pick<Product, "updatedAt" | "priceStockStatus" | "priceStockCheckedAt">;
// Daily observations expire after 24h. Row updated_at/image timestamps are never stock evidence.
export const STOCK_OBSERVATION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export function priceAvailability(item: Observation, now = new Date()) {
  const checked = Date.parse(item.priceStockCheckedAt ?? "");
  const captured = Date.parse(item.updatedAt ?? "");
  const fresh = Number.isFinite(checked) && checked === captured && checked <= now.getTime()
    && now.getTime() - checked <= STOCK_OBSERVATION_MAX_AGE_MS;
  const comparable = item.priceStockStatus === "in-stock" && fresh;
  const stock = item.priceStockStatus === "out-of-stock" ? "確認時点で在庫なし"
    : comparable ? "取得時点で在庫あり（現在の在庫は販売店で確認）"
      : "現在の在庫未確認";
  const date = Number.isFinite(captured) ? new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(captured)) + " JST" : "取得日時不明";
  return { comparable, label: comparable ? "取得時価格" : "最終取得価格", stock, date };
}
export function rankingPricePresentation(item: RankingItem, now = new Date()) {
  const observation = priceAvailability(item, now);
  const price = item.currentPrice ?? item.marketPrice;
  return {
    ...observation,
    price: price ? `${observation.label} ${price.toLocaleString()}円` : "価格確認中",
    description: `${observation.stock} / ${observation.date}${observation.comparable ? ` / ${item.status}` : " / 在庫未確認のため比較対象外"}`,
  };
}
