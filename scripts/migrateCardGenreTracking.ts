import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Genre, Product, RankingItem } from "../data/types";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import {
  selectPriceTrackingProducts,
  selectPublicRankingProducts,
} from "../lib/price-tracking";

const RESOURCE_PRODUCTS = "products";
const RESOURCE_RANKING = "ranking";
const SOURCE = "yahoo";

type MigrationGenre = Extract<Genre, "onepiece" | "dragonball">;

type MigrationDefinition = {
  genre: MigrationGenre;
  product: Product;
  titleKeywords: string[];
};

const definitions: Record<MigrationGenre, MigrationDefinition> = {
  onepiece: {
    genre: "onepiece",
    product: {
      id: "world-strongest-warriors-op17-box",
      genre: "onepiece",
      name: "ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX",
      type: "box",
      releaseDate: "2026-08-22",
      searchWord: "世界最強の戦士 BOX",
      priceTrackingEnabled: true,
    },
    titleKeywords: ["世界最強の戦士"],
  },
  dragonball: {
    genre: "dragonball",
    product: {
      id: "story-booster-01-st01-box",
      genre: "dragonball",
      name: "ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX",
      type: "box",
      releaseDate: "2026-08-08",
      searchWord: "STORY BOOSTER 01 BOX",
      priceTrackingEnabled: true,
    },
    titleKeywords: ["STORY BOOSTER 01"],
  },
};

type ContentRow<T> = {
  genre: string;
  resource: string;
  item_id: string;
  data: T;
  created_at: string;
  updated_at: string;
};

type PriceHistoryRow = {
  id: string;
  genre: string;
  product_id: string;
  price: number;
  shop: string | null;
  product_url: string | null;
  source: string;
  fetched_at: string;
  created_at: string;
};

type Snapshot = {
  products: ContentRow<Product>[];
  rankings: ContentRow<RankingItem>[];
  histories: PriceHistoryRow[];
};

type HistoryInsert = {
  genre: MigrationGenre;
  product_id: string;
  price: number;
  shop: string;
  product_url: string;
  source: typeof SOURCE;
  fetched_at: string;
};

type MigrationPlan = {
  fetchedAt: string;
  selected: YahooItem;
  productRow: Omit<ContentRow<Product>, "created_at"> & { created_at: string };
  rankingRow: Omit<ContentRow<RankingItem>, "created_at"> & { created_at: string };
  historyRow: HistoryInsert;
};

function readGenreArgument(): MigrationGenre {
  const value = process.argv
    .find((argument) => argument.startsWith("--genre="))
    ?.slice("--genre=".length);

  if (value !== "onepiece" && value !== "dragonball") {
    throw new Error("--genre=onepiece または --genre=dragonball を指定してください。");
  }
  return value;
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
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function validateYahooCandidate(
  definition: MigrationDefinition,
  item: YahooItem,
) {
  const title = normalize(item.name);
  const hasBox = title.includes("box") || title.includes("ボックス");
  const hasSealedEvidence = ["未開封", "テープ付き", "テープ付", "シュリンク付き"]
    .some((word) => title.includes(normalize(word)));
  const rejectedWords = [
    "シュリンクなし",
    "シュリンク無し",
    "シュリンク無",
    "テープなし",
    "テープ無し",
    "テープカット",
    "開封済み",
    "訳あり",
    "ダメージあり",
    "カード単品",
    "シングルカード",
    "パック単品",
    "1パック",
    "オリパ",
    "福袋",
    "中古",
  ];

  if (definition.product.type !== "box") {
    throw new Error(`${definition.product.id}: box商品ではありません。`);
  }
  if (
    !definition.titleKeywords.every((keyword) =>
      title.includes(normalize(keyword)),
    )
  ) {
    throw new Error(`${definition.product.id}: 商品名が一致しません。`);
  }
  if (!hasBox || !hasSealedEvidence) {
    throw new Error(`${definition.product.id}: BOXまたは未開封の根拠が不足しています。`);
  }
  const rejectedWord = rejectedWords.find((word) =>
    title.includes(normalize(word)),
  );
  if (rejectedWord) {
    throw new Error(`${definition.product.id}: 除外語があります: ${rejectedWord}`);
  }
  if (item.condition !== "new") {
    throw new Error(`${definition.product.id}: Yahoo候補が新品ではありません。`);
  }
  if (!item.inStock) {
    throw new Error(`${definition.product.id}: Yahoo候補が在庫切れです。`);
  }
  if (!Number.isInteger(item.price) || item.price <= 0) {
    throw new Error(`${definition.product.id}: Yahoo価格が不正です。`);
  }
  if (!item.seller?.name || !item.url.startsWith("https://")) {
    throw new Error(`${definition.product.id}: ショップまたはURLが不正です。`);
  }
}

async function readSnapshot(
  client: SupabaseClient,
  genre: MigrationGenre,
): Promise<Snapshot> {
  const [productsResult, rankingsResult, historiesResult] = await Promise.all([
    client
      .from("content_items")
      .select("genre,resource,item_id,data,created_at,updated_at")
      .eq("genre", genre)
      .eq("resource", RESOURCE_PRODUCTS)
      .order("item_id"),
    client
      .from("content_items")
      .select("genre,resource,item_id,data,created_at,updated_at")
      .eq("genre", genre)
      .eq("resource", RESOURCE_RANKING)
      .order("item_id"),
    client
      .from("price_history")
      .select("id,genre,product_id,price,shop,product_url,source,fetched_at,created_at")
      .eq("genre", genre)
      .order("product_id")
      .order("fetched_at"),
  ]);

  for (const result of [productsResult, rankingsResult, historiesResult]) {
    if (result.error) {
      throw new Error(`Supabase SELECTに失敗しました: ${result.error.message}`);
    }
  }

  return {
    products: (productsResult.data ?? []) as ContentRow<Product>[],
    rankings: (rankingsResult.data ?? []) as ContentRow<RankingItem>[],
    histories: (historiesResult.data ?? []) as PriceHistoryRow[],
  };
}

function validateBeforeState(snapshot: Snapshot, genre: MigrationGenre) {
  if (snapshot.products.length !== 0) {
    throw new Error(`${genre}: 移行前productsが0件ではありません。`);
  }
  if (snapshot.rankings.length !== 0) {
    throw new Error(`${genre}: 移行前rankingが0件ではありません。`);
  }
  if (snapshot.histories.length !== 0) {
    throw new Error(`${genre}: 移行前price_historyが0件ではありません。`);
  }
}

function createPlan(
  definition: MigrationDefinition,
  selected: YahooItem,
): MigrationPlan {
  const fetchedAt = new Date().toISOString();
  const product: Product = {
    ...definition.product,
    marketPrice: selected.price,
    shop: selected.seller.name,
    url: selected.url,
    updatedAt: fetchedAt,
  };
  const ranking: RankingItem = {
    id: product.id,
    genre: definition.genre,
    shop: selected.seller.name,
    product: product.name,
    status: "初回価格",
    icon: "📦",
    href: `/${definition.genre}/ranking`,
    price: `${selected.price.toLocaleString()}円`,
    marketPrice: selected.price,
    currentPrice: selected.price,
    previousPrice: selected.price,
    changeAmount: 0,
    changeRate: 0,
    updatedAt: fetchedAt,
  };

  return {
    fetchedAt,
    selected,
    productRow: {
      genre: definition.genre,
      resource: RESOURCE_PRODUCTS,
      item_id: product.id,
      data: product,
      created_at: fetchedAt,
      updated_at: fetchedAt,
    },
    rankingRow: {
      genre: definition.genre,
      resource: RESOURCE_RANKING,
      item_id: product.id,
      data: ranking,
      created_at: fetchedAt,
      updated_at: fetchedAt,
    },
    historyRow: {
      genre: definition.genre,
      product_id: product.id,
      price: selected.price,
      shop: selected.seller.name,
      product_url: selected.url,
      source: SOURCE,
      fetched_at: fetchedAt,
    },
  };
}

function validatePlan(definition: MigrationDefinition, plan: MigrationPlan) {
  const products = [plan.productRow.data];
  const updateTargets = selectPriceTrackingProducts(definition.genre, products);
  const publicTargets = selectPublicRankingProducts(definition.genre, products);

  if (updateTargets.length !== 1 || updateTargets[0]?.id !== definition.product.id) {
    throw new Error(`${definition.genre}: 自動価格更新対象が想定と一致しません。`);
  }
  if (publicTargets.length !== 1 || publicTargets[0]?.id !== definition.product.id) {
    throw new Error(`${definition.genre}: 公開ranking対象が想定と一致しません。`);
  }
}

function logDryRun(
  definition: MigrationDefinition,
  snapshot: Snapshot,
  plan: MigrationPlan,
) {
  console.log(`\n=== ${definition.genre} 追跡移行 DRY-RUN ===`);
  console.log(`現在products: ${snapshot.products.length}件`);
  console.log(`現在ranking: ${snapshot.rankings.length}件`);
  console.log(`現在price_history: ${snapshot.histories.length}件`);
  console.log("移行後products: 1件");
  console.log("tracking true予定: 1件");
  console.log("tracking false予定: 0件");
  console.log(`商品ID: ${definition.product.id}`);
  console.log(`商品名: ${definition.product.name}`);
  console.log(`発売日: ${definition.product.releaseDate}`);
  console.log(`searchWord: ${definition.product.searchWord}`);
  console.log("\nYahoo採用候補:");
  console.log(`  タイトル: ${plan.selected.name}`);
  console.log(`  価格: ${plan.selected.price.toLocaleString()}円`);
  console.log(`  ショップ: ${plan.selected.seller.name}`);
  console.log(`  URL: ${plan.selected.url}`);
  console.log(`  新品: ${plan.selected.condition === "new"}`);
  console.log(`  在庫: ${plan.selected.inStock}`);
  console.log("  BOX/未開封相当: true");
  console.log("\n作成予定ranking: 1件");
  console.log(JSON.stringify(plan.rankingRow.data, null, 2));
  console.log("\n作成予定price_history: 1件");
  console.log(JSON.stringify(plan.historyRow, null, 2));
  console.log("移行後公開ranking予定: 1件");
  console.log("DB書き込み: 0件");
}

async function rollback(
  client: SupabaseClient,
  definition: MigrationDefinition,
  historyIds: string[],
) {
  const errors: string[] = [];
  const attempt = async (
    label: string,
    operation: PromiseLike<{ error: { message: string } | null }>,
  ) => {
    const { error } = await operation;
    if (error) errors.push(`${label}: ${error.message}`);
  };

  await attempt(
    "product削除",
    client
      .from("content_items")
      .delete()
      .eq("genre", definition.genre)
      .eq("resource", RESOURCE_PRODUCTS)
      .eq("item_id", definition.product.id),
  );
  await attempt(
    "ranking削除",
    client
      .from("content_items")
      .delete()
      .eq("genre", definition.genre)
      .eq("resource", RESOURCE_RANKING)
      .eq("item_id", definition.product.id),
  );
  if (historyIds.length > 0) {
    await attempt(
      "price_history削除",
      client.from("price_history").delete().in("id", historyIds),
    );
  }

  if (errors.length > 0) {
    throw new Error(`補償ロールバックに失敗しました: ${errors.join(" / ")}`);
  }
}

async function applyPlan(
  client: SupabaseClient,
  definition: MigrationDefinition,
  plan: MigrationPlan,
) {
  let historyIds: string[] = [];

  try {
    const { error: rankingError } = await client
      .from("content_items")
      .insert(plan.rankingRow);
    if (rankingError) throw new Error(`ranking作成失敗: ${rankingError.message}`);

    const { data: histories, error: historyError } = await client
      .from("price_history")
      .insert(plan.historyRow)
      .select("id");
    if (historyError) {
      throw new Error(`price_history作成失敗: ${historyError.message}`);
    }
    historyIds = (histories ?? []).map((row) => row.id as string);
    if (historyIds.length !== 1) {
      throw new Error("price_historyの作成件数が1件ではありません。");
    }

    const { error: productError } = await client
      .from("content_items")
      .insert(plan.productRow);
    if (productError) throw new Error(`product作成失敗: ${productError.message}`);

    const after = await readSnapshot(client, definition.genre);
    if (
      after.products.length !== 1 ||
      after.rankings.length !== 1 ||
      after.histories.length !== 1 ||
      after.products[0]?.item_id !== definition.product.id ||
      after.rankings[0]?.item_id !== definition.product.id ||
      after.histories[0]?.product_id !== definition.product.id ||
      after.products[0]?.data.priceTrackingEnabled !== true
    ) {
      throw new Error("移行後状態がproducts/ranking/price_history各1件になっていません。");
    }
  } catch (error) {
    try {
      await rollback(client, definition, historyIds);
    } catch (rollbackError) {
      throw new Error(
        `移行失敗: ${error instanceof Error ? error.message : String(error)} / ${
          rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
        }`,
      );
    }
    throw error;
  }
}

async function main() {
  const genre = readGenreArgument();
  const apply = process.argv.includes("--apply");
  const definition = definitions[genre];
  const client = createAdminClient();
  const snapshot = await readSnapshot(client, genre);
  validateBeforeState(snapshot, genre);

  const candidates = await searchYahooItems(definition.product.searchWord, {
    productType: definition.product.type,
    timeoutMs: 10_000,
  });
  const selected = candidates[0];
  if (!selected) {
    throw new Error(`${definition.product.id}: Yahoo候補が見つかりません。`);
  }
  validateYahooCandidate(definition, selected);

  const plan = createPlan(definition, selected);
  validatePlan(definition, plan);

  if (!apply) {
    logDryRun(definition, snapshot, plan);
    return;
  }

  console.log(`APPLYモード: ${genre}の本番移行を開始します。`);
  await applyPlan(client, definition, plan);
  console.log(`${genre}追跡移行が完了しました。`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
