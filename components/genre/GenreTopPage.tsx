import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { GenreConfig } from "@/data/genre-config";
import type { GenreData } from "@/data/genre-data";
import EmptyState from "./EmptyState";
import GenrePageFrame from "./GenrePageFrame";
import ProductGrid from "./ProductGrid";

export default function GenreTopPage({ config, data }: { config: GenreConfig; data: GenreData }) {
  const acceptingCount = data.lottery.filter((item) => item.status === "受付中").length;
  const isCardGenre = ["pokemon", "onepiece", "dragonball"].includes(config.slug);

  return (
    <GenrePageFrame config={config} home>
      <header className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">{config.icon} {config.name}</h1>
        <p className="mt-3 text-sm text-slate-300 md:text-base">{config.description}</p>
      </header>

      <nav className="mt-6 grid grid-cols-2 gap-3" aria-label={`${config.name}の商品・相場メニュー`}>
        <SectionLink href={`/${config.slug}/products`} title="歴代BOX" text="通常BOXを探す" />
        <SectionLink href={`/${config.slug}/ranking`} title="BOX相場" text="店頭の定価と比べる" />
        {isCardGenre && <SectionLink href={`/${config.slug}/collections`} title="コレクションBOX" text="限定・セット商品を探す" />}
        {isCardGenre && <SectionLink href={`/${config.slug}/collection-ranking`} title="コレクション相場" text="限定品の相場を見る" />}
      </nav>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="抽選情報" value={data.lottery.length} color="text-red-400" />
        <Stat label="受付中" value={acceptingCount} color="text-green-400" />
        <Stat label="再販情報" value={data.restock.length} color="text-blue-400" />
        <Stat label="高騰商品" value={data.ranking.length} color="text-yellow-400" />
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-blue-400">PRODUCTS</p>
            <h2 className="mt-1 text-2xl font-bold">📦 商品一覧</h2>
          </div>
          <Link
            href={`/${config.slug}/products`}
            className="text-sm font-bold text-blue-400 hover:text-blue-300"
          >
            商品一覧をすべて見る →
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid products={data.products.slice(0, 6)} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🎯 最新の抽選情報</h2>
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">{data.lottery.length}件</span>
        </div>
        <div className="mt-5 space-y-4">
          {data.lottery.length === 0 ? <EmptyState /> : data.lottery.map((item) => (
            <ProductCard key={item.id} emoji={item.icon} category={item.shop} title={item.product}
              price={`応募締切：${item.deadline}`} description={item.status} href={item.href} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <SectionLink href={`/${config.slug}/ranking`} title="📈 高騰ランキング" text="追跡商品の価格と変動を確認" />
        <SectionLink href={`/${config.slug}/restock`} title="🛒 再販情報" text="確認済みの店舗・通販情報を掲載" />
        <SectionLink href={`/${config.slug}/guide`} title="📖 初心者ガイド" text="購入後の保管や相場の見方を解説" />
      </section>
    </GenrePageFrame>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-xl bg-slate-900 p-4"><p className="text-xs text-slate-400">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}件</p></div>;
}

function SectionLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="block rounded-2xl bg-slate-900 p-5 transition hover:bg-slate-800"><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm text-slate-300">{text}</p></Link>;
}
