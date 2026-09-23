import type { Metadata } from "next";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateLinks from "@/components/AffiliateLinks";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "トレカの保管方法｜スリーブ・ローダー・BOX保護｜プレミア速報",
  description: "トレカ、未開封BOX、フィギュア・ベイブレードの保管方法を解説。スリーブ、ローダー、保護ケースなど必要な保管用品も紹介します。",
  alternates: { canonical: "/guide/storage" },
};

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
    title: "フィギュア・ベイブレード",
    steps: ["外箱・パッケージを含めて状態を維持する", "紫外線とホコリを避ける", "重ねすぎず箱やパッケージの変形を防ぐ"],
    products: ["フィギュア・ベイブレードの保護ケース", "ディスプレイケース", "防湿・ホコリ対策用品"],
  },
];

function CardProtectionGuide() {
  return (
    <section className="rounded-2xl border border-blue-400/30 bg-[#09152c] p-5">
      <p className="text-xs font-black tracking-[.16em] text-blue-400">CARD PROTECTION</p>
      <h2 className="mt-2 text-xl font-black">カードの価値・用途に合わせた保護</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">まずスリーブが基本。大切なカードほど、その上から保護を一段ずつ強くするのがおすすめです。</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-xl bg-slate-950/60 p-4">
          <h3 className="font-black">基本｜スリーブ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">擦れ・指紋・軽い汚れを防ぐ基本の保護。普段保管するカードはまずここから。</p>
          <AffiliateLinks category="storage" useCase="card-sleeves" title="おすすめのスリーブ" />
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4">
          <h3 className="font-black">当たり｜スリーブ＋ローダー</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">スリーブに入れたカードをさらに硬質ローダーで保護。高レアや当たりカードの折れ・曲がり対策に。</p>
          <AffiliateLinks category="storage" useCase="top-loaders" title="おすすめのローダー" />
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4">
          <h3 className="font-black">最上位｜スリーブ＋強固な保護ケース</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">高額カードやコレクションの主力は、マグネットローダーやフルプロテクト系ケースなど、より強固な保護を検討。</p>
          <div className="mt-3 space-y-3">
            <AffiliateLinks category="storage" useCase="magnetic-loaders" title="おすすめのマグネットローダー" />
            <AffiliateLinks category="storage" useCase="full-protect-cases" title="おすすめのフルプロテクト" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4">
          <h3 className="font-black">鑑定済み｜スラブ用保護</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">PSA・BGS・CGCなどの鑑定ケースは、スラブ用保護袋や専用ケースでケース自体の擦れ・傷を防ぎます。</p>
          <AffiliateLinks category="storage" useCase="slab-sleeves" title="おすすめの鑑定済みカード用保護袋" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">※ 金額だけで決めず、カードの状態・思い入れ・保管期間・持ち運びの有無に合わせて選びましょう。スリーブとローダーなどを組み合わせる場合は、各商品の対応サイズも確認してください。</p>
    </section>
  );
}

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

        <div className="mt-8 space-y-4">
          {items.map((i, index) => (
            <div key={i.title} className="space-y-4">
              <section className="rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
                <h2 className="text-xl font-black">{i.title}</h2>
                <ul className="mt-4 space-y-2 text-slate-300">{i.steps.map((s) => <li key={s}>・{s}</li>)}</ul>
                <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
                  <p className="font-black">あると便利な用品</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{i.products.join(" / ")}</p>
                </div>
              </section>
              {index === 0 ? <CardProtectionGuide /> : null}
              {index === 1 ? <AffiliateLinks category="storage" useCase="box-cases" title="おすすめのBOX保護ケース" /> : null}
              {index === 2 ? <AffiliateLinks category="storage" useCase="figure-cases" title="おすすめのフィギュア・ベイブレード用ケース" /> : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
