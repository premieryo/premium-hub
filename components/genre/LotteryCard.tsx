import type { LotteryItem } from "@/data/types";

const tokyoDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatLotteryDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = Object.fromEntries(
    tokyoDateTimeFormatter.formatToParts(date).map(({ type, value: partValue }) => [type, partValue])
  );
  return `${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`;
}

const applicationTypeLabels: Record<NonNullable<LotteryItem["applicationType"]>, string> = {
  online: "オンライン",
  store: "店頭",
  both: "オンライン・店頭",
};

export function formatApplicationType(value: NonNullable<LotteryItem["applicationType"]>) {
  return applicationTypeLabels[value];
}

function DateDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
      <dt className="font-bold text-slate-400">{label}</dt>
      <dd className="min-w-0 break-words text-slate-100">{value}</dd>
    </div>
  );
}

export default function LotteryCard({ item }: { item: LotteryItem }) {
  const deadline = item.deadlineAt
    ? `${formatLotteryDateTime(item.deadlineAt)}まで`
    : item.deadline;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5">
      <h2 className="break-words text-lg font-black text-white sm:text-xl">
        {item.product}
      </h2>
      <p className="mt-1 break-words text-sm text-slate-300">{item.shop}</p>

      <span className="mt-3 inline-flex max-w-full break-words rounded-full bg-blue-400/15 px-3 py-1 text-center text-xs font-bold text-blue-200">
        {item.status}
      </span>

      {item.applicationType ? (
        <p className="mt-3 break-words text-sm text-slate-200">
          <span className="font-bold text-slate-400">応募方法：</span>
          {formatApplicationType(item.applicationType)}
        </p>
      ) : null}

      <dl className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3">
        {item.applicationStart ? (
          <DateDetail label="応募開始" value={formatLotteryDateTime(item.applicationStart)} />
        ) : null}
        {deadline ? <DateDetail label="応募締切" value={deadline} /> : null}
        {item.resultDate ? (
          <DateDetail label="当選発表" value={formatLotteryDateTime(item.resultDate)} />
        ) : null}
        {item.saleDate ? (
          <DateDetail label="販売・購入期間" value={formatLotteryDateTime(item.saleDate)} />
        ) : null}
      </dl>

      {item.applicationConditions ? (
        <section className="mt-4">
          <h3 className="text-sm font-bold text-slate-300">応募条件</h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100">
            {item.applicationConditions}
          </p>
        </section>
      ) : null}

      {item.notes ? (
        <section className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
          <h3 className="text-sm font-bold text-amber-200">注意事項</h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100">
            {item.notes}
          </p>
        </section>
      ) : null}

      {item.officialUrl ? (
        <a
          href={item.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400"
        >
          公式サイトで応募する ↗
        </a>
      ) : null}
    </article>
  );
}
