import Link from "next/link";
import type { ProductImageAsset } from "@/data/types";
import ProductImage from "@/components/product/ProductImage";
type ProductCardProps = {
  emoji: string;
  category: string;
  title: string;
  price: string;
  description: string;
  href: string;
  image?: ProductImageAsset;
};
export default function ProductCard({
  emoji,
  category,
  title,
  price,
  description,
  href,
  image,
}: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:-translate-y-1">
  <div className="flex items-center justify-between">
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
      {category}
    </span>

    <span className="text-xs font-bold text-red-400">
      注目
    </span>
  </div>

  <div className="mt-3 flex items-center gap-4">
    <ProductImage asset={image} alt={title} fallbackIcon={emoji} />

    <div className="min-w-0 flex-1">
      <h3 className="text-lg font-black text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-300">
        {price}
      </p>

      <p className="mt-1 text-sm font-bold text-green-400">
        {description}
      </p>
    </div>
  </div>

  <Link
    href={href}
    className="mt-4 inline-block w-full rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-400"
  >
    詳細を見る
  </Link>
</article>
  );
}
