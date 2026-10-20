import { createHash } from "node:crypto";
import type { AdminItem } from "./admin-data";
import { previewLotteryAudit } from "./lottery-audit-import";

export type AuditDependencies = {
  read: () => Promise<AdminItem[]>;
  create: (item: AdminItem) => Promise<void>;
  now?: () => Date;
  enabled: boolean;
};
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export async function processLotteryAudit(body: { action?: unknown; candidates?: unknown; fingerprint?: unknown; index?: unknown }, actor: string, deps: AuditDependencies) {
  if (body.action !== "preview" && body.action !== "save") throw new Error("検証または承認待ち保存を選んでください。");
  const results = previewLotteryAudit(body.candidates, await deps.read(), deps.now?.() ?? new Date());
  const fingerprint = digest(results);
  if (body.action === "preview") return { results, fingerprint, saved: false };
  if (!deps.enabled) throw new Error("現在は検証専用です。非公開権限の適用・検証後に保存を有効にしてください。");
  if (body.fingerprint !== fingerprint) throw new Error("入力・既存情報・締切状態が変わりました。再検証して差分を確認してください。");
  const row = results.find(result => result.index === body.index);
  if (!row?.eligible || !row.item) throw new Error("除外または重複候補は保存できません。");
  const item = { ...row.item, id: `audit-${digest(row.item.dedupKey).slice(0, 32)}`, publicationStatus: "pending", importedBy: actor, importedAt: (deps.now?.() ?? new Date()).toISOString() } satisfies AdminItem;
  await deps.create(item);
  return { results, fingerprint, saved: true, item };
}
