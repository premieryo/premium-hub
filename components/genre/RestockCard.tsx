import type { RestockItem } from "@/data/types";

const tokyoDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatRestockDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const parts = Object.fromEntries(
    tokyoDateTimeFormatter.formatToParts(parsed).map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`;
}

const channelLabels: Record<NonNullable<RestockItem["channel"]>, string> = {
  online: "オンライン",
  store: "店頭",
};

export default function RestockCard({ item }: { item: RestockItem }) {
  const saleStart = item.saleStart ? formatRestockDateTime(item.saleStart) : item.date;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5">
      <h2 className="break-words text-lg font-black text-white sm:text-xl">{item.product}</h2>
      <p className="mt-1 break-words text-sm text-slate-300">{item.shop}</p>

      <span className="mt-3 inline-flex max-w-full break-words rounded-full bg-blue-400/15 px-3 py-1 text-center text-xs font-bold text-blue-200">
        {item.status}
      </span>

      <dl className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3 text-sm">
        {saleStart ? <Detail label="販売開始" value={saleStart} /> : null}
        {item.channel ? <Detail label="販売方法" value={channelLabels[item.channel]} /> : null}
        {item.region ? <Detail label="地域" value={item.region} /> : null}
        {item.quantityLimit ? <Detail label="購入制限" value={item.quantityLimit} /> : null}
      </dl>

      {item.officialUrl ? (
        <a
          href={item.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400"
        >
          公式サイトで販売情報を確認する ↗
        </a>
      ) : null}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <dt className="font-bold text-slate-400">{label}</dt>
      <dd className="min-w-0 break-words text-slate-100">{value}</dd>
    </div>
  );
}
