import type { GenreConfig } from "@/data/genre-config";
import type { Product, ProductCategory } from "@/data/types";
import GenrePageFrame from "./GenrePageFrame";
import ProductGrid from "./ProductGrid";

export default function GenreProductsPage({ config, products, upcomingProducts = [], category = "booster-box" }: { config: GenreConfig; products: Product[]; upcomingProducts?: Product[]; category?: ProductCategory }) {
  const collection = category === "collection-box";
  return <GenrePageFrame config={config}><header className="mt-6"><p className="text-sm font-bold text-blue-300">{collection ? "LIMITED & COLLECTION" : "BOOSTER BOX ARCHIVE"}</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">{config.name}{collection ? " コレクションBOX" : " BOX商品"}</h1><p className="mt-3 text-slate-300">{collection ? "限定・記念セットを、新しい順に探せます。" : "公式発表済みの発売予定BOXと、発売済みの歴代BOXを確認できます。"}</p><p className="mt-2 text-sm text-slate-400">価格がまだ集計されていない商品も、公式確認済みの商品として掲載します。</p></header>
    {!collection && upcomingProducts.length > 0 ? <section className="mt-8"><h2 className="text-xl font-black text-amber-300">発売予定</h2><p className="mt-1 text-sm text-slate-400">公式発表済みの未発売booster-box</p><div className="mt-4"><ProductGrid products={upcomingProducts} /></div></section> : null}
    <section className="mt-8"><h2 className="text-xl font-black text-white">{collection ? "コレクションBOX" : "歴代BOX"}</h2><div className="mt-2 text-sm text-slate-400">{products.length}件</div><div className="mt-4"><ProductGrid products={products} /></div></section>
  </GenrePageFrame>;
}
