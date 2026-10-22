import assert from "node:assert/strict";
import test from "node:test";
import type { RankingItem } from "../data/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { previousPrice } from "../scripts/updateGenrePrices";

type Observation = { genre: string; product_id: string; source: string; price: number; fetched_at: string };
const productId = "story-booster-01-st01-box";
const observation = (source: string, price: number, fetched_at: string): Observation => ({ genre: "dragonball", product_id: productId, source, price, fetched_at });

// Exercise the actual query builder, including its database-side source filter.
function historyClient(rows: Observation[]) {
  const filters = new Map<string, unknown>();
  let descending = false;
  const query = {
    select() { return query; },
    eq(key: string, value: unknown) { filters.set(key, value); return query; },
    order(key: string, options: { ascending: boolean }) { assert.equal(key, "fetched_at"); descending = !options.ascending; return query; },
    limit(value: number) { assert.equal(value, 1); return query; },
    async maybeSingle() {
      assert.equal(filters.get("source"), "yahoo");
      assert.equal(filters.get("genre"), "dragonball");
      assert.equal(filters.get("product_id"), productId);
      assert.equal(descending, true);
      const eligible = rows.filter(row => [...filters].every(([key, value]) => row[key as keyof Observation] === value));
      eligible.sort((a, b) => b.fetched_at.localeCompare(a.fetched_at));
      return { data: eligible[0] ?? null, error: null };
    },
  };
  return { from(table: string) { assert.equal(table, "price_history"); return query; } } as unknown as SupabaseClient;
}

test("未検証13,500円と確定誤候補を前回比較へ再利用しない", async () => {
  const rows = [observation("yahoo", 10980, "2026-10-12"), observation("yahoo-unverified", 13500, "2026-10-20"), observation("yahoo-rejected", 1180, "2026-10-21")];
  const before = structuredClone(rows);
  assert.equal(await previousPrice(historyClient(rows), "dragonball", productId, undefined, 10800), 10980);
  assert.deepEqual(rows, before);
});

test("未検証履歴しかなければ安全な新候補を比較基準にし、架空の変動を作らない", async () => {
  const previous = await previousPrice(historyClient([observation("yahoo-unverified", 13500, "2026-10-02")]), "dragonball", productId, undefined, 10980);
  assert.equal(previous, 10980);
  assert.equal(10980 - previous, 0);
});

test("ST01既存ランキングの検証済み現在価格を維持し、13,500円を使わない", async () => {
  const client = { from() { throw new Error("ランキング現在値があれば履歴読込は不要"); } } as unknown as SupabaseClient;
  assert.equal(await previousPrice(client, "dragonball", productId, { id: productId, currentPrice: 10980 } as RankingItem, 10800), 10980);
});
