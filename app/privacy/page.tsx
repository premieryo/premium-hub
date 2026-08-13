import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー・免責事項 | プレミア速報",
  description:
    "プレミア速報のプライバシーポリシー、広告・アフィリエイト、免責事項についての説明です。",
};

const sections = [
  {
    number: "01",
    title: "プライバシーポリシー",
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-white">個人情報の取り扱い</h3>
          <p className="mt-2">
            プレミア速報（以下「当サイト」）では、お問い合わせなどの際に、氏名やメールアドレスなどの情報をご提供いただく場合があります。取得した情報は、お問い合わせへの回答や必要なご連絡のために利用し、それ以外の目的では利用しません。
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">アクセス解析とCookie</h3>
          <p className="mt-2">
            当サイトでは、利用状況の把握やサービス改善のため、アクセス解析ツールを利用する場合があります。これらのツールではCookieを使用し、閲覧したページや利用環境などの情報を収集することがありますが、通常は個人を直接特定するものではありません。Cookieはブラウザの設定から無効にできます。
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">第三者への提供</h3>
          <p className="mt-2">
            取得した個人情報は、法令に基づく場合や、人の生命・身体・財産の保護に必要な場合などを除き、本人の同意なく第三者へ提供しません。
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">内容の変更</h3>
          <p className="mt-2">
            当サイトは、法令やサービス内容の変更などに応じて、本ポリシーを必要に応じて見直すことがあります。変更後の内容は、このページに掲載した時点から適用されます。
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "広告・アフィリエイトについて",
    content: (
      <div className="space-y-4">
        <p>
          当サイトでは、運営やコンテンツ制作を支えるため、Google AdSense、Amazonアソシエイト、各種ASP、その他のアフィリエイトサービスを利用する場合があります。広告配信事業者が、利用者の興味に合った広告を表示する目的でCookieなどを使用することがあります。
        </p>
        <p>
          当サイト内のリンクを通じて商品やサービスを購入・申し込みされた場合、当サイトが紹介料を受け取ることがあります。掲載内容はできる限り分かりやすくお伝えしますが、商品の仕様、価格、在庫、契約条件などは、必ず販売元やサービス提供元のページで最新情報をご確認ください。
        </p>
        <p className="rounded-xl border border-orange-400/20 bg-orange-500/5 px-4 py-3 text-orange-100">
          商品の購入やサービスへの申し込みに関する最終的な判断は、利用者ご自身の責任で行ってください。
        </p>
      </div>
    ),
  },
  {
    number: "03",
    title: "免責事項",
    content: (
      <div className="space-y-4">
        <p>
          当サイトでは、プレミア商品の抽選・再販情報、市場価格や相場、高騰・ランキング、売却に関する情報、初心者向けの解説などを掲載しています。情報の確認には努めていますが、その正確性、完全性、最新性を保証するものではありません。
        </p>
        <p>
          抽選条件、販売日、価格、在庫状況などは、店舗・メーカー・販売元の都合により、掲載後に変更または終了する場合があります。応募や購入の前には、必ず公式サイトや販売ページで最新の条件をご確認ください。
        </p>
        <p>
          相場価格、ランキング、価格変動に関する情報は、確認時点のデータをもとにした参考情報です。将来の価格上昇や売却益を保証するものではありません。商品の購入、保有、売却、その他の投資的な判断は、利用者ご自身の責任で行ってください。
        </p>
        <p>
          当サイトの情報を利用したことで生じた損害やトラブルについて、運営者は責任を負いかねます。また、当サイトからリンクしている外部サイトの内容、サービス、安全性についても、当サイトでは責任を負いません。
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050b18] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_75%_10%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_15%_0%,rgba(14,165,233,0.1),transparent_28%)]" />

      <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-8">
        <header className="flex items-center justify-between border-b border-blue-400/15 pb-5">
          <Link href="/" className="text-xs font-black tracking-[0.28em] text-blue-300 sm:text-sm">
            PREMIUM HUB
          </Link>
          <Link href="/" className="text-xs font-bold text-slate-400 transition hover:text-blue-300">
            トップへ戻る
          </Link>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-black tracking-[0.2em] text-blue-400">POLICY &amp; DISCLAIMER</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            プライバシーポリシー
            <span className="mt-1 block text-blue-300">・免責事項</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            プレミア速報をご利用いただく皆さまに、安心してサイトをお使いいただくための方針と、掲載情報についての大切なご案内です。
          </p>
        </section>

        <div className="space-y-5 sm:space-y-6">
          {sections.map((section) => (
            <section
              key={section.number}
              className="rounded-2xl border border-blue-400/20 bg-[#09152c]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-3xl sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-xs font-black text-blue-300">
                  {section.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white sm:text-2xl">{section.title}</h2>
                  <div className="mt-5 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                    {section.content}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-blue-400/15 bg-blue-950/20 p-5 sm:p-6">
          <h2 className="font-bold text-white">お問い合わせについて</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            本ページの内容や個人情報の取り扱いについて確認したいことがある場合は、当サイトのお問い合わせ窓口が設置された後、そちらからご連絡ください。
          </p>
        </section>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 px-6 py-3 text-sm font-bold text-blue-100 transition hover:border-blue-300 hover:bg-blue-500/20"
          >
            <span className="mr-2" aria-hidden="true">←</span>
            トップページへ戻る
          </Link>
        </div>

        <footer className="mt-12 border-t border-blue-400/15 py-8 text-center text-xs text-slate-500">
          <p className="font-bold tracking-[0.18em] text-slate-400">PREMIUM HUB</p>
          <p className="mt-2">プレミア速報｜プライバシーポリシー・免責事項</p>
        </footer>
      </div>
    </main>
  );
}
