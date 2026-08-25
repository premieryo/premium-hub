import { updateCardPrices } from "./updateCardPrices";

async function main() {
  const apply = process.argv.includes("--apply");
  const allowExistingToday = process.argv.includes("--force-today");
  const run = await updateCardPrices({ dryRun: !apply, useRunLease: apply, allowExistingToday });
  const summaries = run.summaries;
  const total = summaries.reduce((sum, item) => sum + item.total, 0);
  const succeeded = summaries.reduce((sum, item) => sum + item.succeeded, 0);
  const skipped = summaries.reduce((sum, item) => sum + item.skipped, 0);
  const failed = summaries.reduce((sum, item) => sum + item.failed, 0);
  console.log(`\n[ALL] 対象${total} / 成功${succeeded} / skip${skipped} / 失敗${failed}`);
  console.log(JSON.stringify({ batchSize: run.batchSize, selectedProductIds: run.selectedProductIds,
    elapsedMs: run.elapsedMs, nextCursor: run.nextCursor, cursorRevision: run.cursorRevision,
    concurrent: run.concurrent }));
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
