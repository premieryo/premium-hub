import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Genre } from "@/data/types";
import { getAdminSession } from "@/lib/admin-auth";
import { isGenre } from "@/lib/genres";
import { isAdminResource, validateAdminItem, type AdminItem } from "@/lib/admin-data";
import { createAdminItem, deleteAdminItem, informationDuplicateExists, productReferenceExists, readAdminItems, updateAdminItem, updateInformationPublicationStatus } from "@/lib/admin-storage";
import { prepareInformationItem, type InformationResource } from "@/lib/information-moderation";

type Context = { params: Promise<{ genre: string; resource: string }> };
const failure = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

async function requestContext(context: Context) {
  const { genre, resource } = await context.params;
  if (!isGenre(genre) || !isAdminResource(resource)) return { error: failure("ジャンルまたは管理項目が不正です。", 404) };
  const auth = await getAdminSession();
  if (!auth.user) return { error: failure("ログインが必要です。", 401) };
  if (!auth.isAdmin) return { error: failure("管理者権限がありません。", 403) };
  return { genre, resource, supabase: auth.supabase };
}

function revalidate(genre: string, resource: string) {
  revalidatePath("/");
  revalidatePath(`/${genre}`);
  revalidatePath(`/${genre}/${resource}`);
}

async function validateProductReference(client: SupabaseClient, genre: Genre, item: Record<string, unknown>) {
  if (!item.productId) return null;
  return await productReferenceExists(client, genre, String(item.productId))
    ? null
    : failure("選択した商品マスタが同じジャンルに存在しません。");
}

async function prepareInformation(client: SupabaseClient, genre: Genre, resource: InformationResource, item: AdminItem, excludeId?: string) {
  const prepared = prepareInformationItem(genre, resource, item);
  if (prepared.publicationStatus === "pending") {
    const exactDate = resource === "lottery" ? prepared.deadlineAt : prepared.saleStart;
    if (!prepared.officialUrl || !prepared.source || !prepared.fetchedAt || !exactDate) {
      return { error: failure("自動取得候補には公式URL・情報源・取得日時・正確な締切/開始日時が必要です。") };
    }
  }
  if (await informationDuplicateExists(client, genre, resource, prepared, excludeId)) {
    return { error: failure("同じ抽選・再販情報が既に存在します。") };
  }
  return { item: prepared };
}

export async function GET(_request: Request, context: Context) {
  try {
    const scope = await requestContext(context);
    if (scope.error) return scope.error;
    return NextResponse.json(await readAdminItems(scope.supabase, scope.genre!, scope.resource!));
  } catch (error) { return failure(error instanceof Error ? error.message : "DBの読み込みに失敗しました。", 500); }
}

export async function POST(request: Request, context: Context) {
  try {
    const scope = await requestContext(context);
    if (scope.error) return scope.error;
    const validation = validateAdminItem(scope.resource!, await request.json(), scope.genre!);
    if (!validation.item) return failure(validation.error ?? "入力内容を確認してください。");
    if (scope.resource === "lottery" || scope.resource === "restock") {
      if (scope.resource === "lottery") validation.item.observedAt ||= new Date().toISOString();
      const referenceError = await validateProductReference(scope.supabase!, scope.genre!, validation.item);
      if (referenceError) return referenceError;
      const prepared = await prepareInformation(scope.supabase!, scope.genre!, scope.resource, validation.item);
      if (!prepared.item) return prepared.error;
      validation.item = prepared.item;
    }
    await createAdminItem(scope.supabase, scope.genre!, scope.resource!, validation.item);
    revalidate(scope.genre!, scope.resource!);
    return NextResponse.json(validation.item, { status: 201 });
  } catch (error) { return failure(error instanceof Error ? error.message : "DBへの追加に失敗しました。", 500); }
}

export async function PUT(request: Request, context: Context) {
  try {
    const scope = await requestContext(context);
    if (scope.error) return scope.error;
    const body = await request.json() as { originalId?: string; item?: unknown };
    const validation = validateAdminItem(scope.resource!, body.item, scope.genre!);
    if (!body.originalId || !validation.item) return failure(validation.error ?? "更新対象が不正です。");
    if (scope.resource === "lottery" || scope.resource === "restock") {
      const referenceError = await validateProductReference(scope.supabase!, scope.genre!, validation.item);
      if (referenceError) return referenceError;
      const prepared = await prepareInformation(scope.supabase!, scope.genre!, scope.resource, validation.item, body.originalId);
      if (!prepared.item) return prepared.error;
      validation.item = prepared.item;
    }
    const saved = await updateAdminItem(scope.supabase, scope.genre!, scope.resource!, body.originalId, validation.item);
    revalidate(scope.genre!, scope.resource!);
    return NextResponse.json(saved);
  } catch (error) { return failure(error instanceof Error ? error.message : "DBの更新に失敗しました。", 500); }
}


export async function PATCH(request: Request, context: Context) {
  try {
    const scope = await requestContext(context);
    if (scope.error) return scope.error;
    if (scope.resource !== "lottery" && scope.resource !== "restock") return failure("この項目は承認操作に対応していません。", 404);
    const body = await request.json() as { id?: string; action?: string };
    if (!body.id || (body.action !== "approve" && body.action !== "reject")) return failure("承認操作が不正です。");
    const saved = await updateInformationPublicationStatus(scope.supabase!, scope.genre!, scope.resource, body.id, body.action === "approve" ? "approved" : "rejected");
    revalidate(scope.genre!, scope.resource!);
    return NextResponse.json(saved);
  } catch (error) { return failure(error instanceof Error ? error.message : "承認状態の更新に失敗しました。", 500); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const scope = await requestContext(context);
    if (scope.error) return scope.error;
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return failure("削除対象IDがありません。");
    await deleteAdminItem(scope.supabase, scope.genre!, scope.resource!, id);
    revalidate(scope.genre!, scope.resource!);
    return NextResponse.json({ deleted: id });
  } catch (error) { return failure(error instanceof Error ? error.message : "DBからの削除に失敗しました。", 500); }
}
