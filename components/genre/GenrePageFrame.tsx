import Link from "next/link";
import type { ReactNode } from "react";
import type { GenreConfig } from "@/data/genre-config";

type GenrePageFrameProps = {
  config: GenreConfig;
  children: ReactNode;
  home?: boolean;
  maxWidth?: "3xl" | "5xl";
};

export default function GenrePageFrame({
  config,
  children,
  home = false,
  maxWidth = "5xl",
}: GenrePageFrameProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className={maxWidth === "3xl" ? "mx-auto max-w-3xl" : "mx-auto max-w-5xl"}>
        <Link
          href={home ? "/" : `/${config.slug}`}
          className="text-sm font-bold text-blue-400 hover:text-blue-300"
        >
          ← {home ? "トップページへ戻る" : `${config.name}ページへ戻る`}
        </Link>
        {children}
        <footer className="mt-12 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          <Link href="/privacy" className="underline-offset-4 hover:text-blue-300 hover:underline">
            プライバシーポリシー・免責事項
          </Link>
        </footer>
      </div>
    </main>
  );
}
