import type { Metadata } from "next";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateLinks from "@/components/AffiliateLinks";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "保管方法・保管用品｜初心者ガイド｜プレミア速報",
  description: "カード、未開封BOX、フィギュアの保管方法と必要な保管用品を解説。",
  alternates: { canonical: "/guide/storage" },
};

const cardProtectionLevels = [
  {
    title: "基本｜スリーブ",
    description: "普段保管するカードの基本。擦れ・指紋・軽い汚れからカード表面を守ります。",
    scene: "ノーマルカード、通常のレアカード、ファイル保管など",
  },
  {
    title: "当たり｜スリーブ＋ローダー",
    description: "スリーブに入れたカードを硬質ローダーで保護し、折れ・曲がり・圧迫への対策を強くします。",
    scene: "高レア、当たりカード、大切に保管したいカードなど",
  },
  {
    title: "最上位｜スリーブ＋マグネットホルダー／フルプロテクト系ケース",
    description: "ローダーよりしっかりしたケースで保護。コレクションとして見せながら保管したい場合にも向いています。",
    scene: "高額カード、コレクションの主力、特に状態を守りたいカードなど",
  },
  {
    title: "鑑定済み｜スラブ＋スラブ用保護",
    description: "PSA・BGS・CGCなどの鑑定ケース自体を、保護袋や専用ケースで擦れ・傷から守ります。",
    scene: "鑑定済みカードの長期保管、持ち運び、コレクション保管など",
  },
];

const items = [
  {
    title: "カード",
    steps: ["まずスリーブで擦れ・汚れを防ぐ", "カードの重要度に応じてローダーや保護ケースを追加する", "直射日光・高温多湿を避ける"],
    products: ["カードスリーブ", "トップローダー・硬質ケース", "マグネットホルダー・保護ケース", "防湿・乾燥用品"],
  },
  {
    title: "未開封BOX",
    steps: ["シュリンクや外箱を傷つけない", "専用BOXケースで角潰れ・圧迫を防ぐ", "湿気と日焼けを避けて保管する"],
    products: ["未開封BOX用保護ケース", "収納ボックス", "防湿・乾燥用品"],
  },
  {
    title: "フィギュア",
    steps: ["外箱を含めて状態を維持する", "紫外線とホコリを避ける", "重ねすぎず箱の変形を防ぐ"],
    products: ["フィギュア保護ケース", "ディスプレイケース", "防湿・ホコリ対策用品"],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <TopNavigation fallbackHref="/guide" />
        <div className="mt-5"><AffiliateDisclosure /></div>

        <header className="mt-8">
          <p className="text-xs font-black tracking-[.2em] text-blue-400">STORAGE</p>
          <h1 className="mt-2 text-3xl font-black">📦 保管方法・保管用品</h1>
          <p className="mt-3 leading-7 text-slate-300">売る予定がなくても、状態を守ることが将来の選択肢を残します。商品ごとに必要な対策を確認しましょう。</p>
        </header>

        <section className="mt-8 rounded-2xl border border-blue-400/30 bg-[#09152c] p-5">
          <p className="text-xs font-black tracking-[.16em] text-blue-400">CARD PROTECTION</p>
          <h2 className="mt-2 text-xl font-black">カードの保護はどこまで必要？</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">すべてのカードを最上位のケースに入れる必要はありません。カードの重要度や保管目的に合わせて、保護を一段ずつ強くするのが分かりやすい考え方です。</p>
          <div className="mt-5 space-y-3">
            {cardProtectionLevels.map((level) => (
              <div key={level.title} className="rounded-xl bg-slate-950/60 p-4">
                <h3 className="font-black">{level.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{level.description}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">使用場面：{level.scene}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">※ 金額だけで保護方法を固定せず、カードの状態・思い入れ・保管期間・持ち運びの有無なども含めて選びましょう。</p>
        </section>

        <div className="mt-8 space-y-4">
          {items.map((i) => (
            <section key={i.title} className="rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
              <h2 className="text-xl font-black">{i.title}</h2>
              <ul className="mt-4 space-y-2 text-slate-300">{i.steps.map((s) => <li key={s}>・{s}</li>)}</ul>
              <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
                <p className="font-black">あると便利な用品</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{i.products.join(" / ")}</p>
              </div>
            </section>
          ))}
        </div>

        <AffiliateLinks category="storage" title="保管用品を探す" />
      </div>
    </main>
  );
}
