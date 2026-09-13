import { notFound } from "next/navigation";
import MarketRankingPage from "@/components/genre/MarketRankingPage";
import { genreConfigs } from "@/data/genre-config";
import type { Genre } from "@/data/types";
import { getGenreContext } from "@/lib/genres";
import { productsInCategory, rankingInCategory } from "@/lib/product-categories";

const collectionGenres = ["pokemon", "onepiece", "dragonball"] as const;

export const generateStaticParams = () => collectionGenres.map((genre) => ({ genre }));

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!collectionGenres.includes(genre as (typeof collectionGenres)[number])) return {};
  const config = genreConfigs[genre as Genre];
  return {
    title: `${config.name}のコレクションBOX相場 | プレミア速報`,
    description: `${config.name}の限定BOX・記念セット・コレクション商品の相場と価格動向を確認できます。`,
    alternates: { canonical: `/${genre}/collection-ranking` },
  };
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!collectionGenres.includes(genre as (typeof collectionGenres)[number])) notFound();
  const context = await getGenreContext(genre);
  if (!context) notFound();
  const products = productsInCategory(context.data.products, "collection-box");
  return (
    <MarketRankingPage
      config={context.config}
      products={products}
      ranking={rankingInCategory(context.data.ranking, context.data.products, "collection-box")}
      category="collection-box"
    />
  );
}
