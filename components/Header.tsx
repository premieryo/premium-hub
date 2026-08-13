export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-red-400">
            PREMIUM HUB
          </p>
          <h1 className="text-xl font-black text-white">
            プレミア速報
          </h1>
        </div>

        <nav className="hidden gap-6 md:flex">
          <a href="#" className="text-slate-300 hover:text-white">
            ホーム
          </a>

          <a href="#" className="text-slate-300 hover:text-white">
            抽選
          </a>

          <a href="#" className="text-slate-300 hover:text-white">
            相場
          </a>

          <a href="#" className="text-slate-300 hover:text-white">
            初心者ガイド
          </a>
        </nav>

        <button className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white">
          検索
        </button>
      </div>
    </header>
  );
}