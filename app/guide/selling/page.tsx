import type { Metadata } from "next";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "プレミア商品の売り方比較｜初心者ガイド｜プレミア速報",
  description: "カードや未開封BOXなどを売るときの買取店・フリマ・オークションの違いと、手取りの考え方を初心者向けに解説。",
  alternates: { canonical: "/guide/selling" },
};

const methods = [
  { icon: "🏪", title: "買取店", good: "査定から現金化まで早く、出品・購入者対応が不要", watch: "店舗・サービスごとに査定額や条件が違うので比較が重要", fit: "手間を減らして早く売りたい人", kind: "buyback" },
  { icon: "📱", title: "フリマ", good: "自分で販売価格を決めやすく、相場を見ながら出品できる", watch: "販売手数料・送料・梱包・購入者対応を手取りから差し引く", fit: "手間をかけても手取りを高めたい人", kind: "flea" },
  { icon: "🔨", title: "オークション", good: "需要が強い商品は入札によって価格が動く可能性がある", watch: "必ず高くなるとは限らず、手数料・送料・出品条件の確認が必要", fit: "需要が強い商品の入札を待てる人", kind: "auction" },
];

const checks = [
  ["カード", "傷・白欠け・折れ・凹み・センタリングなど、状態によって価格差が出やすい。鑑定済みならグレードも確認。"],
  ["未開封BOX", "シュリンクや封印の状態、箱の潰れ・破れなどを確認。未開封状態を損なわないよう保管。"],
  ["フィギュア等", "外箱の傷み、付属品・パーツの有無、未開封か開封済みかを確認。"],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <TopNavigation fallbackHref="/guide" />
        <div className="mt-5"><AffiliateDisclosure /></div>

        <header className="mt-8">
          <p className="text-xs font-black tracking-[.2em] text-blue-400">SELLING</p>
          <h1 className="mt-2 text-3xl font-black">💰 販売手段を選ぶ</h1>
          <p className="mt-3 leading-7 text-slate-300">
            高く見える販売価格だけでなく、「最終的にいくら残るか」と「どれだけ手間がかかるか」で売り方を選びます。
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-blue-400/25 bg-[#0b1c3d] p-5">
          <p className="text-xs font-black tracking-[.16em] text-blue-300">TAKE-HOME AMOUNT</p>
          <h2 className="mt-2 text-xl font-black">まず「手取り」で比べる</h2>
          <div className="mt-4 rounded-xl bg-slate-950/60 p-4 text-center font-black text-blue-200 sm:text-lg">
            販売価格 − 手数料 − 送料 − 梱包費 ＝ おおよその手取り
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            例えばフリマの表示価格が買取査定額より高くても、手数料や送料を引くと差が小さくなることがあります。
            各サービスの料金は変更されるため、売却時点の公式条件を確認してください。
          </p>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {methods.map((m) => (
            <section key={m.title} className="rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
              <p className="text-2xl">{m.icon}</p>
              <h2 className="mt-2 text-xl font-black">{m.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300"><b className="text-white">メリット：</b>{m.good}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300"><b className="text-white">注意：</b>{m.watch}</p>
              <p className="mt-3 rounded-xl bg-slate-950/60 p-3 text-sm font-bold text-blue-200">向いている人：{m.fit}</p>
              {m.kind === "buyback" && (
                <a className="mt-4 block rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-center text-sm font-black text-blue-200" href="https://affiliate.suruga-ya.jp/modules/af/af_jump.php?user_id=5447&amp;goods_url=https%3A%2F%2Fwww.suruga-ya.jp%2Fman%2Fkaitori%2Fkaitoritop.html" rel="nofollow">
                  駿河屋の買取を確認する <span className="block text-[11px] font-normal text-slate-400">広告・アフィリエイトリンク</span>
                </a>
              )}
              {m.kind === "flea" && (
                <div className="mt-4 space-y-2 text-sm">
                  <a className="block rounded-xl border border-slate-600/50 p-3 font-bold text-blue-200" href="https://jp.mercari.com/" target="_blank" rel="noopener noreferrer">メルカリ（販売手数料 10%）↗</a>
                  <a className="block rounded-xl border border-slate-600/50 p-3 font-bold text-blue-200" href="https://fril.jp/" target="_blank" rel="noopener noreferrer">楽天ラクマ（販売手数料 4.5〜10%）↗</a>
                  <p className="text-[11px] leading-5 text-slate-400">※代表例。広告リンクではありません。ラクマは販売実績に応じて手数料率が変動します。</p>
                </div>
              )}
              {m.kind === "auction" && (
                <div className="mt-4 text-sm">
                  <a className="block rounded-xl border border-slate-600/50 p-3 font-bold text-blue-200" href="https://auctions.yahoo.co.jp/" target="_blank" rel="noopener noreferrer">Yahoo!オークション（落札システム利用料 10%）↗</a>
                  <p className="mt-2 text-[11px] leading-5 text-slate-400">※代表例。広告リンクではありません。一部カテゴリは料金体系が異なります。</p>
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">🔍 売る前に状態を確認</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            同じ商品でも状態によって査定額や売れ方が変わります。写真を撮る前・査定へ出す前に状態を確認しておきましょう。
          </p>
          <div className="mt-4 space-y-3">
            {checks.map(([title, body]) => (
              <div key={title} className="rounded-xl bg-slate-950/60 p-4">
                <p className="font-black text-blue-200">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-400/20 bg-[#09152c] p-5">
          <h2 className="text-xl font-black">⚖️ 高額品ほど「早さ」と「手取り」を分けて考える</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            高額カードや人気の未開封BOXは、すぐ現金化したいなら買取店、自分で価格設定や購入者対応をする余裕があるならフリマなど、
            優先したい条件で選びます。高額だから特定の方法が必ず有利とは限りません。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
              <p className="font-black text-emerald-200">早く・手間を少なく</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">複数の買取査定を比較して、条件に納得できる店舗・サービスを選ぶ。</p>
            </div>
            <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
              <p className="font-black text-blue-200">手取りを自分で調整</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">相場・手数料・送料を確認して、フリマやオークションの出品価格を決める。</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-orange-400/25 bg-orange-500/5 p-5">
          <h2 className="font-black text-orange-200">⚠️ 相場と条件は売る直前に再確認</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            カードやホビー商品の相場、買取価格、販売手数料、キャンペーン条件は変動します。
            古い価格だけで判断せず、売却する時点で複数の相場・査定・公式料金を確認してください。
          </p>
        </section>


      </div>
    </main>
  );
}
