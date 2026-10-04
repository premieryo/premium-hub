import type { Metadata } from "next";
import Link from "next/link";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "トレカ初心者ガイド｜保管・鑑定・売却・梱包｜プレミア速報",
  description: "トレカや未開封BOXを手に入れた後の保管方法、カード鑑定、売り方・買取、梱包・発送を初心者向けに解説。",
  alternates: { canonical: "/guide" },
};

const sections = [
  { href: "/guide/storage", icon: "📦", title: "保管方法・保管用品", body: "カード・未開封BOX・フィギュアをきれいな状態で守る方法と、スリーブ・ローダー・BOXケースなどを確認します。", cta: "保管方法を詳しく見る" },
  { href: "/guide/grading", icon: "🧪", title: "鑑定に出すか判断する", body: "PSAを含む鑑定サービスの違い、費用、PSA10等になった場合の期待値の考え方を確認します。", cta: "鑑定サービスを比較する" },
  { href: "/guide/selling", icon: "💰", title: "販売手段を選ぶ", body: "買取店・フリマ・オークションの手間、手数料、売却価格の考え方を比較します。", cta: "売り方を比較する" },
  { href: "/guide/packing", icon: "📮", title: "梱包して発送する", body: "カード、BOX、フィギュア別に、折れ・水濡れ・角潰れを防ぐ梱包方法を確認します。", cta: "梱包方法を詳しく見る" },
];

export default function GuidePage() {
  return <main className="relative min-h-screen overflow-hidden bg-[#050b18] text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-24 top-28 h-[520px] w-[390px] rotate-[-8deg] rounded-[45%] bg-[radial-gradient(circle_at_45%_32%,rgba(96,165,250,.16),rgba(37,99,235,.07)_42%,transparent_70%)] blur-sm" />
      <div className="absolute -right-10 top-44 select-none text-[190px] font-black leading-none text-blue-300/[.035] sm:text-[260px]">速</div>
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/[.06] blur-3xl" />
    </div>

    <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <TopNavigation /><div className="mt-5"><AffiliateDisclosure /></div>
      <header className="mt-8"><p className="text-xs font-black tracking-[.2em] text-blue-400">BEGINNER&apos;S GUIDE</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">📖 プレミア商品 初心者ガイド</h1><p className="mt-4 leading-7 text-slate-300">当選・購入した後に迷いやすいことを、目的別に詳しく確認できます。</p></header>
      <div className="mt-8 grid gap-4">{sections.map((s) => <Link key={s.href} href={s.href} className="group rounded-2xl border border-blue-400/20 bg-[#09152c]/95 p-5 transition hover:border-blue-300 sm:p-6"><h2 className="text-xl font-black">{s.icon} {s.title}</h2><p className="mt-3 leading-7 text-slate-300">{s.body}</p><p className="mt-4 text-sm font-black text-blue-300">{s.cta} →</p></Link>)}</div>

      <section aria-label="プレ速くん" className="relative mt-10 min-h-56 overflow-hidden rounded-3xl border border-blue-400/15 bg-[#071126]/80">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_82%_55%,rgba(96,165,250,.18),transparent_42%)]" />
        <div aria-hidden="true" className="absolute -bottom-16 -right-7 h-64 w-48 rotate-[-7deg] rounded-[46%_46%_38%_38%] border-[14px] border-blue-300/[.08] bg-blue-500/[.035]">
          <div className="absolute left-1/2 top-7 h-20 w-28 -translate-x-1/2 rounded-[50%] border-[10px] border-blue-300/[.08]" />
          <div className="absolute left-1/2 top-20 h-4 w-20 -translate-x-1/2 rounded-full bg-blue-300/[.08]" />
          <div className="absolute left-1/2 top-28 h-3 w-12 -translate-x-1/2 rounded-full bg-blue-300/[.08]" />
        </div>
        <div className="relative z-10 max-w-[72%] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[.18em] text-blue-400">PRESOKU-KUN</p>
          <p className="mt-3 text-xl font-black">迷ったら、ここから確認。</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">保管・鑑定・売却・梱包まで、当たった後に必要なことを順番にまとめています。</p>
        </div>
      </section>
    </div>
  </main>;
}
