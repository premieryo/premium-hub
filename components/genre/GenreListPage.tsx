import ProductCard from "@/components/ProductCard";
import type { GenreConfig } from "@/data/genre-config";
import type { GenreData } from "@/data/genre-data";
import EmptyState from "./EmptyState";
import GenrePageFrame from "./GenrePageFrame";
import LotteryCard from "./LotteryCard";

type ListKind = "lottery" | "restock" | "ranking";

export default function GenreListPage({ config, data, kind }: { config: GenreConfig; data: GenreData; kind: ListKind }) {
  const presentation = {
    lottery: { icon: "🎯", title: "抽選情報", description: `${config.name}の抽選・予約販売情報を掲載します。` },
    restock: { icon: "🛒", title: "再販情報", description: `${config.name}の再販・店頭販売・通販情報を掲載します。` },
    ranking: { icon: "📈", title: "高騰ランキング", description: `高騰している${config.itemLabel}をランキング形式で掲載します。` },
  }[kind];
  const items = data[kind];

  return (
    <GenrePageFrame config={config}>
      <header className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">{presentation.icon} {config.name}{presentation.title}</h1>
        <p className="mt-3 text-slate-300">{presentation.description}</p>
      </header>
      <section className="mt-8 space-y-4">
        {items.length === 0 ? (
          <EmptyState message={kind === "lottery" ? `現在受付中の${config.name}抽選情報はありません。` : undefined} />
        ) : kind === "lottery" ? (
          data.lottery.map((item) => <LotteryCard key={item.id} item={item} />)
        ) : items.map((item) => {
          const price = kind === "restock" ? `販売開始：${"date" in item ? item.date : ""}`
            : "currentPrice" in item && typeof item.currentPrice === "number"
              ? `現在 ${item.currentPrice.toLocaleString()}円 / 前回 ${(item.previousPrice ?? item.currentPrice).toLocaleString()}円`
              : "price" in item ? item.price : "";
          return <ProductCard key={item.id} emoji={item.icon} category={item.shop} title={item.product}
            price={price} description={item.status} href={item.href} />;
        })}
      </section>
    </GenrePageFrame>
  );
}
