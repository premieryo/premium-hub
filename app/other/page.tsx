import type { Metadata } from "next";
import Link from "next/link";
import PresokuBackground from "@/components/PresokuBackground";
import TopNavigation from "@/components/TopNavigation";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import ProductGrid from "@/components/genre/ProductGrid";
import LotteryCard from "@/components/genre/LotteryCard";
import EmptyState from "@/components/genre/EmptyState";
import { getGenreContext } from "@/lib/genres";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "その他注目商品｜ベイブレード・フィギュア｜プレミア速報",
  description: "ベイブレード・フィギュアなどの注目商品と、応募受付中の抽選をまとめて確認できます。",
  alternates: { canonical: "/other" } };

export default async function OtherPage() {
  const contexts = await Promise.all([getGenreContext("beyblade"), getGenreContext("figure")]);
  const products = contexts.flatMap((context) => context?.data.products ?? [])
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id));
  const lotteries = contexts.flatMap((context) => context?.data.lottery ?? []);
  return <main className="relative isolate min-h-screen bg-slate-950 px-4 py-8 text-white">
    <PresokuBackground />
    <div className="relative z-10 mx-auto max-w-5xl">
      <TopNavigation /><div className="mt-5"><AffiliateDisclosure /></div>
      <header className="mt-6"><h1 className="text-3xl font-black">🎁 その他注目商品</h1>
        <p className="mt-3 text-slate-300">ベイブレード・フィギュアなど、話題の商品と抽選情報をまとめて確認できます。</p></header>
      <nav className="mt-6 grid grid-cols-2 gap-3" aria-label="商品ジャンル">
        {contexts.map((context) => context ? <Link key={context.config.slug} href={`/${context.config.slug}`} className="rounded-xl border border-blue-400/20 bg-slate-900 p-4 font-bold">{context.config.icon} {context.config.name} →</Link> : null)}
      </nav>
      <section className="mt-10"><h2 className="mb-4 text-2xl font-bold">抽選情報</h2>
        <div className="space-y-4">{lotteries.length ? lotteries.map((item) => <LotteryCard key={`${item.genre}:${item.id}`} item={item} />) : <EmptyState />}</div></section>
      <section className="mt-10"><h2 className="mb-4 text-2xl font-bold">注目商品</h2><ProductGrid products={products} /></section>
    </div>
  </main>;
}
