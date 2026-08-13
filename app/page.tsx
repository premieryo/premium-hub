import Link from "next/link";

const categories = [
  {
    name: "ポケモンカード",
    description: "抽選・再販・高騰情報",
    icon: "🔥",
    href: "/pokemon",
  },
  {
    name: "ワンピースカード",
    description: "新商品・抽選・相場情報",
    icon: "🏴‍☠️",
    href: "/onepiece",
  },
  {
    name: "ドラゴンボールカード",
    description: "抽選・再販・注目商品",
    icon: "🐉",
    href: "/dragonball",
  },
  {
    name: "ベイブレード",
    description: "新商品・限定品・再販情報",
    icon: "🌀",
    href: "/beyblade",
  },
  {
    name: "フィギュア",
    description: "予約・限定・プレミア情報",
    icon: "🤖",
    href: "/figure",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
          <p className="text-sm font-bold text-yellow-400">
            PREMIUM HOBBY INFORMATION
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-6xl">
            プレミア速報
          </h1>

          <p className="mt-4 text-2xl font-bold text-blue-300">
            当たった後、迷わない。
          </p>

          <p className="mt-5 max-w-2xl text-slate-300">
            プレミア商品の抽選・再販・相場・売却まで、
            初心者にもわかりやすく紹介します。
          </p>
        </header>
<section className="mt-10">
  <div className="rounded-2xl border border-yellow-500/20 bg-slate-900 p-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">
        🔥 最新速報
      </h2>

      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">
        LIVE
      </span>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-3">

      <Link
        href="/pokemon/restock"
        className="rounded-xl bg-slate-800 p-4 transition hover:bg-slate-700"
      >
        <div className="text-3xl">🛒</div>
        <p className="mt-3 font-bold">
          ポケモン再販
        </p>
        <p className="text-sm text-slate-300">
          8月10日 10:00予定
        </p>
      </Link>

      <Link
        href="/pokemon/lottery"
        className="rounded-xl bg-slate-800 p-4 transition hover:bg-slate-700"
      >
        <div className="text-3xl">🎯</div>
        <p className="mt-3 font-bold">
          抽選締切
        </p>
        <p className="text-sm text-slate-300">
          ヨドバシ 本日23:59
        </p>
      </Link>

      <Link
        href="/pokemon/ranking"
        className="rounded-xl bg-slate-800 p-4 transition hover:bg-slate-700"
      >
        <div className="text-3xl">📈</div>
        <p className="mt-3 font-bold">
          高騰ランキング
        </p>
        <p className="text-sm text-green-400">
          ブラッキーex SAR
        </p>
      </Link>

    </div>
  </div>
</section>
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-xs text-slate-400">本日締切</p>
            <p className="mt-1 text-3xl font-bold text-red-400">5件</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-xs text-slate-400">抽選受付中</p>
            <p className="mt-1 text-3xl font-bold text-green-400">18件</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-xs text-slate-400">再販情報</p>
            <p className="mt-1 text-3xl font-bold text-blue-400">7件</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-xs text-slate-400">高騰商品</p>
            <p className="mt-1 text-3xl font-bold text-yellow-400">12件</p>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-400">CATEGORY</p>
              <h2 className="mt-1 text-3xl font-bold">
                ジャンルから探す
              </h2>
            </div>

            <p className="hidden text-sm text-slate-400 md:block">
              気になるジャンルを選択
            </p>
          </div>
<section className="mb-10">
  <h2 className="mb-4 text-2xl font-bold text-white">
    🔥 最新情報
  </h2>

  <div className="space-y-3">
    <div className="rounded-xl bg-slate-900 p-4">
      <p className="font-bold">📦 ポケモンカード</p>
      <p className="text-sm text-slate-300">
        新弾BOX抽選受付中
      </p>
    </div>

    <div className="rounded-xl bg-slate-900 p-4">
      <p className="font-bold">🛒 再販情報</p>
      <p className="text-sm text-slate-300">
        ポケモンセンターオンライン 再販予定
      </p>
    </div>

    <div className="rounded-xl bg-slate-900 p-4">
      <p className="font-bold">📈 高騰ランキング</p>
      <p className="text-sm text-slate-300">
        ブラッキーex SARが上昇中
      </p>
    </div>
  </div>
</section>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                    {category.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {category.description}
                    </p>
                  </div>

                  <span className="text-2xl text-blue-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-6">
            <p className="text-sm font-bold text-red-400">TODAY</p>
            <h2 className="mt-2 text-xl font-bold">🔥 本日締切</h2>
            <p className="mt-2 text-sm text-slate-300">
              今日中に応募が必要な抽選情報を掲載予定
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <p className="text-sm font-bold text-green-400">NEW</p>
            <h2 className="mt-2 text-xl font-bold">🎯 新着抽選</h2>
            <p className="mt-2 text-sm text-slate-300">
              新しく始まった抽選情報を掲載予定
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <p className="text-sm font-bold text-yellow-400">TREND</p>
            <h2 className="mt-2 text-xl font-bold">📈 高騰ランキング</h2>
            <p className="mt-2 text-sm text-slate-300">
              注目度が上がっている商品を掲載予定
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          プレミア速報｜プレミアホビー情報を初心者にもわかりやすく
        </footer>
      </div>
    </main>
  );
}