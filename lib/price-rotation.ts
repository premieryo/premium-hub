import type { Genre, Product } from "@/data/types";

export const PRICE_BATCH_SIZE = 5;
export const PRICE_ITEM_INTERVAL_MS = 1_100;
export const PRICE_RUN_BUDGET_MS = 52_000;
export const PRICE_MIN_REMAINING_MS = 12_000;
export const PRICE_ROTATION_VERSION = 1;
export const PRICE_CURSOR_KEY = "card-price-rotation";

export type CardGenre = Extract<Genre, "pokemon" | "onepiece" | "dragonball">;
export type RotationProduct = Pick<Product, "id" | "genre" | "releaseDate">;
export type PriceRotationState = {
  version: number;
  nextProductKey: string | null;
  queue: string[];
  retryProductKeys: string[];
  lastRunAt: string | null;
  lastBatchProductIds: string[];
  lease?: { id: string; expiresAt: string };
};

export type RotationBatch = {
  selectedKeys: string[];
  retrySelectedKeys: string[];
  reconciledQueue: string[];
};

const genreOrder: CardGenre[] = ["pokemon", "onepiece", "dragonball"];
export const productKey = (product: Pick<Product, "genre" | "id">) => `${product.genre}:${product.id}`;

export function createInitialRotationState(): PriceRotationState {
  return { version: PRICE_ROTATION_VERSION, nextProductKey: null, queue: [], retryProductKeys: [],
    lastRunAt: null, lastBatchProductIds: [] };
}

export function isRotationLeaseActive(state: PriceRotationState, now = Date.now()) {
  return Boolean(state.lease && Date.parse(state.lease.expiresAt) > now);
}

export function interleaveRotationProducts(products: RotationProduct[]) {
  const groups = new Map(genreOrder.map((genre) => [genre, products
    .filter((product) => product.genre === genre)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id))]));
  const result: string[] = [];
  for (let index = 0; result.length < products.length; index += 1) {
    for (const genre of genreOrder) {
      const product = groups.get(genre)?.[index];
      if (product) result.push(productKey(product));
    }
  }
  return result;
}

export function selectRotationBatch(
  state: PriceRotationState,
  products: RotationProduct[],
  batchSize = PRICE_BATCH_SIZE,
): RotationBatch {
  const eligible = interleaveRotationProducts(products);
  const eligibleSet = new Set(eligible);
  const existing = state.queue.filter((key, index, queue) => eligibleSet.has(key) && queue.indexOf(key) === index);
  const existingSet = new Set(existing);
  const reconciledQueue = [...existing, ...eligible.filter((key) => !existingSet.has(key))];
  const retries = state.retryProductKeys.filter((key, index, retry) =>
    eligibleSet.has(key) && retry.indexOf(key) === index);
  const selectedKeys = [...retries, ...reconciledQueue.filter((key) => !retries.includes(key))].slice(0, batchSize);
  return { selectedKeys, retrySelectedKeys: selectedKeys.filter((key) => retries.includes(key)), reconciledQueue };
}

export function completeRotationBatch(
  state: PriceRotationState,
  batch: RotationBatch,
  failedKeys: string[],
  finishedAt: string,
): PriceRotationState {
  const selected = new Set(batch.selectedKeys);
  const failed = new Set(failedKeys);
  const retrySelected = new Set(batch.retrySelectedKeys);
  const remaining = batch.reconciledQueue.filter((key) => !selected.has(key));
  const deferredFailures = batch.selectedKeys.filter((key) => failed.has(key) && !retrySelected.has(key));
  const rotated = batch.selectedKeys.filter((key) => !deferredFailures.includes(key));
  const queue = [...remaining, ...rotated];
  return {
    version: PRICE_ROTATION_VERSION,
    nextProductKey: deferredFailures[0] ?? queue[0] ?? null,
    queue,
    retryProductKeys: deferredFailures,
    lastRunAt: finishedAt,
    lastBatchProductIds: batch.selectedKeys.map((key) => key.slice(key.indexOf(":") + 1)),
  };
}
