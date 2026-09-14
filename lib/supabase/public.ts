import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

export function createPublicClient() {
  const { url, key } = getSupabasePublicEnv();

  // Keep the server-side public client intentionally minimal. In particular,
  // do not override Supabase's global fetch implementation during Next.js
  // prerendering: Vercel's build runtime can wrap fetch differently from the
  // local/GitHub Actions runtime, and the public reads already have a JSON
  // fallback in getGenreContext when Supabase is unavailable.
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
