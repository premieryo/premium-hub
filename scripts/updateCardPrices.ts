import { createClient } from "@supabase/supabase-js";
import type { Genre, Product } from "../data/types";
import { selectPriceTrackingProducts } from "../lib/price-tracking";
import { completeRotationBatch, PRICE_BATCH_SIZE, PRICE_ITEM_INTERVAL_MS, PRICE_MIN_REMAINING_MS,
  PRICE_RUN_BUDGET_MS, productKey,
  selectRotationBatch, type CardGenre } from "../lib/price-rotation";
import { acquireRotationCursor, commitRotationCursor, readRotationCursor, releaseRotationCursor,
  type CursorLease } from "./priceRotationCursor";
import { updateGenrePrices, type PriceUpdateOptions, type PriceUpdateSummary } from "./updateGenrePrices";

export const cardGenres = ["pokemon", "onepiece", "dragonball"] as const satisfies readonly Genre[];
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export type PriceRotationRun = {
  dryRun: boolean; concurrent: boolean; batchSize: number; selectedProductIds: string[];
  selectedProductKeys: string[]; summaries: PriceUpdateSummary[]; elapsedMs: number;
  nextCursor: string | null; cursorRevision: number;
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function eligibleProducts() {
  const result = await adminClient().from("content_items").select("data")
    .eq("resource", "products").in("genre", cardGenres);
  if (result.error) throw new Error(`tracking商品読込失敗: ${result.error.message}`);
  const products = (result.data ?? []).map((row) => row.data as Product);
  return cardGenres.flatMap((genre) => selectPriceTrackingProducts(genre, products));
}

export async function updateCardPrices(options: PriceUpdateOptions = {}): Promise<PriceRotationRun> {
  const startedAt = Date.now();
  const dryRun = options.dryRun ?? true;
  const client = adminClient();
  const eligible = await eligibleProducts();
  const cursor = dryRun ? await readRotationCursor(client) : await acquireRotationCursor(client);
  if (!cursor) return { dryRun, concurrent: true, batchSize: PRICE_BATCH_SIZE, selectedProductIds: [],
    selectedProductKeys: [], summaries: [], elapsedMs: Date.now() - startedAt,
    nextCursor: null, cursorRevision: 0 };
  const batch = selectRotationBatch(cursor.state, eligible, PRICE_BATCH_SIZE);
  const selectedProductIds = batch.selectedKeys.map((key) => key.slice(key.indexOf(":") + 1));
  if (dryRun) return { dryRun, concurrent: false, batchSize: PRICE_BATCH_SIZE, selectedProductIds,
    selectedProductKeys: batch.selectedKeys, summaries: [], elapsedMs: Date.now() - startedAt,
    nextCursor: batch.selectedKeys[0] ?? null, cursorRevision: cursor.revision };

  const lease = cursor as CursorLease;
  const summaries: PriceUpdateSummary[] = [];
  let committed = false;
  try {
    const deadlineAt = startedAt + PRICE_RUN_BUDGET_MS;
    for (const [index, key] of batch.selectedKeys.entries()) {
      const separator = key.indexOf(":");
      const genre = key.slice(0, separator) as CardGenre;
      const id = key.slice(separator + 1);
      summaries.push(await updateGenrePrices(genre, { ...options, dryRun: false,
        useRunLease: true, productIds: [id], deadlineAt }));
      if (index < batch.selectedKeys.length - 1 && deadlineAt - Date.now() >= PRICE_MIN_REMAINING_MS) {
        await wait(PRICE_ITEM_INTERVAL_MS);
      }
    }
    const retryKeys = summaries.flatMap((summary) => summary.results
      .filter((result) => result.status === "failed" || result.reason?.includes("次回へ延期")
        || result.reason?.includes("別処理が実行中"))
      .map((result) => productKey({ genre: summary.genre as CardGenre, id: result.productId })));
    const nextState = completeRotationBatch(lease.state, batch, retryKeys, new Date().toISOString());
    const cursorRevision = await commitRotationCursor(client, lease, nextState);
    committed = true;
    return { dryRun, concurrent: false, batchSize: PRICE_BATCH_SIZE, selectedProductIds,
      selectedProductKeys: batch.selectedKeys, summaries, elapsedMs: Date.now() - startedAt,
      nextCursor: nextState.nextProductKey, cursorRevision };
  } finally {
    if (!committed) await releaseRotationCursor(client, lease);
  }
}
