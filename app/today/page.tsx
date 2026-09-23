import type { Metadata } from "next";
import Link from "next/link";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";
import { genres, type LotteryItem, type RestockItem } from "@/data/types";
import { getGenreContext } from "@/lib/genres";

export const metadata: Metadata = {
  title: "今日のトレカ情報｜抽選締切・相場・再販｜プレミア速報",
  description: "今日締切の抽選、相場上昇中の商品、新着再販情報をトレカ・ホビーの各ジャンルからまとめて確認できます。",
  alternates: { canonical: "/today" },
};

export const dynamic = "force-dynamic";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function isToday(item: LotteryItem, key: string) {
  if (item.deadlineAt) {
    const deadline = new Date(item.deadlineAt);
    return !Number.isNaN(deadline.getTime()) && dayFormatter.format(deadline) === key;
  }
  return /本日|今日/.test(item.deadline);
}

function restockTime(item: RestockItem) {
  const value = item.restockAt ?? item.saleStart;
  if (value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const parsed = Date.parse(item.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function yen(value?: number) {
  return typeof value === "number" ? `${value.toLocaleString("ja-JP")}円` : null;
}

export default async function Today() {
  const contexts = (await Promise.all(genres.map((genre) => getGenreContext(genre)))).flatMap((context) =>
    context ? [context] : [],
  );
  const todayKey = dayFormatter.format(new Date());

  const lotteries = contexts
    .flatMap(({ config, data }) =>
      data.lottery
        .filter((item) => isToday(item, todayKey))
        .map((item) => ({ ...item, genreName: config.name, genreSlug: config.slug })),
    )
    .sort((a, b) => {
      const aTime = a.deadlineAt ? Date.parse(a.deadlineAt) : Number.MAX_SAFE_INTEGER;
      const bTime = b.deadlineAt ? Date.parse(b.deadlineAt) : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const movers = contexts
    .flatMap(({ config, data }) =>
      data.ranking
        .filter((item) => (item.changeAmount ?? 0) > 0 || (item.changeRate ?? 0) > 0)
        .map((item) => ({ ...item, genreName: config.name, genreSlug: config.slug })),
    )
    .sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0) || (b.changeAmount ?? 0) - (a.changeAmount ?? 0));

  const restocks = contexts
    .flatMap(({ config, data }) =>
      data.restock.map((item) => ({ ...item, genreName: config.name, genreSlug: config.slug })),
    )
    .sort((a, b) => restockTime(b) - restockTime(a));

  const summaryCards = [
    { href: "/lottery", label: "今日締切の抽選", value: lotteries.length, icon: "◎" },
    { href: "/ranking", label: "相場上昇中", value: movers.length, icon: "↗" },
    { href: "/restock", label: "新着再販情報", value: restocks.length, icon: "↻" },
  ];

  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <TopNavigation />
        <div className="mt-5"><AffiliateDisclosure /></div>

        <header className="mt-8">
          <p className="text-xs font-black tracking-[.2em] text-blue-400">TODAY&apos;S SIGNAL</p>
          <h1 className="mt-2 text-3xl font-black">今日の注目</h1>
          <p className="mt-3 text-slate-300">件数だけでなく、いま確認したい情報をこのページだけで見られるようにまとめています。</p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-2xl border border-blue-400/25 bg-[#09152c] p-5 transition hover:border-blue-300">
              <div className="flex justify-between"><span className="font-bold text-slate-300">{card.label}</span><span className="text-blue-400">{card.icon}</span></div>
              <p className="mt-4 text-4xl font-black text-sky-300">{card.value}<span className="ml-1 text-sm text-slate-400">件</span></p>
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-black tracking-[.16em] text-orange-300">LOTTERY</p><h2 className="mt-1 text-2xl font-black">今日締切の抽選</h2></div>
            <Link href="/lottery" className="text-sm font-bold text-blue-300">すべて見る →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lotteries.length === 0 ? <p className="rounded-2xl border border-slate-800 bg-[#09152c] p-5 text-sm text-slate-400 sm:col-span-2">現在、今日締切として確認できる抽選はありません。</p> : lotteries.slice(0, 6).map((item) => (
              <Link key={`${item.genreSlug}-${item.id}`} href={`/${item.genreSlug}/lottery`} className="rounded-2xl border border-orange-400/20 bg-[#09152c] p-5 transition hover:border-orange-300">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-orange-400/10 px-2 py-1 text-orange-200">{item.genreName}</span><span className="text-slate-400">{item.shop}</span></div>
                <h3 className="mt-3 font-black leading-6">{item.product}</h3>
                <p className="mt-3 text-sm font-bold text-orange-200">締切：{item.deadline}</p>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-black tracking-[.16em] text-emerald-300">MARKET</p><h2 className="mt-1 text-2xl font-black">相場上昇中</h2></div>
            <Link href="/ranking" className="text-sm font-bold text-blue-300">すべて見る →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {movers.length === 0 ? <p className="rounded-2xl border border-slate-800 bg-[#09152c] p-5 text-sm text-slate-400 sm:col-span-2">現在、上昇中として表示できる商品はありません。</p> : movers.slice(0, 6).map((item) => (
              <Link key={`${item.genreSlug}-${item.id}`} href={`/${item.genreSlug}/ranking`} className="rounded-2xl border border-emerald-400/20 bg-[#09152c] p-5 transition hover:border-emerald-300">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-200">{item.genreName}</span><span className="text-slate-400">{item.shop}</span></div>
                <h3 className="mt-3 font-black leading-6">{item.product}</h3>
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="text-lg font-black text-white">{yen(item.currentPrice ?? item.marketPrice) ?? item.price}</span>
                  {typeof item.changeRate === "number" && <span className="font-black text-emerald-300">+{item.changeRate.toFixed(1)}%</span>}
                  {typeof item.changeAmount === "number" && item.changeAmount > 0 && <span className="text-sm text-emerald-200">+{item.changeAmount.toLocaleString("ja-JP")}円</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-black tracking-[.16em] text-sky-300">RESTOCK</p><h2 className="mt-1 text-2xl font-black">新着再販情報</h2></div>
            <Link href="/restock" className="text-sm font-bold text-blue-300">すべて見る →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {restocks.length === 0 ? <p className="rounded-2xl border border-slate-800 bg-[#09152c] p-5 text-sm text-slate-400 sm:col-span-2">現在、表示できる再販情報はありません。</p> : restocks.slice(0, 6).map((item) => (
              <Link key={`${item.genreSlug}-${item.id}`} href={`/${item.genreSlug}/restock`} className="rounded-2xl border border-sky-400/20 bg-[#09152c] p-5 transition hover:border-sky-300">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-sky-400/10 px-2 py-1 text-sky-200">{item.genreName}</span><span className="text-slate-400">{item.shop}</span></div>
                <h3 className="mt-3 font-black leading-6">{item.product}</h3>
                <p className="mt-3 text-sm font-bold text-sky-200">{item.date}</p>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
