import type { LotteryItem } from "@/data/types";

function externalUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.toString()
      : undefined;
  } catch { return undefined; }
}

export default function LotteryApplicationLinks({ item }: {
  item: Pick<LotteryItem, "officialUrl" | "applicationUrl" | "applicationType">;
}) {
  const officialUrl = externalUrl(item.officialUrl);
  const applicationUrl = externalUrl(item.applicationUrl);
  const web = item.applicationType === "online" || item.applicationType === "both";
  const app = item.applicationType === "app";
  const store = item.applicationType === "store";
  const officialLabel = app ? "アプリ応募の公式案内を確認" : store ? "店頭応募の公式案内を確認" : "公式情報・応募条件を確認";

  return <section aria-label="応募先と公式情報" className="mt-4 space-y-3">
    {officialUrl && <a href={officialUrl} target="_blank" rel="noopener noreferrer"
      className="flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-400/40 px-4 py-3 text-center text-sm font-bold text-blue-200 hover:bg-blue-400/10">
      {officialLabel} ↗
    </a>}
    {web && applicationUrl && <a href={applicationUrl} target="_blank" rel="noopener noreferrer"
      className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400">
      Web応募ページを開く ↗
    </a>}
    {app && applicationUrl && applicationUrl !== officialUrl && <a href={applicationUrl} target="_blank" rel="noopener noreferrer"
      className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400">
      アプリ応募の案内を確認 ↗
    </a>}
    {app && <p className="text-sm leading-relaxed text-slate-300">応募は公式案内に記載されたアプリ内で行ってください。</p>}
    {(store || item.applicationType === "both") && <p className="text-sm leading-relaxed text-slate-300">店頭応募の受付店舗・方法・条件は公式案内をご確認ください。</p>}
    {web && !applicationUrl && <p className="text-sm leading-relaxed text-slate-300">Web応募先のURLは確認中です。公式情報で応募方法をご確認ください。</p>}
    {!officialUrl && !(applicationUrl && (web || app)) && <p className="text-sm leading-relaxed text-slate-400">公式案内のリンクは確認中です。</p>}
  </section>;
}
