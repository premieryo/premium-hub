import { notFound } from "next/navigation";
import GenreProductsPage from "@/components/genre/GenreProductsPage";
import { getGenreContext } from "@/lib/genres";
import { productsInCategory } from "@/lib/product-categories";

export const generateStaticParams = () => ["pokemon", "onepiece", "dragonball"].map((genre) => ({ genre }));
export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) { const { genre } = await params; return { title: `${genre} コレクションBOX一覧`, description: "限定・記念セットを新しい順に確認できます。", alternates: { canonical: `/${genre}/collections` } }; }
export default async function Page({ params }: { params: Promise<{ genre: string }> }) { const { genre } = await params; if (!["pokemon", "onepiece", "dragonball"].includes(genre)) notFound(); const context = await getGenreContext(genre); if (!context) notFound(); return <GenreProductsPage config={context.config} products={productsInCategory(context.data.products, "collection-box")} category="collection-box" />; }
