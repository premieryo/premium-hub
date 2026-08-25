import { notFound } from "next/navigation";
import GenreProductsPage from "@/components/genre/GenreProductsPage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";
import { generateGenreMetadata } from "@/lib/genre-metadata";
import { splitBoosterProductsByRelease } from "@/lib/product-categories";

export const generateStaticParams = generateGenreParams;

export function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  return generateGenreMetadata(params, "products");
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  const products = splitBoosterProductsByRelease(
    context.data.products,
    ["pokemon", "onepiece", "dragonball"].includes(genre) ? 15 : Number.POSITIVE_INFINITY,
  );
  return <GenreProductsPage config={context.config} products={products.released} upcomingProducts={products.upcoming} />;
}
