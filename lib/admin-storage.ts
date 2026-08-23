import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Genre } from "@/data/types";
import { adminResourceConfig, type AdminItem, type AdminResource } from "./admin-data";
import { buildInformationDedupKey, type InformationResource } from "./information-moderation";

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
  const { data: existing, error: readError } = await client.from("content_items").select("data")
    .eq("genre", genre).eq("resource", resource).eq("item_id", originalId).maybeSingle();
  if (readError) throw new Error(`DBの読み込みに失敗しました: ${readError.message}`);
  if (!existing) throw new Error("更新対象が見つかりません。");

  const merged = { ...(existing.data as AdminItem) };
  for (const field of adminResourceConfig[resource].fields) delete merged[field.name];
  Object.assign(merged, item, { id: item.id, genre });
  delete merged.resource;
  delete merged.item_id;

  const { data, error } = await client.from("content_items").update({ item_id: item.id, data: merged, updated_at: new Date().toISOString() })
    .eq("genre", genre).eq("resource", resource).eq("item_id", originalId).select("item_id");
  if (error) throw new Error(error.code === "23505" ? "同じIDが既に存在します。" : `DBの更新に失敗しました: ${error.message}`);
  if (!data?.length) throw new Error("更新対象が見つからないか、更新権限がありません。");
  return merged;
}

export async function productReferenceExists(client: SupabaseClient, genre: Genre, productId: string) {
  const { data, error } = await client.from("content_items").select("item_id")
    .eq("genre", genre).eq("resource", "products").eq("item_id", productId).maybeSingle();
  if (error) throw new Error(`商品マスタの確認に失敗しました: ${error.message}`);
  return Boolean(data);
}

export async function informationDuplicateExists(client: SupabaseClient, genre: Genre, resource: InformationResource, item: AdminItem, excludeId?: string) {
  const target = buildInformationDedupKey(genre, resource, item);
  const items = await readAdminItems(client, genre, resource);
  return items.some((existing) => existing.id !== excludeId
    && buildInformationDedupKey(genre, resource, existing) === target);
}

export async function updateInformationPublicationStatus(client: SupabaseClient, genre: Genre, resource: InformationResource, id: string, publicationStatus: "approved" | "rejected") {
  const { data: existing, error: readError } = await client.from("content_items").select("data")
    .eq("genre", genre).eq("resource", resource).eq("item_id", id).maybeSingle();
  if (readError) throw new Error(`DBの読み込みに失敗しました: ${readError.message}`);
  if (!existing) throw new Error("候補が見つかりません。");
  const current = existing.data as AdminItem;
  if (publicationStatus === "approved") {
    const exactDate = resource === "lottery" ? current.deadlineAt : current.saleStart;
    if (!current.officialUrl || !exactDate) throw new Error("公式URLと正確な締切/開始日時を確認してから承認してください。");
  }
  const saved = { ...current, publicationStatus, reviewedAt: new Date().toISOString() };
  const { data, error } = await client.from("content_items").update({ data: saved, updated_at: new Date().toISOString() })
    .eq("genre", genre).eq("resource", resource).eq("item_id", id).select("item_id");
  if (error) throw new Error(`承認状態の更新に失敗しました: ${error.message}`);
  if (!data?.length) throw new Error("候補が見つからないか、更新権限がありません。");
  return saved;
}

export async function deleteAdminItem(client: SupabaseClient, genre: Genre, resource: AdminResource, id: string) {
  const { data, error } = await client.from("content_items").delete().eq("genre", genre).eq("resource", resource).eq("item_id", id).select("item_id");
  if (error) throw new Error(`DBからの削除に失敗しました: ${error.message}`);
  if (!data?.length) throw new Error("削除対象が見つからないか、削除権限がありません。");
}
