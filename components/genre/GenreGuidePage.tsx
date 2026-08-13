import type { GenreConfig } from "@/data/genre-config";
import GenrePageFrame from "./GenrePageFrame";

export default function GenreGuidePage({ config }: { config: GenreConfig }) {
  return (
    <GenrePageFrame config={config}>
      <header className="mt-6">
        <h1 className="text-4xl font-bold">📖 {config.name}初心者ガイド</h1>
        <p className="mt-3 text-slate-300">{config.name}初心者向けの情報を掲載します。</p>
      </header>
      <section className="mt-10 space-y-4">
        {config.guideItems.map((item) => (
          <div key={item.title} className="rounded-2xl bg-slate-900 p-5">
            <h2 className="text-xl font-bold">{item.icon} {item.title}</h2>
            <p className="mt-2 text-slate-300">{item.description}</p>
          </div>
        ))}
      </section>
    </GenrePageFrame>
  );
}
