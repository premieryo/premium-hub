import type { Metadata } from "next";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateLinks from "@/components/AffiliateLinks";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "トレカ・BOXの梱包・発送方法｜初心者ガイド｜プレミア速報",
  description: "トレカ、未開封BOX、フィギュア・ベイブレードの梱包手順と発送方法の選び方を初心者向けに解説。",
  alternates: { canonical: "/guide/packing" },
};

const packs = [
  {
    title: "カード",
    steps: ["カードをスリーブに入れる", "ローダー・硬質ケースなどで折れや曲がりを防ぐ", "OPP袋などに入れて水濡れを防ぐ", "封筒や箱の中で動かないよう固定して発送する"],
    need: "スリーブ / ローダー・硬質ケース / OPP袋 / 緩衝材 / 封筒・箱",
  },
  {
    title: "未開封BOX",
    steps: ["シュリンクや外箱を傷つけないよう袋で防水する", "角を潰さないよう緩衝材で全体を包む", "商品より余裕のある段ボールへ入れる", "隙間を埋めて配送中にBOXが動かないよう固定する"],
    need: "OPP袋・防水袋 / 緩衝材 / 段ボール / 隙間埋め材 / テープ",
  },
  {
    title: "フィギュア・ベイブレード",
    steps: ["外箱・パッケージを袋で保護する", "緩衝材で全体を包み、角やブリスターへの直接の衝撃を避ける", "余裕のある段ボールへ入れる", "隙間を埋めて箱の中で動かないよう固定する"],
    need: "防水袋 / 大判緩衝材 / 段ボール / 隙間埋め材 / テープ",
  },
];

const shippingChecks = [
  ["サイズ・重量", "梱包後のサイズと重量を基準に発送方法を選びます。商品だけで測らないよう注意。"],
  ["追跡", "高額品や取引状況を確認したい場合は、配送状況を追える方法を検討します。"],
  ["補償", "高額なカードやBOXなどは、配送事故時の補償内容・上限を確認してから選びます。"],
  ["匿名配送", "フリマ等を利用する場合は、個人情報を相手に伝えず発送できるサービスも選択肢です。"],
];

export default function Page() {
  return <main className="min-h-screen bg-[#050b18] text-white"><div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <TopNavigation fallbackHref="/guide" />
    <div className="mt-5"><AffiliateDisclosure /></div>
    <header className="mt-8">
      <p className="text-xs font-black tracking-[.2em] text-blue-400">PACKING & SHIPPING</p>
      <h1 className="mt-2 text-3xl font-black">📮 梱包・発送する</h1>
      <p className="mt-3 leading-7 text-slate-300">基本は「折れ・潰れ」「水濡れ」「配送中に動く」の3つを防ぐこと。商品ごとの手順と発送前の確認ポイントをまとめます。</p>
    </header>

    <div className="mt-8 space-y-4">
      {packs.map((p) => <section key={p.title} className="rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
        <h2 className="text-xl font-black">{p.title}</h2>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">{p.steps.map((s, i) => <li key={s} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-black text-blue-300">{i + 1}</span><span>{s}</span></li>)}</ol>
        <div className="mt-5 rounded-xl bg-slate-950/60 p-4"><p className="text-xs font-bold text-slate-500">用意するもの</p><p className="mt-1 text-sm font-bold text-blue-200">{p.need}</p></div>
      </section>)}
    </div>

    <section className="mt-8 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
      <p className="text-xs font-black tracking-[.16em] text-blue-400">SHIPPING</p>
      <h2 className="mt-2 text-xl font-black">発送方法を選ぶポイント</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">料金だけでなく、商品の大きさ・価値・取引方法に合わせて選びます。各サービスの料金や条件は変更されるため、発送前に最新情報を確認してください。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{shippingChecks.map(([title, body]) => <div key={title} className="rounded-xl bg-slate-950/60 p-4"><h3 className="font-black text-blue-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{body}</p></div>)}</div>
    </section>

    <section className="mt-4 rounded-2xl border border-orange-400/25 bg-orange-500/5 p-5">
      <h2 className="font-black text-orange-200">発送前の最終チェック</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        <li>✓ 商品が箱・封筒の中で動かない</li>
        <li>✓ 水濡れ対策ができている</li>
        <li>✓ カードの折れ、BOX・外箱の角潰れ対策ができている</li>
        <li>✓ 宛先・発送方法・追跡や補償の条件を確認した</li>
      </ul>
    </section>

    <AffiliateLinks category="packing" title="梱包用品を探す" />
  </div></main>;
}
