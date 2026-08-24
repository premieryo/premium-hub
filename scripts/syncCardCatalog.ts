import { createClient } from "@supabase/supabase-js";
import { officialCardCatalog } from "../data/card-catalog";
import type { Genre, Product, RankingItem } from "../data/types";

type CardGenre = Extract<Genre, "pokemon" | "onepiece" | "dragonball">;
type ContentRow<T> = { genre: CardGenre; resource: string; item_id: string; data: T; updated_at: string };
type HistoryRow = { id: string; genre: string; product_id: string; price: number; shop: string | null; product_url: string | null; source: string; fetched_at: string; created_at: string };

const cardGenres: CardGenre[] = ["pokemon", "onepiece", "dragonball"];
const protectedCommerceFields = ["marketPrice", "shop", "url", "updatedAt", "affiliateUrl", "imageSource", "imageSourceId", "imageAlt", "imageEnabled"] as const;

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  if (secretKey.startsWith("sb_publishable_") || secretKey === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) throw new Error("SUPABASE_SECRET_KEYにはSecret keyを設定してください。");
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizeName(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/ポケモンカードゲーム|one pieceカードゲーム|ドラゴンボールスーパーカードゲーム|フュージョンワールド|mega|拡張パック|強化拡張パック|ハイクラスパック|ブースターパック|エクストラブースター|プレミアムブースター|box|[「」［］\[\]\s・]/g, "");
}

function mergeProduct(official: Product, existing?: Product): Product {
  if (!existing) return official;
  const merged: Product = { ...official, priceTrackingEnabled: existing.priceTrackingEnabled === true };
  for (const field of protectedCommerceFields) {
    const value = existing[field];
    if (value !== undefined) Object.assign(merged, { [field]: value });
  }
  return merged;
}

async function readSnapshot(client: ReturnType<typeof createAdminClient>) {
  const [content, history] = await Promise.all([
    client.from("content_items").select("genre,resource,item_id,data,updated_at").in("genre", cardGenres).in("resource", ["products", "ranking"]).order("genre").order("resource").order("item_id"),
    client.from("price_history").select("id,genre,product_id,price,shop,product_url,source,fetched_at,created_at").order("genre").order("product_id").order("fetched_at"),
  ]);
  if (content.error) throw new Error(`content_itemsの取得に失敗しました: ${content.error.message}`);
  if (history.error) throw new Error(`price_historyの取得に失敗しました: ${history.error.message}`);
  const rows = (content.data ?? []) as ContentRow<Product | RankingItem>[];
  return {
    products: rows.filter((row) => row.resource === "products") as ContentRow<Product>[],
    ranking: rows.filter((row) => row.resource === "ranking") as ContentRow<RankingItem>[],
    history: (history.data ?? []) as HistoryRow[],
  };
}

function createPlan(snapshot: Awaited<ReturnType<typeof readSnapshot>>) {
  const existingByKey = new Map(snapshot.products.map((row) => [`${row.genre}:${row.item_id}`, row]));
  const duplicateKeys = new Map<string, string[]>();
  for (const row of snapshot.products) {
    const key = `${row.genre}:${row.data.releaseDate}:${normalizeName(row.data.name)}`;
    duplicateKeys.set(key, [...(duplicateKeys.get(key) ?? []), row.item_id]);
  }
  const inserts: { genre: CardGenre; resource: "products"; item_id: string; data: Product }[] = [];
  const updates: { before: ContentRow<Product>; data: Product }[] = [];
  const unchanged: Product[] = [];
  const conflicts: string[] = [];

  for (const official of officialCardCatalog) {
    const key = `${official.genre}:${official.id}`;
    const existing = existingByKey.get(key);
    const identityKey = `${official.genre}:${official.releaseDate}:${normalizeName(official.name)}`;
    const otherIds = (duplicateKeys.get(identityKey) ?? []).filter((id) => id !== official.id);
    if (otherIds.length) conflicts.push(`${key}: 同一商品候補が別IDに存在 (${otherIds.join(", ")})`);
    if (existing && (existing.data.genre !== official.genre || existing.data.releaseDate !== official.releaseDate || normalizeName(existing.data.name) !== normalizeName(official.name))) {
      conflicts.push(`${key}: ID衝突（既存名または発売日が不一致）`);
      continue;
    }
    const data = mergeProduct(official, existing?.data);
    if (!existing) inserts.push({ genre: official.genre as CardGenre, resource: "products", item_id: official.id, data });
    else if (stable(existing.data) === stable(data)) unchanged.push(data);
    else updates.push({ before: existing, data });
  }
  return { inserts, updates, unchanged, conflicts };
}

function logPlan(snapshot: Awaited<ReturnType<typeof readSnapshot>>, plan: ReturnType<typeof createPlan>) {
  console.log("=== CARD CATALOG DRY-RUN ===");
  for (const genre of cardGenres) {
    const current = snapshot.products.filter((row) => row.genre === genre);
    const inserts = plan.inserts.filter((row) => row.genre === genre);
    const updates = plan.updates.filter((row) => row.before.genre === genre);
    const unchanged = plan.unchanged.filter((row) => row.genre === genre);
    console.log(`\n${genre}: 現在${current.length} / 新規${inserts.length} / 更新${updates.length} / 変更なし${unchanged.length} / 保留0 / 重複0 / ID衝突0`);
    for (const row of inserts) console.log(JSON.stringify(row.data));
    for (const row of updates) console.log(`UPDATE ${row.data.id}: ${JSON.stringify(row.data)}`);
  }
  console.log(`\nranking: ${snapshot.ranking.length}件（変更予定0）`);
  console.log(`price_history: ${snapshot.history.length}件（変更予定0）`);
  console.log(`DB書き込み予定: insert ${plan.inserts.length}件 / CAS update ${plan.updates.length}件`);
  if (plan.conflicts.length) console.log(`停止条件:\n${plan.conflicts.join("\n")}`);
}

async function applyPlan(client: ReturnType<typeof createAdminClient>, before: Awaited<ReturnType<typeof readSnapshot>>, plan: ReturnType<typeof createPlan>) {
  if (plan.conflicts.length) throw new Error("重複またはID衝突があるためapplyを停止しました。");
  if (plan.inserts.length) {
    const { data, error } = await client.from("content_items").insert(plan.inserts).select("item_id");
    if (error) throw new Error(`新規商品の追加に失敗しました: ${error.message}`);
    if (data?.length !== plan.inserts.length) throw new Error("新規商品の追加件数が予定と一致しません。");
  }
  for (const update of plan.updates) {
    const { data, error } = await client.from("content_items")
      .update({ data: update.data, updated_at: new Date().toISOString() })
      .eq("genre", update.before.genre).eq("resource", "products").eq("item_id", update.before.item_id).eq("updated_at", update.before.updated_at).select("item_id");
    if (error) throw new Error(`${update.before.item_id}のCAS更新に失敗しました: ${error.message}`);
    if (data?.length !== 1) throw new Error(`${update.before.item_id}はdry-run後に変更されたためCAS更新を停止しました。`);
  }
  const after = await readSnapshot(client);
  const afterIds = new Set(after.products.map((row) => `${row.genre}:${row.item_id}`));
  if (!officialCardCatalog.every((product) => afterIds.has(`${product.genre}:${product.id}`))) throw new Error("apply後に公式カタログの商品IDが不足しています。");
  if (stable(before.ranking) !== stable(after.ranking)) throw new Error("rankingが変更されました。");
  if (stable(before.history) !== stable(after.history)) throw new Error("price_historyが変更されました。");
  const trackedBefore = before.products.filter((row) => row.data.priceTrackingEnabled === true);
  for (const old of trackedBefore) {
    const current = after.products.find((row) => row.genre === old.genre && row.item_id === old.item_id)?.data;
    if (!current) throw new Error(`${old.item_id}がapply後に見つかりません。`);
    for (const field of ["marketPrice", "shop", "url", "priceTrackingEnabled"] as const) {
      if (current[field] !== old.data[field]) throw new Error(`${old.item_id}の${field}が変更されました。`);
    }
  }
  console.log(`APPLY完了: insert ${plan.inserts.length}件 / update ${plan.updates.length}件`);
  for (const genre of cardGenres) {
    const products = after.products.filter((row) => row.genre === genre).map((row) => row.data);
    console.log(`${genre}: products ${products.length} / booster ${products.filter((p) => p.productCategory === "booster-box").length} / collection ${products.filter((p) => p.productCategory === "collection-box").length} / tracking true ${products.filter((p) => p.priceTrackingEnabled === true).length}`);
  }
  console.log(`ranking ${before.ranking.length} -> ${after.ranking.length}`);
  console.log(`price_history ${before.history.length} -> ${after.history.length}`);
}

async function main() {
  const client = createAdminClient();
  const snapshot = await readSnapshot(client);
  const plan = createPlan(snapshot);
  logPlan(snapshot, plan);
  if (!process.argv.includes("--apply")) return;
  await applyPlan(client, snapshot, plan);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
