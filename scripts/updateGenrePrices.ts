import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Genre, Product, RankingItem } from "../data/types";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import { selectPriceTrackingProducts } from "../lib/price-tracking";

const REQUEST_INTERVAL_MS = 1_100;
const REQUEST_TIMEOUT_MS = 10_000;
const PRICE_SOURCE = "yahoo";

type ContentItemRow<T> = { item_id: string; data: T };
type PriceUpdateOptions = { dryRun?: boolean };

type PlannedPriceUpdate = {
  product: Product;
  selected: YahooItem;
  fetchedAt: string;
  previousPrice: number;
  changeAmount: number;
  changeRate: number;
  productData: Product;
  rankingData: RankingItem;
};

export type PriceUpdateSummary = {
  genre: Genre;
  dryRun: boolean;
  total: number;
  succeeded: number;
  failed: number;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !secretKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  }
  if (secretKey.startsWith("sb_publishable_") || secretKey === publicKey) {
    throw new Error("SUPABASE_SECRET_KEYにはSecret keyを設定してください。");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.genre === "string" &&
    typeof product.type === "string" &&
    typeof product.searchWord === "string" &&
    typeof product.releaseDate === "string"
  );
}

async function readProducts(client: SupabaseClient, genre: Genre) {
  const { data, error } = await client
    .from("content_items")
    .select("item_id,data")
    .eq("genre", genre)
    .eq("resource", "products")
    .order("item_id");
  if (error) throw new Error(`productsの読み込みに失敗しました: ${error.message}`);

  return (data ?? []).map((row) => {
    if (!isProduct(row.data) || row.item_id !== row.data.id || row.data.genre !== genre) {
      throw new Error(`[${genre}/${row.item_id}] productsデータの形式が不正です。`);
    }
    return row.data;
  });
}

async function readRankings(client: SupabaseClient, genre: Genre) {
  const { data, error } = await client
    .from("content_items")
    .select("item_id,data")
    .eq("genre", genre)
    .eq("resource", "ranking");
  if (error) throw new Error(`rankingの読み込みに失敗しました: ${error.message}`);

  return new Map(
    ((data ?? []) as ContentItemRow<RankingItem>[]).map((row) => [row.item_id, row.data])
  );
}

async function readPreviousPrice(
  client: SupabaseClient,
  genre: Genre,
  productId: string,
  currentPrice: number
) {
  const { data, error } = await client
    .from("price_history")
    .select("price")
    .eq("genre", genre)
    .eq("product_id", productId)
    .eq("source", PRICE_SOURCE)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`前回価格の読み込みに失敗しました: ${error.message}`);
  return typeof data?.price === "number" ? data.price : currentPrice;
}

function itemIcon(product: Product) {
  if (product.type === "figure") return "🎁";
  if (product.type === "toy") return "⚙️";
  if (product.type === "card") return "🎴";
  return "📦";
}

function movementStatus(changeAmount: number, changeRate: number) {
  const sign = changeAmount > 0 ? "+" : changeAmount < 0 ? "-" : "±";
  const rateSign = changeRate >= 0 ? "+" : "";
  return `前回比 ${sign}${Math.abs(changeAmount).toLocaleString()}円 (${rateSign}${changeRate.toFixed(2)}%)`;
}

function planPriceUpdate(
  genre: Genre,
  product: Product,
  existingRanking: RankingItem | undefined,
  selected: YahooItem,
  fetchedAt: string,
  previousPrice: number
): PlannedPriceUpdate {
  const changeAmount = selected.price - previousPrice;
  const rawChangeRate = previousPrice === 0 ? 0 : (changeAmount / previousPrice) * 100;
  const changeRate = Number(rawChangeRate.toFixed(2));
  const productData: Product = {
    ...product,
    marketPrice: selected.price,
    shop: selected.seller.name,
    url: selected.url,
    updatedAt: fetchedAt,
  };
  const rankingData: RankingItem = {
    id: product.id,
    genre,
    shop: selected.seller.name,
    product: existingRanking?.product ?? product.name,
    status: existingRanking?.status ?? movementStatus(changeAmount, changeRate),
    icon: existingRanking?.icon ?? itemIcon(product),
    href: existingRanking?.href ?? `/${genre}/ranking`,
    price: `${selected.price.toLocaleString()}円`,
    marketPrice: selected.price,
    currentPrice: selected.price,
    previousPrice,
    changeAmount,
    changeRate,
    updatedAt: fetchedAt,
  };

  return {
    product,
    selected,
    fetchedAt,
    previousPrice,
    changeAmount,
    changeRate,
    productData,
    rankingData: existingRanking ? { ...existingRanking, ...rankingData } : rankingData,
  };
}

function logDryRun(plan: PlannedPriceUpdate) {
  const currentDbPrice = plan.product.marketPrice;
  const dbDifference =
    typeof currentDbPrice === "number" ? plan.selected.price - currentDbPrice : null;

  console.log(`  [DRY-RUN] ${plan.product.name}`);
  console.log(`    採用商品: ${plan.selected.name}`);
  console.log(`    取得価格: ${plan.selected.price.toLocaleString()}円`);
  console.log(`    ショップ: ${plan.selected.seller.name}`);
  console.log(`    商品URL: ${plan.selected.url}`);
  console.log(
    `    現在DB価格との差: ${dbDifference === null ? "未登録" : `${dbDifference >= 0 ? "+" : ""}${dbDifference.toLocaleString()}円`}`
  );
  console.log(`    前回履歴価格: ${plan.previousPrice.toLocaleString()}円`);
  console.log(`    想定騰落額: ${plan.changeAmount >= 0 ? "+" : ""}${plan.changeAmount.toLocaleString()}円`);
  console.log(`    想定騰落率: ${plan.changeRate >= 0 ? "+" : ""}${plan.changeRate.toFixed(2)}%`);
}

async function persistPriceUpdate(
  client: SupabaseClient,
  genre: Genre,
  plan: PlannedPriceUpdate
) {
  const { error: historyError } = await client.from("price_history").insert({
    genre,
    product_id: plan.product.id,
    price: plan.selected.price,
    shop: plan.selected.seller.name,
    product_url: plan.selected.url,
    source: PRICE_SOURCE,
    fetched_at: plan.fetchedAt,
  });
  if (historyError) throw new Error(`価格履歴の保存に失敗しました: ${historyError.message}`);

  const { error: productError } = await client.from("content_items").upsert(
    {
      genre,
      resource: "products",
      item_id: plan.product.id,
      data: plan.productData,
      updated_at: plan.fetchedAt,
    },
    { onConflict: "genre,resource,item_id" }
  );
  if (productError) throw new Error(`productsの更新に失敗しました: ${productError.message}`);

  const { error: rankingError } = await client.from("content_items").upsert(
    {
      genre,
      resource: "ranking",
      item_id: plan.product.id,
      data: plan.rankingData,
      updated_at: plan.fetchedAt,
    },
    { onConflict: "genre,resource,item_id" }
  );
  if (rankingError) throw new Error(`rankingの更新に失敗しました: ${rankingError.message}`);
}

export async function updateGenrePrices(
  genre: Genre,
  options: PriceUpdateOptions = {}
): Promise<PriceUpdateSummary> {
  const dryRun = options.dryRun ?? true;
  const client = createAdminClient();
  const [allProducts, rankings] = await Promise.all([
    readProducts(client, genre),
    readRankings(client, genre),
  ]);
  const products = selectPriceTrackingProducts(genre, allProducts);
  let succeeded = 0;

  console.log(`\n[${genre}] ${allProducts.length}商品中 ${products.length}商品の価格${dryRun ? "確認" : "更新"}を開始します`);
  console.log(`モード: ${dryRun ? "DRY-RUN（DB書き込みなし）" : "APPLY（DB書き込みあり）"}`);

  for (const [index, product] of products.entries()) {
    try {
      const items = await searchYahooItems(product.searchWord, {
        productType: product.type,
        timeoutMs: REQUEST_TIMEOUT_MS,
      });
      const selected = items[0];
      if (!selected) throw new Error("条件に一致する本体商品が見つかりませんでした。");
      if (!Number.isInteger(selected.price) || selected.price <= 0) {
        throw new Error("取得価格が正の整数ではありません。");
      }

      const fetchedAt = new Date().toISOString();
      const previousPrice = await readPreviousPrice(
        client,
        genre,
        product.id,
        selected.price
      );
      const plan = planPriceUpdate(
        genre,
        product,
        rankings.get(product.id),
        selected,
        fetchedAt,
        previousPrice
      );

      if (dryRun) {
        logDryRun(plan);
      } else {
        await persistPriceUpdate(client, genre, plan);
        console.log(`  ✓ ${product.name}: ${selected.price.toLocaleString()}円`);
      }
      succeeded += 1;
    } catch (error) {
      console.error(`  ✗ ${product.name}: ${errorMessage(error)}`);
    }

    if (index < products.length - 1) await wait(REQUEST_INTERVAL_MS);
  }

  const summary = {
    genre,
    dryRun,
    total: products.length,
    succeeded,
    failed: products.length - succeeded,
  };
  console.log(
    `[${genre}] ${dryRun ? "確認" : "更新"}成功 ${summary.succeeded}件 / 失敗 ${summary.failed}件`
  );
  return summary;
}
