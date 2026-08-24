import { notFound } from "next/navigation";
import MarketRankingPage from "@/components/genre/MarketRankingPage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";
import { generateGenreMetadata } from "@/lib/genre-metadata";
import { productsInCategory, rankingInCategory } from "@/lib/product-categories";

export const generateStaticParams = generateGenreParams;

export function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  return generateGenreMetadata(params, "ranking");
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  const products = productsInCategory(context.data.products, "booster-box");
  return <MarketRankingPage config={context.config} products={products} ranking={rankingInCategory(context.data.ranking, context.data.products, "booster-box")} category="booster-box" />;
}
