import type { Metadata } from "next";
import Link from "next/link";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { genreConfigs } from "@/data/genre-config";
import { genres, type LotteryItem } from "@/data/types";
import { getGenreContext } from "@/lib/genres";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const primarySections = [
  {
    label: "抽選情報",
    description: "応募できる抽選と締切をまとめて確認",
    icon: "◎",
    href: "/pokemon/lottery",
  },
  {
    label: "現在相場",
    description: "前回価格との比較から値動きをチェック",
    icon: "↗",
    href: "/pokemon/ranking",
  },
  {
    label: "再販情報",
    description: "販売予定や再入荷の情報を見逃さない",
    icon: "↻",
    href: "/pokemon/restock",
  },
];

const tokyoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getTokyoDateKey(date: Date) {
  return tokyoDateFormatter.format(date);
}

function isToday(deadline: LotteryItem, today: string) {
  if (deadline.deadlineAt) {
    const date = new Date(deadline.deadlineAt);
    return !Number.isNaN(date.getTime()) && getTokyoDateKey(date) === today;
  }

  return /本日|今日/.test(deadline.deadline);
}

export default async function HomePage() {
  const contexts = await Promise.all(genres.map((genre) => getGenreContext(genre)));
  const data = contexts.flatMap((context) => (context ? [context.data] : []));
  const today = getTokyoDateKey(new Date());

  const metrics = [
    {
      label: "今日締切の抽選",
      value: data.reduce(
        (count, genre) => count + genre.lottery.filter((item) => isToday(item, today)).length,
        0,
      ),
      unit: "件",
      accent: "text-orange-300",
      icon: "◎",
    },
    {
      label: "相場上昇中",
      value: data.reduce(
        (count, genre) =>
          count +
          genre.ranking.filter(
            (item) => (item.changeAmount ?? 0) > 0 || (item.changeRate ?? 0) > 0,
          ).length,
        0,
      ),
      unit: "件",
      accent: "text-sky-300",
      icon: "↗",
    },
    {
      label: "新着再販情報",
      value: data.reduce((count, genre) => count + genre.restock.length, 0),
      unit: "件",
      accent: "text-blue-300",
      icon: "↻",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050b18] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_75%_12%,rgba(37,99,235,0.22),transparent_32%),radial-gradient(circle_at_15%_5%,rgba(14,165,233,0.12),transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-blue-400/15 pb-5">
          <Link href="/" className="text-xs font-black tracking-[0.28em] text-blue-300 sm:text-sm">
            PREMIUM HUB
          </Link>
          <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-200">
            HOBBY MARKET GUIDE
          </span>
        </header>

        <AffiliateDisclosure />

        <section className="py-10 sm:py-14 lg:grid lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-12 lg:py-20">
          <div>
            <p
              className="text-lg font-black tracking-[0.2em] text-blue-400 sm:text-xl"
              style={{
                fontFamily:
                  '"Hiragino Kaku Gothic ProN", "Yu Gothic", "YuGothic", Meiryo, sans-serif',
                WebkitTextStroke: "0.35px currentColor",
              }}
            >
              プレミア速報
            </p>
            <h1 className="mt-4 text-[2.7rem] font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
              当たった後、
              <br />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                迷わない。
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] font-medium leading-7 text-slate-300 sm:text-lg sm:leading-8">
              抽選情報、現在相場、売却先、手数料、梱包、発送まで。
              <br className="hidden sm:block" />
              プレミア商品を手に入れた後の行動を、初心者にも分かりやすく案内します。
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link
                href="#today"
                className="inline-flex min-h-13 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3.5 text-sm font-black shadow-[0_12px_35px_rgba(239,68,68,0.25)] transition hover:brightness-110"
              >
                今日の注目を見る
                <span className="ml-2" aria-hidden="true">↓</span>
              </Link>
              <Link
                href="/pokemon/guide"
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-950/40 px-6 py-3.5 text-sm font-bold text-blue-100 transition hover:border-blue-300 hover:bg-blue-900/50"
              >
                初心者ガイド
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 hidden rounded-3xl border border-blue-400/20 bg-blue-950/25 p-6 lg:block">
            <p className="text-xs font-bold tracking-[0.18em] text-blue-400">START HERE</p>
            <p className="mt-3 text-2xl font-black leading-snug">手に入れる前も、<br />手に入れた後も。</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">抽選から売却まで、次に見るべき情報へ迷わず進めます。</p>
          </div>
        </section>

        <section id="today" aria-labelledby="today-heading" className="scroll-mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-blue-400">TODAY&apos;S SIGNAL</p>
              <h2 id="today-heading" className="mt-1 text-xl font-black sm:text-2xl">今日の注目</h2>
            </div>
            <p className="text-xs text-slate-500">取得済みデータから集計</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`rounded-2xl border border-blue-400/20 bg-[#0b1730]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6 ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-400 sm:text-sm">{metric.label}</p>
                  <span className="text-lg text-blue-400" aria-hidden="true">{metric.icon}</span>
                </div>
                <p className={`mt-3 text-3xl font-black sm:text-4xl ${metric.accent}`}>
                  {metric.value}<span className="ml-1 text-sm font-bold text-slate-400">{metric.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-20" aria-labelledby="information-heading">
          <p className="text-xs font-black tracking-[0.2em] text-blue-400">INFORMATION</p>
          <h2 id="information-heading" className="mt-1 text-2xl font-black sm:text-3xl">知りたい情報へすぐ進む</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {primarySections.map((section) => (
              <Link
                key={section.label}
                href={section.href}
                className="group rounded-2xl border border-blue-400/20 bg-[#09152c] p-5 transition hover:border-blue-400/60 hover:bg-[#0c1c39]"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-xl font-black text-blue-300">
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-black">{section.label}<span className="ml-2 text-blue-400 transition group-hover:translate-x-1">→</span></h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{section.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-20" aria-labelledby="category-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-blue-400">CATEGORY</p>
              <h2 id="category-heading" className="mt-1 text-2xl font-black sm:text-3xl">ジャンルから探す</h2>
            </div>
            <p className="hidden text-sm text-slate-500 sm:block">5ジャンルの最新情報を掲載</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => {
              const category = genreConfigs[genre];
              return (
                <Link
                  key={genre}
                  href={`/${genre}`}
                  className="group flex items-center gap-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-4 transition hover:border-blue-400/60 hover:bg-[#0c1c39] sm:p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-950/80 text-2xl" aria-hidden="true">
                    {category.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black sm:text-lg">{category.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{category.description}</p>
                  </div>
                  <span className="text-blue-400 transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0d1d3a] to-[#071126] p-6 sm:mt-20 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-orange-400">BEGINNER&apos;S GUIDE</p>
              <h2 className="mt-2 text-2xl font-black">当選したら、まず何をする？</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">相場の見方、保管方法、売るタイミング。初心者が迷いやすいポイントを順番に確認できます。</p>
            </div>
            <Link href="/pokemon/guide" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-orange-400/40 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-200 transition hover:bg-orange-500/20">
              ガイドを読む <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t border-blue-400/15 py-8 text-center text-xs text-slate-500">
          <p className="font-bold tracking-[0.18em] text-slate-400">PREMIUM HUB</p>
          <p className="mt-2">プレミア速報｜手に入れた後の行動まで、初心者にも分かりやすく</p>
          <p className="mt-2 text-slate-400">当サイトはアフィリエイト広告を利用しています。</p>
          <Link href="/privacy" className="mt-3 inline-block underline-offset-4 hover:text-blue-300 hover:underline">
            プライバシーポリシー・免責事項
          </Link>
        </footer>
      </div>
    </main>
  );
}
