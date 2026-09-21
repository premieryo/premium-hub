import type { Metadata } from "next";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateLinks from "@/components/AffiliateLinks";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "カード鑑定サービス比較｜初心者ガイド｜プレミア速報",
  description: "PSAなどのカード鑑定を利用する前に、評価・費用・価値・期待値の考え方を初心者向けに解説。",
  alternates: { canonical: "/guide/grading" },
};

const grades = [
  ["10", "GEM-MT", "最高評価。状態が非常に良好なカード。"],
  ["9", "MINT", "非常に良好だが、10の基準には届かないカード。"],
  ["8以下", "NM-MT以下", "状態に応じて段階的に評価されます。"],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <TopNavigation fallbackHref="/guide" />
        <div className="mt-5"><AffiliateDisclosure /></div>

        <header className="mt-8">
          <p className="text-xs font-black tracking-[.2em] text-blue-400">GRADING</p>
          <h1 className="mt-2 text-3xl font-black">🧪 カード鑑定サービスを比較する</h1>
          <p className="mt-3 leading-7 text-slate-300">
            カード鑑定は、カードの真贋や状態を第三者が確認し、評価とともに専用ケースへ封入するサービスです。
            高評価なら必ず得になるわけではないため、費用と鑑定後の価値を比べて判断しましょう。
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-blue-400/25 bg-[#0b1c3d] p-5">
          <p className="text-xs font-black tracking-[.16em] text-blue-300">PSA GRADING</p>
          <h2 className="mt-2 text-xl font-black">PSAの評価は1〜10</h2>
          <p className="mt-3 leading-7 text-slate-300">
            PSAは1〜10のグレードで評価し、10が最高です。角・エッジ・表面・センタリング・印刷状態などを確認して総合的に判定します。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {grades.map(([grade, label, description]) => (
              <div key={grade} className="rounded-xl bg-slate-950/60 p-4">
                <p className="text-2xl font-black text-blue-300">PSA {grade}</p>
                <p className="mt-1 font-bold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            ※同じカードでも個体ごとに状態が異なり、見た目だけでグレードを確定することはできません。
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">💴 鑑定にかかる費用を考える</h2>
          <p className="mt-3 leading-7 text-slate-300">
            鑑定料金だけでなく、発送・返送料、保険や申告価格に関する条件なども含めて総額で考えます。
            サービス料金や納期は変更されるため、申し込み直前に公式サイトで最新条件を確認してください。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["鑑定サービス料金", "発送・返送にかかる費用", "申告価格・補償条件", "梱包用品などの準備費用"].map((item) => (
              <div key={item} className="rounded-xl bg-slate-950/60 p-3 text-sm text-slate-300">✓ {item}</div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">📊 鑑定に出すべきかの考え方</h2>
          <p className="mt-3 leading-7 text-slate-300">
            「最高評価になった場合の手取り × その確率」＋「それ以外の評価になった場合の手取り × その確率」− 鑑定・送料等のコストを、
            素体のまま売った場合の手取りと比較します。
          </p>
          <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
            <p className="font-bold text-blue-200">判断するときのポイント</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              白欠け・傷・凹み・センタリングなどを確認し、PSA10の相場だけではなくPSA9や素体の相場も確認します。
              「10なら利益が出る」だけで判断せず、10以外だった場合まで考えるのが重要です。
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            最高評価になる確率はカードの状態などで大きく変わるため、プレミア速報では一律の確率を掲載しません。
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">🔎 鑑定サービスを比較するポイント</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            PSA以外にも鑑定サービスがあります。料金だけでなく、評価方法や売却時の流通状況まで確認して選びます。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["鑑定料金と往復送料", "納期・受付方法", "鑑定基準・評価方法", "売却時の流通量・相場", "補償や申告価格の条件", "ケース・ラベルの好み"].map((x) => (
              <div key={x} className="rounded-xl bg-slate-950/60 p-3 text-sm text-slate-300">✓ {x}</div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            代表例としてPSA、BGS（Beckett）、CGCなどがあります。各社で評価基準・料金体系・納期が異なり、条件は変更されることがあります。
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">🛡️ 鑑定前・鑑定後もカードを保護</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            鑑定前は傷や折れを増やさないように保管し、返却後は鑑定ケース自体の擦れや汚れも防ぐと安心です。
          </p>
          <AffiliateLinks category="storage" useCase="slab-sleeves" title="おすすめの鑑定済みカード用保護袋" />
        </section>

        <section className="mt-4 rounded-2xl border border-orange-400/25 bg-orange-500/5 p-5">
          <h2 className="font-black text-orange-200">鑑定サービスへのリンクについて</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            PSAを含め、利用可能な鑑定サービスを比較対象にします。広告・紹介プログラムが利用できるサービスは、
            条件を確認したうえで公式申込先への広告リンクを追加します。提携していないサービスを有料広告のように見せることはしません。
          </p>
        </section>
      </div>
    </main>
  );
}
