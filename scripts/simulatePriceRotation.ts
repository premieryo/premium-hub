import { createClient } from "@supabase/supabase-js";
import type { Product } from "../data/types";
import { selectPriceTrackingProducts } from "../lib/price-tracking";
import { completeRotationBatch, createInitialRotationState, selectRotationBatch } from "../lib/price-rotation";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Supabase credentials are required");
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await db.from("content_items").select("data").eq("resource", "products")
    .in("genre", ["pokemon", "onepiece", "dragonball"]);
  if (result.error) throw result.error;
  const products = result.data.map((row) => row.data as Product);
  const eligible = (["pokemon", "onepiece", "dragonball"] as const)
    .flatMap((genre) => selectPriceTrackingProducts(genre, products));
  let state = createInitialRotationState();
  const selected = new Set<string>();
  for (let run = 1; run <= Math.ceil(eligible.length / 5); run += 1) {
    const batch = selectRotationBatch(state, eligible);
    console.log(JSON.stringify({ run, selected: batch.selectedKeys }));
    batch.selectedKeys.forEach((key) => selected.add(key));
    state = completeRotationBatch(state, batch, [], new Date().toISOString());
  }
  console.log(JSON.stringify({ tracking: eligible.length, selectedUnique: selected.size,
    yahooCalls: 0, dbWrites: 0, nextCursor: state.nextProductKey }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
