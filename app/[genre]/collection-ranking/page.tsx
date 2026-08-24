import { notFound } from "next/navigation";
import MarketRankingPage from "@/components/genre/MarketRankingPage";
import { getGenreContext } from "@/lib/genres";
import { productsInCategory, rankingInCategory } from "@/lib/product-categories";

export const generateStaticParams = () => ["pokemon", "onepiece", "dragonball"].map((genre) => ({ genre }));
export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) { const { genre } = await params; return { title: `${genre} コレクション相場ランキング`, description: "同一性を安全に確認できた限定・セット商品の相場です。", alternates: { canonical: `/${genre}/collection-ranking` } }; }
export default async function Page({ params }: { params: Promise<{ genre: string }> }) { const { genre } = await params; if (!["pokemon", "onepiece", "dragonball"].includes(genre)) notFound(); const context = await getGenreContext(genre); if (!context) notFound(); const products = productsInCategory(context.data.products, "collection-box"); return <MarketRankingPage config={context.config} products={products} ranking={rankingInCategory(context.data.ranking, context.data.products, "collection-box")} category="collection-box" />; }
