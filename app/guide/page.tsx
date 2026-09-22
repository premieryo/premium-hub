import type { Metadata } from "next";
import Link from "next/link";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "初心者ガイド｜プレミア速報",
  description: "プレミア商品を手に入れた後の保管、鑑定、売却、梱包・発送を初心者向けに解説。",
  alternates: { canonical: "/guide" },
};

const sections = [
  { href: "/guide/storage", icon: "📦", title: "保管方法・保管用品", body: "カード・未開封BOX・フィギュアをきれいな状態で守る方法と、スリーブ・ローダー・BOXケースなどを確認します。", cta: "保管方法を詳しく見る" },
  { href: "/guide/grading", icon: "🧪", title: "鑑定に出すか判断する", body: "PSAを含む鑑定サービスの違い、費用、PSA10等になった場合の期待値の考え方を確認します。", cta: "鑑定サービスを比較する" },
  { href: "/guide/selling", icon: "💰", title: "販売手段を選ぶ", body: "買取店・フリマ・オークションの手間、手数料、売却価格の考え方を比較します。", cta: "売り方を比較する" },
  { href: "/guide/packing", icon: "📮", title: "梱包して発送する", body: "カード、BOX、フィギュア別に、折れ・水濡れ・角潰れを防ぐ梱包方法を確認します。", cta: "梱包方法を詳しく見る" },
];

export default function GuidePage() {
  return <main className="min-h-screen bg-[#050b18] text-white"><div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <TopNavigation /><div className="mt-5"><AffiliateDisclosure /></div>
    <header className="mt-8"><p className="text-xs font-black tracking-[.2em] text-blue-400">BEGINNER&apos;S GUIDE</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">📖 プレミア商品 初心者ガイド</h1><p className="mt-4 leading-7 text-slate-300">当選・購入した後に迷いやすいことを、目的別に詳しく確認できます。</p></header>
    <div className="mt-8 grid gap-4">{sections.map((s) => <Link key={s.href} href={s.href} className="group rounded-2xl border border-blue-400/20 bg-[#09152c] p-5 transition hover:border-blue-300 sm:p-6"><h2 className="text-xl font-black">{s.icon} {s.title}</h2><p className="mt-3 leading-7 text-slate-300">{s.body}</p><p className="mt-4 text-sm font-black text-blue-300">{s.cta} →</p></Link>)}</div>
  </div></main>;
}
