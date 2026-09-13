import { NextResponse } from "next/server";
import { fetchLotteryCandidates } from "@/lib/lottery-source-monitor";
import { lotterySources } from "@/lib/lottery-sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SOURCE_INTERVAL_MS = 300;
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function GET(request: Request) {
  const startedAt = new Date().toISOString();
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[lottery-monitor] CRON_SECRETが設定されていません。");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{
    sourceId: string;
    sourceName: string;
    policy: "auto" | "review";
    ok: boolean;
    candidates: Awaited<ReturnType<typeof fetchLotteryCandidates>>;
    error?: string;
  }> = [];

  for (const [index, source] of lotterySources.entries()) {
    try {
      const candidates = await fetchLotteryCandidates(source);
      results.push({ sourceId: source.id, sourceName: source.name, policy: source.policy, ok: true, candidates });
    } catch (error) {
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        policy: source.policy,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        candidates: [],
      });
    }
    if (index < lotterySources.length - 1) await wait(SOURCE_INTERVAL_MS);
  }

  const candidateCount = results.reduce((sum, result) => sum + result.candidates.length, 0);
  const failedSourceCount = results.filter((result) => !result.ok).length;
  const response = {
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: "read-only-discovery",
    sourceCount: results.length,
    failedSourceCount,
    candidateCount,
    results,
  };
  console.log("[lottery-monitor]", JSON.stringify(response));
  return NextResponse.json(response, { status: failedSourceCount > 0 ? 207 : 200 });
}
