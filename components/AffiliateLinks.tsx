import { activeAffiliateLinks } from "@/lib/affiliate-links";

type Props = {
  category: "storage" | "packing" | "grading" | "selling";
  title?: string;
};

export default function AffiliateLinks({ category, title = "関連商品・サービス" }: Props) {
  const links = activeAffiliateLinks(category);
  if (links.length === 0) return null;

  return (
    <section className="mt-5 rounded-2xl border border-orange-400/25 bg-orange-500/5 p-5">
      <h2 className="font-black text-orange-200">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">広告・アフィリエイトリンクを含みます。購入価格や条件はリンク先でご確認ください。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={`${link.provider}-${link.label}-${link.href}`}
            href={link.href}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-center text-sm font-black text-white transition hover:border-blue-400"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
