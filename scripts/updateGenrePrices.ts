import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Genre, Product, RankingItem } from "../data/types";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import { selectPriceTrackingProducts } from "../lib/price-tracking";

const SOURCE = "yahoo";
const TIMEOUT_MS = 10_000;
const INTERVAL_MS = 1_100;
const MAX_CHANGE_RATE = 60;
const LEASE_MS = 30 * 60_000;

type Row<T> = { item_id: string; data: T; created_at: string; updated_at: string };
type Lease = { id: string; expiresAt: string };
type ProductWithLease = Product & { _priceUpdateLease?: Lease };
type Options = { dryRun?: boolean; useRunLease?: boolean; allowExistingToday?: boolean };

export type PriceUpdateResult = {
  productId: string;
  productName: string;
  status: "succeeded" | "skipped" | "failed";
  reason?: string;
  previousPrice?: number;
  currentPrice?: number;
  changeAmount?: number;
  changeRate?: number;
  shop?: string;
  url?: string;
};

export type PriceUpdateSummary = {
  genre: Genre;
  dryRun: boolean;
  total: number;
  succeeded: number;
  skipped: number;
  failed: number;
  results: PriceUpdateResult[];
};

type Plan = {
  product: Product;
  selected: YahooItem;
  fetchedAt: string;
  previousPrice: number;
  changeAmount: number;
  changeRate: number;
  productData: Product;
  rankingData: RankingItem;
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const message = (error: unknown) => error instanceof Error ? error.message : String(error);

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  if (secret.startsWith("sb_publishable_") || secret === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("SUPABASE_SECRET_KEYにはSecret keyを設定してください。");
  }
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

function isProduct(value: unknown): value is ProductWithLease {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<Product>;
  return [item.id, item.name, item.genre, item.type, item.searchWord, item.releaseDate]
    .every((field) => typeof field === "string");
}

async function productRows(client: SupabaseClient, genre: Genre) {
  const result = await client.from("content_items")
    .select("item_id,data,created_at,updated_at").eq("genre", genre).eq("resource", "products").order("item_id");
  if (result.error) throw new Error(`products読込失敗: ${result.error.message}`);
  return (result.data ?? []).map((row) => {
    if (!isProduct(row.data) || row.item_id !== row.data.id || row.data.genre !== genre) {
      throw new Error(`[${genre}/${row.item_id}] products形式が不正です。`);
    }
    return row as Row<ProductWithLease>;
  });
}

async function rankingRows(client: SupabaseClient, genre: Genre) {
  const result = await client.from("content_items")
    .select("item_id,data,created_at,updated_at").eq("genre", genre).eq("resource", "ranking");
  if (result.error) throw new Error(`ranking読込失敗: ${result.error.message}`);
  return (result.data ?? []) as Row<RankingItem>[];
}

function tokyoDate(now: Date) {
  const fields = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).map((part) => [part.type, part.value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

async function hasHistoryToday(client: SupabaseClient, genre: Genre, productId: string) {
  const start = new Date(`${tokyoDate(new Date())}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 86_400_000);
  const result = await client.from("price_history").select("id", { count: "exact", head: true })
    .eq("genre", genre).eq("product_id", productId).eq("source", SOURCE)
    .gte("fetched_at", start.toISOString()).lt("fetched_at", end.toISOString());
  if (result.error) throw new Error(`当日履歴確認失敗: ${result.error.message}`);
  return (result.count ?? 0) > 0;
}

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function validateCandidate(product: Product, item: YahooItem) {
  const title = normalize(item.name);
  const core = normalize(product.searchWord).replace(/box|ボックス/g, "");
  const sealed = ["未開封", "シュリンク付き", "シュリンク付", "テープ付き", "テープ付"]
    .some((word) => title.includes(normalize(word)));
  const rejected = ["シュリンクなし", "シュリンク無し", "テープなし", "テープ無し", "テープカット",
    "開封済み", "訳あり", "ダメージあり", "カード単品", "シングルカード", "パック単品",
    "1パック", "オリパ", "福袋", "中古", "カートン", "セット販売", "boxセット",
    "ボックスセット", "まとめ売り"].find((word) => title.includes(normalize(word)));
  const quantity = title.match(/(\d+)(?:box|ボックス)/);

  if (product.type !== "box") throw new Error("追跡対象がBOXではありません。");
  if (!core || !title.includes(core)) throw new Error("対象商品名が一致しません。");
  if (!(title.includes("box") || title.includes("ボックス")) || !sealed) {
    throw new Error("未開封BOXの根拠が不足しています。");
  }
  if (rejected) throw new Error(`除外語を検出: ${rejected}`);
  if (quantity && Number(quantity[1]) !== 1) throw new Error(`複数BOXを検出: ${quantity[0]}`);
  if (item.condition !== "new") throw new Error("新品ではありません。");
  if (!item.inStock) throw new Error("在庫切れです。");
  if (!Number.isInteger(item.price) || item.price <= 0) throw new Error("価格が不正です。");
  if (!item.seller?.name || !item.url.startsWith("https://")) throw new Error("ショップまたはURLが不正です。");
}

async function previousPrice(
  client: SupabaseClient, genre: Genre, productId: string,
  ranking: RankingItem | undefined, fallback: number,
) {
  if (typeof ranking?.currentPrice === "number" && ranking.currentPrice > 0) return ranking.currentPrice;
  const result = await client.from("price_history").select("price").eq("genre", genre)
    .eq("product_id", productId).eq("source", SOURCE).order("fetched_at", { ascending: false }).limit(1).maybeSingle();
  if (result.error) throw new Error(`前回価格読込失敗: ${result.error.message}`);
  return typeof result.data?.price === "number" && result.data.price > 0 ? result.data.price : fallback;
}

function status(amount: number, rate: number) {
  if (amount === 0) return "前回比 ±0円 (+0.00%)";
  return `前回比 ${amount > 0 ? "+" : "-"}${Math.abs(amount).toLocaleString()}円 (${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%)`;
}

function createPlan(genre: Genre, product: Product, old: RankingItem | undefined, selected: YahooItem, previous: number): Plan {
  const amount = selected.price - previous;
  const rate = Number((previous === 0 ? 0 : amount / previous * 100).toFixed(2));
  if (Math.abs(rate) > MAX_CHANGE_RATE) {
    throw new Error(`異常価格ガード: 前回比${rate.toFixed(2)}%（許容±${MAX_CHANGE_RATE}%）`);
  }
  const fetchedAt = new Date().toISOString();
  const productData: Product = { ...product, marketPrice: selected.price, shop: selected.seller.name, url: selected.url, updatedAt: fetchedAt };
  delete (productData as ProductWithLease)._priceUpdateLease;
  const rankingData: RankingItem = {
    ...(old ?? {}), id: product.id, genre, product: old?.product ?? product.name,
    shop: selected.seller.name, status: status(amount, rate), icon: old?.icon ?? "📦",
    href: old?.href ?? `/${genre}/ranking`, price: `${selected.price.toLocaleString()}円`,
    marketPrice: selected.price, currentPrice: selected.price, previousPrice: previous,
    changeAmount: amount, changeRate: rate, updatedAt: fetchedAt,
  };
  return { product, selected, fetchedAt, previousPrice: previous, changeAmount: amount, changeRate: rate, productData, rankingData };
}

function logDryRun(plan: Plan) {
  console.log(`  [DRY-RUN] ${plan.product.name}`);
  console.log(`    採用商品: ${plan.selected.name}`);
  console.log(`    価格/ショップ: ${plan.selected.price.toLocaleString()}円 / ${plan.selected.seller.name}`);
  console.log(`    URL: ${plan.selected.url}`);
  console.log(`    現在→予定: ${plan.previousPrice.toLocaleString()}円 → ${plan.selected.price.toLocaleString()}円`);
  console.log(`    騰落予定: ${plan.changeAmount >= 0 ? "+" : ""}${plan.changeAmount.toLocaleString()}円 / ${plan.changeRate.toFixed(2)}%`);
  console.log("    history追加予定: 1件");
}

async function persist(
  client: SupabaseClient, genre: Genre, plan: Plan,
  originalProduct: Row<ProductWithLease>, originalRanking: Row<RankingItem> | undefined,
) {
  let historyId: string | undefined;
  try {
    const history = await client.from("price_history").insert({ genre, product_id: plan.product.id,
      price: plan.selected.price, shop: plan.selected.seller.name, product_url: plan.selected.url,
      source: SOURCE, fetched_at: plan.fetchedAt }).select("id").single();
    if (history.error) throw new Error(`history保存失敗: ${history.error.message}`);
    historyId = history.data.id as string;

    const product = await client.from("content_items").upsert({ genre, resource: "products",
      item_id: plan.product.id, data: plan.productData, updated_at: plan.fetchedAt }, { onConflict: "genre,resource,item_id" });
    if (product.error) throw new Error(`products更新失敗: ${product.error.message}`);
    const ranking = await client.from("content_items").upsert({ genre, resource: "ranking",
      item_id: plan.product.id, data: plan.rankingData, updated_at: plan.fetchedAt }, { onConflict: "genre,resource,item_id" });
    if (ranking.error) throw new Error(`ranking更新失敗: ${ranking.error.message}`);
  } catch (error) {
    const failures: string[] = [];
    const restoredProduct = await client.from("content_items").upsert({ genre, resource: "products",
      item_id: originalProduct.item_id, data: originalProduct.data, created_at: originalProduct.created_at,
      updated_at: originalProduct.updated_at }, { onConflict: "genre,resource,item_id" });
    if (restoredProduct.error) failures.push(restoredProduct.error.message);
    if (originalRanking) {
      const restoredRanking = await client.from("content_items").upsert({ genre, resource: "ranking",
        item_id: originalRanking.item_id, data: originalRanking.data, created_at: originalRanking.created_at,
        updated_at: originalRanking.updated_at }, { onConflict: "genre,resource,item_id" });
      if (restoredRanking.error) failures.push(restoredRanking.error.message);
    }
    if (historyId) {
      const removed = await client.from("price_history").delete().eq("id", historyId);
      if (removed.error) failures.push(removed.error.message);
    }
    if (failures.length) throw new Error(`${message(error)} / ロールバック失敗: ${failures.join(" / ")}`);
    throw error;
  }
}

async function acquireLease(client: SupabaseClient, genre: Genre, row: Row<ProductWithLease>) {
  if (row.data._priceUpdateLease && Date.parse(row.data._priceUpdateLease.expiresAt) > Date.now()) return null;
  const lease = { id: randomUUID(), expiresAt: new Date(Date.now() + LEASE_MS).toISOString() };
  const result = await client.from("content_items")
    .update({ data: { ...row.data, _priceUpdateLease: lease }, updated_at: new Date().toISOString() })
    .eq("genre", genre).eq("resource", "products").eq("item_id", row.item_id)
    .eq("updated_at", row.updated_at).select("item_id");
  if (result.error) throw new Error(`実行リース取得失敗: ${result.error.message}`);
  return result.data?.length === 1 ? lease : null;
}

async function releaseLease(client: SupabaseClient, genre: Genre, productId: string, leaseId: string) {
  const current = await client.from("content_items").select("data").eq("genre", genre)
    .eq("resource", "products").eq("item_id", productId).single();
  if (current.error) throw new Error(`リース解放確認失敗: ${current.error.message}`);
  const product = current.data.data as ProductWithLease;
  if (product._priceUpdateLease?.id !== leaseId) return;
  delete product._priceUpdateLease;
  const result = await client.from("content_items").update({ data: product, updated_at: new Date().toISOString() })
    .eq("genre", genre).eq("resource", "products").eq("item_id", productId);
  if (result.error) throw new Error(`リース解放失敗: ${result.error.message}`);
}

export async function updateGenrePrices(genre: Genre, options: Options = {}): Promise<PriceUpdateSummary> {
  const dryRun = options.dryRun ?? true;
  const client = adminClient();
  const [allProductRows, allRankingRows] = await Promise.all([productRows(client, genre), rankingRows(client, genre)]);
  const products = selectPriceTrackingProducts(genre, allProductRows.map((row) => row.data));
  const productMap = new Map(allProductRows.map((row) => [row.item_id, row]));
  const rankingMap = new Map(allRankingRows.map((row) => [row.item_id, row]));
  const results: PriceUpdateResult[] = [];
  let lease: Lease | null = null;
  const leaseProduct = products[0];

  console.log(`\n[${genre}] 対象${products.length}件 / ${dryRun ? "DRY-RUN" : "APPLY"}`);
  if (!dryRun && options.useRunLease && leaseProduct) {
    const row = productMap.get(leaseProduct.id);
    if (!row) throw new Error("リース対象がありません。");
    lease = await acquireLease(client, genre, row);
    if (!lease) {
      const reason = "別処理が実行中のためskip";
      return { genre, dryRun, total: products.length, succeeded: 0, skipped: products.length, failed: 0,
        results: products.map((item) => ({ productId: item.id, productName: item.name, status: "skipped", reason })) };
    }
  }

  try {
    for (const [index, product] of products.entries()) {
      try {
        if (!dryRun && !options.allowExistingToday && await hasHistoryToday(client, genre, product.id)) {
          const reason = "本日（JST）のYahoo履歴が既に存在するためskip";
          console.log(`  [SKIP] ${product.name}: ${reason}`);
          results.push({ productId: product.id, productName: product.name, status: "skipped", reason });
          continue;
        }
        const selected = (await searchYahooItems(product.searchWord, { productType: product.type, timeoutMs: TIMEOUT_MS }))[0];
        if (!selected) throw new Error("一致する未開封BOXがありません。");
        validateCandidate(product, selected);
        const ranking = rankingMap.get(product.id);
        const previous = await previousPrice(client, genre, product.id, ranking?.data, selected.price);
        const plan = createPlan(genre, product, ranking?.data, selected, previous);
        if (dryRun) logDryRun(plan);
        else {
          const original = productMap.get(product.id);
          if (!original) throw new Error("更新前products行がありません。");
          await persist(client, genre, plan, original, ranking);
          console.log(`  [SUCCESS] ${product.name}: ${selected.price.toLocaleString()}円`);
        }
        results.push({ productId: product.id, productName: product.name, status: "succeeded",
          previousPrice: previous, currentPrice: selected.price, changeAmount: plan.changeAmount,
          changeRate: plan.changeRate, shop: selected.seller.name, url: selected.url });
      } catch (error) {
        const reason = message(error);
        console.error(`  [FAILED] ${product.name}: ${reason}`);
        results.push({ productId: product.id, productName: product.name, status: "failed", reason });
      }
      if (index < products.length - 1) await wait(INTERVAL_MS);
    }
  } finally {
    if (lease && leaseProduct) await releaseLease(client, genre, leaseProduct.id, lease.id);
  }

  const summary = { genre, dryRun, total: products.length,
    succeeded: results.filter((item) => item.status === "succeeded").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    failed: results.filter((item) => item.status === "failed").length, results };
  console.log(`[${genre}] 成功${summary.succeeded} / skip${summary.skipped} / 失敗${summary.failed}`);
  return summary;
}
