import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product, RankingItem } from "../data/types";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import {
  selectPriceTrackingProducts,
  selectPublicRankingProducts,
} from "../lib/price-tracking";

const GENRE = "pokemon" as const;
const RESOURCE_PRODUCTS = "products";
const RESOURCE_RANKING = "ranking";
const SOURCE = "yahoo";
const trackedProductIds = [
  "storm-emeralda-box",
  "mega-brave-box",
  "mega-symphonia-box",
] as const;

const existingProductIds = [
  "black-bolt-box",
  "white-flare-box",
  "rocket-glory-box",
  "hot-wind-arena-box",
  "terastal-festival-box",
  "super-electric-breaker-box",
] as const;

const newProducts: Product[] = [
  {
    id: "storm-emeralda-box",
    genre: GENRE,
    name: "ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX",
    type: "box",
    releaseDate: "2026-07-31",
    searchWord: "ストームエメラルダ BOX",
    priceTrackingEnabled: true,
  },
  {
    id: "mega-brave-box",
    genre: GENRE,
    name: "ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX",
    type: "box",
    releaseDate: "2025-08-01",
    searchWord: "メガブレイブ BOX",
    priceTrackingEnabled: true,
  },
  {
    id: "mega-symphonia-box",
    genre: GENRE,
    name: "ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX",
    type: "box",
    releaseDate: "2025-08-01",
    searchWord: "メガシンフォニア BOX",
    priceTrackingEnabled: true,
  },
  {
    id: "30th-celebration-box",
    genre: GENRE,
    name: "ポケモンカードゲーム MEGA 拡張パック「30th CELEBRATION」BOX",
    type: "box",
    releaseDate: "2026-09-16",
    searchWord: "30th CELEBRATION BOX",
    priceTrackingEnabled: false,
  },
  {
    id: "30th-celebration-premium-deck-set-espeon-umbreon",
    genre: GENRE,
    name: "30th CELEBRATION プレミアムデッキセット エーフィ・ブラッキー",
    type: "other",
    releaseDate: "2026-09-16",
    searchWord: "30th CELEBRATION プレミアムデッキセット エーフィ ブラッキー 未開封",
    priceTrackingEnabled: false,
  },
  {
    id: "30th-celebration-futuristic-box",
    genre: GENRE,
    name: "30th CELEBRATION FUTURISTIC BOX",
    type: "other",
    releaseDate: "2026-09-16",
    searchWord: "30th CELEBRATION FUTURISTIC BOX 未開封",
    priceTrackingEnabled: false,
  },
];

type ContentRow<T> = {
  genre: string;
  resource: string;
  item_id: string;
  data: T;
  created_at: string;
  updated_at: string;
};

type MigrationSnapshot = {
  products: ContentRow<Product>[];
  rankings: ContentRow<RankingItem>[];
  trackedHistoryCount: number;
  allHistoryCount: number;
};

type HistoryInsert = {
  genre: typeof GENRE;
  product_id: string;
  price: number;
  shop: string;
  product_url: string;
  source: typeof SOURCE;
  fetched_at: string;
};

type MigrationPlan = {
  fetchedAt: string;
  selectedItems: Map<string, YahooItem>;
  existingUpdates: ContentRow<Product>[];
  productInserts: ContentRow<Product>[];
  rankingInserts: ContentRow<RankingItem>[];
  historyInserts: HistoryInsert[];
  finalProducts: Product[];
};

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

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function validateYahooCandidate(product: Product, item: YahooItem) {
  const title = normalize(item.name);
  const coreName = normalize(product.searchWord).replace(/box|ボックス/g, "");
  const hasBox = title.includes("box") || title.includes("ボックス");
  const hasShrink = title.includes("シュリンク");
  const rejectedWords = [
    "シュリンクなし",
    "シュリンク無し",
    "シュリンク無",
    "開封済み",
    "カード単品",
    "パック単品",
    "1パック",
  ];

  if (product.type !== "box") {
    throw new Error(`${product.id}: 未開封判定の緩和はbox商品だけに適用できます。`);
  }
  if (!coreName || !title.includes(coreName)) {
    throw new Error(`${product.id}: Yahoo採用候補の商品名が一致しません。`);
  }
  if (!hasBox || !hasShrink) {
    throw new Error(`${product.id}: Yahoo採用候補にBOXまたはシュリンク表記がありません。`);
  }
  const rejectedWord = rejectedWords.find((word) => title.includes(normalize(word)));
  if (rejectedWord) {
    throw new Error(`${product.id}: Yahoo採用候補に除外語があります: ${rejectedWord}`);
  }
  if (!item.inStock) throw new Error(`${product.id}: Yahoo採用候補が在庫切れです。`);
  if (item.condition !== "new") throw new Error(`${product.id}: Yahoo採用候補が新品ではありません。`);
  if (!Number.isInteger(item.price) || item.price <= 0) {
    throw new Error(`${product.id}: Yahoo採用価格が正の整数ではありません。`);
  }
  if (!item.seller?.name || !item.url.startsWith("https://")) {
    throw new Error(`${product.id}: Yahoo採用候補のショップまたはURLが不正です。`);
  }
}

async function readSnapshot(client: SupabaseClient): Promise<MigrationSnapshot> {
  const [productsResult, rankingsResult, trackedHistoryResult, allHistoryResult] =
    await Promise.all([
      client
        .from("content_items")
        .select("genre,resource,item_id,data,created_at,updated_at")
        .eq("genre", GENRE)
        .eq("resource", RESOURCE_PRODUCTS)
        .order("item_id"),
      client
        .from("content_items")
        .select("genre,resource,item_id,data,created_at,updated_at")
        .eq("genre", GENRE)
        .eq("resource", RESOURCE_RANKING)
        .order("item_id"),
      client
        .from("price_history")
        .select("id", { count: "exact", head: true })
        .eq("genre", GENRE)
        .in("product_id", [...trackedProductIds]),
      client
        .from("price_history")
        .select("id", { count: "exact", head: true })
        .eq("genre", GENRE),
    ]);

  for (const result of [
    productsResult,
    rankingsResult,
    trackedHistoryResult,
    allHistoryResult,
  ]) {
    if (result.error) throw new Error(`Supabase SELECTに失敗しました: ${result.error.message}`);
  }

  return {
    products: (productsResult.data ?? []) as ContentRow<Product>[],
    rankings: (rankingsResult.data ?? []) as ContentRow<RankingItem>[],
    trackedHistoryCount: trackedHistoryResult.count ?? 0,
    allHistoryCount: allHistoryResult.count ?? 0,
  };
}

function validateBeforeState(snapshot: MigrationSnapshot) {
  const actualIds = snapshot.products.map((row) => row.item_id).sort();
  const expectedIds = [...existingProductIds].sort();

  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(
      `移行前productsが想定と異なります。expected=${expectedIds.join(",")} actual=${actualIds.join(",")}`
    );
  }
  if (snapshot.products.some((row) => row.data.id !== row.item_id || row.data.genre !== GENRE)) {
    throw new Error("既存productsのitem_id、data.id、genreが一致しません。");
  }
  if (
    snapshot.products.some((row) =>
      Object.prototype.hasOwnProperty.call(row.data, "priceTrackingEnabled")
    )
  ) {
    throw new Error("既存productsにpriceTrackingEnabledキーがすでに存在します。");
  }
  const existingTrackedRanking = snapshot.rankings.find((row) =>
    trackedProductIds.includes(row.item_id as (typeof trackedProductIds)[number])
  );
  if (existingTrackedRanking) {
    throw new Error(`${existingTrackedRanking.item_id}のrankingがすでに存在します。`);
  }
  if (snapshot.trackedHistoryCount !== 0) {
    throw new Error("追跡予定3商品のprice_historyがすでに存在します。");
  }
}

function createPlan(
  snapshot: MigrationSnapshot,
  selectedItems: Map<string, YahooItem>
): MigrationPlan {
  const fetchedAt = new Date().toISOString();
  const plannedNewProducts = newProducts.map((product): Product => {
    if (product.priceTrackingEnabled !== true) return product;
    const selected = selectedItems.get(product.id);
    if (!selected) throw new Error(`${product.id}のYahoo採用候補がありません。`);
    return {
      ...product,
      marketPrice: selected.price,
      shop: selected.seller.name,
      url: selected.url,
      updatedAt: fetchedAt,
    };
  });
  const existingUpdates = snapshot.products.map((row) => ({
    ...row,
    data: { ...row.data, priceTrackingEnabled: false },
    updated_at: fetchedAt,
  }));
  const productInserts = plannedNewProducts.map((product) => ({
    genre: GENRE,
    resource: RESOURCE_PRODUCTS,
    item_id: product.id,
    data: product,
    created_at: fetchedAt,
    updated_at: fetchedAt,
  }));
  const trackedProducts = plannedNewProducts.filter(
    (product) => product.priceTrackingEnabled === true
  );
  const rankingInserts = trackedProducts.map((product): ContentRow<RankingItem> => {
    const selected = selectedItems.get(product.id);
    if (!selected) throw new Error(`${product.id}のYahoo採用候補がありません。`);
    return {
      genre: GENRE,
      resource: RESOURCE_RANKING,
      item_id: product.id,
      data: {
        id: product.id,
        genre: GENRE,
        shop: selected.seller.name,
        product: product.name,
        status: "初回価格",
        icon: "📦",
        href: "/pokemon/ranking",
        price: `${selected.price.toLocaleString()}円`,
        marketPrice: selected.price,
        currentPrice: selected.price,
        previousPrice: selected.price,
        changeAmount: 0,
        changeRate: 0,
        updatedAt: fetchedAt,
      },
      created_at: fetchedAt,
      updated_at: fetchedAt,
    };
  });
  const historyInserts = trackedProducts.map((product): HistoryInsert => {
    const selected = selectedItems.get(product.id);
    if (!selected) throw new Error(`${product.id}のYahoo採用候補がありません。`);
    return {
      genre: GENRE,
      product_id: product.id,
      price: selected.price,
      shop: selected.seller.name,
      product_url: selected.url,
      source: SOURCE,
      fetched_at: fetchedAt,
    };
  });
  const finalProducts = [...existingUpdates.map((row) => row.data), ...plannedNewProducts];

  return {
    fetchedAt,
    selectedItems,
    existingUpdates,
    productInserts,
    rankingInserts,
    historyInserts,
    finalProducts,
  };
}

function validatePlan(plan: MigrationPlan) {
  const trueProducts = plan.finalProducts.filter(
    (product) => product.priceTrackingEnabled === true
  );
  const falseProducts = plan.finalProducts.filter(
    (product) => product.priceTrackingEnabled === false
  );
  const updateTargets = selectPriceTrackingProducts(GENRE, plan.finalProducts);
  const publicTargets = selectPublicRankingProducts(GENRE, plan.finalProducts);

  const trueIds = trueProducts.map((product) => product.id).sort();
  const expectedTrueIds = [...trackedProductIds].sort();

  if (plan.finalProducts.length !== 12) throw new Error("移行後productsが12件ではありません。");
  if (JSON.stringify(trueIds) !== JSON.stringify(expectedTrueIds)) {
    throw new Error("tracking true商品が正式候補3件と一致しません。");
  }
  if (falseProducts.length !== 9) throw new Error("tracking false商品が9件ではありません。");
  if (plan.rankingInserts.length !== 3 || plan.historyInserts.length !== 3) {
    throw new Error("初回rankingまたはprice_historyの予定件数が3件ではありません。");
  }
  if (updateTargets.length !== 3 || publicTargets.length !== 3) {
    throw new Error("発売済み価格更新対象または公開ranking対象が3件ではありません。");
  }
}

function logDryRun(snapshot: MigrationSnapshot, plan: MigrationPlan) {
  const futureProducts = plan.finalProducts.filter(
    (product) => product.releaseDate > "2026-08-24"
  );

  console.log("\n=== pokemon追跡移行 DRY-RUN ===");
  console.log(`現在products: ${snapshot.products.length}件`);
  console.log(`移行後products: ${plan.finalProducts.length}件`);
  console.log(`現在ranking: ${snapshot.rankings.length}件（既存行は削除しません）`);
  console.log(`現在pokemon price_history: ${snapshot.allHistoryCount}件`);
  console.log(`既存false設定予定: ${existingProductIds.join(", ")}`);
  console.log(`新規追加予定: ${newProducts.map((product) => product.id).join(", ")}`);
  console.log(`tracking true予定 (${trackedProductIds.length}件): ${trackedProductIds.join(", ")}`);
  console.log(`tracking false予定: ${plan.finalProducts.filter((product) => product.priceTrackingEnabled === false).length}件`);
  console.log(`発売前除外: ${futureProducts.map((product) => product.id).join(", ")}`);
  console.log("\nYahoo採用候補:");
  for (const productId of trackedProductIds) {
    const selected = plan.selectedItems.get(productId);
    if (!selected) continue;
    console.log(`  [${productId}]`);
    console.log(`    タイトル: ${selected.name}`);
    console.log(`    価格: ${selected.price.toLocaleString()}円`);
    console.log(`    ショップ: ${selected.seller.name}`);
    console.log(`    URL: ${selected.url}`);
    console.log(`    新品: ${selected.condition === "new"}`);
    console.log(`    在庫: ${selected.inStock}`);
    console.log("    BOX/シュリンク付き/未開封相当: true");
  }
  console.log("\n作成予定ranking 3件:");
  console.log(JSON.stringify(plan.rankingInserts.map((row) => row.data), null, 2));
  console.log("\n作成予定price_history 3件:");
  console.log(JSON.stringify(plan.historyInserts, null, 2));
  console.log(`\n移行後公開ranking予定: 3件 (${trackedProductIds.join(", ")})`);
  console.log("DB書き込み: 0件");
}

async function rollback(
  client: SupabaseClient,
  snapshot: MigrationSnapshot,
  historyIds: string[]
) {
  const errors: string[] = [];
  const attempt = async (label: string, operation: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await operation;
    if (error) errors.push(`${label}: ${error.message}`);
  };

  await attempt(
    "既存products復元",
    client.from("content_items").upsert(
      snapshot.products.map((row) => ({
        genre: row.genre,
        resource: row.resource,
        item_id: row.item_id,
        data: row.data,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      { onConflict: "genre,resource,item_id" }
    )
  );
  await attempt(
    "新規products削除",
    client
      .from("content_items")
      .delete()
      .eq("genre", GENRE)
      .eq("resource", RESOURCE_PRODUCTS)
      .in("item_id", newProducts.map((product) => product.id))
  );
  await attempt(
    "新規ranking削除",
    client
      .from("content_items")
      .delete()
      .eq("genre", GENRE)
      .eq("resource", RESOURCE_RANKING)
      .in("item_id", [...trackedProductIds])
  );
  if (historyIds.length > 0) {
    await attempt(
      "新規price_history削除",
      client.from("price_history").delete().in("id", historyIds)
    );
  }

  if (errors.length > 0) throw new Error(`補償ロールバックに失敗しました: ${errors.join(" / ")}`);
}

async function applyPlan(
  client: SupabaseClient,
  snapshot: MigrationSnapshot,
  plan: MigrationPlan
) {
  let historyIds: string[] = [];

  try {
    const { error: rankingError } = await client.from("content_items").upsert(
      plan.rankingInserts,
      { onConflict: "genre,resource,item_id" }
    );
    if (rankingError) throw new Error(`ranking作成失敗: ${rankingError.message}`);

    const { data: histories, error: historyError } = await client
      .from("price_history")
      .insert(plan.historyInserts)
      .select("id");
    if (historyError) throw new Error(`price_history作成失敗: ${historyError.message}`);
    historyIds = (histories ?? []).map((row) => row.id as string);
    if (historyIds.length !== 3) {
      throw new Error("price_historyの作成件数が3件ではありません。");
    }

    const { error: insertError } = await client.from("content_items").upsert(
      plan.productInserts,
      { onConflict: "genre,resource,item_id" }
    );
    if (insertError) throw new Error(`新規products作成失敗: ${insertError.message}`);

    const { error: updateError } = await client.from("content_items").upsert(
      plan.existingUpdates.map((row) => ({
        genre: row.genre,
        resource: row.resource,
        item_id: row.item_id,
        data: row.data,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      { onConflict: "genre,resource,item_id" }
    );
    if (updateError) throw new Error(`既存products更新失敗: ${updateError.message}`);

    const after = await readSnapshot(client);
    const trueCount = after.products.filter(
      (row) => row.data.priceTrackingEnabled === true
    ).length;
    const falseCount = after.products.filter(
      (row) => row.data.priceTrackingEnabled === false
    ).length;
    if (
      after.products.length !== 12 ||
      after.trackedHistoryCount !== 3 ||
      !trackedProductIds.every((productId) =>
        after.rankings.some((row) => row.item_id === productId)
      ) ||
      trueCount !== 3 ||
      falseCount !== 9
    ) {
      throw new Error("移行後状態がproducts 12件・true 3件・false 9件・初回履歴/ranking各3件になっていません。");
    }
  } catch (error) {
    try {
      await rollback(client, snapshot, historyIds);
    } catch (rollbackError) {
      throw new Error(
        `移行失敗: ${error instanceof Error ? error.message : String(error)} / ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`
      );
    }
    throw error;
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createAdminClient();
  const snapshot = await readSnapshot(client);
  validateBeforeState(snapshot);

  const selectedItems = new Map<string, YahooItem>();
  for (const productId of trackedProductIds) {
    const product = newProducts.find((candidate) => candidate.id === productId);
    if (!product) throw new Error(`${productId}の商品定義がありません。`);
    const candidates = await searchYahooItems(product.searchWord, {
      productType: product.type,
      timeoutMs: 10_000,
    });
    const selected = candidates[0];
    if (!selected) throw new Error(`Yahooで条件に一致する${productId}が見つかりません。`);
    validateYahooCandidate(product, selected);
    selectedItems.set(productId, selected);
  }

  const plan = createPlan(snapshot, selectedItems);
  validatePlan(plan);

  if (!apply) {
    logDryRun(snapshot, plan);
    return;
  }

  console.log("APPLYモード: 本番DBへの移行を開始します。");
  await applyPlan(client, snapshot, plan);
  console.log("pokemon追跡移行が完了しました。");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
