import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRICE_CURSOR_KEY, createInitialRotationState, isRotationLeaseActive, type PriceRotationState } from "../lib/price-rotation";

const LEASE_MS = 15 * 60_000;
export type CursorLease = { state: PriceRotationState; revision: number; leaseId: string };

function isState(value: unknown): value is PriceRotationState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Partial<PriceRotationState>;
  return typeof state.version === "number" && Array.isArray(state.queue)
    && Array.isArray(state.retryProductKeys) && Array.isArray(state.lastBatchProductIds);
}

export async function readRotationCursor(client: SupabaseClient) {
  const result = await client.from("cron_state").select("state,revision").eq("key", PRICE_CURSOR_KEY).maybeSingle();
  if (result.error) throw new Error(`cursor読込失敗: ${result.error.message}`);
  if (!result.data) return { state: createInitialRotationState(), revision: 0, exists: false };
  if (!isState(result.data.state)) throw new Error("cursor形式が不正です。");
  return { state: result.data.state, revision: result.data.revision as number, exists: true };
}

export async function acquireRotationCursor(client: SupabaseClient): Promise<CursorLease | null> {
  const current = await readRotationCursor(client);
  if (isRotationLeaseActive(current.state)) return null;
  const leaseId = randomUUID();
  const state = { ...current.state, lease: { id: leaseId, expiresAt: new Date(Date.now() + LEASE_MS).toISOString() } };
  if (!current.exists) {
    const inserted = await client.from("cron_state").insert({ key: PRICE_CURSOR_KEY, state, revision: 1 }).select("revision").single();
    if (inserted.error) {
      if (inserted.error.code === "23505") return null;
      throw new Error(`cursor初期化失敗: ${inserted.error.message}`);
    }
    return { state, revision: inserted.data.revision as number, leaseId };
  }
  const updated = await client.from("cron_state").update({ state, revision: current.revision + 1, updated_at: new Date().toISOString() })
    .eq("key", PRICE_CURSOR_KEY).eq("revision", current.revision).select("revision");
  if (updated.error) throw new Error(`cursor lease取得失敗: ${updated.error.message}`);
  if (updated.data.length !== 1) return null;
  return { state, revision: current.revision + 1, leaseId };
}

export async function commitRotationCursor(
  client: SupabaseClient, lease: CursorLease, state: PriceRotationState,
) {
  const saved = await client.from("cron_state").update({ state, revision: lease.revision + 1, updated_at: new Date().toISOString() })
    .eq("key", PRICE_CURSOR_KEY).eq("revision", lease.revision)
    .contains("state", { lease: { id: lease.leaseId } }).select("revision");
  if (saved.error) throw new Error(`cursor更新失敗: ${saved.error.message}`);
  if (saved.data.length !== 1) throw new Error("cursor競合を検出しました。");
  return saved.data[0].revision as number;
}

export async function releaseRotationCursor(client: SupabaseClient, lease: CursorLease) {
  const current = await readRotationCursor(client);
  if (current.state.lease?.id !== lease.leaseId) return;
  const { lease: _lease, ...state } = current.state;
  void _lease;
  const released = await client.from("cron_state").update({ state, revision: current.revision + 1, updated_at: new Date().toISOString() })
    .eq("key", PRICE_CURSOR_KEY).eq("revision", current.revision).select("revision");
  if (released.error) throw new Error(`cursor lease解放失敗: ${released.error.message}`);
}
