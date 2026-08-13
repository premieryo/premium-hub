import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Genre } from "@/data/types";
import type { AdminItem, AdminResource } from "./admin-data";

export async function readAdminItems(client: SupabaseClient, genre: Genre, resource: AdminResource) {
  const { data, error } = await client
    .from("content_items")
    .select("data")
    .eq("genre", genre)
    .eq("resource", resource)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`DBの読み込みに失敗しました: ${error.message}`);
  return (data ?? []).map((row) => row.data as AdminItem);
}

export async function createAdminItem(client: SupabaseClient, genre: Genre, resource: AdminResource, item: AdminItem) {
  const { error } = await client.from("content_items").insert({ genre, resource, item_id: item.id, data: item });
  if (error) throw new Error(error.code === "23505" ? "同じIDが既に存在します。" : `DBへの追加に失敗しました: ${error.message}`);
}

export async function updateAdminItem(client: SupabaseClient, genre: Genre, resource: AdminResource, originalId: string, item: AdminItem) {
  const { data, error } = await client.from("content_items").update({ item_id: item.id, data: item, updated_at: new Date().toISOString() })
    .eq("genre", genre).eq("resource", resource).eq("item_id", originalId).select("item_id");
  if (error) throw new Error(error.code === "23505" ? "同じIDが既に存在します。" : `DBの更新に失敗しました: ${error.message}`);
  if (!data?.length) throw new Error("更新対象が見つからないか、更新権限がありません。");
}

export async function deleteAdminItem(client: SupabaseClient, genre: Genre, resource: AdminResource, id: string) {
  const { data, error } = await client.from("content_items").delete().eq("genre", genre).eq("resource", resource).eq("item_id", id).select("item_id");
  if (error) throw new Error(`DBからの削除に失敗しました: ${error.message}`);
  if (!data?.length) throw new Error("削除対象が見つからないか、削除権限がありません。");
}
