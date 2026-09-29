import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Genre, Product, ProductImageAsset } from "../data/types";
import { searchYahooItems } from "../lib/api/yahoo";
import { selectPriceTrackingProducts } from "../lib/price-tracking";
import { validateCandidate } from "./updateGenrePrices";

const genres = ["pokemon", "onepiece", "dragonball"] as const satisfies readonly Genre[];
const INTERVAL_MS = 1_100;

type Row = { item_id: string; data: Product; updated_at: string };

export type ImageBackfillResult = {
  genre: Genre;
  productId: string;
  productName: string;
  status: "updated" | "skipped" | "failed";
  reason?: string;
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

function createImageAsset(product: Product, item: Awaited<ReturnType<typeof searchYahooItems>>[number]) {
  const image = item.exImage;
  if (
    !image?.url?.startsWith("https://item-shopping.c.yimg.jp/")
    || !item.url.startsWith("https://ck.jp.ap.valuecommerce.com/")
    || !Number.isInteger(image.width) || (image.width ?? 0) <= 0
    || !Number.isInteger(image.height) || (image.height ?? 0) <= 0
  ) return null;

  const fetchedAt = new Date().toISOString();
  const asset: ProductImageAsset = {
    source: "valuecommerce",
    src: image.url,
    clickUrl: item.url,
    alt: item.name || product.name,
    width: image.width!,
    height: image.height!,
    fetchedAt,
  };
  return asset;
}

async function rows(client: SupabaseClient, genre: Genre) {
  const result = await client.from("content_items").select("item_id,data,updated_at")
    .eq("genre", genre).eq("resource", "products").order("item_id");
  if (result.error) throw new Error(`products読込失敗: ${result.error.message}`);
  return (result.data ?? []) as Row[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function backfillProductImages(options: { dryRun?: boolean; productIds?: string[] } = {}) {
  const dryRun = options.dryRun ?? true;
  const selectedIds = options.productIds ? new Set(options.productIds) : null;
  const client = adminClient();
  const results: ImageBackfillResult[] = [];

  for (const genre of genres) {
    const productRows = await rows(client, genre);
    const products = selectPriceTrackingProducts(genre, productRows.map((row) => row.data))
      .filter((product) => !selectedIds || selectedIds.has(product.id));

    for (const [index, product] of products.entries()) {
      try {
        const items = await searchYahooItems(product.searchWord, { productType: product.type, timeoutMs: 10_000 });
        const selected = items.find((item) => {
          try {
            validateCandidate(product, item);
            return Boolean(createImageAsset(product, item));
          } catch {
            return false;
          }
        });
        if (!selected) {
          results.push({ genre, productId: product.id, productName: product.name, status: "skipped", reason: "許可条件を満たす商品画像なし" });
          continue;
        }
        const imageAsset = createImageAsset(product, selected)!;
        if (!dryRun) {
          const row = productRows.find((candidate) => candidate.item_id === product.id);
          if (!row) throw new Error("更新対象products行がありません。");
          const data: Product = {
            ...row.data,
            imageSource: "valuecommerce",
            imageAlt: imageAsset.alt,
            imageEnabled: true,
            imageAsset,
          };
          const update = await client.from("content_items").update({ data, updated_at: new Date().toISOString() })
            .eq("genre", genre).eq("resource", "products").eq("item_id", product.id)
            .eq("updated_at", row.updated_at).select("item_id");
          if (update.error) throw new Error(`画像保存失敗: ${update.error.message}`);
          if (update.data?.length !== 1) throw new Error("商品が同時更新されたため画像保存を中止しました。");
        }
        results.push({ genre, productId: product.id, productName: product.name, status: "updated" });
      } catch (error) {
        results.push({ genre, productId: product.id, productName: product.name, status: "failed",
          reason: error instanceof Error ? error.message : String(error) });
      }
      if (index < products.length - 1) await wait(INTERVAL_MS);
    }
  }

  return {
    dryRun,
    updated: results.filter((item) => item.status === "updated").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    failed: results.filter((item) => item.status === "failed").length,
    results,
  };
}

if (process.argv[1]?.includes("backfillProductImages")) {
  const apply = process.argv.includes("--apply");
  backfillProductImages({ dryRun: !apply }).then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
    if (summary.failed > 0) process.exitCode = 1;
  });
}
