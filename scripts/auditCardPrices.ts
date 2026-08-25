import { createClient } from "@supabase/supabase-js";
import { officialCardCatalog } from "../data/card-catalog";
import type { Genre, Product, RankingItem } from "../data/types";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import { evaluateProductIdentity, findMultipleItemExpression } from "../lib/commerce-matching";
import { getProductCategory } from "../lib/product-categories";
import { isReleasedInTokyo } from "../lib/price-tracking";
import { validateCandidate } from "./updateGenrePrices";

type CardGenre = Extract<Genre, "pokemon" | "onepiece" | "dragonball">;
type ContentRow<T> = { genre: CardGenre; resource: string; item_id: string; data: T };
type HistoryRow = { genre: CardGenre; product_id: string };
const genres: CardGenre[] = ["pokemon", "onepiece", "dragonball"];
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

function evidence(product: Product, item: YahooItem) {
  const normalized = item.name.normalize("NFKC").toLowerCase();
  const identity = evaluateProductIdentity(product, item);
  return {
    title: item.name,
    price: item.price,
    shop: item.seller?.name,
    url: item.url,
    new: item.condition === "new",
    inStock: item.inStock,
    box: normalized.includes("box") || normalized.includes("ボックス"),
    sealed: ["未開封", "シュリンク付き", "シュリンク付", "テープ付き", "テープ付"].some((word) => normalized.includes(word)),
    single: findMultipleItemExpression(item.name) === null,
    identity: identity.accepted,
    identityReason: identity.reason,
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function main() {
  const client = adminClient();
  const [content, history] = await Promise.all([
    client.from("content_items").select("genre,resource,item_id,data").in("genre", genres).in("resource", ["products", "ranking"]),
    client.from("price_history").select("genre,product_id").in("genre", genres),
  ]);
  if (content.error) throw content.error;
  if (history.error) throw history.error;
  const rows = (content.data ?? []) as ContentRow<Product | RankingItem>[];
  const productRows = rows.filter((row) => row.resource === "products") as ContentRow<Product>[];
  const rankingRows = rows.filter((row) => row.resource === "ranking");
  const historyRows = (history.data ?? []) as HistoryRow[];
  const officialIds = new Set(officialCardCatalog.map((product) => `${product.genre}:${product.id}`));

  console.log("=== PRODUCTION SNAPSHOT (READ ONLY) ===");
  for (const genre of genres) {
    const products = productRows.filter((row) => row.genre === genre).map((row) => row.data);
    console.log(JSON.stringify({ genre, products: products.length,
      boosters: products.filter((item) => getProductCategory(item) === "booster-box").length,
      collections: products.filter((item) => getProductCategory(item) === "collection-box").length,
      ranking: rankingRows.filter((row) => row.genre === genre).length,
      history: historyRows.filter((row) => row.genre === genre).length,
      tracked: products.filter((item) => item.priceTrackingEnabled === true).map((item) => ({ id: item.id, name: item.name, price: item.marketPrice, shop: item.shop })),
      nonOfficial: productRows.filter((row) => row.genre === genre && !officialIds.has(`${row.genre}:${row.item_id}`)).map((row) => ({ id: row.item_id, data: row.data })),
    }));
  }

  console.log("=== YAHOO BOOSTER AUDIT (DB WRITES: 0) ===");
  const requestedGenre = process.argv.find((argument) => argument.startsWith("--genre="))?.split("=")[1];
  if (requestedGenre && !genres.includes(requestedGenre as CardGenre)) throw new Error(`未対応genre: ${requestedGenre}`);
  const products = officialCardCatalog.filter((product) => product.productCategory === "booster-box"
    && (!requestedGenre || product.genre === requestedGenre));
  for (const [index, product] of products.entries()) {
    let items: YahooItem[] = [];
    let searchError: string | undefined;
    try {
      items = await searchYahooItems(product.searchWord, { productType: "box", timeoutMs: 10_000 });
    } catch (error) {
      searchError = error instanceof Error ? error.message : String(error);
    }
    const accepted: YahooItem[] = [];
    const rejected: { item: YahooItem; reason: string }[] = [];
    for (const item of items) {
      try { validateCandidate(product, item); accepted.push(item); }
      catch (error) { rejected.push({ item, reason: error instanceof Error ? error.message : String(error) }); }
    }
    const selected = accepted[0];
    const prices = accepted.map((item) => item.price);
    const priceMedian = prices.length ? median(prices) : undefined;
    const deviation = selected && priceMedian ? Math.abs(selected.price / priceMedian - 1) * 100 : undefined;
    const stablePrice = accepted.length >= 2 && deviation !== undefined && deviation <= 60;
    const released = isReleasedInTokyo(product);
    const production = productRows.find((row) => row.genre === product.genre && row.item_id === product.id)?.data;
    const classification = production?.priceTrackingEnabled === true ? "A" : !released ? "D" : !items.length ? "E" : !selected ? "F" : stablePrice ? "B" : "C";
    console.log(JSON.stringify({ genre: product.genre, id: product.id, name: product.name, searchWord: product.searchWord,
      classification, released, productionTracking: production?.priceTrackingEnabled === true,
      selected: selected ? evidence(product, selected) : null,
      acceptedCandidates: accepted.length, candidatePrices: prices.slice(0, 10), median: priceMedian, deviationPercent: deviation,
      searchError, rejected: rejected.slice(0, 3).map(({ item, reason }) => ({ title: item.name, price: item.price, reason })),
      reason: classification === "A" ? "既存tracking=true（変更なし）" : classification === "D" ? "発売前のためtracking禁止" : classification === "E" ? (searchError ?? "Yahoo取得不可") : classification === "F" ? "安全条件を満たす同一商品なし" : classification === "B" ? "複数の安全候補と価格帯を確認" : "候補数または価格安定性が不足",
    }));
    if (index < products.length - 1) await wait(1_100);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
