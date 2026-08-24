import type { Product } from "@/data/types";
import ProductImage from "@/components/product/ProductImage";
import { isReleasedInTokyo } from "@/lib/price-tracking";

export default function PublicProductCard({ product }: { product: Product }) {
  const released = isReleasedInTokyo(product);
  const releaseDate = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${product.releaseDate}T00:00:00+09:00`));
  const priceMessage = !released ? "相場集計は発売後に開始予定" : product.priceTrackingEnabled ? "現在相場を確認中" : "相場集計前";
  return <article className="flex h-full min-w-0 flex-col rounded-2xl border border-white/10 bg-slate-900 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="rounded-full bg-white/10 px-3 py-1 font-bold text-slate-200">{product.seriesNumber || (product.productCategory === "collection-box" ? "限定・セット商品" : "通常BOX")}</span><span className={released ? "text-emerald-300" : "text-amber-300"}>{released ? "発売済み" : "発売予定"}</span></div>
    <div className="mt-4 flex min-w-0 items-start gap-4"><ProductImage alt={product.imageAlt || product.name} fallbackIcon="📦" className="h-20 w-20 shrink-0" /><div className="min-w-0"><h3 className="break-words text-lg font-black text-white">{product.name}</h3><p className="mt-2 text-xs text-slate-400">発売日 {releaseDate}</p></div></div>
    <dl className="mt-5 space-y-3 text-sm">{product.retailPrice ? <Row label="定価" value={`${product.retailPrice.toLocaleString()}円`} /> : null}<Row label="現在相場" value={product.marketPrice ? `${product.marketPrice.toLocaleString()}円` : priceMessage} accent={Boolean(product.marketPrice)} /></dl>
    {product.officialUrl && <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-5 min-h-11 rounded-xl border border-blue-500/50 px-4 py-3 text-center text-sm font-bold text-blue-300">公式商品情報を見る</a>}
  </article>;
}
function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-slate-400">{label}</dt><dd className={`break-words text-right font-bold ${accent ? "text-emerald-300" : "text-slate-200"}`}>{value}</dd></div>; }
