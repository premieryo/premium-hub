import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { adminResources, type AdminItem } from "../lib/admin-data";
import { genres } from "../data/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) throw new Error("NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SECRET_KEYが必要です。");
if (secretKey.startsWith("sb_publishable_") || secretKey === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("SUPABASE_SECRET_KEYにPublishable keyが設定されています。Secret keyを設定してください。");
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function main() {
  let total = 0;
  for (const genre of genres) {
    for (const resource of adminResources) {
      const path = join(process.cwd(), "data", genre, `${resource}.json`);
      const items = JSON.parse(readFileSync(path, "utf8")) as AdminItem[];
      if (!items.length) continue;
      const rows = items.map((item) => ({ genre, resource, item_id: item.id, data: { ...item, genre } }));
      const { error } = await supabase.from("content_items").upsert(rows, { onConflict: "genre,resource,item_id" });
      if (error) throw new Error(`[${genre}/${resource}] ${error.message}`);
      total += rows.length;
      console.log(`✓ ${genre}/${resource}: ${rows.length}件`);
    }
  }
  console.log(`移行完了: 合計${total}件`);
}

main().catch((error) => {
  console.error("JSON移行に失敗しました。", error);
  process.exitCode = 1;
});
