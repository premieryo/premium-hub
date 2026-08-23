import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { updateCardPrices } from "@/scripts/updateCardPrices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const startedAt = new Date().toISOString();
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[price-cron] CRON_SECRETが設定されていません。");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summaries = await updateCardPrices({ dryRun: false, useRunLease: true });
    for (const genre of ["pokemon", "onepiece", "dragonball"]) {
      revalidatePath(`/${genre}`);
      revalidatePath(`/${genre}/products`);
      revalidatePath(`/${genre}/ranking`);
    }
    const totals = summaries.reduce(
      (result, item) => ({
        total: result.total + item.total,
        succeeded: result.succeeded + item.succeeded,
        skipped: result.skipped + item.skipped,
        failed: result.failed + item.failed,
      }),
      { total: 0, succeeded: 0, skipped: 0, failed: 0 },
    );
    const response = { startedAt, finishedAt: new Date().toISOString(), ...totals, summaries };
    console.log("[price-cron]", JSON.stringify(response));
    return NextResponse.json(response, { status: totals.failed > 0 ? 207 : 200 });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[price-cron] failed:", reason);
    return NextResponse.json({ startedAt, finishedAt: new Date().toISOString(), error: reason }, { status: 500 });
  }
}
