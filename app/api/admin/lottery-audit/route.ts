import { NextResponse } from "next/server";
import { genres } from "@/data/types";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminItem, readAdminItems } from "@/lib/admin-storage";
import { processLotteryAudit } from "@/lib/lottery-audit-service";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "別サイトからの操作は受け付けません。" }, { status: 403 });
  const auth = await getAdminSession();
  if (!auth.user) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  try {
    const text = await request.text();
    if (text.length > 100000) return NextResponse.json({ error: "入力は100KB以内にしてください。" }, { status: 413 });
    const result = await processLotteryAudit(JSON.parse(text), auth.user.id, {
      enabled: process.env.LOTTERY_AUDIT_IMPORT_ENABLED === "true",
      read: async () => (await Promise.all(genres.map(genre => readAdminItems(auth.supabase, genre, "lottery")))).flat(),
      create: item => createAdminItem(auth.supabase, item.genre, "lottery", item),
    });
    // A pending insert does not invalidate or publish any public page.
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "取り込みを検証できませんでした。" }, { status: 400 });
  }
}
