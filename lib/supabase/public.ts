import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

export function createPublicClient() {
  const { url, key } = getSupabasePublicEnv();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Public content is already refreshed explicitly after cron/admin writes.
      // Avoid caching Supabase REST responses here so newly saved product images
      // and other content are visible on the next page render.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
