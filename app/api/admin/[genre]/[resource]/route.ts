import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { isGenre } from "@/lib/genres";
import { isAdminResource, validateAdminItem } from "@/lib/admin-data";
import { createAdminItem, deleteAdminItem, readAdminItems, updateAdminItem } from "@/lib/admin-storage";

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
  revalidatePath(`/${genre}`);
  revalidatePath(`/${genre}/${resource}`);
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
    await updateAdminItem(scope.supabase, scope.genre!, scope.resource!, body.originalId, validation.item);
    revalidate(scope.genre!, scope.resource!);
    return NextResponse.json(validation.item);
  } catch (error) { return failure(error instanceof Error ? error.message : "DBの更新に失敗しました。", 500); }
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
