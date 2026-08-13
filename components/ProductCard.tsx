import Link from "next/link";
type ProductCardProps = {
  emoji: string;
  category: string;
  title: string;
  price: string;
  description: string;
  href: string;
};
export default function ProductCard({
  emoji,
  category,
  title,
  price,
  description,
  href,
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
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-blue-900 text-3xl">
      {emoji}
    </div>

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