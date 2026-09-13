import Link from "next/link";
import type { GenreConfig } from "@/data/genre-config";
import GenrePageFrame from "./GenrePageFrame";

const cardGuides = [
  {
    icon: "📦",
    title: "BOXをきれいに保管する",
    paragraphs: [
      "未開封BOXは、シュリンクや外箱の状態も確認されやすいため、購入後は潰れ・擦れ・日焼け・湿気を避けて保管しましょう。",
      "直射日光の当たらない場所で、上に重い物を載せず、必要ならBOXサイズに合った保護ケースを使うと安心です。購入時のレシートや納品書も一緒に保管しておくと、購入経路を確認しやすくなります。",
    ],
  },
  {
    icon: "💰",
    title: "定価と相場を分けて見る",
    paragraphs: [
      "『定価がいくらか』と『今いくらで取引・販売されているか』は別の数字です。プレミア速報では、確認できる商品は定価と現在相場を分けて表示しています。",
      "相場は在庫、再販、新商品の発表などで変動します。1店舗だけの価格で判断せず、ランキングの前回価格や値動きも確認してから判断するのがおすすめです。",
    ],
  },
  {
    icon: "⏱️",
    title: "売るタイミングを考える",
    paragraphs: [
      "発売直後に価格が高くても、その後の追加販売や再販で下がることがあります。一方で、流通量が減ってから上がる商品もあるため、『必ずこの時期が高い』とは限りません。",
      "売却する場合は、現在相場だけでなく、再販予定・抽選状況・自分がいくらで購入したかも確認しましょう。買取価格とフリマ等の販売価格は手数料や送料が違うため、表示価格だけで比較しないことも大切です。",
    ],
  },
  {
    icon: "🔍",
    title: "抽選・再販情報を確認する",
    paragraphs: [
      "抽選は応募期間、応募条件、当選発表、購入期限を確認します。店舗によって会員登録や購入履歴などの条件が付く場合があります。",
      "再販情報は変更・終了することがあるため、応募や購入の直前には必ずリンク先の公式情報を確認してください。",
    ],
  },
];

export default function GenreGuidePage({ config }: { config: GenreConfig }) {
  const isCardGenre = ["pokemon", "onepiece", "dragonball"].includes(config.slug);
  const guides = isCardGenre ? cardGuides : config.guideItems.map((item) => ({ ...item, paragraphs: [item.description] }));

  return (
    <GenrePageFrame config={config}>
      <header className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">📖 {config.name}初心者ガイド</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {config.name}を買った後に迷いやすい、保管・相場・売却・抽選情報の見方を初心者向けにまとめます。
        </p>
      </header>

      <nav className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={`${config.name}関連ページ`}>
        <GuideLink href={`/${config.slug}/products`} title="歴代商品を見る" />
        <GuideLink href={`/${config.slug}/ranking`} title="現在の相場を見る" />
        <GuideLink href={`/${config.slug}/lottery`} title="抽選情報を見る" />
      </nav>

      <section className="mt-10 space-y-5">
        {guides.map((item) => (
          <article key={item.title} className="rounded-2xl bg-slate-900 p-5 md:p-6">
            <h2 className="text-xl font-bold md:text-2xl">{item.icon} {item.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300 md:text-base">
              {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </section>

      {isCardGenre && (
        <aside className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 text-sm leading-6 text-slate-300">
          <p className="font-bold text-white">価格・販売情報について</p>
          <p className="mt-2">相場や販売状況は変動します。購入・応募・売却を行う際は、各ショップや公式サイトの最新情報もあわせて確認してください。</p>
        </aside>
      )}
    </GenrePageFrame>
  );
}

function GuideLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold transition hover:bg-slate-800">
      {title} →
    </Link>
  );
}
