import type { GenreConfig } from "@/data/genre-config";
import type { Product } from "@/data/types";
import GenrePageFrame from "./GenrePageFrame";
import ProductGrid from "./ProductGrid";

export default function GenreProductsPage({
  config,
  products,
}: {
  config: GenreConfig;
  products: Product[];
}) {
  return (
    <GenrePageFrame config={config}>
      <header className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">📦 {config.name}商品一覧</h1>
            <p className="mt-3 text-slate-300">発売日の新しい順に商品情報を掲載します。</p>
          </div>
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
            {products.length}件
          </span>
        </div>
      </header>

      <section className="mt-8">
        <ProductGrid products={products} />
      </section>
    </GenrePageFrame>
  );
}
