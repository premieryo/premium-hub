import type { GenreConfig } from "@/data/genre-config";
import type { Product, ProductCategory } from "@/data/types";
import GenrePageFrame from "./GenrePageFrame";
import ProductGrid from "./ProductGrid";

export default function GenreProductsPage({ config, products, category = "booster-box" }: { config: GenreConfig; products: Product[]; category?: ProductCategory }) {
  const collection = category === "collection-box";
  return <GenrePageFrame config={config}><header className="mt-6"><p className="text-sm font-bold text-blue-300">{collection ? "LIMITED & COLLECTION" : "BOOSTER BOX ARCHIVE"}</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">{config.name}{collection ? " コレクションBOX" : " 歴代BOX"}</h1><p className="mt-3 text-slate-300">{collection ? "限定・記念セットを、新しい順に探せます。" : "通常のブースターBOXを、新しい順に探せる商品図鑑です。"}</p><p className="mt-2 text-sm text-slate-400">価格がまだ集計されていない商品も、公式確認済みの商品として掲載します。</p></header><div className="mt-5 text-sm text-slate-400">{products.length}件</div><section className="mt-5"><ProductGrid products={products} /></section></GenrePageFrame>;
}
