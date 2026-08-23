import type { Product } from "@/data/types";
import ProductImage from "@/components/product/ProductImage";

export default function PublicProductCard({ product }: { product: Product }) {
  const releaseDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${product.releaseDate}T00:00:00`));

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
          {product.type.toUpperCase()}
        </span>
        <span className="text-xs text-slate-400">発売日 {releaseDate}</span>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <ProductImage
          alt={product.imageAlt || product.name}
          fallbackIcon="◇"
          className="h-20 w-20"
        />
        <h3 className="min-w-0 flex-1 text-xl font-black text-white">{product.name}</h3>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-400">現在価格</dt>
          <dd className="font-bold text-green-400">
            {typeof product.marketPrice === "number"
              ? `${product.marketPrice.toLocaleString()}円`
              : "価格未取得"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="shrink-0 text-slate-400">ショップ</dt>
          <dd className="text-right text-slate-200">{product.shop || "未登録"}</dd>
        </div>
      </dl>

      {product.url ? (
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-5 block min-h-12 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-500"
        >
          商品ページを見る ↗
        </a>
      ) : (
        <span className="mt-5 block min-h-12 rounded-xl bg-slate-800 px-4 py-3 text-center text-sm font-bold text-slate-500">
          商品リンク未登録
        </span>
      )}
    </article>
  );
}
