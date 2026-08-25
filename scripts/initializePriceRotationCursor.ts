import assert from "node:assert/strict";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../data/types";
import { PRICE_CURSOR_KEY, createInitialRotationState } from "../lib/price-rotation";

async function snapshot(db: SupabaseClient) {
  const [content, history] = await Promise.all([
    db.from("content_items").select("resource,data").in("genre", ["pokemon", "onepiece", "dragonball"])
      .in("resource", ["products", "ranking"]),
    db.from("price_history").select("id", { count: "exact", head: true }),
  ]);
  if (content.error || history.error) throw content.error ?? history.error;
  const rows = content.data as { resource: string; data: Product }[];
  return { products: rows.filter((row) => row.resource === "products").length,
    tracking: rows.filter((row) => row.resource === "products"
      && (row.data as Product).priceTrackingEnabled === true).length,
    ranking: rows.filter((row) => row.resource === "ranking").length,
    history: history.count ?? 0 };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Supabase credentials are required");
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const before = await snapshot(db);
  const existing = await db.from("cron_state").select("key,state,revision").eq("key", PRICE_CURSOR_KEY).maybeSingle();
  if (existing.error) throw existing.error;
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ dryRun: true, cursorExists: Boolean(existing.data), before, dbWrites: 0 }));
    return;
  }
  if (existing.data) throw new Error("cursorは既に初期化済みです。再実行しません。");
  const inserted = await db.from("cron_state").insert({ key: PRICE_CURSOR_KEY,
    state: createInitialRotationState(), revision: 0 }).select("key,state,revision").single();
  if (inserted.error) throw inserted.error;
  const after = await snapshot(db);
  assert.deepEqual(after, before);
  console.log(JSON.stringify({ dryRun: false, cursor: inserted.data, before, after, dbWrites: 1 }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
