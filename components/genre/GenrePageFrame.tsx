import Link from "next/link";
import type { ReactNode } from "react";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";
import type { GenreConfig } from "@/data/genre-config";

type GenrePageFrameProps = {
  config: GenreConfig;
  children: ReactNode;
  home?: boolean;
  maxWidth?: "3xl" | "5xl";
};

const relatedLinks = [
  { path: "lottery", label: "抽選情報" },
  { path: "products", label: "歴代商品" },
  { path: "ranking", label: "相場" },
  { path: "restock", label: "再販情報" },
  { path: "guide", label: "初心者ガイド" },
] as const;

export default function GenrePageFrame({
  config,
  children,
  home = false,
  maxWidth = "5xl",
}: GenrePageFrameProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className={maxWidth === "3xl" ? "mx-auto max-w-3xl" : "mx-auto max-w-5xl"}>
        <TopNavigation fallbackHref={home ? "/" : `/${config.slug}`} />
        <div className="mt-5">
          <AffiliateDisclosure />
        </div>
        {children}

        {!home && (
          <nav className="mt-12 border-t border-slate-800 pt-6" aria-label={`${config.name}の関連ページ`}>
            <p className="text-sm font-bold text-slate-300">{config.name}の関連情報</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {relatedLinks.map((item) => (
                <Link
                  key={item.path}
                  href={`/${config.slug}/${item.path}`}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-center text-sm font-bold text-slate-200 transition hover:border-blue-500/50 hover:bg-slate-800 hover:text-blue-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <footer className="mt-12 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          <p className="mb-3 text-slate-400">当サイトはアフィリエイト広告を利用しています。</p>
          <Link href="/privacy" className="underline-offset-4 hover:text-blue-300 hover:underline">
            プライバシーポリシー・免責事項
          </Link>
        </footer>
      </div>
    </main>
  );
}
