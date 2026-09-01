import Link from "next/link";

export default function AffiliateDisclosure() {
  return (
    <aside
      aria-label="広告に関するお知らせ"
      className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-[13px] leading-5 text-amber-50 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:text-sm"
    >
      <p className="font-medium">広告｜当サイトはアフィリエイト広告を利用しています。</p>
      <Link
        href="/privacy"
        className="mt-1 inline-block shrink-0 font-bold text-amber-200 underline decoration-amber-300/60 underline-offset-4 transition hover:text-amber-100 sm:mt-0"
      >
        詳しくはこちら
      </Link>
    </aside>
  );
}
