import type { Product } from "@/data/types";
import PublicProductCard from "./PublicProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
        現在商品情報はありません
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <PublicProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
